<script setup>
/**
 * AuthorCard.vue — карточка кулинара с подпиской.
 *
 * Используется на главной, в личном кабинете и на странице рецепта.
 */

import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useCatalogStore } from '@/stores/catalog';
import { announce } from '@/composables/useLiveRegion';

const props = defineProps({
  author: { type: Object, required: true },
  headingLevel: { type: Number, default: 3 },
  showSubscribe: { type: Boolean, default: true },
});

const auth = useAuthStore();
const catalog = useCatalogStore();
const router = useRouter();

const submitting = ref(false);
const error = ref('');

const headingTag = computed(() => `h${props.headingLevel}`);
const subscribed = computed(() => catalog.isSubscribed(props.author.id));
const subscribersCount = computed(
  () => Number(props.author.subscribers || 0) + (subscribed.value ? 1 : 0),
);

async function toggle() {
  error.value = '';

  if (!auth.user) {
    router.push({
      name: 'login',
      query: { redirect: router.currentRoute.value.fullPath },
    });
    return;
  }

  submitting.value = true;
  try {
    const active = await catalog.toggleSubscription(
      props.author.id,
      auth.user.id,
    );
    announce(
      active ? 'Вы подписались на кулинара' : 'Вы отписались от кулинара',
    );
  } catch (err) {
    error.value = err?.message || 'Не удалось изменить подписку.';
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <div class="card h-100">
    <div class="card-body">
      <component :is="headingTag" class="h6 mb-1">
        {{ author.name }}
      </component>
      <p v-if="author.bio" class="text-muted small mb-2">
        {{ author.bio }}
      </p>
      <span class="badge rh-badge">
        {{ subscribersCount }} подписчиков
      </span>

      <div
        v-if="error"
        class="alert alert-danger py-2 px-3 small mt-2 mb-0"
        role="alert"
      >
        {{ error }}
      </div>
    </div>

    <div v-if="showSubscribe" class="card-footer bg-body border-top-0">
      <button
        class="btn btn-sm btn-outline-secondary w-100"
        type="button"
        :class="{ 'is-active': subscribed }"
        :aria-pressed="subscribed"
        :disabled="submitting"
        @click="toggle"
      >
        {{ subscribed ? 'Вы подписаны' : 'Подписаться' }}
      </button>
    </div>

    <div v-if="$slots.footer" class="card-footer bg-body">
      <slot name="footer" />
    </div>
  </div>
</template>
