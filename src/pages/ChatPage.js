import { ConversationList } from '../components/ConversationList.js'
import { ChatWindow } from '../components/ChatWindow.js'

export class ChatPage {
  constructor() {
    this.selectedConversation = null
    this.conversationList = new ConversationList()
    this.chatWindow = new ChatWindow()
    this.isMobile = window.innerWidth < 768
  }

  render() {
    return `
      <div class="h-screen flex bg-gray-100">
        <!-- Sidebar avec liste des conversations -->
        <div class="w-full md:w-1/3 bg-white border-r border-gray-200 flex flex-col ${this.selectedConversation && this.isMobile ? 'hidden' : ''}">
          <!-- Header -->
          <div class="bg-whatsapp-secondary p-4 text-white">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <img 
                  src="${window.app.getCurrentUser()?.avatar || 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=150'}" 
                  alt="Avatar" 
                  class="w-10 h-10 rounded-full object-cover"
                >
                <span class="font-medium">${window.app.getCurrentUser()?.name || 'Utilisateur'}</span>
              </div>
              <button id="logoutBtn" class="p-2 hover:bg-whatsapp-dark rounded-full transition-colors">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16 17v-3H9v-4h7V7l5 5-5 5M14 2a2 2 0 012 2v2h-2V4H4v16h10v-2h2v2a2 2 0 01-2 2H4a2 2 0 01-2-2V4a2 2 0 012-2h10z"/>
                </svg>
              </button>
            </div>
          </div>
          
          <!-- Search bar -->
          <div class="p-4 border-b border-gray-200">
            <div class="relative">
              <input 
                type="text" 
                placeholder="Rechercher..." 
                class="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-whatsapp-primary"
              >
              <svg class="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
              </svg>
            </div>
          </div>
          
          <!-- Conversations list -->
          <div id="conversationsList" class="flex-1 overflow-y-auto">
            <!-- Sera rempli par ConversationList -->
          </div>
        </div>

        <!-- Zone de chat -->
        <div class="flex-1 flex flex-col ${!this.selectedConversation && this.isMobile ? 'hidden' : ''}">
          ${this.selectedConversation ? `
            <div id="chatWindow">
              <!-- Sera rempli par ChatWindow -->
            </div>
          ` : `
            <div class="flex-1 flex items-center justify-center bg-whatsapp-gray">
              <div class="text-center text-gray-500">
                <svg class="w-32 h-32 mx-auto mb-4 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
                </svg>
                <h3 class="text-xl font-medium mb-2">Sélectionnez une conversation</h3>
                <p>Choisissez une conversation dans la liste pour commencer à chatter</p>
              </div>
            </div>
          `}
        </div>
      </div>
    `
  }

  mount() {
    // Gestion de la déconnexion
    const logoutBtn = document.getElementById('logoutBtn')
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        if (confirm('Voulez-vous vraiment vous déconnecter ?')) {
          window.app.authManager.logout()
        }
      })
    }

    // Monter la liste des conversations
    this.conversationList.mount('conversationsList')
    
    // Écouter la sélection de conversation
    this.conversationList.on('conversationSelected', (conversation) => {
      this.selectedConversation = conversation
      this.updateChatWindow()
    })

    // Gestion responsive
    this.handleResize()
    window.addEventListener('resize', () => this.handleResize())
  }

  handleResize() {
    this.isMobile = window.innerWidth < 768
    this.updateUI()
  }

  updateChatWindow() {
    if (this.selectedConversation) {
      this.chatWindow.setConversation(this.selectedConversation)
      this.chatWindow.mount('chatWindow')
      
      if (this.isMobile) {
        this.updateUI()
      }
    }
  }

  updateUI() {
    const app = document.getElementById('app')
    app.innerHTML = this.render()
    this.mount()
  }

  destroy() {
    window.removeEventListener('resize', this.handleResize)
  }
}