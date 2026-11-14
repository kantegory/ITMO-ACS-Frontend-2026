<script setup>
import { computed } from 'vue';
import { useFormat } from '../composables/useFormat.js';

const props = defineProps({
  value: { type: Number, required: true },
  large: { type: Boolean, default: false }
});

const { price } = useFormat();
const formatted = computed(() => price(props.value));
</script>

<template>
  <span class="price-tag" :class="{ 'price-tag-lg': large }">
    {{ formatted }} <small>/ мес</small>
  </span>
</template>
