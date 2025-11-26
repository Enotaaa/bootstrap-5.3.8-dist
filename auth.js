// Конфигурация API (демо-версия)
const API_CONFIG = {
    BASE_URL: 'https://jsonplaceholder.typicode.com', // Демо API
    ENDPOINTS: {
        LOGIN: '/posts', // Демо endpoint
        REGISTER: '/posts',
        FORGOT_PASSWORD: '/posts',
        STATS: '/posts',
        USER_PROFILE: '/users/1',
        PETS: '/posts',
        FAVORITES: '/posts'
    }
};

// Демо-данные пользователя
const DEMO_USER = {
    id: 1,
    firstName: 'Василий',
    lastName: 'Николаевич',
    email: 'demo@example.com',
    phone: '+7 (999) 123-45-67',
    city: 'moscow',
    about: 'Люблю животных и помогаю им находить новые дома.',
    newsletterSubscription: true
};

// Токен авторизации и пользователь
let authToken = localStorage.getItem('authToken');
let currentUser = JSON.parse(localStorage.getItem('userData')) || DEMO_USER;

// Основные функции авторизации
function checkAuth() {
    if (authToken && currentUser) {
        updateUIAfterAuth(currentUser);
        return true;
    }
    updateUIForGuest();
    return false;
}

function updateUIAfterAuth(user) {
    const navButtons = document.querySelector('.navbar .d-flex');
    if (!navButtons) return;

    navButtons.innerHTML = `
        <div class="dropdown">
            <button class="btn btn-outline-primary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                <i class="bi bi-person-circle me-2"></i>${user.firstName} ${user.lastName}
            </button>
            <ul class="dropdown-menu">
                <li><a class="dropdown-item" href="profile.html"><i class="bi bi-person me-2"></i>Мой профиль</a></li>
                <li><a class="dropdown-item" href="my-pets.html"><i class="bi bi-heart me-2"></i>Мои питомцы</a></li>
                <li><a class="dropdown-item" href="favorites.html"><i class="bi bi-star me-2"></i>Избранное</a></li>
                <li><hr class="dropdown-divider"></li>
                <li><a class="dropdown-item" href="#" onclick="logout()"><i class="bi bi-box-arrow-right me-2"></i>Выйти</a></li>
            </ul>
        </div>
    `;
}

function updateUIForGuest() {
    const navButtons = document.querySelector('.navbar .d-flex');
    if (!navButtons) return;

    navButtons.innerHTML = `
        <button class="btn btn-outline-primary me-2" onclick="openModal('loginModal')">Войти</button>
        <button class="btn btn-primary" onclick="openModal('registerModal')">Регистрация</button>
    `;
}

function logout() {
    authToken = null;
    currentUser = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    location.reload();
}

// Функции для работы с API
async function makeApiRequest(url, options = {}) {
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        }
    };

    if (authToken) {
        defaultOptions.headers['Authorization'] = `Bearer ${authToken}`;
    }

    // Для демо-версии имитируем задержку сети
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
        const finalOptions = { ...defaultOptions, ...options };
        
        // Для POST-запросов добавляем тело
        if (finalOptions.body && typeof finalOptions.body === 'object') {
            finalOptions.body = JSON.stringify(finalOptions.body);
        }

        const response = await fetch(`${API_CONFIG.BASE_URL}${url}`, finalOptions);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return { data, success: true };

    } catch (error) {
        console.error('API Error:', error);
        
        // Демо-данные для тестирования
        if (url.includes('/auth/login')) {
            return {
                data: {
                    token: 'demo-token-' + Date.now(),
                    user: DEMO_USER
                },
                success: true
            };
        }
        
        if (url.includes('/auth/register')) {
            return {
                data: { message: 'Регистрация успешна' },
                success: true
            };
        }
        
        throw error;
    }
}

// Функции для уведомлений
function showAlert(message, type = 'success') {
    // Создаем контейнер для уведомлений если его нет
    let alertsContainer = document.getElementById('alertsContainer');
    if (!alertsContainer) {
        alertsContainer = document.createElement('div');
        alertsContainer.id = 'alertsContainer';
        alertsContainer.className = 'alert-position';
        document.body.appendChild(alertsContainer);
    }

    const alert = document.createElement('div');
    alert.className = `alert alert-${type} alert-dismissible fade show`;
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    alertsContainer.appendChild(alert);

    setTimeout(() => {
        if (alert.parentNode) {
            alert.remove();
        }
    }, 5000);
}

// Функции для модальных окон
function openModal(modalId) {
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
    }
}

function switchToRegister() {
    const loginModal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
    if (loginModal) loginModal.hide();
    setTimeout(() => openModal('registerModal'), 300);
}

function switchToLogin() {
    const registerModal = bootstrap.Modal.getInstance(document.getElementById('registerModal'));
    if (registerModal) registerModal.hide();
    setTimeout(() => openModal('loginModal'), 300);
}

function showForgotPassword() {
    const loginForm = document.getElementById('loginForm');
    const forgotForm = document.getElementById('forgotPasswordForm');
    if (loginForm && forgotForm) {
        loginForm.classList.add('d-none');
        forgotForm.classList.remove('d-none');
    }
}

function showLoginForm() {
    const loginForm = document.getElementById('loginForm');
    const forgotForm = document.getElementById('forgotPasswordForm');
    if (loginForm && forgotForm) {
        forgotForm.classList.add('d-none');
        loginForm.classList.remove('d-none');
    }
}

function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const icon = input.parentNode.querySelector('.bi');
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('bi-eye');
        icon.classList.add('bi-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('bi-eye-slash');
        icon.classList.add('bi-eye');
    }
}

