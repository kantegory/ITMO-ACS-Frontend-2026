export default class MessagesApi {
  constructor(client) {
    this.client = client
  }

  // Пользователь бывает и арендатором, и владельцем, поэтому запрашиваем обе стороны
  async getUserConversations(userId) {
    const [{ data: asTenant }, { data: asOwner }] = await Promise.all([
      this.client.get('/conversations', { params: { tenantId: userId, _expand: 'property' } }),
      this.client.get('/conversations', { params: { ownerId: userId, _expand: 'property' } }),
    ])
    const unique = new Map([...asTenant, ...asOwner].map((item) => [item.id, item]))
    return [...unique.values()]
  }

  async findOrCreateConversation(property, user) {
    const { data: existing } = await this.client.get('/conversations', {
      params: { propertyId: property.id, tenantId: user.id },
    })
    if (existing[0]) return existing[0]

    const { data: created } = await this.client.post('/conversations', {
      propertyId: property.id,
      tenantId: user.id,
      tenantName: `${user.firstName} ${user.lastName}`,
      ownerId: property.userId,
      ownerName: property.ownerName,
    })
    return created
  }

  getMessages(conversationId) {
    return this.client
      .get('/messages', { params: { conversationId, _sort: 'id' } })
      .then(({ data }) => data)
  }

  sendMessage({ conversationId, senderId, text }) {
    return this.client
      .post('/messages', { conversationId, senderId, text })
      .then(({ data }) => data)
  }

  async sendToOwner(property, user, text) {
    const conversation = await this.findOrCreateConversation(property, user)
    return this.sendMessage({
      conversationId: conversation.id,
      senderId: user.id,
      text,
    })
  }
}
