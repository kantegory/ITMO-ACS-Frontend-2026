export default class NotesApi {
  constructor(instance) {
    this.api = instance
  }

  async getAll() {
    const { data } = await this.api.get('/notes', { params: { userId: 1, _sort: 'id', _order: 'desc' } })
    return data
  }

  async createNote(note) {
    const { data } = await this.api.post('/notes', { ...note, userId: 1 })
    return data
  }

  async removeNote(id) {
    await this.api.delete(`/notes/${id}`)
  }
}
