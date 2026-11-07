class SocialApi {
  constructor(instance, resource) {
    this.API = instance
    this.resource = resource
  }

  find = async (params) => {
    return this.API({ url: `/${this.resource}`, params })
  }

  add = async (data) => {
    return this.API({ method: 'POST', url: `/${this.resource}`, data })
  }

  remove = async (id) => {
    return this.API({ method: 'DELETE', url: `/${this.resource}/${id}` })
  }
}

export default SocialApi
