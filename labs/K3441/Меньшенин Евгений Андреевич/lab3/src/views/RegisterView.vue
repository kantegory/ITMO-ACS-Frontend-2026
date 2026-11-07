<script setup>
import { useRouter } from "vue-router";
import AuthForm from "../components/AuthForm.vue";
import { useAuth } from "../composables/useAuth.js";
const emit = defineEmits(["notify"]),
  router = useRouter(),
  { register } = useAuth();
async function submit(form) {
  try {
    await register({
      name: form.name,
      surname: form.surname,
      email: form.email,
      password: form.password,
      username: form.email.split("@")[0],
      city: "",
      bio: "",
    });
    emit("notify", "Аккаунт создан");
    router.push("/profile");
  } catch (e) {
    emit("notify", e.userMessage || e.message);
  }
}
</script>
<template>
  <section class="auth-page">
    <div class="container auth-layout">
      <AuthForm mode="register" @submit="submit" />
      <div class="auth-art" aria-hidden="true"></div>
    </div>
  </section>
</template>
