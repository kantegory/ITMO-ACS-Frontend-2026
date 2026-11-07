<script setup>
// Иконка из SVG-спрайта (ДЗ4): на странице только ссылка <use> на символ из img/sprite.svg
defineProps({
  name: { type: String, required: true },
})

const spriteUrl = `${import.meta.env.BASE_URL}img/sprite.svg`
</script>

<template>
  <svg class="icon" aria-hidden="true"><use :href="`${spriteUrl}#${name}`" /></svg>
</template>
