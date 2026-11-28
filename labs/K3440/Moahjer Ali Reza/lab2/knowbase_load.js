import http from "k6/http";
import { check, sleep } from "k6";

// Переменные окружения
const VUS = Number(__ENV.VUS || 0);
const BASE_URL = __ENV.BASE_URL || "";
const LAB_TOKEN = __ENV.LAB_TOKEN || "";
const CONFIRM = __ENV.CONFIRM_LAB_RUN || "";

// Ограничения безопасности
const ALLOWED_BASE_URL = "http://127.0.0.1:8080";
const ALLOWED_VUS = [10, 20, 50];

if (!ALLOWED_VUS.includes(VUS)) {
  throw new Error("Разрешены только 10, 20 или 50 VU");
}

if (BASE_URL !== ALLOWED_BASE_URL) {
  throw new Error("Неверный адрес учебного стенда");
}

if (!LAB_TOKEN || CONFIRM !== "YES") {
  throw new Error("Нет токена или подтверждения запуска");
}

// Настройки нагрузочного тестирования
export const options = {
  scenarios: {
    default: {
      executor: "constant-vus",
      vus: VUS,
      duration: "30s",
      gracefulStop: "5s",
    },
  },

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

    checks: ["rate==1"],

    "http_reqs{endpoint:search}": ["count>0"],
    "http_reqs{endpoint:chat}": ["count>0"],

    "http_req_duration{endpoint:search}": ["p(95)<10000"],
    "http_req_duration{endpoint:chat}": ["p(95)<10000"],

    "http_req_failed{endpoint:search}": ["rate<0.10"],
    "http_req_failed{endpoint:chat}": ["rate<0.10"],
  },
};

// Заголовки HTTP
const params = {
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${LAB_TOKEN}`,
    "X-Lab-Mode": "mock",
  },
};

// Основной сценарий
export default function () {
  // Поиск статей
  const search = http.get(
    `${BASE_URL}/api/v1/pages/search?CategoryId=0&Search=Welcome&FuzzySearch=false`,
    { ...params, tags: { endpoint: "search" } },
  );

  check(search, {
    "search: status 200": (r) => r.status === 200,
  });

  sleep(1);

  // RAG-чат
  const chat = http.post(
    `${BASE_URL}/api/v1/chat`,
    JSON.stringify({
      query: "Что такое нагрузочное тестирование?",
    }),
    { ...params, tags: { endpoint: "chat" } },
  );

  check(chat, {
    "chat: status 200": (r) => r.status === 200,
  });

  sleep(1);
}
