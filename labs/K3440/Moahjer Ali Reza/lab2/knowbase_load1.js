import http from "k6/http";
import { check, sleep } from "k6";

const VUS = Number(__ENV.VUS || 0);
const BASE_URL = __ENV.BASE_URL || "";
const LAB_TOKEN = __ENV.LAB_TOKEN || "";
const CONFIRM = __ENV.CONFIRM_LAB_RUN || "";

// Преподаватель заменяет значение перед выдачей файла.
const ALLOWED_BASE_URL = "https://ТУТ-УКАЗАТЬ-УЧЕБНЫЙ-СТЕНД";
const ALLOWED_VUS = [10, 20, 50];

if (!ALLOWED_VUS.includes(VUS)) {
  throw new Error("Разрешены только 10, 20 или 50 VU");
}

if (BASE_URL !== ALLOWED_BASE_URL) {
  throw new Error("BASE_URL не совпадает с разрешённым стендом");
}

if (!LAB_TOKEN || CONFIRM !== "YES") {
  throw new Error("Нет токена или подтверждения запуска");
}

export const options = {
  vus: VUS,
  duration: "30s",
  gracefulStop: "5s",
  thresholds: {
    http_req_failed: [
      {
        threshold: "rate<0.10",
        abortOnFail: true,
        delayAbortEval: "10s",
      },
    ],
    http_req_duration: [
      {
        threshold: "p(95)<10000",
        abortOnFail: true,
        delayAbortEval: "10s",
      },
    ],
    "http_reqs{endpoint:search}": ["count>0"],

    "http_reqs{endpoint:chat}": ["count>0"],
    "http_req_duration{endpoint:search}": ["p(95)<10000"],
    "http_req_duration{endpoint:chat}": ["p(95)<10000"],
    "http_req_failed{endpoint:search}": ["rate<0.10"],
    "http_req_failed{endpoint:chat}": ["rate<0.10"],
  },
};

const params = {
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${LAB_TOKEN}`,
    "X-Lab-Mode": "mock",
  },
};

export default function () {
  const searchResponse = http.post(
    `${BASE_URL}/api/search`,
    JSON.stringify({ query: "нагрузочное тестирование", limit: 5 }),
    { ...params, tags: { endpoint: "search" } },
  );
  check(searchResponse, {
    "search: status 200": (r) => r.status === 200,
  });

  sleep(1);

  const chatResponse = http.post(
    `${BASE_URL}/api/chat`,
    JSON.stringify({
      question: "Что такое нагрузочное тестирование?",
      mode: "mock",
    }),
    { ...params, tags: { endpoint: "chat" } },
  );
  check(chatResponse, {
    "chat: status 200": (r) => r.status === 200,
  });

  sleep(1);
}
