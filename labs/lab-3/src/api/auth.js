import { apiClient } from "./client";

export async function login(email, password) {
  const { data } = await apiClient.post("/login", { email, password });
  return data;
}

export async function register(name, email, password) {
  const { data } = await apiClient.post("/register", { name, email, password });
  return data;
}
