<script setup>
import { reactive, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth.js";
import { useAsync } from "../composables/useAsync.js";
import PasswordField from "../components/PasswordField.vue";
const route = useRoute(),
  router = useRouter();
const register = computed(() => route.path === "/register");
const form = reactive({ name: "", email: "", password: "", confirmation: "" });
const auth = useAuthStore();
const { loading, error, execute } = useAsync(async () => {
  if (register.value && !form.name.trim()) throw new Error("Укажите имя.");
  if (register.value && form.password !== form.confirmation)
    throw new Error("Пароли не совпадают.");

  await auth.authenticate(register.value ? "register" : "login", {
    email: form.email.trim().toLowerCase(),
    password: form.password,
    ...(register.value ? { name: form.name.trim() } : {}),
  });
  const next =
    typeof route.query.next === "string" ? route.query.next : "/account";
  const resolved =
    next.startsWith("/") &&
    !next.startsWith("//") &&
    !next.includes(String.fromCharCode(92))
      ? router.resolve(next)
      : null;
  await router.replace(
    resolved &&
      resolved.matched.length &&
      !["/login", "/register"].includes(resolved.path)
      ? next
      : "/account",
  );
});
</script>
<template>
  <section class="auth-wrap">
    <div class="auth-form-side">
      <form class="auth-form" @submit.prevent="execute">
        <h1>{{ register ? "Регистрация" : "Вход" }}</h1>
        <p v-if="error" class="form-error" role="alert">
          {{ error }}
        </p>
        <template v-if="register">
          <label for="name">Имя</label>
          <input
            id="name"
            v-model="form.name"
            class="form-control"
            autocomplete="name"
            maxlength="60"
            required
          />
        </template>
        <label for="email">Почта</label>
        <input
          id="email"
          v-model="form.email"
          class="form-control"
          type="email"
          autocomplete="email"
          required
        />
        <PasswordField
          id="password"
          v-model="form.password"
          :autocomplete="register ? 'new-password' : 'current-password'"
          :minlength="register ? 9 : 1"
        />
        <PasswordField
          v-if="register"
          id="confirmation"
          v-model="form.confirmation"
          label="Повторите пароль"
          autocomplete="new-password"
        />
        <button class="btn btn-dark" type="submit" :disabled="loading">
          {{
            loading ? "Подождите…" : register ? "Зарегистрироваться" : "Войти"
          }}
        </button>
        <p class="form-note">
          <RouterLink
            :to="{
              path: register ? '/login' : '/register',
              query: route.query,
            }"
          >
            {{
              register
                ? "Уже есть аккаунт? Войти"
                : "Нет аккаунта? Зарегистрироваться"
            }}
          </RouterLink>
        </p>
      </form>
    </div>
  </section>
</template>
