export class AuthManager {
  constructor() {
    this.events = {};
    this.verificationCode = null;
    this.pendingPhone = null;
  }

  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  emit(event, data) {
    if (this.events[event]) {
      this.events[event].forEach((callback) => callback(data));
    }
  }

  async sendVerificationCode(phone) {
    // Simuler l'envoi du code de vérification
    this.verificationCode = Math.floor(1000 + Math.random() * 9000).toString();
    this.pendingPhone = phone;

    console.log(
      `Code de vérification envoyé au ${phone}: ${this.verificationCode}`
    );

    // Dans un vrai projet, on ferait un appel API ici
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, message: "Code envoyé avec succès" });
      }, 1000);
    });
  }

  async verifyCode(code) {
    if (code === this.verificationCode) {
      // Vérifier si l'utilisateur existe ou en créer un nouveau
      let user = await this.findUserByPhone(this.pendingPhone);

      if (!user) {
        user = await this.createUser(this.pendingPhone);
      }

      this.emit("authenticated", user);
      return { success: true, user };
    } else {
      return { success: false, message: "Code de vérification incorrect" };
    }
  }

  async findUserByPhone(phone) {
    try {
      const response = await fetch(
        `https://backend-n0fo.onrender.com/users?phone=${phone}`
      );
      const users = await response.json();
      return users.length > 0 ? users[0] : null;
    } catch (error) {
      console.error("Erreur lors de la recherche utilisateur:", error);
      return null;
    }
  }

  async createUser(phone) {
    const newUser = {
      phone,
      name: `Utilisateur ${phone}`,
      avatar:
        "https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=150",
      lastSeen: new Date().toISOString(),
      isOnline: true,
    };

    try {
      const response = await fetch("https://backend-n0fo.onrender.com/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newUser),
      });
      return await response.json();
    } catch (error) {
      console.error("Erreur lors de la création utilisateur:", error);
      return newUser;
    }
  }

  logout() {
    this.emit("logout");
  }
}

// Utilisation de AuthManager
const auth = new AuthManager();
await auth.sendVerificationCode("0600000000");
// Regarde le code affiché dans la console
await auth.verifyCode("le_code_affiché");
