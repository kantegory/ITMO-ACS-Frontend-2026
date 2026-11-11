// «Контейнер» API: каждый модуль получает общий экземпляр axios
import instance from '@/api/instance'
import AuthApi from '@/api/auth'
import CommentsApi from '@/api/comments'
import RecipesApi from '@/api/recipes'
import SocialApi from '@/api/social'
import UsersApi from '@/api/users'

const authApi = new AuthApi(instance)
const recipesApi = new RecipesApi(instance)
const usersApi = new UsersApi(instance)
const commentsApi = new CommentsApi(instance)
const socialApi = new SocialApi(instance)

export { authApi, recipesApi, usersApi, commentsApi, socialApi }
