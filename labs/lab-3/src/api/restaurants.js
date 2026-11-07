import { apiClient } from "./client";

export async function fetchRestaurants(filters = {}) {
  const params = {};
  if (filters.name) params.name_like = filters.name;
  if (filters.cuisine) params.cuisine = filters.cuisine;
  if (filters.city) params.city = filters.city;
  if (filters.price) params.price = filters.price;

  const { data } = await apiClient.get("/restaurants", { params });
  return data;
}

export async function fetchRestaurantById(id) {
  try {
    const { data } = await apiClient.get(`/restaurants/${id}`);
    return data;
  } catch (e) {
    return null;
  }
}
