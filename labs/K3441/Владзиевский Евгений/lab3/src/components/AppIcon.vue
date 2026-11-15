<script setup>
// Иконка из общего SVG-спрайта (ДЗ4). Размер — в em, цвет наследуется.
defineProps({
  name: { type: String, required: true }
});
</script>

<template>
  <svg class="icon" aria-hidden="true"><use :href="`/img/sprite.svg#${name}`" /></svg>
</template>
