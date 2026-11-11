// Лайки, сохранённые рецепты и подписки: у всех трёх одинаковое устройство
// (запись связывает пользователя с рецептом или автором)
class SocialApi {
  constructor(instance) {
    this.API = instance
  }

  getLikes = async (params) => this.API({ url: '/likes', params })

  addLike = async (userId, recipeId) =>
    this.API({ method: 'POST', url: '/likes', data: { userId, recipeId } })

  removeLike = async (id) => this.API({ method: 'DELETE', url: `/likes/${id}` })

  // /saves закрыт правилом 600. json-server-auth проверяет список упрощённо
  // и на пустую коллекцию пользователя отвечает 403 — считаем это пустым списком
  getSaves = async (userId) => {
    try {
      return await this.API({ url: '/saves', params: { userId } })
    } catch (error) {
      if (error.response?.status === 403) return { data: [] }
      throw error
    }
  }

  addSave = async (userId, recipeId) =>
    this.API({ method: 'POST', url: '/saves', data: { userId, recipeId } })

  removeSave = async (id) => this.API({ method: 'DELETE', url: `/saves/${id}` })

  getSubscriptions = async (params) => this.API({ url: '/subscriptions', params })

  subscribe = async (userId, authorId) =>
    this.API({ method: 'POST', url: '/subscriptions', data: { userId, authorId } })

  unsubscribe = async (id) => this.API({ method: 'DELETE', url: `/subscriptions/${id}` })
}

export default SocialApi
