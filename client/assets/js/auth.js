// Auth utility functions for DrinkWater App
const Auth = {
    // Storage keys
    TOKEN_KEY: 'drinkwater_token',
    USER_KEY: 'drinkwater_user',

    // Get stored token
    getToken() {
        return localStorage.getItem(this.TOKEN_KEY);
    },

    // Store token and user
    setAuth(token, user) {
        localStorage.setItem(this.TOKEN_KEY, token);
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    },

    // Get stored user
    getUser() {
        const user = localStorage.getItem(this.USER_KEY);
        return user ? JSON.parse(user) : null;
    },

    // Clear auth data
    clearAuth() {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);
    },

    // Check if authenticated
    isAuthenticated() {
        return !!this.getToken();
    },

    // Redirect to login if not authenticated
    requireAuth() {
        if (!this.isAuthenticated()) {
            window.location.href = '/login.html';
            return false;
        }
        return true;
    },

    // Login function
    async login(email, passwd) {
        const response = await fetch('/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, passwd })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Erro ao fazer login');
        }

        this.setAuth(data.token, data.data.user);
        return data;
    },

    // Logout function
    logout() {
        this.clearAuth();
        window.location.href = '/login.html';
    },

    // Get authorization header
    getAuthHeader() {
        const token = this.getToken();
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    }
};
