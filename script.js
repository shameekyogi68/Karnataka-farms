// ==================== STATE MANAGEMENT ====================
class Store {
    constructor(initialState) {
        this.state = initialState;
        this.listeners = [];
    }
    subscribe(listener) {
        this.listeners.push(listener);
        return () => { this.listeners = this.listeners.filter(l => l !== listener); };
    }
    setState(newState) {
        this.state = { ...this.state, ...newState };
        this.listeners.forEach(l => l(this.state));
    }
    getState() { return this.state; }
}

const appStore = new Store({
    products: [],
    cart: JSON.parse(localStorage.getItem('karnatakaCart')) || [],
    wishlist: JSON.parse(localStorage.getItem('karnatakaWishlist')) || [],
    currentProduct: null,
    zipCode: localStorage.getItem('kf_zip') || '',
    currentFilter: 'all',
    currentSort: 'popularity',
    priceMin: 0,
    priceMax: 999999,
});

appStore.subscribe((state) => {
    localStorage.setItem('karnatakaCart', JSON.stringify(state.cart));
    localStorage.setItem('karnatakaWishlist', JSON.stringify(state.wishlist));
});

// ==================== REVIEWS DATA ====================
const sampleReviews = [
    { name: 'Priya S.', city: 'Bangalore', rating: 5, text: 'Absolutely beautiful plants! Arrived perfectly packaged and thriving. Karnataka Farms has set a new standard.', date: '3 weeks ago', verified: true },
    { name: 'Rahul M.', city: 'Mysore', rating: 5, text: 'My Monstera arrived in perfect condition. The roots were healthy and it already has a new leaf after 2 weeks!', date: '1 month ago', verified: true },
    { name: 'Ananya K.', city: 'Hubli', rating: 5, text: 'Best online plant purchase I have ever made. Customer support on WhatsApp is incredibly responsive.', date: '2 months ago', verified: true },
    { name: 'Vijay R.', city: 'Manipal', rating: 4, text: 'Great quality plants, very well packaged. Delivery was a day late but completely worth it.', date: '2 months ago', verified: true },
];

// ==================== ROUTING ====================
function showPage(pageName) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const target = document.getElementById('page-' + pageName);
    if (target) {
        target.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    // Update desktop nav
    document.querySelectorAll('.nav-link').forEach(l => {
        l.classList.toggle('active', l.getAttribute('data-page') === pageName);
    });
    // Page-specific logic
    if (pageName === 'checkout') updateCheckoutSummary();
    if (pageName === 'garden') renderGarden();
    if (pageName === 'shop') { renderShopProducts(); }
    closeAllOverlays();
    setupReveal();
}

// ==================== INIT & FETCH ====================
async function initApp() {
    try {
        const res = await fetch('products.json');
        const products = await res.json();
        appStore.setState({ products, currentProduct: products[0] });

        renderHomeProducts();
        renderShopProducts();
        updateCartUI();
        showPage('home');

        setTimeout(() => {
            const preloader = document.getElementById('preloader');
            if (preloader) preloader.classList.add('hidden');
            setupReveal();
        }, 600);

        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/service-worker.js').catch(() => {});
        }

        // Open zip modal on first visit
        const zip = localStorage.getItem('kf_zip');
        if (!zip) {
            setTimeout(() => openZipModal(), 1200);
        } else {
            const banner = document.getElementById('zipBanner');
            if (banner) {
                banner.style.display = 'flex';
                updateZipBanner(zip);
            }
        }

    } catch (error) {
        console.error('Failed to load products:', error);
        showToast('Error loading store. Please use Live Server to run this app.', 'error');
        setTimeout(() => {
            const preloader = document.getElementById('preloader');
            if (preloader) preloader.classList.add('hidden');
        }, 600);
    }
}

document.addEventListener('DOMContentLoaded', initApp);

// ==================== SCROLL REVEAL ====================
function setupReveal() {
    const revealEls = document.querySelectorAll('.reveal:not(.visible)');
    if (!revealEls.length) return;
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(el => observer.observe(el));
}

// ==================== PRODUCT RENDERING ====================
function getStarHTML(rating) {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    let stars = '';
    for (let i = 0; i < full; i++) stars += '★';
    if (half) stars += '½';
    while (stars.replace('½','').length < 5) stars += '☆';
    return stars;
}

