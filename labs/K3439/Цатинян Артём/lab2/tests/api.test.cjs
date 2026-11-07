const { test } = require("node:test");
const assert = require("node:assert/strict");
const { spawn } = require("node:child_process");
const { mkdtempSync, readFileSync } = require("node:fs");
const { tmpdir } = require("node:os");
const path = require("node:path");
test("API: authentication, ownership, booking lifecycle and persistence", async () => {
  const file = path.join(
    mkdtempSync(path.join(tmpdir(), "tablely-test-")),
    "db.json",
  );
  const server = spawn(process.execPath, ["server.cjs"], {
    cwd: path.join(__dirname, ".."),
    env: { ...process.env, PORT: "3099", DB_FILE: file },
    stdio: ["ignore", "pipe", "pipe"],
  });
  await new Promise((resolve, reject) => {
    server.stdout.once("data", resolve);
    server.once("error", reject);
    server.once("exit", (code) => reject(new Error("Server exited " + code)));
  });
  const request = async (url, method = "GET", body, token) => {
    const r = await fetch("http://127.0.0.1:3099/api" + url, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: "Bearer " + token } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    return { status: r.status, data: await r.json() };
  };
  try {
    assert.equal((await request("/bookings")).status, 401);
    assert.equal(
      (
        await request(
          "/restaurants?cuisine=" + encodeURIComponent("Итальянская"),
        )
      ).data.length,
      2,
    );
    const first = await request("/register", "POST", {
      name: "Первый",
      email: "one@example.com",
      password: "testpass123",
    });
    const second = await request("/register", "POST", {
      name: "Второй",
      email: "two@example.com",
      password: "testpass123",
    });
    const token = first.data.token;
    assert.ok(token);
    assert.equal(
      (
        await request("/register", "POST", {
          name: "Дубль",
          email: "one@example.com",
          password: "testpass123",
        })
      ).status,
      409,
    );
    assert.equal(
      (
        await request("/login", "POST", {
          email: "one@example.com",
          password: "wrongpass",
        })
      ).status,
      401,
    );
    assert.ok(
      (
        await request("/login", "POST", {
          email: "one@example.com",
          password: "testpass123",
        })
      ).data.token,
    );
    const date = new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 10);
    const body = { restaurantId: "1", date, time: "19:00", guests: 2 };
    const created = await request("/bookings", "POST", body, token);
    assert.equal(created.status, 201);
    const id = created.data.id;
    assert.equal((await request("/bookings", "POST", body, token)).status, 409);
    assert.equal(
      (await request("/bookings/" + id, "GET", null, second.data.token)).status,
      404,
    );
    assert.equal(
      (await request("/bookings/" + id, "DELETE", null, second.data.token))
        .status,
      404,
    );
    assert.equal(
      (
        await request(
          "/bookings?userId=" + first.data.user.id,
          "GET",
          null,
          second.data.token,
        )
      ).data.length,
      0,
    );
    assert.equal(
      (await request("/bookings/" + id, "PATCH", { guests: 4 }, token)).data
        .guests,
      4,
    );
    assert.equal(JSON.parse(readFileSync(file)).bookings[0].guests, 4);
    assert.equal((await request("/users", "GET", null, token)).status, 404);
    assert.equal(
      (
        await request(
          "/bookings",
          "POST",
          { ...body, date: "2000-01-01" },
          token,
        )
      ).status,
      400,
    );
    assert.equal(
      (await request("/bookings/" + id, "DELETE", null, token)).status,
      200,
    );
    assert.equal(
      (await request("/bookings", "GET", null, token)).data.length,
      0,
    );
    await request("/logout", "POST", {}, token);
    assert.equal((await request("/me", "GET", null, token)).status, 401);
  } finally {
    server.kill();
  }
});
