document.addEventListener('DOMContentLoaded', () => {

    // 1. Products Data (Local Images Path)
    const products = [
        {
            id: 1,
            title: "Wireless Noise-Canceling Headphones",
            price: 2499,
            category: "electronics",
            image: "images/product1.jpg"
        },
        {
            id: 2,
            title: "Smart Fitness Watch",
            price: 1899,
            category: "electronics",
            image: "images/product2.jpg"
        },
        {
            id: 3,
            title: "Classic Denim Jacket",
            price: 1499,
            category: "clothing",
            image: "images/product3.jpg"
        },
        {
            id: 4,
            title: "Casual Cotton T-Shirt",
            price: 499,
            category: "clothing",
            image: "images/product4.jpg"
        },
        {
            id: 5,
            title: "Leather Minimalist Backpack",
            price: 1999,
            category: "accessories",
            image: "images/product5.jpg"
        },
        {
            id: 6,
            title: "Polarized UV Sunglasses",
            price: 799,
            category: "accessories",
            image: "images/product6.jpg"
        }
    ];

    // 2. State & Elements
    let cart = JSON.parse(localStorage.getItem('nexStore_cart')) || [];

    const productGrid = document.getElementById('productGrid');
    const cartDrawer = document.getElementById('cartDrawer');
    const overlay = document.getElementById('overlay');
    const cartCount = document.getElementById('cartCount');
    const cartItemsList = document.getElementById('cartItemsList');
    const cartTotal = document.getElementById('cartTotal');
    const searchInput = document.getElementById('searchInput');
    const cartToggleBtn = document.getElementById('cartToggleBtn');
    const closeCartBtn = document.getElementById('closeCartBtn');
    const checkoutBtn = document.getElementById('checkoutBtn');
    const filterButtons = document.querySelectorAll('.filter-btn');

    // 3. Render Products
    function renderProducts(items) {
        productGrid.innerHTML = '';

        if (!items || items.length === 0) {
            productGrid.innerHTML = '<p style="grid-column: 1/-1; text-align:center; color:#64748b; padding: 40px;">No products found.</p>';
            return;
        }

        items.forEach(product => {
            const card = document.createElement('div');
            card.className = 'card';

            card.innerHTML = `
                <img src="${product.image}" alt="${product.title}" class="card-img">
                <span class="card-category">${product.category}</span>
                <h3 class="card-title">${product.title}</h3>
                <div class="card-price">₹${product.price}</div>
                <button class="add-btn" data-id="${product.id}">Add to Cart</button>
            `;

            productGrid.appendChild(card);
        });

        // Add to Cart Listeners
        document.querySelectorAll('.add-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = parseInt(e.target.getAttribute('data-id'));
                addToCart(id);
            });
        });
    }

    // 4. Cart Controls
    function toggleCart() {
        cartDrawer.classList.toggle('open');
        overlay.classList.toggle('active');
    }

    cartToggleBtn.addEventListener('click', toggleCart);
    closeCartBtn.addEventListener('click', toggleCart);
    overlay.addEventListener('click', toggleCart);

    // 5. Cart Logic
    function addToCart(productId) {
        const product = products.find(p => p.id === productId);
        const existingItem = cart.find(item => item.id === productId);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ ...product, quantity: 1 });
        }

        saveAndRefreshCart();
    }

    function removeFromCart(productId) {
        cart = cart.filter(item => item.id !== productId);
        saveAndRefreshCart();
    }

    function saveAndRefreshCart() {
        localStorage.setItem('nexStore_cart', JSON.stringify(cart));
        updateCartUI();
    }

    function updateCartUI() {
        const totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.innerText = totalQty;

        cartItemsList.innerHTML = '';

        if (cart.length === 0) {
            cartItemsList.innerHTML = '<p class="empty-msg">Your cart is currently empty.</p>';
            cartTotal.innerText = '₹0';
            return;
        }

        let totalAmount = 0;

        cart.forEach(item => {
            totalAmount += item.price * item.quantity;

            const row = document.createElement('div');
            row.className = 'cart-item';
            row.innerHTML = `
                <div class="item-info">
                    <h4>${item.title}</h4>
                    <p>₹${item.price} × ${item.quantity}</p>
                </div>
                <button class="remove-btn" data-id="${item.id}">Remove</button>
            `;
            cartItemsList.appendChild(row);
        });

        document.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.getAttribute('data-id'));
                removeFromCart(id);
            });
        });

        cartTotal.innerText = `₹${totalAmount}`;
    }

    // 6. Category Filter
    filterButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterButtons.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');

            const category = e.target.getAttribute('data-category');
            if (category === 'all') {
                renderProducts(products);
            } else {
                const filtered = products.filter(p => p.category === category);
                renderProducts(filtered);
            }
        });
    });

    // 7. Search Input
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const filtered = products.filter(p => 
            p.title.toLowerCase().includes(query) || p.category.toLowerCase().includes(query)
        );
        renderProducts(filtered);
    });

    // 8. Checkout Simulation
    checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) {
            alert("Your cart is empty!");
            return;
        }
        alert("🎉 Order placed successfully! Thank you for shopping with NexStore.");
        cart = [];
        saveAndRefreshCart();
        toggleCart();
    });

    // Initial Load
    renderProducts(products);
    updateCartUI();
});