function renderProductCard(p, delay = 0) {
    const discount = p.originalPrice ? Math.round((1 - p.price / p.originalPrice) * 100) : 0;
    const isWishlisted = appStore.getState().wishlist.some(w => w.id === p.id);
    const rating = p.rating || (4.6 + Math.random() * 0.4);
    const reviews = p.reviews || Math.floor(50 + Math.random() * 200);
    return `
    <div class="card reveal ${delay ? 'reveal-delay-' + delay : ''}" onclick="openProductDetail(${p.id})">
        <div class="product-image-wrap img-container">
            <img src="${p.image}" alt="${p.name}" loading="lazy" decoding="async"
                 onload="this.parentElement.classList.add('loaded')"
                 onerror="this.style.opacity='1';this.src='https://placehold.co/400x400/EAF4EC/1A4D3E?text=${encodeURIComponent(p.name)}'">
            <div class="product-badges">
                ${discount > 0 ? `<span class="badge badge-sale">-${discount}%</span>` : ''}
                ${p.isNew ? `<span class="badge badge-new">New</span>` : ''}
                ${p.isBestSeller ? `<span class="badge badge-bestseller">⭐ Best Seller</span>` : ''}
            </div>
            <div class="product-actions">
                <button class="action-btn wishlist-btn ${isWishlisted ? 'wishlisted' : ''}"
                    onclick="event.stopPropagation(); toggleWishlist(${p.id})" aria-label="Wishlist">
                    ${isWishlisted ? '❤️' : '🤍'}
                </button>
                <button class="action-btn" onclick="event.stopPropagation(); quickAddToCart(${p.id})" aria-label="Quick add to cart">🛒</button>
            </div>
        </div>
        <div class="product-info">
            <div class="product-category">${p.category || 'Fruit Plant'}</div>
            <h3 class="product-title">${p.name}</h3>
            <div class="product-rating">
                <span class="stars-gold">${getStarHTML(rating).substring(0,5)}</span>
                <span style="color:var(--text-secondary);font-weight:400;">(${reviews})</span>
            </div>
            <div class="product-meta">
                <div class="product-price">
                    <span class="price-current">₹${p.price.toLocaleString('en-IN')}</span>
                    ${p.originalPrice ? `<span class="price-original">₹${p.originalPrice.toLocaleString('en-IN')}</span>` : ''}
                </div>
            </div>
            <button class="quick-add-full-btn" onclick="event.stopPropagation(); quickAddToCart(${p.id})">
                Add to Cart
            </button>
        </div>
    </div>`;
}

function renderHomeProducts() {
    const { products } = appStore.getState();
    const container = document.getElementById('homeProducts');
    if (!container || !products.length) return;
    const featured = products.slice(0, 8);
    container.innerHTML = featured.map((p, i) => renderProductCard(p, (i % 4) + 1)).join('');
    setTimeout(() => setupReveal(), 50);
}

