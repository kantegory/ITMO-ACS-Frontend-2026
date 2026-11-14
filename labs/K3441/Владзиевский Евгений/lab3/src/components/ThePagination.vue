<script setup>
import { computed } from 'vue';

const props = defineProps({
  page: { type: Number, required: true },
  total: { type: Number, required: true },
  perPage: { type: Number, default: 6 }
});

const emit = defineEmits(['update:page']);

const pages = computed(() => Math.max(1, Math.ceil(props.total / props.perPage)));
</script>

<template>
  <nav v-if="pages > 1" class="mt-4" aria-label="Страницы результатов">
    <ul class="pagination justify-content-center">
      <li class="page-item">
        <button class="page-link" type="button" :disabled="page === 1" @click="emit('update:page', page - 1)">
          Назад
        </button>
      </li>

      <li v-for="n in pages" :key="n" class="page-item" :class="{ active: n === page }" :aria-current="n === page ? 'page' : undefined">
        <span v-if="n === page" class="page-link">{{ n }}<span class="visually-hidden"> (текущая страница)</span></span>
        <button v-else class="page-link" type="button" :aria-label="`Страница ${n}`" @click="emit('update:page', n)">{{ n }}</button>
      </li>

      <li class="page-item">
        <button class="page-link" type="button" :disabled="page === pages" @click="emit('update:page', page + 1)">
          Дальше
        </button>
      </li>
    </ul>
  </nav>
</template>
