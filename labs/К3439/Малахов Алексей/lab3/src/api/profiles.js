class ProfilesApi {
  constructor(instance) {
    this.API = instance
  }

  getAll = async () => {
    return this.API({ url: '/profiles' })
  }

  getOne = async (id) => {
    return this.API({ url: `/profiles/${id}` })
  }

  create = async (data) => {
    return this.API({ method: 'POST', url: '/profiles', data })
  }

  update = async (id, data) => {
    return this.API({ method: 'PATCH', url: `/profiles/${id}`, data })
  }
}

export default ProfilesApi