function renderShopProducts() {
    const { products, currentFilter, currentSort, priceMin, priceMax } = appStore.getState();
    const container = document.getElementById('shopProducts');
    if (!container || !products.length) return;

    let filtered = [...products];
    if (currentFilter !== 'all') {
        filtered = filtered.filter(p => p.categorySlug === currentFilter || p.category === currentFilter);
    }
    filtered = filtered.filter(p => p.price >= priceMin && p.price <= priceMax);

    if (currentSort === 'price-low') filtered.sort((a, b) => a.price - b.price);
    else if (currentSort === 'price-high') filtered.sort((a, b) => b.price - a.price);
    else if (currentSort === 'newest') filtered.sort((a, b) => (b.id || 0) - (a.id || 0));

    const showing = Math.min(filtered.length, 24);
    const showingEl = document.getElementById('showingCount');
    if (showingEl) showingEl.textContent = `${showing} of ${filtered.length}`;

    if (!filtered.length) {
        container.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:60px 20px;color:var(--text-secondary);">
            <div style="font-size:48px;margin-bottom:16px;">🌿</div>
            <h3>No plants found</h3>
            <p>Try adjusting your filters</p>
            <button class="btn btn-secondary" style="margin-top:20px;" onclick="filterProducts('all', null)">Clear Filters</button>
        </div>`;
    } else {
        container.innerHTML = filtered.slice(0, showing).map((p, i) => renderProductCard(p, 0)).join('');
    }
    setTimeout(() => setupReveal(), 50);
}

// ==================== FILTERS ====================
function filterProducts(category, el) {
    appStore.setState({ currentFilter: category });
    // Update active state
    document.querySelectorAll('.filter-item').forEach(li => li.classList.remove('active'));
    if (el) el.classList.add('active');
    renderShopProducts();
}

function sortProducts(value) {
    appStore.setState({ currentSort: value });
    renderShopProducts();
}

function applyPriceFilter() {
    const min = parseFloat(document.getElementById('priceMin')?.value) || 0;
    const max = parseFloat(document.getElementById('priceMax')?.value) || 999999;
    appStore.setState({ priceMin: min, priceMax: max });
    renderShopProducts();
    showToast('Price filter applied!', 'success');
}

function filterCategoryFromFooter(category) {
    showPage('shop');
    setTimeout(() => {
        const filterEl = document.querySelector(`[data-filter="${category}"]`);
        filterProducts(category, filterEl);
    }, 100);
}

// ==================== PRODUCT DETAIL ====================
let currentProduct = null;

function openProductDetail(productId) {
    const { products } = appStore.getState();
    const p = products.find(prod => prod.id === productId) || products[0];
    if (!p) return;
    currentProduct = p;
    appStore.setState({ currentProduct: p });
    showPage('product');
    populateProductDetail(p);
}

function populateProductDetail(p) {
    const set = (id, html) => { const el = document.getElementById(id); if (el) el.innerHTML = html; };
    const discount = p.originalPrice ? Math.round((1 - p.price / p.originalPrice) * 100) : 0;
    const rating = p.rating || 4.9;
    const reviews = p.reviews || 128;

    set('productName', p.name);
    set('productPrice', '₹' + p.price.toLocaleString('en-IN'));
    set('productOldPrice', p.originalPrice ? '₹' + p.originalPrice.toLocaleString('en-IN') : '');
    set('productDesc', p.description || 'Premium nursery-grown plant, hand-selected by our expert horticulturists.');
    set('productRating', `<span class="stars-gold">${'★'.repeat(Math.round(rating))}</span> <span style="color:var(--text-secondary);font-weight:400;">(${reviews} reviews)</span>`);
    set('addToCartPrice', '₹' + p.price.toLocaleString('en-IN'));
    set('productBreadcrumbName', p.name);
    set('tabProductName', p.name);
    set('productBreadcrumbCategory', p.category || 'Fruit Plants');

    // Badges
    set('productBadges', `
        ${discount > 0 ? `<span class="badge badge-sale">-${discount}% OFF</span>` : ''}
        ${p.isBestSeller ? `<span class="badge badge-bestseller">⭐ Best Seller</span>` : ''}
        ${p.isNew ? `<span class="badge badge-new">New Arrival</span>` : ''}
        <span class="badge badge-stock">In Stock</span>
    `);

    // Gallery
    const mainImg = document.getElementById('galleryMain');
    const galleryContainer = document.getElementById('galleryMainContainer');
    if (mainImg) {
        mainImg.src = p.image;
        mainImg.alt = p.name;
        mainImg.onload = () => galleryContainer?.classList.add('loaded');
        galleryContainer?.classList.remove('loaded');
    }

    // Thumbs — use main image + color variants
    const thumbUrls = [p.image,
        `https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=200&h=200&fit=crop`,
        `https://images.unsplash.com/photo-1463320726281-696a485928c7?w=200&h=200&fit=crop`,
    ];
    const thumbsEl = document.getElementById('galleryThumbs');
    if (thumbsEl) {
        thumbsEl.innerHTML = thumbUrls.map((url, i) => `
            <img class="gallery-thumb ${i === 0 ? 'active' : ''}" src="${url}" alt="${p.name} view ${i+1}"
                 onclick="switchGalleryImg(this, '${url}')" loading="lazy">`
        ).join('');
    }

    // Description tab
    set('tabDesc1', p.description || `Native to tropical regions, <strong>${p.name}</strong> is a premium variety cultivated in our Bangalore nursery with organic practices and expert care.`);
    set('tabDesc2', `At Karnataka Farms, every ${p.name} is grown from carefully selected specimens in our controlled nursery environment. We acclimate each plant to indoor conditions for a minimum of 4 weeks before shipping.`);

    // Care cards
    set('careCards', `
        <div class="care-card"><div class="care-icon">☀️</div><h4>Bright Indirect</h4><p>Avoid harsh direct sun</p></div>
        <div class="care-card"><div class="care-icon">💧</div><h4>Weekly Water</h4><p>When top inch dries</p></div>
        <div class="care-card"><div class="care-icon">🌡️</div><h4>18-30°C</h4><p>Tropical comfort zone</p></div>
    `);

    // Care instructions
    set('careInstructions', `
        <li><strong style="color:var(--color-primary);">Light:</strong> Place in bright, indirect sunlight. An east-facing window is ideal.</li>
        <li><strong style="color:var(--color-primary);">Water:</strong> Water thoroughly when the top 1-2 inches of soil feel dry. Reduce in winter.</li>
        <li><strong style="color:var(--color-primary);">Humidity:</strong> Prefers 60%+ humidity. Mist occasionally or use a pebble tray.</li>
        <li><strong style="color:var(--color-primary);">Fertilizer:</strong> Feed with balanced liquid fertilizer every 2 weeks during March-September.</li>
        <li><strong style="color:var(--color-primary);">Pruning:</strong> Remove yellowing leaves to redirect energy to new growth.</li>
    `);

    // Reviews
    set('reviewsList', sampleReviews.map(r => `
        <div class="review-card">
            <div class="review-header">
                <div class="reviewer">
                    <div class="reviewer-avatar">${r.name[0]}</div>
                    <div>
                        <div class="reviewer-name">${r.name} ${r.verified ? '<span style="color:var(--color-accent-green);font-size:11px;font-weight:500;">✓ Verified</span>' : ''}</div>
                        <div class="reviewer-date">${r.city} · ${r.date}</div>
                    </div>
                </div>
                <div class="review-stars">${'★'.repeat(r.rating)}</div>
            </div>
            <p class="review-text">${r.text}</p>
        </div>
    `).join(''));

    // Related products
    const { products } = appStore.getState();
    const related = products.filter(prod => prod.id !== p.id).slice(0, 4);
    set('relatedProducts', related.map(rp => renderProductCard(rp, 0)).join(''));

    // Qty reset
    const qtyInput = document.getElementById('qtyInput');
    if (qtyInput) qtyInput.value = 1;

    // Reset tab
    setTab(document.querySelector('.tab.active') || document.querySelector('.tab'), 'desc');

    setTimeout(() => setupReveal(), 100);
}

