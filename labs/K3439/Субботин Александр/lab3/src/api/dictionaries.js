// Справочники для фильтров и формы поиска: кухни, районы, особенности ресторанов
class DictionariesApi {
  constructor(instance) {
    this.API = instance
  }

  getCuisines = async () => {
    const response = await this.API.get('/cuisines')
    return response.data
  }

  getDistricts = async () => {
    const response = await this.API.get('/districts')
    return response.data
  }

  getFeatures = async () => {
    const response = await this.API.get('/features')
    return response.data
  }
}

export default DictionariesApi
