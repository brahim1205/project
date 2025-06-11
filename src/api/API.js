export class API {
  constructor() {
    this.baseURL = 'https://backend-n0fo.onrender.com'
  }

  async get(endpoint) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`)
      return await response.json()
    } catch (error) {
      console.error(`Erreur GET ${endpoint}:`, error)
      throw error
    }
  }

  async post(endpoint, data) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
      return await response.json()
    } catch (error) {
      console.error(`Erreur POST ${endpoint}:`, error)
      throw error
    }
  }

  async put(endpoint, data) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
      return await response.json()
    } catch (error) {
      console.error(`Erreur PUT ${endpoint}:`, error)
      throw error
    }
  }

  async delete(endpoint) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'DELETE'
      })
      return await response.json()
    } catch (error) {
      console.error(`Erreur DELETE ${endpoint}:`, error)
      throw error
    }
  }
}