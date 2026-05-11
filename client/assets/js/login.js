// Login page scripts

document.addEventListener('DOMContentLoaded', function() {
    // Redirect if already logged in
    if (Auth.isAuthenticated()) {
        window.location.href = '/';
        return;
    }

    // Password toggle
    var togglePassword = document.getElementById('togglePassword');
    var passwd = document.getElementById('passwd');

    if (togglePassword && passwd) {
        togglePassword.addEventListener('click', function() {
            var icon = this.querySelector('i');

            if (passwd.type === 'password') {
                passwd.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                passwd.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    }

    // Login form handler
    var loginForm = document.getElementById('loginForm');

    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            var email = document.getElementById('email').value;
            var passwdValue = document.getElementById('passwd').value;
            var errorDiv = document.getElementById('loginError');
            var btnLogin = document.getElementById('btnLogin');

            try {
                errorDiv.style.display = 'none';
                btnLogin.disabled = true;
                btnLogin.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Entrando...';

                await Auth.login(email, passwdValue);
                window.location.href = '/';

            } catch (error) {
                errorDiv.textContent = error.message;
                errorDiv.style.display = 'block';
                btnLogin.disabled = false;
                btnLogin.innerHTML = '<i class="fas fa-sign-in-alt mr-2"></i>Entrar';
            }
        });
    }
});
