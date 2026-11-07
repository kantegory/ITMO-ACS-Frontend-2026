import { apiClient } from "./client";

export async function fetchBookings() {
  try {
    const { data } = await apiClient.get("/bookings");
    return data;
  } catch (err) {
    // json-server-auth возвращает ошибку вместо [] когда у владельца ещё нет записей
    if (/owner id/.test(err.message)) return [];
    throw err;
  }
}

export async function createBooking(booking) {
  const { data } = await apiClient.post("/bookings", booking);
  return data;
}

export async function cancelBooking(id) {
  const { data } = await apiClient.patch(`/bookings/${id}`, { status: "cancelled" });
  return data;
}
