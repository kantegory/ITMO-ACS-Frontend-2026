// Корневой модуль API (IoC-контейнер): здесь решаем, с каким instance работает каждый класс
import instance from '@/api/instance'
import NotesApi from '@/api/notes'

const notesApi = new NotesApi(instance)

export { notesApi }
