// «Контейнер» API: здесь решаем, с каким экземпляром axios работает каждый модуль
import instance from '@/api/instance'
import NotesApi from '@/api/notes'

const notesApi = new NotesApi(instance)

export {
  notesApi
}
