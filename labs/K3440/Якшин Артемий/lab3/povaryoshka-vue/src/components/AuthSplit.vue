<script setup>
// Экран входа и регистрации: слева фото блюда с цитатой автора, справа форма (слот)
defineProps({
  image: { type: String, required: true },
  quote: { type: String, required: true },
  author: { type: String, required: true }
})
</script>

<template>
  <div class="auth">
    <div class="auth__media d-none d-lg-flex" :style="{ backgroundImage: `url('${image}')` }">
      <blockquote class="auth__quote mb-0">
        «{{ quote }}»
        <footer>{{ author }}</footer>
      </blockquote>
    </div>
    <div class="auth__body">
      <div class="auth__card">
        <slot />
      </div>
    </div>
  </div>
</template>
