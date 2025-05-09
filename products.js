const Products = (function () {
    let products = [];

    // DOM Elements
    const DOM = {
        searchInput: document.getElementById('searchInput'),
        priceFilter: document.getElementById('priceFilter'),
        productList: document.getElementById('product-list'),
        loadingSpinner: document.getElementById('loadingSpinner'),
        cartItems: document.getElementById('cartItems'),
        cartTotal: document.getElementById('cartTotal')
    };

    // Debounce utility
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Loading State
    function showLoading(show) {
        if (DOM.loadingSpinner && DOM.productList) {
            DOM.loadingSpinner.style.display = show ? 'block' : 'none';
            DOM.productList.style.display = show ? 'none' : 'flex';
        }
    }

    // Fetch Products
    async function fetchProducts() {
        showLoading(true);
        try {
            const response = await fetch('products.json');
            if (!response.ok) {
                throw new Error('Failed to fetch products.json');
            }
            products = await response.json();
            if (!Array.isArray(products) || products.length === 0) {
                throw new Error('Products data is empty or invalid');
            }
            console.log('Products loaded:', products);
            renderProducts(products);
        } catch (error) {
            console.error('Error fetching products:', error);
            DOM.productList.innerHTML = `<p class="text-danger" data-en="Failed to load products. Please try again later." data-vi="Không thể tải sản phẩm. Vui lòng thử lại sau.">
                ${localStorage.getItem('language') === 'en' ? 'Failed to load products. Please try again later.' : 'Không thể tải sản phẩm. Vui lòng thử lại sau.'}
            </p>`;
        } finally {
            showLoading(false);
        }
    }

    // Render Products
    function renderProducts(productsToRender) {
        if (!DOM.productList) return;
        DOM.productList.innerHTML = '';

        productsToRender.forEach((product, index) => {
            DOM.productList.innerHTML += `
                <div class="col-md-4 mb-4">
                    <div class="card product-card">
                        <div class="image-skeleton" style="height: 200px;"></div>
                        <img src="${product.image}" class="card-img-top" alt="${product.name}" loading="lazy" onload="this.previousElementSibling.style.display='none';">
                        <div class="card-body">
                            <h5 class="card-title">${product.name}</h5>
                            <p class="card-text">${product.description}</p>
                            <p class="card-text"><strong>Giá:</strong> ${product.price.toLocaleString('vi-VN')} VNĐ</p>
                            <div class="rating">
                                ${'★'.repeat(Math.round(product.rating))}${'☆'.repeat(5 - Math.round(product.rating))}
                            </div>
                            <a href="#" class="btn btn-primary mt-2" onclick="Products.addToCart(${index}); return false;">Thêm vào Giỏ</a>
                        </div>
                    </div>
                </div>
            `;
        });
    }

    // Add to Cart
    function addToCart(index) {
        if (!products[index]) {
            console.error(`Product at index ${index} not found. Available products:`, products);
            alert(localStorage.getItem('language') === 'en' ? 'Error: Product not found!' : 'Lỗi: Không tìm thấy sản phẩm!');
            return;
        }

        const product = products[index];
        console.log('Adding product to cart:', product);

        const user = localStorage.getItem('user');
        let cart;
        if (user) {
            // Load user-specific cart
            let userCarts = JSON.parse(localStorage.getItem('userCarts')) || {};
            cart = userCarts[user] || [];
        } else {
            // Load guest cart
            cart = JSON.parse(localStorage.getItem('guestCart')) || [];
        }

        const cartItem = cart.find(item => item.name === product.name);
        if (cartItem) {
            cartItem.quantity += 1;
        } else {
            cart.push({
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: 1
            });
        }

        console.log('Cart before saving:', cart);
        if (user) {
            let userCarts = JSON.parse(localStorage.getItem('userCarts')) || {};
            userCarts[user] = cart;
            localStorage.setItem('userCarts', JSON.stringify(userCarts));
        } else {
            localStorage.setItem('guestCart', JSON.stringify(cart));
        }
        localStorage.setItem('cart', JSON.stringify(cart)); // Update current cart
        console.log('Cart after saving:', JSON.parse(localStorage.getItem('cart')));
        Common.loadCart();
        Common.renderCart();
        alert(localStorage.getItem('language') === 'en' ? `${product.name} has been added to your cart!` : `${product.name} đã được thêm vào giỏ hàng!`);
    }

    // Search Products
    function searchProducts() {
        const searchTerm = DOM.searchInput.value.toLowerCase();
        const filteredProducts = products.filter(product =>
            product.name.toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm)
        );
        applyPriceFilter(filteredProducts);
    }

    // Apply Price Filter
    function applyPriceFilter(productsToSort) {
        const priceFilter = DOM.priceFilter.value;
        let sortedProducts = [...productsToSort];

        if (priceFilter === 'low-to-high') {
            sortedProducts.sort((a, b) => a.price - b.price);
        } else if (priceFilter === 'high-to-low') {
            sortedProducts.sort((a, b) => b.price - a.price);
        }

        renderProducts(sortedProducts);
    }

    // Reset Filters
    function resetFilters() {
        if (DOM.searchInput && DOM.priceFilter) {
            DOM.searchInput.value = '';
            DOM.priceFilter.value = '';
            renderProducts(products);
        }
    }

    // Checkout
    function checkout() {
        const user = localStorage.getItem('user');
        let cart;
        if (user) {
            let userCarts = JSON.parse(localStorage.getItem('userCarts')) || {};
            cart = userCarts[user] || [];
        } else {
            cart = JSON.parse(localStorage.getItem('guestCart')) || [];
        }

        if (cart.length === 0) {
            const lang = localStorage.getItem('language') || 'vi';
            alert(lang === 'vi' ? 'Giỏ hàng của bạn đang trống! Vui lòng thêm sản phẩm trước khi thanh toán.' : 'Your cart is empty! Please add products before checking out.');
            return;
        }

        alert(localStorage.getItem('language') === 'vi' ? 'Cảm ơn bạn đã mua hàng! Đơn hàng của bạn đã được xử lý.' : 'Thank you for your purchase! Your order has been processed.');
        cart = [];
        if (user) {
            let userCarts = JSON.parse(localStorage.getItem('userCarts')) || {};
            userCarts[user] = cart;
            localStorage.setItem('userCarts', JSON.stringify(userCarts));
        } else {
            localStorage.setItem('guestCart', JSON.stringify(cart));
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        Common.loadCart();
        Common.renderCart();
        const cartModal = bootstrap.Modal.getInstance(document.getElementById('cartModal'));
        cartModal.hide();
    }

    // Initialize
    function initialize() {
        if (DOM.searchInput) {
            DOM.searchInput.addEventListener('input', debounce(searchProducts, 300));
        }
        if (DOM.priceFilter) {
            DOM.priceFilter.addEventListener('change', () => applyPriceFilter(products));
        }
        fetchProducts();

        // Update cart when modal is shown
        const cartModal = document.getElementById('cartModal');
        if (cartModal) {
            cartModal.addEventListener('shown.bs.modal', () => {
                console.log('Cart modal shown, rendering cart...');
                Common.renderCart();
            });
        }
    }

    document.addEventListener('DOMContentLoaded', initialize);

    return { addToCart, resetFilters, checkout };
})();