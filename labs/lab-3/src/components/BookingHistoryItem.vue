<script setup>
defineProps({
  booking: { type: Object, required: true }
});

const emit = defineEmits(["cancel"]);

const STATUS_CLASS = {
  confirmed: "status-badge-confirmed",
  cancelled: "status-badge-cancelled"
};

const STATUS_LABEL = {
  confirmed: "Подтверждено",
  cancelled: "Отменено"
};

function statusBadgeClass(status) {
  return STATUS_CLASS[status] || "status-badge-pending";
}

function statusLabel(status) {
  return STATUS_LABEL[status] || "Ожидает";
}
</script>

<template>
  <div class="card mb-3 booking-history-item">
    <div class="card-body d-flex justify-content-between align-items-start">
      <div>
        <h3 class="h6 mb-1">{{ booking.restaurantName }}</h3>
        <p class="mb-1 text-muted">{{ booking.date }} в {{ booking.time }} · {{ booking.guests }} гостей</p>
        <p v-if="booking.comment" class="mb-0 small">Комментарий: {{ booking.comment }}</p>
      </div>
      <div class="text-end">
        <span class="badge mb-2" :class="statusBadgeClass(booking.status)">{{ statusLabel(booking.status) }}</span><br>
        <button
          v-if="booking.status !== 'cancelled'"
          class="btn btn-sm btn-outline-danger"
          @click="emit('cancel', booking.id)"
        >Отменить</button>
      </div>
    </div>
  </div>
</template>
