import instance, { apiURL } from '@/api/instance'
import AuthApi from '@/api/auth'
import RecipesApi from '@/api/recipes'
import AuthorsApi from '@/api/authors'
import CommentsApi from '@/api/comments'
import LikesApi from '@/api/likes'
import SavedApi from '@/api/saved'
import FollowingApi from '@/api/following'

export const authApi = new AuthApi(instance)
export const recipesApi = new RecipesApi(instance)
export const authorsApi = new AuthorsApi(instance)
export const commentsApi = new CommentsApi(instance)
export const likesApi = new LikesApi(instance)
export const savedApi = new SavedApi(instance)
export const followingApi = new FollowingApi(instance)

export { apiURL }
