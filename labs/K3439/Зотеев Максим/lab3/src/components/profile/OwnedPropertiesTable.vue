<script setup>
import { computed } from 'vue'
import { useFormatters } from '@/composables/useFormatters'

const props = defineProps({
  properties: { type: Array, required: true },
  activeRentals: { type: Array, required: true },
})

const { formatPrice } = useFormatters()

const rows = computed(() =>
  props.properties.map((property) => ({
    property,
    rental: props.activeRentals.find((rental) => rental.propertyId === property.id) ?? null,
  })),
)
</script>

<template>
  <div v-if="rows.length" class="table-responsive" role="region" aria-label="Объекты, которые вы сдаёте" tabindex="0">
    <table class="table table-hover align-middle bg-body">
      <caption class="visually-hidden">Объекты, которые вы сдаёте</caption>
      <thead>
        <tr>
          <th scope="col">Объект</th>
          <th scope="col">Цена</th>
          <th scope="col">Статус</th>
          <th scope="col">Арендатор</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="{ property, rental } in rows" :key="property.id">
          <td>
            <RouterLink :to="{ name: 'property', params: { id: property.id } }">
              {{ property.title }}
            </RouterLink>
          </td>
          <td>{{ formatPrice(property.price) }}</td>
          <td>
            <span v-if="rental" class="badge text-bg-success">Сдаётся</span>
            <span v-else class="badge text-bg-warning">Свободен</span>
          </td>
          <td>{{ rental?.tenantName ?? '—' }}</td>
        </tr>
      </tbody>
    </table>
  </div>
  <p v-else class="text-muted">У вас пока нет объявлений.</p>
</template>
