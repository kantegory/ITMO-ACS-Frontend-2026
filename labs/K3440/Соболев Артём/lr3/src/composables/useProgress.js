import { computed } from "vue";
import api from "../api.js";
import { useAuthStore } from "../stores/auth.js";
import { useAsync } from "./useAsync.js";
import { progressStats } from "../utils/progress.js";

export function useProgress() {
  const auth = useAuthStore();
  const request = useAsync(
    () =>
      api.get("/sessions", {
        params: { userId: auth.user.id, _sort: "completedAt", _order: "desc" },
      }),
    [],
  );
  const stats = computed(() => progressStats(request.data.value));
  request.execute();
  return { ...request, sessions: request.data, stats };
}
