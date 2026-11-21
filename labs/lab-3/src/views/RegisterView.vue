<script setup>
import { computed, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import AppIcon from "../components/AppIcon.vue";
import { useAuth } from "../composables/useAuth";
import { useAsync } from "../composables/useAsync";
import { register } from "../api/auth";

const router = useRouter();
const { setSession } = useAuth();
const form = reactive({ name: "", email: "", password: "", password2: "", terms: false });
const { error, loading, run } = useAsync(register);
const formEl = ref(null);

const passwordsMismatch = computed(() => form.password2 !== "" && form.password !== form.password2);

async function submit() {
  if (formEl.value && !formEl.value.checkValidity()) {
    formEl.value.classList.add("was-validated");
    formEl.value.querySelector(":invalid")?.focus();
    return;
  }
  if (passwordsMismatch.value || !form.terms) return;

  try {
    const data = await run(form.name, form.email, form.password);
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
        <h1 class="h3 text-center mb-4">Регистрация</h1>
        <form ref="formEl" @submit.prevent="submit" novalidate>
          <div class="mb-3">
            <label class="form-label" for="r-name">Имя</label>
            <input type="text" class="form-control" id="r-name" v-model="form.name" required aria-describedby="r-name-feedback">
            <div class="invalid-feedback" id="r-name-feedback">Введите ваше имя.</div>
          </div>
          <div class="mb-3">
            <label class="form-label" for="r-email">Email</label>
            <input type="email" class="form-control" id="r-email" v-model="form.email" required aria-describedby="r-email-feedback">
            <div class="invalid-feedback" id="r-email-feedback">Введите корректный email.</div>
          </div>
          <div class="mb-3">
            <label class="form-label" for="r-password">Пароль</label>
            <input type="password" class="form-control" id="r-password" v-model="form.password" minlength="4" required aria-describedby="r-password-feedback">
            <div class="invalid-feedback" id="r-password-feedback">Пароль должен содержать не менее 4 символов.</div>
          </div>
          <div class="mb-3">
            <label class="form-label" for="r-password2">Повторите пароль</label>
            <input type="password" class="form-control" id="r-password2" v-model="form.password2" minlength="4" required aria-describedby="r-password2-feedback">
            <div class="invalid-feedback" id="r-password2-feedback">Пароли не совпадают.</div>
            <div v-if="passwordsMismatch" class="text-danger small mt-1" role="alert">Пароли не совпадают.</div>
          </div>
          <div class="form-check mb-3">
            <input class="form-check-input" type="checkbox" v-model="form.terms" id="r-terms" required aria-describedby="r-terms-feedback">
            <label class="form-check-label" for="r-terms">Я согласен с условиями использования</label>
            <div class="invalid-feedback" id="r-terms-feedback">Необходимо согласие с условиями.</div>
          </div>
          <div v-if="error" class="alert-soft alert-soft-danger" role="alert" aria-live="assertive">
            <AppIcon name="icon-alert-circle" />
            Пользователь с таким email уже зарегистрирован.
          </div>
          <button type="submit" class="btn btn-brand w-100" :disabled="loading">Зарегистрироваться</button>
        </form>
        <p class="text-center mt-3 mb-0">
          Уже есть аккаунт? <router-link to="/login">Войти</router-link>
        </p>
      </div>
    </div>
  </main>
</template>
