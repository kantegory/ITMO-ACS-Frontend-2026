<script setup>
import { useRouter } from "vue-router";
import { useAuth } from "../composables/useAuth";

const router = useRouter();
const { user, clearSession } = useAuth();

function logout() {
  clearSession();
  router.push("/");
}
</script>

<template>
  <nav class="navbar navbar-expand-lg navbar-dark" style="background-color:#922b21;">
    <div class="container">
      <router-link class="navbar-brand" to="/">TableBook</router-link>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navMenu">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navMenu">
        <ul class="navbar-nav me-auto">
          <li class="nav-item"><router-link class="nav-link" to="/">Поиск ресторанов</router-link></li>
          <li class="nav-item"><router-link class="nav-link" to="/profile">Личный кабинет</router-link></li>
        </ul>
        <ul class="navbar-nav align-items-lg-center">
          <li v-if="user" class="nav-item dropdown">
            <a class="nav-link dropdown-toggle text-white" href="#" data-bs-toggle="dropdown">{{ user.name }}</a>
            <ul class="dropdown-menu dropdown-menu-end">
              <li><router-link class="dropdown-item" to="/profile">Личный кабинет</router-link></li>
              <li><a class="dropdown-item" href="#" @click.prevent="logout">Выйти</a></li>
            </ul>
          </li>
          <template v-else>
            <li class="nav-item"><router-link class="nav-link" to="/login">Вход</router-link></li>
            <li class="nav-item"><router-link class="btn btn-light btn-sm ms-2" to="/register">Регистрация</router-link></li>
          </template>
        </ul>
      </div>
    </div>
  </nav>
</template>
