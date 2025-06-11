import { LoginPage } from '../pages/LoginPage.js'
import { VerificationPage } from '../pages/VerificationPage.js'
import { ChatPage } from '../pages/ChatPage.js'

export class Router {
  constructor() {
    this.routes = {
      'login': LoginPage,
      'verification': VerificationPage,
      'chat': ChatPage
    }
    this.currentPage = null
  }

  navigate(route, params = {}) {
    const PageClass = this.routes[route]
    if (!PageClass) {
      console.error(`Route ${route} not found`)
      return
    }

    if (this.currentPage && this.currentPage.destroy) {
      this.currentPage.destroy()
    }

    this.currentPage = new PageClass(params)
    this.render()
  }

  render() {
    const app = document.getElementById('app')
    if (this.currentPage) {
      app.innerHTML = this.currentPage.render()
      if (this.currentPage.mount) {
        this.currentPage.mount()
      }
    }
  }
}