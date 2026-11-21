<script setup>
import { formatDate, formatPrice, STATUS_NAMES } from '../format'
defineProps({ rentals: Array, caption: String })
</script>

<template>
  <p v-if="!rentals.length" class="text-body-secondary">Заявок пока нет</p>
  <div v-else class="table-responsive">
    <table class="table align-middle">
      <caption class="visually-hidden">{{ caption }}</caption>
      <thead><tr><th scope="col">Объект</th><th scope="col">Даты</th><th scope="col">Сумма</th><th scope="col">Статус</th></tr></thead>
      <tbody>
        <tr v-for="rental in rentals" :key="rental.id">
          <td><RouterLink :to="{ name: 'property', params: { id: rental.propertyId } }">{{ rental.property?.title || 'Объявление' }}</RouterLink></td>
          <td>{{ formatDate(rental.startDate) }} — {{ formatDate(rental.endDate) }}</td>
          <td>{{ formatPrice(rental.totalPrice) }}</td>
          <td>
            <span :class="'badge text-bg-' + (STATUS_NAMES[rental.status]?.[1] || 'secondary')">
              {{ STATUS_NAMES[rental.status]?.[0] || rental.status }}
            </span>
            <slot name="actions" :rental="rental" />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
