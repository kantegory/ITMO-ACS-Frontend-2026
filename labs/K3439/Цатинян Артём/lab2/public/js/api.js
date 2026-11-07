const tokenKey = "tablely-token";
let token = sessionStorage.getItem(tokenKey);
async function api(path, method = "GET", body) {
  let response;
  try {
    response = await fetch("/api" + path, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: "Bearer " + token } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
  } catch {
    throw new Error("Не удалось подключиться к серверу.");
  }
  const data = await response.json();
  if (!response.ok) {
    if (response.status === 401 && !["/login", "/register"].includes(path)) {
      sessionStorage.removeItem(tokenKey);
      token = null;
    }
    throw new Error(data.message || "Ошибка запроса");
  }
  return data;
}

export { api, tokenKey };
export const getToken = () => token;
