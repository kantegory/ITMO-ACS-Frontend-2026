<script setup>
import { useFormatters } from '@/composables/useFormatters'

defineProps({
  deals: { type: Array, required: true },
  currentUserId: { type: Number, required: true },
})

const { formatDate, formatPrice, getDealStatus } = useFormatters()
</script>

<template>
  <h2 id="dealsTitle" class="h3 mb-3">История сделок</h2>
  <div v-if="deals.length" class="table-responsive" role="region" aria-labelledby="dealsTitle" tabindex="0">
    <table class="table table-striped bg-body" aria-labelledby="dealsTitle">
      <thead>
        <tr>
          <th scope="col">Дата</th>
          <th scope="col">Объект</th>
          <th scope="col">Роль</th>
          <th scope="col">Сумма в месяц</th>
          <th scope="col">Статус</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="deal in deals" :key="deal.id">
          <td>{{ formatDate(deal.startDate) }}</td>
          <td>
            <RouterLink
              v-if="deal.property"
              :to="{ name: 'property', params: { id: deal.property.id } }"
            >
              {{ deal.property.title }}
            </RouterLink>
            <span v-else>—</span>
          </td>
          <td>{{ deal.ownerId === currentUserId ? 'Владелец' : 'Арендатор' }}</td>
          <td>{{ formatPrice(deal.price) }}</td>
          <td>
            <span :class="['badge', getDealStatus(deal.status).badge]">
              {{ getDealStatus(deal.status).label }}
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  <p v-else class="text-muted">Сделок пока нет.</p>
</template>
