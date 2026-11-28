export default class RentalsApi {
  constructor(client) {
    this.client = client
  }

  getTenantRentals(tenantId) {
    return this.client
      .get('/rentals', {
        params: {
          tenantId,
          status_ne: 'cancelled',
          _expand: 'property',
          _sort: 'startDate',
          _order: 'desc',
        },
      })
      .then(({ data }) => data)
  }

  getActiveOwnerRentals(ownerId) {
    return this.client
      .get('/rentals', {
        params: { ownerId, status: 'active' },
      })
      .then(({ data }) => data)
  }

  // Пользователь бывает и арендатором, и владельцем, поэтому запрашиваем обе стороны
  async getUserDeals(userId) {
    const [{ data: asTenant }, { data: asOwner }] = await Promise.all([
      this.client.get('/rentals', { params: { tenantId: userId, _expand: 'property' } }),
      this.client.get('/rentals', { params: { ownerId: userId, _expand: 'property' } }),
    ])
    const unique = new Map([...asTenant, ...asOwner].map((deal) => [deal.id, deal]))
    return [...unique.values()].sort((a, b) => b.startDate.localeCompare(a.startDate))
  }
}
