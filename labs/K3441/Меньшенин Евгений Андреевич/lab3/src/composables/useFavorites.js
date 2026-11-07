import { ref } from "vue";
import { api } from "../services/api.js";
import { useAuth } from "./useAuth.js";

const favorites = ref([]);
export function useFavorites() {
  const { user } = useAuth();
  async function load() {
    if (!user.value) return (favorites.value = []);
    const { data } = await api.get("/favorites", {
      params: { userId: user.value.id },
    });
    favorites.value = data;
  }
  const isFavorite = (recipeId) =>
    favorites.value.some((item) => String(item.recipeId) === String(recipeId));
  async function toggle(recipeId) {
    if (!user.value) throw new Error("Сначала войдите в аккаунт");
    const item = favorites.value.find(
      (favorite) => String(favorite.recipeId) === String(recipeId),
    );
    if (item) {
      await api.delete(`/favorites/${item.id}`);
      favorites.value = favorites.value.filter(
        (favorite) => favorite.id !== item.id,
      );
    } else {
      const { data } = await api.post("/favorites", {
        userId: String(user.value.id),
        recipeId: String(recipeId),
      });
      favorites.value.push(data);
    }
  }
  return { favorites, load, toggle, isFavorite };
}