function switchGalleryImg(thumbEl, url) {
    document.querySelectorAll('.gallery-thumb').forEach(t => t.classList.remove('active'));
    thumbEl.classList.add('active');
    const mainImg = document.getElementById('galleryMain');
    const container = document.getElementById('galleryMainContainer');
    if (mainImg) {
        container?.classList.remove('loaded');
        mainImg.style.opacity = '0';
        setTimeout(() => {
            mainImg.src = url;
            mainImg.onload = () => {
                container?.classList.add('loaded');
                mainImg.style.opacity = '1';
            };
        }, 200);
    }
}

function updateQty(change) {
    const input = document.getElementById('qtyInput');
    if (!input) return;
    let val = parseInt(input.value) + change;
    if (val < 1) val = 1;
    if (val > 99) val = 99;
    input.value = val;
    const priceEl = document.getElementById('addToCartPrice');
    if (priceEl && currentProduct) {
        priceEl.textContent = '₹' + (currentProduct.price * val).toLocaleString('en-IN');
    }
}

function addCurrentProductToCart() {
    if (!currentProduct) return;
    const qty = parseInt(document.getElementById('qtyInput')?.value) || 1;
    const selectedPot = document.querySelector('#potVariants .variant-option.active')?.textContent || 'Classic White';
    addToCart({
        id: currentProduct.id,
        name: currentProduct.name,
        price: currentProduct.price,
        image: currentProduct.image,
        categorySlug: currentProduct.categorySlug || 'general',
        size: 'Standard',
        pot: selectedPot,
        qty
    });
}

function selectVariant(btn, group) {
    const parent = btn.closest('.variant-options');
    if (parent) parent.querySelectorAll('.variant-option').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
}

function setTab(btn, tabId) {
    if (btn) {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        btn.classList.add('active');
    }
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    const panel = document.getElementById('tab-' + tabId);
    if (panel) panel.classList.add('active');
}

// ==================== CART LOGIC ====================
function addToCart(item) {
    const { cart } = appStore.getState();
    const existingIndex = cart.findIndex(c => c.id === item.id && c.size === item.size && c.pot === item.pot);
    const newCart = [...cart];
    if (existingIndex > -1) {
        newCart[existingIndex].qty += item.qty;
    } else {
        newCart.push(item);
    }
    appStore.setState({ cart: newCart });
    updateCartUI();
    showToast(`🌿 ${item.name} added to cart!`, 'success');
    toggleCart();
}

function quickAddToCart(productId) {
    const { products } = appStore.getState();
    const p = products.find(prod => prod.id === productId);
    if (!p) return;
    addToCart({
        id: p.id, name: p.name, price: p.price, image: p.image,
        categorySlug: p.categorySlug || 'general',
        size: p.sizes?.[0] || 'Standard', pot: p.pots?.[0] || 'Nursery Pot', qty: 1
    });
}

function updateCartQty(index, change) {
    const { cart } = appStore.getState();
    const newCart = [...cart];
    newCart[index].qty += change;
    if (newCart[index].qty < 1) newCart.splice(index, 1);
    appStore.setState({ cart: newCart });
    updateCartUI();
}

function removeCartItem(index) {
    const { cart } = appStore.getState();
    const item = cart[index];
    const newCart = cart.filter((_, i) => i !== index);
    appStore.setState({ cart: newCart });
    updateCartUI();
    showToast(`${item.name} removed`, 'info');
}

