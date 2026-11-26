<script setup>
import { RouterLink, useRouter } from 'vue-router';
import { useRequest } from '../composables/useRequest.js';
import { useSessionStore } from '../stores/session.js';

const router = useRouter();
const session = useSessionStore();
const { pending, run } = useRequest();

async function logout() {
  await run(() => session.logout());
  await router.replace('/');
}
</script>

<template>
  <RouterLink to="/" class="back-link">К ресторанам</RouterLink>
  <section class="account-panel panel">
    <h1>Личный кабинет</h1>
    <template v-if="session.user">
      <dl class="profile-data"><div><dt>Имя</dt><dd>{{ session.user.name }}</dd></div><div><dt>Электронная почта</dt><dd>{{ session.user.email }}</dd></div></dl>
      <div class="action-row">
        <RouterLink to="/history" class="btn btn-primary">Мои брони</RouterLink>
        <button type="button" class="btn btn-outline-primary" :disabled="pending" @click="logout">Выйти</button>
      </div>
    </template>
  </section>
</template>
