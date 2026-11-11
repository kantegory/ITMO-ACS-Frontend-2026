<script setup>
// иконка из общего SVG-спрайта (public/img/sprite.svg, см. ДЗ4)
defineProps({
  name: { type: String, required: true }
})

const sprite = `${import.meta.env.BASE_URL}img/sprite.svg`
</script>

<template>
  <svg class="icon" aria-hidden="true" focusable="false">
    <use :href="`${sprite}#icon-${name}`" />
  </svg>
</template>
