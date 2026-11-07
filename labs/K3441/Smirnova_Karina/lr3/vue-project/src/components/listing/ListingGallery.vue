<script setup>
import { ref } from 'vue'
import BaseModal from '@/components/BaseModal.vue'
import spriteUrl from '@/assets/sprite.svg'
const props = defineProps({
  images: { type: Array, required: true },
  title: { type: String, required: true },
})
const open = ref(false)
const index = ref(0)
function show(position) {
  index.value = position
  open.value = true
}
function previous() {
  index.value = (index.value - 1 + props.images.length) % props.images.length
}
function next() {
  index.value = (index.value + 1) % props.images.length
}
</script>

<template>
  <section class="gallery-grid" aria-label="Фотографии объекта">
    <button
      v-for="(image, position) in images.slice(0, 5)"
      :key="image"
      type="button"
      :class="['gallery-button', { 'gallery-button--main': position === 0 }]"
      @click="show(position)"
    >
      <img :src="image" :alt="`${title}, фотография ${position + 1}`" />
    </button>
  </section>
  <BaseModal v-model="open" labelledby="gallery-title">
    <template #title><h2 id="gallery-title" class="h5 m-0">Фотографии объекта</h2></template>
    <div class="gallery-modal">
      <img :src="images[index]" :alt="`${title}, фотография ${index + 1}`" /><button
        class="gallery-control prev"
        aria-label="Предыдущее фото"
        @click="previous"
      >
        <svg class="gallery-control__icon" aria-hidden="true" focusable="false">
          <use :href="`${spriteUrl}#chevron-left`" />
        </svg></button
      ><button class="gallery-control next" aria-label="Следующее фото" @click="next">
        <svg class="gallery-control__icon" aria-hidden="true" focusable="false">
          <use :href="`${spriteUrl}#chevron-right`" />
        </svg>
      </button>
      <p>{{ index + 1 }} из {{ images.length }}</p>
    </div>
  </BaseModal>
</template>

<style scoped>
.gallery-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  grid-template-rows: 190px 190px;
  gap: 12px;
  margin: 24px 0;
}
.gallery-button {
  padding: 0;
  overflow: hidden;
  border: 0;
  border-radius: 12px;
  background: #ddd;
  cursor: pointer;
}
.gallery-button--main {
  grid-row: 1 / 3;
}
.gallery-button img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.2s;
}
.gallery-button:hover img {
  transform: scale(1.03);
}
.gallery-modal {
  position: relative;
  text-align: center;
}
.gallery-modal img {
  width: 100%;
  max-height: 65vh;
  object-fit: contain;
}
.gallery-control {
  position: absolute;
  top: 50%;
  translate: 0 -50%;
  width: 44px;
  height: 44px;
  border: 0;
  border-radius: 50%;
  background: rgb(0 0 0 / 60%);
  color: #fff;
  display: grid;
  place-items: center;
}
.gallery-control__icon {
  width: 22px;
  height: 22px;
  fill: currentColor;
}
.prev {
  left: 10px;
}
.next {
  right: 10px;
}
.gallery-modal p {
  margin: 10px 0 0;
  color: var(--rs-muted);
}
@media (max-width: 700px) {
  .gallery-grid {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 250px 120px 120px;
  }
  .gallery-button--main {
    grid-column: 1 / 3;
    grid-row: auto;
  }
}
</style>
