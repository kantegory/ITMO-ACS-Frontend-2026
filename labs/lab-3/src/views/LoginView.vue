<script setup>
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import AppIcon from "../components/AppIcon.vue";
import { useAuth } from "../composables/useAuth";
import { useAsync } from "../composables/useAsync";
import { login } from "../api/auth";

const router = useRouter();
const { setSession } = useAuth();
const form = reactive({ email: "", password: "" });
const { error, loading, run } = useAsync(login);
const formEl = ref(null);

async function submit() {
  if (formEl.value && !formEl.value.checkValidity()) {
    formEl.value.classList.add("was-validated");
    formEl.value.querySelector(":invalid")?.focus();
    return;
  }

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
  <main class="container" id="main-content">
    <div class="card shadow-sm auth-card">
      <div class="card-body p-4">
        <h1 class="h3 text-center mb-4">Вход в аккаунт</h1>
        <form ref="formEl" @submit.prevent="submit" novalidate>
          <div class="mb-3">
            <label class="form-label" for="l-email">Email</label>
            <input type="email" class="form-control" id="l-email" v-model="form.email" required aria-describedby="l-email-feedback">
            <div class="invalid-feedback" id="l-email-feedback">Введите корректный email.</div>
          </div>
          <div class="mb-3">
            <label class="form-label" for="l-password">Пароль</label>
            <input type="password" class="form-control" id="l-password" v-model="form.password" minlength="4" required aria-describedby="l-password-feedback">
            <div class="invalid-feedback" id="l-password-feedback">Пароль должен содержать не менее 4 символов.</div>
          </div>
          <div v-if="error" class="alert-soft alert-soft-danger" role="alert" aria-live="assertive">
            <AppIcon name="icon-alert-circle" />
            Неверный email или пароль.
          </div>
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
