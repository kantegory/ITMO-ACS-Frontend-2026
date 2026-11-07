<script setup>
import { computed } from 'vue'

import { formatMoney } from '@/utils/format'

const props = defineProps({
  items: { type: Array, required: true },
})

// Блюда приходят списком, на странице они сгруппированы по разделам меню
const categories = computed(() => [...Map.groupBy(props.items, (item) => item.category)])
</script>

<template>
  <section
    v-for="([category, dishes], index) in categories"
    :key="category"
    class="menu-section"
    :aria-labelledby="`menu-category-${index}`"
  >
    <h3 :id="`menu-category-${index}`" class="h5">{{ category }}</h3>
    <ul class="menu-list">
      <li v-for="dish in dishes" :key="dish.id">
        <div class="menu-item-head">
          <span class="dish-name">{{ dish.name }} <span v-if="dish.badge" class="badge text-bg-light border ms-1">{{ dish.badge }}</span></span>
          <span class="dish-price">{{ formatMoney(dish.price) }}</span>
        </div>
        <p class="dish-desc">{{ dish.description }}</p>
      </li>
    </ul>
  </section>
</template>
