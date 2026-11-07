<script setup>
import { reactive } from "vue";
import { useRouter } from "vue-router";
import { useAuth } from "../composables/useAuth";
import { useAsync } from "../composables/useAsync";
import { login } from "../api/auth";

const router = useRouter();
const { setSession } = useAuth();
const form = reactive({ email: "", password: "" });
const { error, loading, run } = useAsync(login);

async function submit() {
  try {
    const data = await run(form.email, form.password);
    setSession(data.accessToken, { name: data.user.name, email: data.user.email, id: data.user.id });
    router.push("/profile");
  } catch (e) {
    // ошибка отражена в error
  }
}
</script>

<template>
  <main class="container">
    <div class="card shadow-sm auth-card">
      <div class="card-body p-4">
        <h1 class="h3 text-center mb-4">Вход в аккаунт</h1>
        <form @submit.prevent="submit" novalidate>
          <div class="mb-3">
            <label class="form-label">Email</label>
            <input type="email" class="form-control" v-model="form.email" required>
          </div>
          <div class="mb-3">
            <label class="form-label">Пароль</label>
            <input type="password" class="form-control" v-model="form.password" minlength="4" required>
          </div>
          <div v-if="error" class="alert alert-danger">Неверный email или пароль.</div>
          <button type="submit" class="btn btn-brand w-100" :disabled="loading">Войти</button>
        </form>
        <p class="text-center mt-3 mb-0">
          Нет аккаунта? <router-link to="/register">Зарегистрироваться</router-link>
        </p>
        <p class="text-center text-muted small mt-2">
          Авторизация выполняется через мок-API (json-server-auth, JWT)
        </p>
      </div>
    </div>
  </main>
</template>
