import { ref } from 'vue'
import { api } from '../api'

export function useRentals(userId) {
  const outgoing = ref([])
  const incoming = ref([])

  async function loadRentals() {
    const common = { _expand: 'property', _sort: 'createdAt', _order: 'desc' }
    const [mine, requests] = await Promise.all([
      api.get('/rentals', { params: { ...common, userId } }),
      api.get('/rentals', { params: { ...common, landlordId: userId } })
    ])
    outgoing.value = mine.data
    incoming.value = requests.data
  }

  return { outgoing, incoming, loadRentals }
}
