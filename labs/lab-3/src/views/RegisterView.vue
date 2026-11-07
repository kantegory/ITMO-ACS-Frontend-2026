<script setup>
import { computed, reactive } from "vue";
import { useRouter } from "vue-router";
import { useAuth } from "../composables/useAuth";
import { useAsync } from "../composables/useAsync";
import { register } from "../api/auth";

const router = useRouter();
const { setSession } = useAuth();
const form = reactive({ name: "", email: "", password: "", password2: "", terms: false });
const { error, loading, run } = useAsync(register);

const passwordsMismatch = computed(() => form.password2 !== "" && form.password !== form.password2);

async function submit() {
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
  <main class="container">
    <div class="card shadow-sm auth-card">
      <div class="card-body p-4">
        <h1 class="h3 text-center mb-4">Регистрация</h1>
        <form @submit.prevent="submit" novalidate>
          <div class="mb-3">
            <label class="form-label">Имя</label>
            <input type="text" class="form-control" v-model="form.name" required>
          </div>
          <div class="mb-3">
            <label class="form-label">Email</label>
            <input type="email" class="form-control" v-model="form.email" required>
          </div>
          <div class="mb-3">
            <label class="form-label">Пароль</label>
            <input type="password" class="form-control" v-model="form.password" minlength="4" required>
          </div>
          <div class="mb-3">
            <label class="form-label">Повторите пароль</label>
            <input type="password" class="form-control" v-model="form.password2" minlength="4" required>
            <div v-if="passwordsMismatch" class="text-danger small mt-1">Пароли не совпадают.</div>
          </div>
          <div class="form-check mb-3">
            <input class="form-check-input" type="checkbox" v-model="form.terms" id="r-terms" required>
            <label class="form-check-label" for="r-terms">Я согласен с условиями использования</label>
          </div>
          <div v-if="error" class="alert alert-danger">Пользователь с таким email уже зарегистрирован.</div>
          <button type="submit" class="btn btn-brand w-100" :disabled="loading">Зарегистрироваться</button>
        </form>
        <p class="text-center mt-3 mb-0">
          Уже есть аккаунт? <router-link to="/login">Войти</router-link>
        </p>
      </div>
    </div>
  </main>
</template>
