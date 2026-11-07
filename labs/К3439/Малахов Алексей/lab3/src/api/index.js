import instance from '@/api/instance'
import AuthApi from '@/api/auth'
import ProfilesApi from '@/api/profiles'
import RecipesApi from '@/api/recipes'
import SocialApi from '@/api/social'

const authApi = new AuthApi(instance)
const profilesApi = new ProfilesApi(instance)
const recipesApi = new RecipesApi(instance)
const likesApi = new SocialApi(instance, 'likes')
const savedApi = new SocialApi(instance, 'saved')
const followsApi = new SocialApi(instance, 'follows')
const commentsApi = new SocialApi(instance, 'comments')

export { authApi, profilesApi, recipesApi, likesApi, savedApi, followsApi, commentsApi }
