import instance, { setUnauthorizedHandler } from './instance'
import AuthApi from './auth'
import UsersApi from './users'
import PropertiesApi from './properties'
import RentalsApi from './rentals'
import MessagesApi from './messages'
import ViewingsApi from './viewings'

export { instance as apiClient, setUnauthorizedHandler }
export const authApi = new AuthApi(instance)
export const usersApi = new UsersApi(instance)
export const propertiesApi = new PropertiesApi(instance)
export const rentalsApi = new RentalsApi(instance)
export const messagesApi = new MessagesApi(instance)
export const viewingsApi = new ViewingsApi(instance)