function toggleWishlist(productId) {
    const { products, wishlist } = appStore.getState();
    const p = products.find(prod => prod.id === productId);
    if (!p) return;
    const idx = wishlist.findIndex(w => w.id === productId);
    let newWishlist;
    if (idx > -1) {
        newWishlist = wishlist.filter((_, i) => i !== idx);
        showToast(`${p.name} removed from wishlist`, 'info');
    } else {
        newWishlist = [...wishlist, { id: p.id, name: p.name }];
        showToast(`❤️ ${p.name} added to wishlist!`, 'success');
    }
    appStore.setState({ wishlist: newWishlist });
    // Re-render to update heart icons
    renderHomeProducts();
    renderShopProducts();
}

function updateCartUI() {
    const { cart } = appStore.getState();
    const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    const hasReadyPlants = cart.some(item => item.categorySlug === 'ready-plants');
    const deliveryFree = subtotal >= 999 || hasReadyPlants;
    const delivery = deliveryFree ? 0 : (subtotal > 0 ? 49 : 0);
    const total = subtotal + delivery;

    // Header badge
    const badge = document.getElementById('cartBadge');
    if (badge) {
        badge.textContent = totalQty;
        badge.classList.add('pulse');
        setTimeout(() => badge.classList.remove('pulse'), 400);
    }
    // Bottom nav badge
    const bottomBadge = document.getElementById('bottomNavCartCount');
    if (bottomBadge) {
        bottomBadge.textContent = totalQty;
        bottomBadge.style.display = totalQty > 0 ? 'flex' : 'none';
    }
    // Cart header count
    const cartCountHeader = document.getElementById('cartCountHeader');
    if (cartCountHeader) cartCountHeader.textContent = totalQty;

    // Cart items
    const cartEmpty = document.getElementById('cartEmpty');
    const cartItemsEl = document.getElementById('cartItems');
    const cartFooter = document.getElementById('cartFooter');

    if (cart.length === 0) {
        if (cartEmpty) cartEmpty.style.display = 'flex';
        if (cartItemsEl) cartItemsEl.innerHTML = '';
        if (cartFooter) cartFooter.style.display = 'none';
    } else {
        if (cartEmpty) cartEmpty.style.display = 'none';
        if (cartFooter) cartFooter.style.display = 'block';
        if (cartItemsEl) {
            cartItemsEl.innerHTML = cart.map((item, i) => `
                <div class="cart-item">
                    <div class="cart-item-img-wrap img-container ${item.image ? 'loaded' : ''}">
                        <img src="${item.image}" alt="${item.name}" loading="lazy"
                             onload="this.parentElement.classList.add('loaded')"
                             onerror="this.style.opacity='1';this.src='https://placehold.co/72x72/EAF4EC/1A4D3E?text=🌿'">
                    </div>
                    <div class="cart-item-info">
                        <h4>${item.name}</h4>
                        <p>${item.size} · ${item.pot}</p>
                        <div class="cart-item-qty">
                            <button onclick="updateCartQty(${i}, -1)" aria-label="Decrease">−</button>
                            <span>${item.qty}</span>
                            <button onclick="updateCartQty(${i}, 1)" aria-label="Increase">+</button>
                            <button class="cart-item-remove" onclick="removeCartItem(${i})">Remove</button>
                        </div>
                    </div>
                    <div class="cart-item-price">₹${(item.price * item.qty).toLocaleString('en-IN')}</div>
                </div>
            `).join('');
        }
    }

    // Totals
    const cartSubtotalEl = document.getElementById('cartSubtotal');
    if (cartSubtotalEl) cartSubtotalEl.textContent = '₹' + subtotal.toLocaleString('en-IN');

    const cartDrawerDelivery = document.getElementById('cartDrawerDelivery');
    if (cartDrawerDelivery) {
        cartDrawerDelivery.textContent = deliveryFree ? 'Free' : `₹${delivery}`;
        cartDrawerDelivery.style.color = deliveryFree ? 'var(--color-accent-green)' : 'var(--text-primary)';
    }
    const cartTotalEl = document.getElementById('cartTotal');
    if (cartTotalEl) cartTotalEl.textContent = '₹' + total.toLocaleString('en-IN');

    // Checkout button state
    const checkoutBtn = document.getElementById('cartDrawerCheckoutBtn');
    const bulkMsg = document.getElementById('cartBulkMsg');
    if (checkoutBtn) {
        checkoutBtn.disabled = false;
        if (bulkMsg) bulkMsg.style.display = 'none';
    }

    // Note
    const noteEl = document.getElementById('cartDeliveryNote');
    if (noteEl) noteEl.innerHTML = deliveryFree
        ? `<span>✓</span> Free delivery applied`
        : `Add ₹${(999 - subtotal).toLocaleString('en-IN')} more for free delivery`;

    // Update checkout summary too
    updateCheckoutSummary();
}

