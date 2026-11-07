<script setup>
import { computed } from 'vue'

// Скринридер прочитал бы «₽₽» как «рубль рубль», поэтому у значка есть текстовая альтернатива
const props = defineProps({
  level: { type: Number, required: true },
})

const dim = computed(() => '₽'.repeat(3 - props.level))
</script>

<template>
  <span class="price-level" role="img" :aria-label="`Ценовой уровень ${level} из 3`">{{ '₽'.repeat(level) }}<span v-if="dim" class="dim">{{ dim }}</span></span>
</template>
