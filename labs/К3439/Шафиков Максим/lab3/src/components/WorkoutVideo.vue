<script setup>
import { computed, nextTick, ref } from 'vue';
import { photoUrl } from '../format.js';
import AppIcon from './AppIcon.vue';

const props = defineProps({ workout: { type: Object, required: true } });
const videoId = computed(() => encodeURIComponent(props.workout.video));
const playing = ref(false);
const player = ref(null);

async function play() {
  playing.value = true;
  await nextTick();
  player.value?.focus();
}
</script>

<template>
  <section aria-label="Видео тренировки">
    <div class="video-panel">
      <iframe v-if="playing" ref="player" :title="workout.title"
        :src="'https://www.youtube-nocookie.com/embed/' + videoId + '?autoplay=1'"
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen />
      <template v-else>
        <img :data-photo="workout.image" :src="photoUrl(workout.image)" alt="" width="512" height="512">
        <button class="btn btn-primary" type="button" @click="play"><AppIcon name="play" />Смотреть тренировку</button>
      </template>
    </div>
    <p class="mt-2">
      <a :href="'https://www.youtube.com/watch?v=' + videoId" target="_blank" rel="noopener">Открыть видео HASfit на YouTube</a>
    </p>
  </section>
</template>