// ==================== CHECKOUT ====================
function updateCheckoutSummary() {
    const { cart } = appStore.getState();
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    const hasReadyPlants = cart.some(item => item.categorySlug === 'ready-plants');
    const deliveryFree = subtotal >= 999 || hasReadyPlants;
    const delivery = deliveryFree ? 0 : (subtotal > 0 ? 49 : 0);
    const total = subtotal + delivery;

    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    set('checkoutSubtotal', '₹' + subtotal.toLocaleString('en-IN'));
    set('checkoutFinalTotal', '₹' + total.toLocaleString('en-IN'));
    set('checkoutTotal', '₹' + total.toLocaleString('en-IN'));

    const deliveryEl = document.getElementById('checkoutPageDelivery');
    if (deliveryEl) {
        deliveryEl.textContent = deliveryFree ? 'Free' : `₹${delivery}`;
        deliveryEl.style.color = deliveryFree ? 'var(--color-accent-green)' : 'var(--text-primary)';
    }

    const checkoutItems = document.getElementById('checkoutItems');
    if (checkoutItems) {
        checkoutItems.innerHTML = cart.map(item => `
            <div class="summary-product">
                <img src="${item.image}" alt="${item.name}" loading="lazy"
                     onerror="this.src='https://placehold.co/56x56/EAF4EC/1A4D3E?text=🌿'">
                <div class="summary-product-info">
                    <h4>${item.name}</h4>
                    <p>${item.size} · Qty: ${item.qty}</p>
                </div>
                <div style="font-weight:700;color:var(--color-luxury);white-space:nowrap;">₹${(item.price * item.qty).toLocaleString('en-IN')}</div>
            </div>
        `).join('');
    }
}

function selectPayment(el) {
    document.querySelectorAll('.payment-option').forEach(p => p.classList.remove('active'));
    el.classList.add('active');
    const radio = el.querySelector('input[type="radio"]');
    if (radio) radio.checked = true;
}

function placeOrder() {
    const name = document.getElementById('co_name')?.value?.trim();
    const phone = document.getElementById('co_phone')?.value?.trim();
    const email = document.getElementById('co_email')?.value?.trim();
    const addr1 = document.getElementById('co_addr1')?.value?.trim();
    const city = document.getElementById('co_city')?.value?.trim();
    const pin = document.getElementById('co_pin')?.value?.trim();
    const state = document.getElementById('co_state')?.value;

    if (!name) { showToast('Please enter your full name', 'error'); return; }
    if (!phone || phone.replace(/\D/g, '').length < 10) { showToast('Please enter a valid phone number', 'error'); return; }
    if (!email || !email.includes('@')) { showToast('Please enter a valid email address', 'error'); return; }
    if (!addr1) { showToast('Please enter your address', 'error'); return; }
    if (!city) { showToast('Please enter your city', 'error'); return; }
    if (!pin || pin.length !== 6) { showToast('Please enter a valid 6-digit PIN code', 'error'); return; }
    if (!state) { showToast('Please select your state', 'error'); return; }

    const { cart } = appStore.getState();
    if (!cart.length) { showToast('Your cart is empty!', 'error'); return; }

    const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    const orderItems = cart.map(item => `• ${item.name} (x${item.qty}) — ₹${(item.price * item.qty).toLocaleString('en-IN')}`).join('%0A');
    const delivery = document.querySelector('input[name="delivery"]:checked')?.value || 'Home Delivery';
    const payment = document.querySelector('.payment-option.active .payment-label')?.textContent || 'Cash on Delivery';

    const waMsg = `Hello Karnataka Farms!%0A%0A*New Order Request*%0A%0AName: ${encodeURIComponent(name)}%0APhone: ${encodeURIComponent(phone)}%0AEmail: ${encodeURIComponent(email)}%0ADelivery: ${delivery}%0AAddress: ${encodeURIComponent(addr1 + ', ' + city + ', ' + state + ' - ' + pin)}%0APayment: ${payment}%0A%0AItems:%0A${orderItems}%0A%0ATotal: ₹${total.toLocaleString('en-IN')}%0A%0AThank you!`;

    window.open(`https://wa.me/917760674510?text=${waMsg}`, '_blank');

    const whatsappOptIn = document.getElementById('whatsappOptIn')?.checked;
    appStore.setState({ cart: [] });
    updateCartUI();

    showToast('🎉 Order placed! Redirecting to WhatsApp...', 'success');
    setTimeout(() => showPage('home'), 2000);
}

