const Login = (function () {
    // DOM Elements
    const DOM = {
        loginForm: document.getElementById('loginForm'),
        registerForm: document.getElementById('registerForm'),
        usernameInput: document.getElementById('username'),
        passwordInput: document.getElementById('password'),
        regUsernameInput: document.getElementById('regUsername'),
        regPasswordInput: document.getElementById('regPassword'),
        regConfirmPasswordInput: document.getElementById('regConfirmPassword'),
        loginLink: document.getElementById('loginLink'),
        userInfo: document.getElementById('userInfo'),
        logoutLink: document.getElementById('logoutLink'),
        switchToRegister: document.getElementById('switchToRegister'),
        switchToLogin: document.getElementById('switchToLogin'),
        loginFormSection: document.getElementById('loginFormSection'),
        registerFormSection: document.getElementById('registerFormSection')
    };

    // Check Login Status
    function checkLoginStatus() {
        const user = localStorage.getItem('user');
        const lang = localStorage.getItem('language') || 'vi';
        if (user) {
            if (DOM.loginLink) DOM.loginLink.style.display = 'none';
            if (DOM.userInfo) {
                const displayName = user.split('@')[0];
                DOM.userInfo.textContent = displayName;
                DOM.userInfo.style.display = 'inline';
            }
            if (DOM.logoutLink) DOM.logoutLink.style.display = 'inline';
        } else {
            if (DOM.loginLink) DOM.loginLink.style.display = 'inline';
            if (DOM.userInfo) DOM.userInfo.style.display = 'none';
            if (DOM.logoutLink) DOM.logoutLink.style.display = 'none';
        }
        if (typeof Common !== 'undefined' && typeof Common.loadCart === 'function') {
            Common.loadCart();
        }
    }

    // Handle Login
    function handleLogin(event) {
        event.preventDefault();
        const username = DOM.usernameInput.value.trim();
        const password = DOM.passwordInput.value.trim();
        const lang = localStorage.getItem('language') || 'vi';

        if (!username || !password) {
            alert(lang === 'en' ? 'Please enter username and password!' : 'Vui lòng nhập tên người dùng và mật khẩu!');
            return;
        }

        // Lấy danh sách người dùng từ localStorage với kiểm tra lỗi
        let users;
        try {
            const usersData = localStorage.getItem('users');
            users = usersData ? JSON.parse(usersData) : {};
            console.log('Users data from localStorage:', users); // Debug
        } catch (e) {
            console.error('Error parsing users data:', e);
            users = {};
        }

        // Kiểm tra xem username có tồn tại và mật khẩu có khớp không
        if (!users[username] || users[username].password !== password) {
            alert(lang === 'en' ? 'Invalid username or password!' : 'Tên người dùng hoặc mật khẩu không đúng!');
            return;
        }

        // Merge guest cart with user cart
        const guestCart = JSON.parse(localStorage.getItem('guestCart')) || [];
        let userCarts = JSON.parse(localStorage.getItem('userCarts')) || {};
        let userCart = userCarts[username] || [];

        guestCart.forEach(guestItem => {
            const existingItem = userCart.find(item => item.name === guestItem.name);
            if (existingItem) {
                existingItem.quantity += guestItem.quantity;
            } else {
                userCart.push(guestItem);
            }
        });

        userCarts[username] = userCart;
        localStorage.setItem('userCarts', JSON.stringify(userCarts));
        localStorage.removeItem('guestCart');
        localStorage.setItem('user', username);

        alert(lang === 'en' ? 'Login successful!' : 'Đăng nhập thành công!');
        checkLoginStatus();
        window.location.href = 'index.html';
    }

    // Handle Register
    function handleRegister(event) {
        event.preventDefault();
        const username = DOM.regUsernameInput.value.trim();
        const password = DOM.regPasswordInput.value.trim();
        const confirmPassword = DOM.regConfirmPasswordInput.value.trim();
        const lang = localStorage.getItem('language') || 'vi';

        if (!username || !password || !confirmPassword) {
            alert(lang === 'en' ? 'Please fill in all fields!' : 'Vui lòng điền đầy đủ tất cả các trường!');
            return;
        }

        if (password !== confirmPassword) {
            alert(lang === 'en' ? 'Passwords do not match!' : 'Mật khẩu không khớp!');
            return;
        }

        // Lấy danh sách người dùng từ localStorage với kiểm tra lỗi
        let users;
        try {
            const usersData = localStorage.getItem('users');
            users = usersData ? JSON.parse(usersData) : {};
            console.log('Users data before registration:', users); // Debug
        } catch (e) {
            console.error('Error parsing users data:', e);
            users = {};
        }

        if (users[username]) {
            alert(lang === 'en' ? 'This email is already registered!' : 'Email này đã được đăng ký!');
            return;
        }

        // Lưu thông tin người dùng mới
        users[username] = { password: password };
        try {
            localStorage.setItem('users', JSON.stringify(users));
            console.log('Users data after registration:', users); // Debug
        } catch (e) {
            console.error('Error saving users data:', e);
            alert(lang === 'en' ? 'Registration failed!' : 'Đăng ký thất bại!');
            return;
        }

        alert(lang === 'en' ? 'Registration successful! Please login.' : 'Đăng ký thành công! Vui lòng đăng nhập.');
        DOM.registerForm.reset();
        toggleForms('login');
    }

    // Handle Logout
    function handleLogout(event) {
        event.preventDefault();
        const user = localStorage.getItem('user');
        const lang = localStorage.getItem('language') || 'vi';

        const currentCart = JSON.parse(localStorage.getItem('cart')) || [];
        if (user && currentCart.length > 0) {
            let userCarts = JSON.parse(localStorage.getItem('userCarts')) || {};
            userCarts[user] = currentCart;
            localStorage.setItem('userCarts', JSON.stringify(userCarts));
        }

        localStorage.removeItem('user');
        localStorage.removeItem('cart');
        alert(lang === 'en' ? 'Logged out successfully!' : 'Đăng xuất thành công!');
        checkLoginStatus();
        window.location.href = 'index.html';
    }

    // Toggle between Login and Register forms
    function toggleForms(formType) {
        if (formType === 'register' && DOM.registerFormSection && DOM.loginFormSection) {
            DOM.loginFormSection.style.display = 'none';
            DOM.registerFormSection.style.display = 'block';
        } else if (DOM.registerFormSection && DOM.loginFormSection) {
            DOM.loginFormSection.style.display = 'block';
            DOM.registerFormSection.style.display = 'none';
        }
    }

    // Initialize
    function initialize() {
        checkLoginStatus();

        if (DOM.loginForm) {
            DOM.loginForm.addEventListener('submit', handleLogin);
        }

        if (DOM.registerForm) {
            DOM.registerForm.addEventListener('submit', handleRegister);
        }

        if (DOM.logoutLink) {
            DOM.logoutLink.addEventListener('click', handleLogout);
        }

        if (DOM.switchToRegister) {
            DOM.switchToRegister.addEventListener('click', (e) => {
                e.preventDefault();
                toggleForms('register');
            });
        }

        if (DOM.switchToLogin) {
            DOM.switchToLogin.addEventListener('click', (e) => {
                e.preventDefault();
                toggleForms('login');
            });
        }

        document.addEventListener('languageChange', () => {
            checkLoginStatus();
        });
    }

    document.addEventListener('DOMContentLoaded', initialize);

    return { checkLoginStatus };
})();