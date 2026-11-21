<script setup>
defineProps({
  listing: { type: Object, required: true },
  saved: Boolean
})
defineEmits(['toggle'])
const priceFormat = new Intl.NumberFormat('ru-RU')
</script>

<template>
  <article class="listing">
    <p class="location">{{ listing.city }} · {{ listing.type }}</p>
    <h2>{{ listing.title }}</h2>
    <p class="price">{{ priceFormat.format(listing.price) }} ₽ <span>/ мес</span></p>
    <button type="button" :aria-pressed="saved" :aria-label="'В избранном: ' + listing.title" @click="$emit('toggle', listing.id)">
      {{ saved ? 'В избранном' : 'Сохранить' }}
    </button>
  </article>
</template>
