<template>
  <main class="container my-4">
    <!-- сюда подставляется содержимое страницы, обёрнутой в лейаут -->
    <slot />
  </main>
</template>

<script>
export default {
  name: 'BaseLayout',
}
</script>
