const Common = (function () {
    // DOM Elements
    const DOM = {
        cartCount: document.getElementById('cartCount'),
        cartItems: document.getElementById('cartItems'),
        cartTotal: document.getElementById('cartTotal'),
        languageSelect: document.getElementById('languageSelect')
    };

    // Language Handling
    function updateLanguage(lang) {
        const elements = document.querySelectorAll('[data-en][data-vi]');
        elements.forEach(element => {
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA' || element.tagName === 'SELECT') {
                element.placeholder = element.getAttribute(`data-${lang}-placeholder`) || element.getAttribute(`data-${lang}`);
            } else {
                element.textContent = element.getAttribute(`data-${lang}`);
            }
        });
        localStorage.setItem('language', lang);
        document.dispatchEvent(new Event('languageChange'));
    }

    // Cart Handling
    function saveCart(cart) {
        console.log('Saving cart to localStorage:', cart);
        const user = localStorage.getItem('user');
        if (user) {
            let userCarts = JSON.parse(localStorage.getItem('userCarts')) || {};
            userCarts[user] = cart;
            localStorage.setItem('userCarts', JSON.stringify(userCarts));
        } else {
            localStorage.setItem('guestCart', JSON.stringify(cart));
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        renderCart();
    }

    function loadCart() {
        const user = localStorage.getItem('user');
        let cart;
        if (user) {
            let userCarts = JSON.parse(localStorage.getItem('userCarts')) || {};
            cart = userCarts[user] || [];
        } else {
            cart = JSON.parse(localStorage.getItem('guestCart')) || [];
        }
        console.log('Loaded cart from localStorage:', cart);
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        renderCart();
        return cart;
    }

    function updateCartCount() {
        if (DOM.cartCount) {
            const cart = JSON.parse(localStorage.getItem('cart')) || [];
            const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
            DOM.cartCount.textContent = totalItems;
            console.log('Updated cart count:', totalItems);
        }
    }

    function renderCart() {
        if (!DOM.cartItems || !DOM.cartTotal) {
            console.log('Cart DOM elements not found');
            return;
        }

        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        console.log('Rendering cart:', cart);
        DOM.cartItems.innerHTML = '';

        if (cart.length === 0) {
            const lang = localStorage.getItem('language') || 'vi';
            const emptyCartText = lang === 'en' ? 'Your cart is empty.' : 'Giỏ hàng của bạn đang trống.';
            DOM.cartItems.innerHTML = `<p class="empty-cart" data-en="Your cart is empty." data-vi="Giỏ hàng của bạn đang trống.">${emptyCartText}</p>`;
            DOM.cartTotal.textContent = '0 VNĐ';
            return;
        }

        let total = 0;
        cart.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            DOM.cartItems.innerHTML += `
                <div class="cart-item">
                    <img src="${item.image}" alt="${item.name}">
                    <div>
                        <h6>${item.name}</h6>
                        <p>${item.price.toLocaleString('vi-VN')} VNĐ x ${item.quantity}</p>
                    </div>
                    <div class="quantity-controls">
                        <button class="btn btn-sm btn-outline-secondary" onclick="Common.updateQuantity(${index}, -1)">-</button>
                        <span>${item.quantity}</span>
                        <button class="btn btn-sm btn-outline-secondary" onclick="Common.updateQuantity(${index}, 1)">+</button>
                        <button class="btn btn-sm btn-outline-danger" onclick="Common.removeFromCart(${index})"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
            `;
        });
        DOM.cartTotal.textContent = total.toLocaleString('vi-VN') + ' VNĐ';
    }

    function updateQuantity(index, change) {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        if (cart[index]) {
            cart[index].quantity += change;
            if (cart[index].quantity <= 0) {
                cart.splice(index, 1);
            }
            saveCart(cart);
        }
    }

    function removeFromCart(index) {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        if (cart[index]) {
            cart.splice(index, 1);
            saveCart(cart);
        }
    }

    // Initialize
    function initialize() {
        if (window.commonInitialized) return;
        window.commonInitialized = true;

        const savedLang = localStorage.getItem('language') || 'vi';
        if (DOM.languageSelect) {
            DOM.languageSelect.value = savedLang;
            DOM.languageSelect.addEventListener('change', (e) => updateLanguage(e.target.value));
        }
        updateLanguage(savedLang);
        loadCart();
    }

    document.addEventListener('DOMContentLoaded', initialize);

    return {
        updateLanguage,
        saveCart,
        loadCart,
        updateCartCount,
        renderCart,
        updateQuantity,
        removeFromCart
    };
})();