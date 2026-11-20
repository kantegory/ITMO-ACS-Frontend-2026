class NotesApi {
  constructor(instance) {
    this.API = instance
  }

  getAll = async () => this.API({ url: '/notes' })

  createNote = async (data) => this.API({
    method: 'POST',
    url: '/notes',
    data,
    headers: { 'Content-Type': 'application/json' }
  })
}

export default NotesApi
