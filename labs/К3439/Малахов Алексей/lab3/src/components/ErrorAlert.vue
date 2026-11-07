<template>
  <div class="alert alert-danger" role="alert">{{ error.message }}</div>
</template>

<script setup>
defineProps({
  error: { type: Object, required: true },
})
</script>
