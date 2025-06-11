export class ChatWindow {
  constructor() {
    this.conversation = null
    this.messages = []
    this.users = []
    this.currentMessage = ''
  }

  async setConversation(conversation) {
    this.conversation = conversation
    await this.loadMessages()
    await this.loadUsers()
  }

  async loadMessages() {
    try {
      const response = await fetch(`https://backend-n0fo.onrender.com/messages?conversationId=${this.conversation.id}`)
      this.messages = await response.json()
    } catch (error) {
      console.error('Erreur lors du chargement des messages:', error)
      this.messages = []
    }
  }

  async loadUsers() {
    try {
      const response = await fetch('https://backend-n0fo.onrender.com/users')
      this.users = await response.json()
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error)
      this.users = []
    }
  }

  getUserById(id) {
    return this.users.find(user => user.id === id)
  }

  getOtherParticipant() {
    const currentUserId = window.app.getCurrentUser()?.id
    const otherUserId = this.conversation.participants.find(id => id !== currentUserId)
    return this.getUserById(otherUserId)
  }

  formatTime(timestamp) {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  }

  async sendMessage(content) {
    if (!content.trim()) return

    const newMessage = {
      conversationId: this.conversation.id,
      senderId: window.app.getCurrentUser().id,
      content: content.trim(),
      timestamp: new Date().toISOString(),
      type: 'text'
    }

    try {
      const response = await fetch('https://backend-n0fo.onrender.com/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newMessage)
      })

      if (response.ok) {
        const savedMessage = await response.json()
        this.messages.push(savedMessage)
        this.currentMessage = ''
        this.render()
        this.scrollToBottom()
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error)
    }
  }

  render() {
    if (!this.conversation) return ''

    const otherUser = this.getOtherParticipant()
    const currentUserId = window.app.getCurrentUser()?.id

    const messagesHtml = this.messages.map(message => {
      const isOwn = message.senderId === currentUserId
      const sender = this.getUserById(message.senderId)

      return `
        <div class="flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4">
          <div class="chat-bubble ${isOwn ? 'chat-bubble-sent' : 'chat-bubble-received'}">
            <p class="text-sm">${message.content}</p>
            <span class="text-xs text-gray-500 mt-1 block">${this.formatTime(message.timestamp)}</span>
          </div>
        </div>
      `
    }).join('')

    return `
      <!-- Header du chat -->
      <div class="bg-whatsapp-secondary text-white p-4 flex items-center space-x-3">
        <button id="backToList" class="md:hidden p-1 hover:bg-whatsapp-dark rounded">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
          </svg>
        </button>
        <img 
          src="${otherUser?.avatar || ''}" 
          alt="${otherUser?.name || ''}" 
          class="w-10 h-10 rounded-full object-cover"
        >
        <div class="flex-1">
          <h2 class="font-medium">${otherUser?.name || 'Utilisateur'}</h2>
          <p class="text-sm text-whatsapp-light">
            ${otherUser?.isOnline ? 'En ligne' : `Vu pour la dernière fois ${this.formatTime(otherUser?.lastSeen || '')}`}
          </p>
        </div>
        <button class="p-2 hover:bg-whatsapp-dark rounded-full">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
          </svg>
        </button>
      </div>

      <!-- Messages -->
      <div id="messagesContainer" class="flex-1 overflow-y-auto p-4 bg-gray-50 scrollbar-hide">
        ${messagesHtml || '<div class="text-center text-gray-500 mt-8">Aucun message pour le moment</div>'}
      </div>

      <!-- Input pour nouveau message -->
      <div class="bg-white p-4 border-t border-gray-200">
        <form id="messageForm" class="flex items-center space-x-3">
          <button type="button" class="p-2 text-gray-500 hover:text-whatsapp-primary">
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm-7 4H8v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2z"/>
            </svg>
          </button>
          
          <input 
            type="text" 
            id="messageInput"
            placeholder="Tapez votre message..."
            class="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-whatsapp-primary focus:border-transparent"
            value="${this.currentMessage}"
          >
          
          <button 
            type="submit" 
            class="p-2 bg-whatsapp-primary text-white rounded-full hover:bg-whatsapp-secondary transition-colors"
          >
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
        </form>
      </div>
    `
  }

  mount(containerId) {
    const container = document.getElementById(containerId)
    if (!container) return

    container.innerHTML = this.render()
    this.bindEvents()
    this.scrollToBottom()
  }

  bindEvents() {
    const messageForm = document.getElementById('messageForm')
    const messageInput = document.getElementById('messageInput')
    const backBtn = document.getElementById('backToList')

    if (messageInput) {
      messageInput.focus()
      
      messageInput.addEventListener('input', (e) => {
        this.currentMessage = e.target.value
      })

      messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault()
          messageForm.dispatchEvent(new Event('submit'))
        }
      })
    }

    if (messageForm) {
      messageForm.addEventListener('submit', (e) => {
        e.preventDefault()
        this.sendMessage(this.currentMessage)
      })
    }

    if (backBtn) {
      backBtn.addEventListener('click', () => {
        // Retour à la liste des conversations (mobile)
        window.location.reload()
      })
    }
  }

  scrollToBottom() {
    setTimeout(() => {
      const container = document.getElementById('messagesContainer')
      if (container) {
        container.scrollTop = container.scrollHeight
      }
    }, 100)
  }
}