// ==================== QUIZ ====================
const quizAnswers = {};
function nextQuizStep(step, answer) {
    quizAnswers[step] = answer;
    const current = document.getElementById(`quizStep${step}`);
    const next = document.getElementById(`quizStep${step + 1}`);
    if (current) current.classList.remove('active');
    if (next) next.classList.add('active');
    const progress = document.getElementById('quizProgress');
    if (progress) progress.style.width = `${((step) / 6) * 100}%`;
}

function finishQuiz() {
    const email = document.getElementById('quizEmail')?.value;
    if (email) showToast('10% discount code sent to ' + email, 'success');
    showQuizResults();
}

function showQuizResults() {
    const { products } = appStore.getState();
    showPage('quiz-results');
    const container = document.getElementById('quizResultProducts');
    if (container && products.length) {
        const results = products.slice(0, 4);
        container.innerHTML = results.map((p, i) => renderProductCard(p, i + 1)).join('');
        setTimeout(() => setupReveal(), 50);
    }
}

// ==================== GARDEN ====================
function renderGarden() {
    const { cart } = appStore.getState();
    const gardenPlants = document.getElementById('gardenPlants');
    const schedule = document.getElementById('gardenSchedule');

    if (cart.length === 0) {
        if (gardenPlants) gardenPlants.innerHTML = `
            <div style="grid-column:1/-1;text-align:center;padding:60px 20px;color:var(--text-secondary);">
                <div style="font-size:48px;margin-bottom:16px;">🌱</div>
                <h3 style="color:var(--color-primary);margin-bottom:8px;">Your garden is empty</h3>
                <p>Order plants to start tracking your garden.</p>
                <button class="btn btn-primary" style="margin-top:20px;" onclick="showPage('shop')">Shop Plants</button>
            </div>`;
        return;
    }

    if (gardenPlants) {
        gardenPlants.innerHTML = cart.map(item => `
            <div class="garden-plant-card">
                <img class="garden-plant-img" src="${item.image}" alt="${item.name}"
                     onerror="this.src='https://placehold.co/400x200/EAF4EC/1A4D3E?text=🌿'">
                <div class="garden-plant-info">
                    <h4>${item.name}</h4>
                    <p style="color:var(--text-secondary);font-size:13px;margin-top:4px;">Qty: ${item.qty}</p>
                    <button class="btn water-btn due" style="width:100%;margin-top:12px;">💧 Water Today</button>
                </div>
            </div>`).join('');
    }

    if (schedule) {
        schedule.innerHTML = cart.map(item => `
            <li style="padding:8px 0;border-bottom:1px solid var(--border-light);display:flex;align-items:center;gap:8px;">
                <span style="color:var(--color-accent-green);">💧</span>
                <span>${item.name}</span>
            </li>`).join('');
    }
}

// ==================== OVERLAYS & UI ====================
function toggleCart() {
    const overlay = document.getElementById('cartOverlay');
    const drawer = document.getElementById('cartDrawer');
    if (overlay && drawer) {
        const isOpen = overlay.classList.contains('open');
        if (!isOpen) updateCartUI();
        overlay.classList.toggle('open');
        drawer.classList.toggle('open');
        document.body.style.overflow = isOpen ? '' : 'hidden';
    }
}

function toggleMobileMenu() {
    const overlay = document.getElementById('mobileMenuOverlay');
    const menu = document.getElementById('mobileMenu');
    if (overlay && menu) {
        const isOpen = overlay.classList.contains('open');
        overlay.classList.toggle('open');
        menu.classList.toggle('open');
        document.body.style.overflow = isOpen ? '' : 'hidden';
    }
}

function toggleSearch() {
    const overlay = document.getElementById('searchOverlay');
    if (!overlay) return;
    const isOpen = overlay.classList.contains('open');
    overlay.classList.toggle('open');
    document.body.style.overflow = isOpen ? '' : 'hidden';
    if (!isOpen) {
        setTimeout(() => {
            const input = document.getElementById('searchInput');
            if (input) input.focus();
        }, 200);
    } else {
        const input = document.getElementById('searchInput');
        if (input) { input.value = ''; }
        const suggestions = document.getElementById('searchSuggestions');
        if (suggestions) suggestions.style.display = 'none';
    }
}

function handleSearch(query) {
    const { products } = appStore.getState();
    const suggestions = document.getElementById('searchSuggestions');
    if (!suggestions) return;
    if (!query.trim()) { suggestions.style.display = 'none'; return; }
    const results = products.filter(p =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        (p.description || '').toLowerCase().includes(query.toLowerCase())
    ).slice(0, 6);

    if (!results.length) {
        suggestions.style.display = 'block';
        suggestions.innerHTML = `<p style="padding:16px;color:var(--text-secondary);">No results for "${query}"</p>`;
        return;
    }
    suggestions.style.display = 'block';
    suggestions.innerHTML = results.map(p => `
        <div class="search-suggestion-item" onclick="openProductDetail(${p.id}); toggleSearch();">
            <img src="${p.image}" alt="${p.name}"
                 onerror="this.src='https://placehold.co/48x48/EAF4EC/1A4D3E?text=🌿'">
            <div>
                <span>${p.name}</span>
                <div style="font-size:12px;color:var(--text-secondary);">₹${p.price.toLocaleString('en-IN')}</div>
            </div>
        </div>
    `).join('');
}

