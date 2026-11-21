<script setup>
import NavBar from "./components/NavBar.vue";
</script>

<template>
  <a class="visually-hidden-focusable" href="#main-content">Перейти к основному содержимому</a>
  <NavBar />
  <router-view />
</template>
