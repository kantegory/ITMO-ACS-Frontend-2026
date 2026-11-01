#!/usr/bin/env python3
"""Idempotent, non-destructive queue/DLX bootstrap via RabbitMQ Management API."""
import base64
import json
from http.client import HTTPException
import os
import sys
import time
from urllib.error import HTTPError, URLError
from urllib.parse import quote, urlsplit
from urllib.request import Request, urlopen

SOURCE_QUEUE = "catalog.user.registered"
INVALID_QUEUE = "catalog.user.registered.invalid"
SOURCE_EXCHANGE = "restaurant.user"
DLX = "restaurant.user.dlx"
ROUTING_KEY = "user.registered"
POLICY_NAME = "catalog-user-registered-dlx"

class API:
    def __init__(self, endpoint, username, password):
        parsed = urlsplit(endpoint)
        if parsed.scheme not in ("http", "https") or not parsed.hostname or parsed.username or parsed.password or parsed.query or parsed.fragment:
            raise ValueError("Management URL must be HTTP(S), without credentials or query")
        if not username or not password:
            raise ValueError("RabbitMQ bootstrap credentials are required")
        self.endpoint = endpoint.rstrip("/")
        self.authorization = "Basic " + base64.b64encode((username + ":" + password).encode()).decode()

    def call(self, method, parts, data=None, missing=False):
        # Vhost '/' must be percent encoded as a single path segment.
        path = "/api/" + "/".join(quote(part, safe="") for part in parts)
        body = None if data is None else json.dumps(data).encode()
        request = Request(self.endpoint + path, data=body, method=method, headers={"Authorization": self.authorization, "Content-Type": "application/json"})
        try:
            with urlopen(request, timeout=5) as response:
                payload = response.read()
                return json.loads(payload) if payload else None
        except HTTPError as error:
            if missing and error.code == 404:
                return None
            raise RuntimeError("RabbitMQ Management API returned HTTP " + str(error.code)) from None
        except (URLError, OSError, HTTPException):
            raise RuntimeError("RabbitMQ Management API unavailable") from None

def ensure_exchange(api, vhost, name):
    existing = api.call("GET", ["exchanges", vhost, name], missing=True)
    if existing is not None:
        if existing.get("type") != "topic" or not existing.get("durable") or existing.get("auto_delete"):
            raise RuntimeError("Existing exchange is incompatible: " + name + "; no resource was deleted")
        return
    api.call("PUT", ["exchanges", vhost, name], {"type": "topic", "durable": True, "auto_delete": False, "internal": False, "arguments": {}})

def ensure_queue(api, vhost, name):
    existing = api.call("GET", ["queues", vhost, name], missing=True)
    if existing is not None:
        if not existing.get("durable") or existing.get("auto_delete") or existing.get("exclusive"):
            raise RuntimeError("Existing queue is incompatible: " + name + "; do not delete it automatically")
        queue_type = existing.get("type") or existing.get("arguments", {}).get("x-queue-type", "classic")
        if queue_type not in ("classic", "quorum"):
            raise RuntimeError("Existing queue type is unsupported: " + name)
        # Preserve type and client-supplied arguments; never redeclare an existing queue.
        return queue_type
    api.call("PUT", ["queues", vhost, name], {"durable": True, "auto_delete": False, "arguments": {"x-queue-type": "quorum"}})
    return "quorum"

def ensure_binding(api, vhost, exchange, queue):
    existing = api.call("GET", ["bindings", vhost, "e", exchange, "q", queue])
    if any(item.get("routing_key") == ROUTING_KEY and not item.get("arguments") for item in existing):
        return
    api.call("POST", ["bindings", vhost, "e", exchange, "q", queue], {"routing_key": ROUTING_KEY, "arguments": {}})

def bootstrap(api, vhost="/"):
    # Validate existing resources before modifying policies.
    queue_type = ensure_queue(api, vhost, SOURCE_QUEUE)
    ensure_queue(api, vhost, INVALID_QUEUE)
    ensure_exchange(api, vhost, SOURCE_EXCHANGE)
    ensure_exchange(api, vhost, DLX)
    ensure_binding(api, vhost, SOURCE_EXCHANGE, SOURCE_QUEUE)
    ensure_binding(api, vhost, DLX, INVALID_QUEUE)
    definition = {"dead-letter-exchange": DLX, "dead-letter-routing-key": ROUTING_KEY}
    if queue_type == "quorum":
        definition["delivery-limit"] = 10
    source = api.call("GET", ["queues", vhost, SOURCE_QUEUE])
    arguments = source.get("arguments", {})
    for key, expected in definition.items():
        if "x-" + key in arguments and arguments["x-" + key] != expected:
            raise RuntimeError("Existing queue argument overrides DLX policy: " + key + "; migrate explicitly, without deleting the queue")
    old_policy = api.call("GET", ["policies", vhost, POLICY_NAME], missing=True)
    if old_policy and old_policy.get("pattern") != "^catalog[.]user[.]registered$":
        raise RuntimeError("Existing policy name belongs to a different queue; refusing to overwrite")
    api.call("PUT", ["policies", vhost, POLICY_NAME], {"pattern": "^catalog[.]user[.]registered$", "apply-to": "queues", "priority": 100, "definition": definition})
    # Management statistics can lag the policy PUT by collect_statistics_interval.
    # Wait for observable application, without treating a stale snapshot as a conflict.
    for attempt in range(30):
        try:
            effective = api.call("GET", ["queues", vhost, SOURCE_QUEUE]).get("effective_policy_definition", {})
            if all(effective.get(key) == expected for key, expected in definition.items()):
                break
        except RuntimeError:
            if attempt == 29:
                raise
        if attempt == 29:
            raise RuntimeError("Required DLX policy did not become effective within 60s; inspect management statistics and competing policies")
        time.sleep(2)
    print("RabbitMQ topology ready: source queue preserved; invalid queue and exact DLX policy configured")
    if queue_type == "classic":
        print("Existing classic source queue retained; quorum delivery-limit is not applied")

def main():
    api = API(os.environ.get("RABBITMQ_MANAGEMENT_URL", "http://127.0.0.1:15672"), os.environ.get("RABBITMQ_USERNAME", ""), os.environ.get("RABBITMQ_PASSWORD", ""))
    # Only readiness polling is retried; a topology conflict never triggers destructive recovery.
    for attempt in range(30):
        try:
            api.call("GET", ["overview"])
            break
        except RuntimeError:
            if attempt == 29:
                raise
            time.sleep(2)
    bootstrap(api, os.environ.get("RABBITMQ_VHOST", "/"))

if __name__ == "__main__":
    try:
        main()
    except (RuntimeError, ValueError) as error:
        print(str(error), file=sys.stderr)
        raise SystemExit(1)