function closeAllOverlays() {
    ['cartOverlay', 'cartDrawer', 'mobileMenuOverlay', 'mobileMenu', 'searchOverlay'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.remove('open');
    });
    document.body.style.overflow = '';
}

// ==================== ZIP MODAL ====================
function openZipModal() {
    const modal = document.getElementById('zipModal');
    if (modal) modal.classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeZipModal() {
    const modal = document.getElementById('zipModal');
    if (modal) modal.classList.remove('open');
    document.body.style.overflow = '';
}

function checkZip() {
    const input = document.getElementById('zipInput');
    const errorEl = document.getElementById('zipError');
    const zip = input?.value?.trim();
    if (!zip || zip.length < 6) { showToast('Please enter a 6-digit PIN code', 'error'); return; }

    const deliverableZones = ['560', '570', '575', '576', '580', '590', '600', '627', '641'];
    const isDeliverable = deliverableZones.some(z => zip.startsWith(z));

    if (isDeliverable) {
        localStorage.setItem('kf_zip', zip);
        appStore.setState({ zipCode: zip });
        updateZipBanner(zip);
        const banner = document.getElementById('zipBanner');
        if (banner) banner.style.display = 'flex';
        closeZipModal();
        showToast('✅ Great! We deliver to your area.', 'success');
    } else {
        if (errorEl) errorEl.style.display = 'block';
    }
}

function updateZipBanner(zip) {
    const text = document.getElementById('zipBannerText');
    const cities = { '560': 'Bangalore', '570': 'Mysore', '575': 'Mangalore', '576': 'Manipal', '580': 'Hubli' };
    const prefix = zip.substring(0, 3);
    const city = cities[prefix] || 'Your Area';
    if (text) text.innerHTML = `Delivering to: <strong>${zip} (${city})</strong> — Plants thrive here!`;
}

// ==================== HEADER SCROLL ====================
window.addEventListener('scroll', () => {
    const header = document.getElementById('header');
    if (header) {
        header.classList.toggle('scrolled', window.scrollY > 20);
    }
    // Back to top
    const backToTop = document.getElementById('backToTop');
    if (backToTop) {
        backToTop.classList.toggle('visible', window.scrollY > 400);
    }
});

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ==================== BOTTOM NAV ====================
function updateBottomNav(el) {
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    if (el) el.classList.add('active');
}

// ==================== TOAST ====================
function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const icons = { success: '✅', error: '❌', info: 'ℹ️' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <div class="toast-icon">${icons[type] || '🌿'}</div>
        <div class="toast-content">
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close" onclick="this.parentElement.classList.remove('show'); setTimeout(()=>this.parentElement.remove(),400)">×</button>
    `;
    container.appendChild(toast);
    requestAnimationFrame(() => { requestAnimationFrame(() => toast.classList.add('show')); });
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
    }, 3500);
}

// ==================== B2B ====================
function submitB2B() {
    const name = document.getElementById('b2bName')?.value?.trim();
    const phone = document.getElementById('b2bPhone')?.value?.trim();
    const company = document.getElementById('b2bCompany')?.value?.trim();
    const count = document.getElementById('b2bCount')?.value;
    if (!name) { showToast('Please enter your name', 'error'); return; }
    if (!phone) { showToast('Please enter your phone number', 'error'); return; }
    const waMsg = `Hello! I'd like a B2B quote.%0AName: ${encodeURIComponent(name)}%0ACompany: ${encodeURIComponent(company || 'N/A')}%0APlant Count: ${count || 'Not specified'}`;
    window.open(`https://wa.me/917760674510?text=${waMsg}`, '_blank');
    showToast('Redirecting to WhatsApp for your quote!', 'success');
}

// ==================== KEYBOARD & GLOBAL EVENTS ====================
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const searchOverlay = document.getElementById('searchOverlay');
        if (searchOverlay?.classList.contains('open')) { toggleSearch(); return; }
        const cartOverlay = document.getElementById('cartOverlay');
        if (cartOverlay?.classList.contains('open')) { toggleCart(); return; }
        const mobileMenu = document.getElementById('mobileMenu');
        if (mobileMenu?.classList.contains('open')) { toggleMobileMenu(); return; }
        const zipModal = document.getElementById('zipModal');
        if (zipModal?.classList.contains('open')) { closeZipModal(); return; }
    }
});