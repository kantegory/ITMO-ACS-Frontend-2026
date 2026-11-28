export default class NotesApi {
  constructor(client) {
    this.client = client
  }

  getAll() {
    return this.client.get('/notes')
  }

  createNote(note) {
    return this.client.post('/notes', note)
  }
}
