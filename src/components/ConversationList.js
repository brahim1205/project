export class ConversationList {
  constructor() {
    this.conversations = []
    this.users = []
    this.events = {}
    this.loadData()
  }

  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = []
    }
    this.events[event].push(callback)
  }

  emit(event, data) {
    if (this.events[event]) {
      this.events[event].forEach(callback => callback(data))
    }
  }

  async loadData() {
    try {
      const [conversationsRes, usersRes] = await Promise.all([
        fetch('https://backend-n0fo.onrender.com/conversations'),
        fetch('https://backend-n0fo.onrender.com/users')
      ])
      
      this.conversations = await conversationsRes.json()
      this.users = await usersRes.json()
      
      this.render()
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error)
    }
  }

  getUserById(id) {
    return this.users.find(user => user.id === id)
  }

  getOtherParticipant(conversation) {
    const currentUserId = window.app.getCurrentUser()?.id
    const otherUserId = conversation.participants.find(id => id !== currentUserId)
    return this.getUserById(otherUserId)
  }

  formatTime(timestamp) {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now - date

    if (diff < 24 * 60 * 60 * 1000) {
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    } else {
      return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
    }
  }

  render() {
    const container = document.getElementById('conversationsList')
    if (!container) return

    if (this.conversations.length === 0) {
      container.innerHTML = `
        <div class="flex-1 flex items-center justify-center text-gray-500">
          <div class="text-center">
            <svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
            </svg>
            <p>Aucune conversation</p>
          </div>
        </div>
      `
      return
    }

    const conversationsHtml = this.conversations.map(conversation => {
      const otherUser = this.getOtherParticipant(conversation)
      if (!otherUser) return ''

      return `
        <div class="conversation-item p-4 border-b border-gray-100 flex items-center space-x-3" data-conversation-id="${conversation.id}">
          <div class="relative">
            <img 
              src="${otherUser.avatar}" 
              alt="${otherUser.name}" 
              class="w-12 h-12 rounded-full object-cover"
            >
            ${otherUser.isOnline ? `
              <div class="absolute bottom-0 right-0 w-3 h-3 bg-whatsapp-primary rounded-full border-2 border-white"></div>
            ` : ''}
          </div>
          
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between">
              <h3 class="font-medium text-gray-900 truncate">${otherUser.name}</h3>
              <span class="text-xs text-gray-500">${this.formatTime(conversation.lastMessageTime)}</span>
            </div>
            <div class="flex items-center justify-between">
              <p class="text-sm text-gray-600 truncate">${conversation.lastMessage}</p>
              ${conversation.unreadCount > 0 ? `
                <span class="bg-whatsapp-primary text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                  ${conversation.unreadCount}
                </span>
              ` : ''}
            </div>
          </div>
        </div>
      `
    }).join('')

    container.innerHTML = conversationsHtml
    this.bindEvents()
  }

  bindEvents() {
    const conversationItems = document.querySelectorAll('.conversation-item')
    conversationItems.forEach(item => {
      item.addEventListener('click', () => {
        const conversationId = parseInt(item.dataset.conversationId)
        const conversation = this.conversations.find(c => c.id === conversationId)
        if (conversation) {
          this.emit('conversationSelected', conversation)
        }
      })
    })
  }

  mount(containerId) {
    this.render()
  }
}