// Обработчики форм
function initializeAuthForms() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const forgotForm = document.getElementById('forgotPasswordForm');

    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    if (forgotForm) {
        forgotForm.addEventListener('submit', handleForgotPassword);
    }
}

// Функция входа
async function handleLogin(e) {
    e.preventDefault();
    
    const submitBtn = document.getElementById('loginSubmitBtn');
    const spinner = submitBtn?.querySelector('.spinner-border');
    const buttonText = submitBtn?.querySelector('span:last-child');

    const formData = {
        email: document.getElementById('loginEmail').value,
        password: document.getElementById('loginPassword').value,
        rememberMe: document.getElementById('rememberMe')?.checked || false
    };

    if (!formData.email || !formData.password) {
        showAlert('Пожалуйста, заполните все поля', 'danger');
        return;
    }

    try {
        if (spinner) spinner.classList.remove('d-none');
        if (buttonText) buttonText.textContent = 'Вход...';
        if (submitBtn) submitBtn.disabled = true;

        const response = await makeApiRequest(API_CONFIG.ENDPOINTS.LOGIN, {
            method: 'POST',
            body: formData
        });

        if (response.success) {
            authToken = response.data.token;
            currentUser = response.data.user;
            
            localStorage.setItem('authToken', authToken);
            localStorage.setItem('userData', JSON.stringify(currentUser));

            showAlert('Вход выполнен успешно!', 'success');

            const modal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
            if (modal) modal.hide();

            updateUIAfterAuth(currentUser);
        }

    } catch (error) {
        showAlert('Ошибка входа. Проверьте email и пароль.', 'danger');
    } finally {
        if (spinner) spinner.classList.add('d-none');
        if (buttonText) buttonText.textContent = 'Войти';
        if (submitBtn) submitBtn.disabled = false;
    }
}

// Функция регистрации
async function handleRegister(e) {
    e.preventDefault();
    
    const submitBtn = document.getElementById('registerSubmitBtn');
    const spinner = submitBtn?.querySelector('.spinner-border');
    const buttonText = submitBtn?.querySelector('span:last-child');

    const formData = {
        firstName: document.getElementById('registerFirstName').value,
        lastName: document.getElementById('registerLastName').value,
        email: document.getElementById('registerEmail').value,
        password: document.getElementById('registerPassword').value,
        confirmPassword: document.getElementById('registerConfirmPassword').value,
        phone: document.getElementById('registerPhone').value || '',
        city: document.getElementById('registerCity').value || '',
        agreeTerms: document.getElementById('agreeTerms').checked,
        newsletterSubscription: document.getElementById('newsletterSubscription')?.checked || false
    };

    // Валидация
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.confirmPassword) {
        showAlert('Пожалуйста, заполните все обязательные поля', 'danger');
        return;
    }

    if (formData.password !== formData.confirmPassword) {
        showAlert('Пароли не совпадают', 'danger');
        return;
    }

    if (formData.password.length < 6) {
        showAlert('Пароль должен содержать минимум 6 символов', 'danger');
        return;
    }

    if (!formData.agreeTerms) {
        showAlert('Необходимо согласие с условиями использования', 'danger');
        return;
    }

    try {
        if (spinner) spinner.classList.remove('d-none');
        if (buttonText) buttonText.textContent = 'Регистрация...';
        if (submitBtn) submitBtn.disabled = true;

        const response = await makeApiRequest(API_CONFIG.ENDPOINTS.REGISTER, {
            method: 'POST',
            body: formData
        });

        if (response.success) {
            showAlert('Регистрация прошла успешно! Теперь вы можете войти в систему.', 'success');

            const modal = bootstrap.Modal.getInstance(document.getElementById('registerModal'));
            if (modal) modal.hide();

            // Очищаем форму регистрации
            document.getElementById('registerForm').reset();
            
            // Показываем форму входа
            setTimeout(() => openModal('loginModal'), 500);
        }

    } catch (error) {
        showAlert('Ошибка регистрации. Попробуйте еще раз.', 'danger');
    } finally {
        if (spinner) spinner.classList.add('d-none');
        if (buttonText) buttonText.textContent = 'Зарегистрироваться';
        if (submitBtn) submitBtn.disabled = false;
    }
}

// Функция восстановления пароля
async function handleForgotPassword(e) {
    e.preventDefault();
    
    const submitBtn = document.getElementById('forgotSubmitBtn');
    const spinner = submitBtn?.querySelector('.spinner-border');
    const buttonText = submitBtn?.querySelector('span:last-child');

    const email = document.getElementById('forgotEmail').value;

    if (!email) {
        showAlert('Пожалуйста, введите email', 'danger');
        return;
    }

    try {
        if (spinner) spinner.classList.remove('d-none');
        if (buttonText) buttonText.textContent = 'Отправка...';
        if (submitBtn) submitBtn.disabled = true;

        await makeApiRequest(API_CONFIG.ENDPOINTS.FORGOT_PASSWORD, {
            method: 'POST',
            body: { email }
        });

        showAlert('Инструкции по восстановлению пароля отправлены на вашу почту', 'success');
        showLoginForm();

    } catch (error) {
        showAlert('Ошибка отправки. Попробуйте еще раз.', 'danger');
    } finally {
        if (spinner) spinner.classList.add('d-none');
        if (buttonText) buttonText.textContent = 'Восстановить пароль';
        if (submitBtn) submitBtn.disabled = false;
    }
}

// Проверка авторизации для защищенных действий
function checkAuthForActions() {
    if (!checkAuth()) {
        showAlert('Для выполнения этого действия необходимо войти в систему', 'warning');
        openModal('loginModal');
        return false;
    }
    return true;
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    initializeAuthForms();
});