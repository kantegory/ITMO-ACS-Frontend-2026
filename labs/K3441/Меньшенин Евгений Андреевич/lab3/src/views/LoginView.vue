<script setup>
import { useRoute, useRouter } from "vue-router";
import AuthForm from "../components/AuthForm.vue";
import { useAuth } from "../composables/useAuth.js";
const emit = defineEmits(["notify"]),
  router = useRouter(),
  route = useRoute(),
  { login } = useAuth();
async function submit(form) {
  try {
    await login(
      { email: form.email, password: form.password },
      form.remember,
    );
    emit("notify", "Вы успешно вошли");
    router.push(route.query.redirect || "/profile");
  } catch (e) {
    emit(
      "notify",
      e.response?.status === 400
        ? "Неверная почта или пароль"
        : e.userMessage || e.message,
    );
  }
}
</script>
<template>
  <section class="auth-page">
    <div class="container auth-layout">
      <div class="auth-art" aria-hidden="true"></div>
      <AuthForm mode="login" @submit="submit" @notify="$emit('notify', $event)" />
    </div>
  </section>
</template>
