<script setup>
import { computed, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";
import { useAsync } from "../composables/useAsync";
const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const isRegister = computed(() => route.name === "register");
const form = reactive({ name: "", email: "", password: "" });
const showPassword = ref(false);
const { loading, error, run } = useAsync();
async function submit() {
  const mode = isRegister.value ? "register" : "login";
  const result = await run(async () => {
    await auth.authenticate(mode, form);
    return true;
  });
  if (result) {
    const destination =
      typeof route.query.redirect === "string" &&
      route.query.redirect.startsWith("/") &&
      !route.query.redirect.startsWith("//")
        ? route.query.redirect
        : "/profile";
    router.push(destination);
  }
}
</script>
<template>
  <main id="main-content" class="container py-5" tabindex="-1">
    <div class="row justify-content-center">
      <section
        class="col-md-7 col-lg-5 bg-white rounded-4 p-4 p-md-5 shadow-sm"
      >
        <p class="eyebrow">
          {{ isRegister ? "Первый шаг" : "С возвращением" }}
        </p>
        <h1 class="mb-4">
          {{ isRegister ? "Создать аккаунт" : "Войти в аккаунт" }}
        </h1>
        <form @submit.prevent="submit">
          <div v-if="isRegister">
            <label class="form-label" for="name">Имя</label>
            <input
              id="name"
              v-model.trim="form.name"
              class="form-control border rounded p-2 mb-3"
              required
              maxlength="80"
              autocomplete="name"
            />
          </div>
          <label class="form-label" for="email">Почта</label>
          <input
            id="email"
            v-model.trim="form.email"
            class="form-control border rounded p-2 mb-3"
            type="email"
            required
            autocomplete="email"
          />
          <label class="form-label" for="password">Пароль</label>
          <input
            id="password"
            v-model="form.password"
            class="form-control border rounded p-2 mb-3"
            :type="showPassword ? 'text' : 'password'"
            required
            minlength="8"
            maxlength="128"
            :autocomplete="isRegister ? 'new-password' : 'current-password'"
          />
          <button
            type="button"
            class="btn btn-link p-0 mb-3"
            :aria-pressed="showPassword"
            aria-controls="password"
            @click="showPassword = !showPassword"
          >
            {{ showPassword ? "Скрыть" : "Показать" }}
          </button>
          <p v-if="error" class="alert alert-danger" role="alert">
            {{ error }}
          </p>
          <button class="btn btn-accent w-100 py-2" :disabled="loading">
            {{
              loading
                ? "Подождите..."
                : isRegister
                  ? "Зарегистрироваться"
                  : "Войти"
            }}
          </button>
        </form>
        <p class="mt-3 mb-0">
          <RouterLink
            :to="{
              name: isRegister ? 'login' : 'register',
              query: route.query,
            }"
            >{{
              isRegister
                ? "Уже есть аккаунт? Войти"
                : "Нет аккаунта? Зарегистрироваться"
            }}</RouterLink
          >
        </p>
      </section>
    </div>
  </main>
</template>
