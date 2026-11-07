<script setup>
import { reactive, ref } from "vue";
const props = defineProps({ mode: { type: String, required: true } });
const emit = defineEmits(["submit", "notify"]);
const form = reactive({
  name: "",
  surname: "",
  email: "",
  password: "",
  remember: false,
  terms: false,
});
const busy = ref(false);
async function submit() {
  busy.value = true;
  try {
    await emit("submit", { ...form });
  } finally {
    busy.value = false;
  }
}
</script>
<template>
  <form class="paper-card auth-card" @submit.prevent="submit">
    <span class="eyebrow">{{
      mode === "login" ? "С возвращением" : "Присоединяйтесь"
    }}</span>
    <h1>{{ mode === "login" ? "Войдите на кухню" : "Создайте аккаунт" }}</h1>
    <p class="muted auth-copy">
      {{
        mode === "login"
          ? "Продолжите собирать любимые рецепты и следить за новыми публикациями авторов."
          : "Собирайте любимые рецепты, оставляйте комментарии и подписывайтесь на интересных авторов."
      }}
    </p>
    <template v-if="mode === 'register'"
      ><label
        >Имя<input
          v-model.trim="form.name"
          name="name"
          autocomplete="given-name"
          required /></label
      ><label
        >Фамилия<input
          v-model.trim="form.surname"
          name="surname"
          autocomplete="family-name"
          required /></label></template
    ><label
      >Электронная почта<input
        v-model.trim="form.email"
        name="email"
        type="email"
        autocomplete="email"
        required /></label
    ><div class="form-field">
      <span class="label-row">
        <label for="authPassword">Пароль</label>
        <button
          v-if="mode === 'login'"
          class="link-button"
          type="button"
          @click="$emit('notify', 'Эта возможность скоро появится')"
        >
          Забыли пароль?
        </button>
      </span>
      <input
        id="authPassword"
        v-model="form.password"
        name="password"
        type="password"
        :minlength="mode === 'login' ? 6 : 8"
        :autocomplete="mode === 'login' ? 'current-password' : 'new-password'"
        required />
    </div>
    <label v-if="mode === 'register'" class="check-row">
      <input v-model="form.terms" type="checkbox" required />
      <span>Я принимаю правила сообщества</span>
    </label>
    <label v-if="mode === 'login'" class="check-row">
      <input v-model="form.remember" type="checkbox" />
      <span>Запомнить меня</span>
    </label>
    <button class="button primary wide" :disabled="busy">
      {{ busy ? "Подождите…" : mode === "login" ? "Войти" : "Создать аккаунт" }}
    </button>
    <template v-if="mode === 'login'">
      <div class="auth-divider">или</div>
      <button
        class="button social wide"
        type="button"
        @click="$emit('notify', 'Эта возможность скоро появится')"
      >
        Продолжить с Google
      </button>
    </template>
    <p v-if="mode === 'login'" class="muted">
      Нет аккаунта? <RouterLink to="/register">Зарегистрироваться</RouterLink>
    </p>
    <p v-else class="muted">
      Уже есть аккаунт? <RouterLink to="/login">Войти</RouterLink>
    </p>
  </form>
</template>
