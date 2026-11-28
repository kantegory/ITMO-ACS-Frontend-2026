<script setup>
import SvgIcon from '@/components/common/SvgIcon.vue'

defineProps({
  user: { type: Object, required: true },
  initials: { type: String, required: true },
  fullName: { type: String, required: true },
})

defineEmits(['add-listing'])
</script>

<template>
  <div class="card text-center">
    <div class="card-body">
      <div class="avatar rounded-circle fs-2 mx-auto mb-3" aria-hidden="true">
        {{ initials }}
      </div>
      <h1 class="h5 mb-1">{{ fullName }}</h1>
      <p class="text-muted small mb-3">
        <span>{{ user.email }}</span>
        <template v-if="user.phone">
          <br>
          <span>{{ user.phone }}</span>
        </template>
      </p>
      <button type="button" class="btn btn-primary w-100" @click="$emit('add-listing')">
        <SvgIcon name="plus" /> Сдать жильё
      </button>
    </div>
  </div>
</template>
