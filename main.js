import './style.css'
import { AuthManager } from './src/auth/AuthManager.js'
import { Router } from './src/router/Router.js'
import { API } from './src/api/API.js'

class App {
  constructor() {
    this.authManager = new AuthManager()
    this.router = new Router()
    this.api = new API()
    this.currentUser = null
    
    this.init()
  }

  async init() {
    // Vérifier si l'utilisateur est déjà connecté
    const savedUser = localStorage.getItem('currentUser')
    if (savedUser) {
      this.currentUser = JSON.parse(savedUser)
      this.router.navigate('chat')
    } else {
      this.router.navigate('login')
    }

    // Écouter les événements d'authentification
    this.authManager.on('authenticated', (user) => {
      this.currentUser = user
      localStorage.setItem('currentUser', JSON.stringify(user))
      this.router.navigate('chat')
    })

    this.authManager.on('logout', () => {
      this.currentUser = null
      localStorage.removeItem('currentUser')
      this.router.navigate('login')
    })
  }

  getCurrentUser() {
    return this.currentUser
  }
}

// Initialiser l'application
window.app = new App()