export class VerificationPage {
  constructor(params) {
    this.phone = params.phone || ''
    this.code = ''
    this.isLoading = false
  }

  render() {
    return `
      <div class="min-h-screen bg-whatsapp-gray flex items-center justify-center p-4">
        <div class="bg-white rounded-lg shadow-lg w-full max-w-md p-8">
          <div class="text-center mb-8">
            <div class="w-16 h-16 bg-whatsapp-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <h1 class="text-2xl font-bold text-gray-800 mb-2">Vérification</h1>
            <p class="text-gray-600">
              Nous avons envoyé un code de vérification au
              <br><strong>${this.phone}</strong>
            </p>
          </div>

          <form id="verificationForm" class="space-y-6">
            <div>
              <label for="code" class="block text-sm font-medium text-gray-700 mb-2">
                Code de vérification
              </label>
              <input 
                type="text" 
                id="code" 
                placeholder="1234"
                maxlength="4"
                class="input-field text-center text-2xl tracking-widest"
                value="${this.code}"
                required
              >
            </div>

            <button 
              type="submit" 
              class="btn-primary w-full ${this.isLoading ? 'opacity-50 cursor-not-allowed' : ''}"
              ${this.isLoading ? 'disabled' : ''}
            >
              ${this.isLoading ? 'Vérification...' : 'Vérifier'}
            </button>
          </form>

          <div class="mt-6 text-center">
            <button 
              id="backBtn"
              class="text-whatsapp-primary hover:text-whatsapp-secondary text-sm font-medium"
            >
              ← Retour
            </button>
            <span class="mx-2 text-gray-300">|</span>
            <button 
              id="resendBtn"
              class="text-whatsapp-primary hover:text-whatsapp-secondary text-sm font-medium"
            >
              Renvoyer le code
            </button>
          </div>

          <div class="mt-4 text-center text-xs text-gray-500">
            Code de test : consultez la console du navigateur
          </div>
        </div>
      </div>
    `
  }

  mount() {
    const form = document.getElementById('verificationForm')
    const codeInput = document.getElementById('code')
    const backBtn = document.getElementById('backBtn')
    const resendBtn = document.getElementById('resendBtn')

    // Auto-focus sur le champ de code
    codeInput.focus()

    // Permettre seulement les chiffres
    codeInput.addEventListener('input', (e) => {
      e.target.value = e.target.value.replace(/[^0-9]/g, '')
      this.code = e.target.value
    })

    // Soumettre automatiquement quand 4 chiffres sont entrés
    codeInput.addEventListener('input', (e) => {
      if (e.target.value.length === 4) {
        form.dispatchEvent(new Event('submit'))
      }
    })

    form.addEventListener('submit', async (e) => {
      e.preventDefault()
      
      if (this.code.length !== 4) {
        alert('Veuillez entrer un code à 4 chiffres')
        return
      }

      this.isLoading = true
      this.updateUI()

      try {
        const result = await window.app.authManager.verifyCode(this.code)
        if (result.success) {
          // La navigation sera gérée par l'événement 'authenticated'
        } else {
          alert(result.message || 'Code incorrect')
          this.code = ''
        }
      } catch (error) {
        alert('Erreur de vérification')
        console.error(error)
      } finally {
        this.isLoading = false
        this.updateUI()
      }
    })

    backBtn.addEventListener('click', () => {
      window.app.router.navigate('login')
    })

    resendBtn.addEventListener('click', async () => {
      try {
        await window.app.authManager.sendVerificationCode(this.phone)
        alert('Code renvoyé avec succès')
      } catch (error) {
        alert('Erreur lors du renvoi du code')
      }
    })
  }

  updateUI() {
    const app = document.getElementById('app')
    app.innerHTML = this.render()
    this.mount()
  }
}