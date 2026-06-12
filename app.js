/**
 * Pisco Nontay - UX/UI and E-Commerce Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // --- STORES & DATA ---
    const productsDB = {
        'nontay-moscatel': {
            id: 'nontay-moscatel',
            name: 'Pisco Nontay Moscatel Premium',
            price: 24990,
            image: 'foto21 bla.jpg'
        },
        'nontay-envejecido': {
            id: 'nontay-envejecido',
            name: 'Pisco Nontay Envejecido Premium',
            price: 29990,
            image: 'foto22 envejecido.jpg'
        },
        'nontay-duo': {
            id: 'nontay-duo',
            name: 'Pack Nontay Selección Dúo',
            price: 45990,
            image: 'foto2.jpg'
        }
    };

    let cart = JSON.parse(localStorage.getItem('nontay_cart')) || [];

    // --- DOM ELEMENTS ---
    const ageGate = document.getElementById('age-gate');
    const btnAgeYes = document.getElementById('btn-age-yes');
    const btnAgeNo = document.getElementById('btn-age-no');
    const ageGateError = document.getElementById('age-gate-error');

    const mainHeader = document.getElementById('main-header');
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const navMenu = document.getElementById('nav-menu');
    const navItems = document.querySelectorAll('.nav-item');

    const sideCart = document.getElementById('side-cart');
    const cartToggleBtn = document.getElementById('cart-toggle-btn');
    const cartCloseBtn = document.getElementById('cart-close-btn');
    const sideCartOverlay = document.getElementById('side-cart-overlay');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartBadge = document.getElementById('cart-badge');
    const cartSubtotal = document.getElementById('cart-subtotal');
    const cartTotal = document.getElementById('cart-total');
    const checkoutBtn = document.getElementById('checkout-btn');

    // ==========================================================================
    // 1. AGE GATE CONTROL
    // ==========================================================================
    function checkAgeGate() {
        const isVerified = localStorage.getItem('ageVerified');
        if (isVerified === 'true') {
            ageGate.style.display = 'none';
            document.body.style.overflow = '';
        } else {
            ageGate.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    }

    if (btnAgeYes) {
        btnAgeYes.addEventListener('click', () => {
            localStorage.setItem('ageVerified', 'true');
            ageGate.classList.add('fade-out');
            document.body.style.overflow = '';
            setTimeout(() => {
                ageGate.style.display = 'none';
            }, 500);
        });
    }

    if (btnAgeNo) {
        btnAgeNo.addEventListener('click', () => {
            ageGateError.style.display = 'block';
            // Disable yes button to enforce limit if desired, or redirect
            btnAgeYes.style.opacity = '0.5';
            btnAgeYes.style.pointerEvents = 'none';
            
            setTimeout(() => {
                window.location.href = 'https://www.google.com';
            }, 3000);
        });
    }

    checkAgeGate();

    // ==========================================================================
    // 2. STICKY HEADER & ACTIVE LINKS ON SCROLL
    // ==========================================================================
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            mainHeader.classList.add('scrolled');
        } else {
            mainHeader.classList.remove('scrolled');
        }
        highlightNavOnScroll();
    });

    function highlightNavOnScroll() {
        let scrollPosition = window.scrollY + 150; // Offset for header height
        
        document.querySelectorAll('section').forEach(section => {
            if (section.id) {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.offsetHeight;
                
                if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                    navItems.forEach(item => {
                        item.classList.remove('active');
                        if (item.getAttribute('href') === `#${section.id}`) {
                            item.classList.add('active');
                        }
                    });
                }
            }
        });
        
        // Return active to start if scroll is at top
        if (window.scrollY < 200) {
            navItems.forEach(item => item.classList.remove('active'));
            navItems[0].classList.add('active');
        }
    }

    // ==========================================================================
    // 3. RESPONSIVE NAVIGATION MENU
    // ==========================================================================
    if (mobileMenuBtn && navMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenuBtn.classList.toggle('open');
            navMenu.classList.toggle('open');
        });
    }

    // Close menu when link is clicked
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            if (mobileMenuBtn.classList.contains('open')) {
                mobileMenuBtn.classList.remove('open');
                navMenu.classList.remove('open');
            }
        });
    });

    // ==========================================================================
    // 4. SIDE CART & E-COMMERCE SYSTEM
    // ==========================================================================
    
    // Toggle Cart open/close
    function toggleCart() {
        sideCart.classList.toggle('open');
        if (sideCart.classList.contains('open')) {
            document.body.style.overflow = 'hidden'; // prevent background scrolling
        } else {
            // Restore scrolling unless age gate is active
            if (localStorage.getItem('ageVerified') !== 'true') {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        }
    }

    cartToggleBtn.addEventListener('click', toggleCart);
    cartCloseBtn.addEventListener('click', toggleCart);
    sideCartOverlay.addEventListener('click', toggleCart);

    // Save cart state
    function saveCart() {
        localStorage.setItem('nontay_cart', JSON.stringify(cart));
        updateCartUI();
    }

    // Format currency to CLP
    function formatCurrency(number) {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP',
            minimumFractionDigits: 0
        }).format(number);
    }

    // Update Cart UI elements
    function updateCartUI() {
        // Update total items count in badge
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartBadge.textContent = totalItems;
        
        // Hide badge if empty
        if (totalItems === 0) {
            cartBadge.style.opacity = '0';
        } else {
            cartBadge.style.opacity = '1';
        }

        // Render Items
        cartItemsContainer.innerHTML = '';
        
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="cart-empty-message">Tu carrito está vacío. ¡Elige un Pisco Nontay para comenzar!</div>
            `;
            cartSubtotal.textContent = '$0 CLP';
            cartTotal.textContent = '$0 CLP';
            return;
        }

        let subtotal = 0;

        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;

            const cartItemDiv = document.createElement('div');
            cartItemDiv.className = 'cart-item';
            cartItemDiv.innerHTML = `
                <img src="${item.image}" alt="${item.name}" class="cart-item-img">
                <div class="cart-item-details">
                    <h4 class="cart-item-title">${item.name}</h4>
                    <p class="cart-item-price">${formatCurrency(item.price)}</p>
                    <div class="cart-item-controls">
                        <div class="quantity-control">
                            <button class="btn-qty-minus" data-id="${item.id}">-</button>
                            <span>${item.quantity}</span>
                            <button class="btn-qty-plus" data-id="${item.id}">+</button>
                        </div>
                        <button class="cart-item-remove" data-id="${item.id}">Eliminar</button>
                    </div>
                </div>
            `;
            cartItemsContainer.appendChild(cartItemDiv);
        });

        // Calculations
        cartSubtotal.textContent = formatCurrency(subtotal);
        cartTotal.textContent = formatCurrency(subtotal);

        // Add Listeners to newly rendered dynamic buttons
        document.querySelectorAll('.btn-qty-minus').forEach(btn => {
            btn.addEventListener('click', (e) => {
                changeQuantity(e.target.dataset.id, -1);
            });
        });

        document.querySelectorAll('.btn-qty-plus').forEach(btn => {
            btn.addEventListener('click', (e) => {
                changeQuantity(e.target.dataset.id, 1);
            });
        });

        document.querySelectorAll('.cart-item-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                removeFromCart(e.target.dataset.id);
            });
        });
    }

    // Add product to cart
    function addToCart(productId) {
        const product = productsDB[productId];
        if (!product) return;

        const existingItem = cart.find(item => item.id === productId);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: 1
            });
        }
        
        saveCart();
        
        // Open the cart drawer automatically so user gets feedback
        if (!sideCart.classList.contains('open')) {
            toggleCart();
        }

        // Add micro-animation effect to header badge
        cartBadge.classList.add('pulse');
        setTimeout(() => {
            cartBadge.classList.remove('pulse');
        }, 300);
    }

    // Change item quantity
    function changeQuantity(productId, change) {
        const item = cart.find(item => item.id === productId);
        if (!item) return;

        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            saveCart();
        }
    }

    // Remove item from cart
    function removeFromCart(productId) {
        cart = cart.filter(item => item.id !== productId);
        saveCart();
    }

    // Bind catalog shop buttons
    document.querySelectorAll('.product-card').forEach(card => {
        const btnAdd = card.querySelector('.btn-add-cart');
        const productId = card.dataset.productId;
        
        if (btnAdd && productId) {
            btnAdd.addEventListener('click', () => {
                addToCart(productId);
            });
        }
    });

    // Bind Hero Shop Button
    const heroBtnShop = document.querySelector('.hero-actions-container a[href="#tienda"]');
    if (heroBtnShop) {
        heroBtnShop.addEventListener('click', (e) => {
            e.preventDefault();
            const shopSec = document.getElementById('tienda');
            if (shopSec) {
                shopSec.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    // ==========================================================================
    // 5. CHECKOUT STEP-BY-STEP & PAYMENTS WIZARD
    // ==========================================================================
    const checkoutModal = document.getElementById('checkout-modal');
    const checkoutCloseBtn = document.getElementById('checkout-close-btn');
    const shippingForm = document.getElementById('shipping-form');
    const shippingRegion = document.getElementById('shipping-region');
    const checkoutSubtotal = document.getElementById('checkout-subtotal');
    const checkoutShipping = document.getElementById('checkout-shipping');
    const checkoutTotal = document.getElementById('checkout-total');
    const btnCheckoutBack = document.getElementById('btn-checkout-back');
    const btnCheckoutNext = document.getElementById('btn-checkout-next');

    const checkoutStep1 = document.getElementById('checkout-step-1');
    const checkoutStep2 = document.getElementById('checkout-step-2');
    const progressStep1Ind = document.getElementById('progress-step-1-indicator');
    const progressStep2Ind = document.getElementById('progress-step-2-indicator');
    const progressLineInd = document.getElementById('progress-line-indicator');

    const payOptWhatsapp = document.getElementById('pay-opt-whatsapp');
    const payOptOnline = document.getElementById('pay-opt-online');

    const webpaySimulator = document.getElementById('webpay-simulator');
    const webpayMockForm = document.getElementById('webpay-mock-form');
    const webpayAmount = document.getElementById('webpay-amount');
    const webpayLoadingStage = document.getElementById('webpay-loading-stage');
    const webpayFormStage = document.getElementById('webpay-form-stage');
    const webpaySuccessStage = document.getElementById('webpay-success-stage');

    let currentStep = 1;
    let selectedPayment = 'whatsapp'; // default matching checked card in html
    const regionRates = {
        'coquimbo': 3500,
        'coquimbo-local': 2500,
        'rm': 4900,
        'centro': 4500,
        'norte': 6500,
        'sur': 5900,
        'extremas': 8500
    };

    // Calculate subtotal from cart
    function getCartSubtotal() {
        return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }

    // Update Checkout Prices Summary
    function updateCheckoutSummary() {
        const subtotal = getCartSubtotal();
        const region = shippingRegion.value;
        let shippingCost = 0;

        if (region && regionRates[region]) {
            // Free shipping if purchase >= $50,000 CLP
            if (subtotal >= 50000) {
                shippingCost = 0;
            } else {
                shippingCost = regionRates[region];
            }
        }

        const total = subtotal + shippingCost;

        checkoutSubtotal.textContent = formatCurrency(subtotal);
        checkoutShipping.textContent = shippingCost === 0 && region ? 'Gratis' : formatCurrency(shippingCost);
        checkoutTotal.textContent = formatCurrency(total);
        webpayAmount.textContent = formatCurrency(total);
    }

    // Open Checkout
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cart.length === 0) return;
            
            // Open Checkout Modal & Close Side Cart
            checkoutModal.classList.add('open');
            toggleCart();
            document.body.style.overflow = 'hidden';
            
            // Reset Wizard to Step 1
            goToStep(1);
            shippingForm.reset();
            updateCheckoutSummary();
        });
    }

    // Close Checkout Modal
    if (checkoutCloseBtn) {
        checkoutCloseBtn.addEventListener('click', () => {
            checkoutModal.classList.remove('open');
            document.body.style.overflow = '';
        });
    }

    // Calculate on region select change
    if (shippingRegion) {
        shippingRegion.addEventListener('change', updateCheckoutSummary);
    }

    // Select Payment Cards
    if (payOptWhatsapp && payOptOnline) {
        payOptWhatsapp.addEventListener('click', () => {
            payOptWhatsapp.classList.add('selected');
            payOptOnline.classList.remove('selected');
            selectedPayment = 'whatsapp';
        });

        payOptOnline.addEventListener('click', () => {
            payOptOnline.classList.add('selected');
            payOptWhatsapp.classList.remove('selected');
            selectedPayment = 'online';
        });
    }

    // Wizard Step Navigation
    function goToStep(step) {
        currentStep = step;
        if (step === 1) {
            checkoutStep1.classList.add('active');
            checkoutStep2.classList.remove('active');
            progressStep1Ind.classList.add('active');
            progressStep2Ind.classList.remove('active');
            progressLineInd.classList.remove('filled');
            
            btnCheckoutBack.style.display = 'none';
            btnCheckoutNext.textContent = 'Continuar al Pago';
        } else if (step === 2) {
            checkoutStep1.classList.remove('active');
            checkoutStep2.classList.add('active');
            progressStep1Ind.classList.add('active');
            progressStep2Ind.classList.add('active');
            progressLineInd.classList.add('filled');
            
            btnCheckoutBack.style.display = 'inline-flex';
            btnCheckoutNext.textContent = 'Finalizar Pedido';
        }
    }

    if (btnCheckoutBack) {
        btnCheckoutBack.addEventListener('click', () => {
            if (currentStep === 2) {
                goToStep(1);
            }
        });
    }

    if (btnCheckoutNext) {
        btnCheckoutNext.addEventListener('click', () => {
            if (currentStep === 1) {
                // Validate fields
                if (shippingForm.reportValidity()) {
                    goToStep(2);
                }
            } else if (currentStep === 2) {
                processPayment();
            }
        });
    }

    // Process Final Payment Stage
    function processPayment() {
        const subtotal = getCartSubtotal();
        const region = shippingRegion.value;
        const shippingCost = subtotal >= 50000 ? 0 : (regionRates[region] || 0);
        const total = subtotal + shippingCost;
        
        const customerName = document.getElementById('shipping-name').value;
        const customerEmail = document.getElementById('shipping-email').value;
        const customerPhone = document.getElementById('shipping-phone').value;
        const customerAddress = document.getElementById('shipping-address').value;
        const regionText = shippingRegion.options[shippingRegion.selectedIndex].text.split('—')[0].trim();

        if (selectedPayment === 'whatsapp') {
            // Generate WhatsApp message
            let message = `*NUEVO PEDIDO - PISCO NONTAY*\n`;
            message += `===================================\n`;
            message += `*CLIENTE:*\n`;
            message += `👤 Nombre: ${customerName}\n`;
            message += `📧 Email: ${customerEmail}\n`;
            message += `📞 Teléfono: ${customerPhone}\n`;
            message += `📍 Despacho: ${customerAddress}, ${regionText}\n`;
            message += `===================================\n`;
            message += `*PRODUCTOS:*\n`;
            
            cart.forEach(item => {
                message += `• ${item.quantity}x ${item.name} (${formatCurrency(item.price)} c/u) - *${formatCurrency(item.price * item.quantity)}*\n`;
            });
            
            message += `===================================\n`;
            message += `*RESUMEN DE COMPRA:*\n`;
            message += `💰 Subtotal: ${formatCurrency(subtotal)}\n`;
            message += `🚚 Despacho: ${shippingCost === 0 ? 'Gratis' : formatCurrency(shippingCost)}\n`;
            message += `⭐ *TOTAL A PAGAR:* ${formatCurrency(total)}\n`;
            message += `===================================\n`;
            message += `Hola, acabo de realizar mi pedido en su web. Me gustaría coordinar los datos de transferencia bancaria para completar el pago.`;

            // WhatsApp link redirection (Business Number: +56 9 1234 5678)
            const whatsappUrl = `https://wa.me/56912345678?text=${encodeURIComponent(message)}`;
            
            // Clear cart, close modals, redirect
            cart = [];
            saveCart();
            checkoutModal.classList.remove('open');
            document.body.style.overflow = '';
            
            // Open WhatsApp
            window.open(whatsappUrl, '_blank');
        } else if (selectedPayment === 'online') {
            // Transbank Webpay Simulation
            checkoutModal.classList.remove('open');
            webpaySimulator.classList.add('open');
            
            // Webpay Step 1: Loading
            webpayLoadingStage.classList.add('active');
            webpayFormStage.classList.remove('active');
            webpaySuccessStage.classList.remove('active');
            
            setTimeout(() => {
                // Webpay Step 2: Show Form
                webpayLoadingStage.classList.remove('active');
                webpayFormStage.classList.add('active');
            }, 1800);
        }
    }

    // Webpay simulated form submit
    if (webpayMockForm) {
        webpayMockForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Show loading stage for processing transaction
            webpayFormStage.classList.remove('active');
            webpayLoadingStage.classList.add('active');
            const loadingText = webpayLoadingStage.querySelector('h3');
            const loadingDesc = webpayLoadingStage.querySelector('p');
            
            if (loadingText) loadingText.textContent = 'Procesando transacción en Transbank...';
            if (loadingDesc) loadingDesc.textContent = 'Verificando los fondos de tu tarjeta bancaria.';

            setTimeout(() => {
                // Webpay Step 3: Success Screen
                webpayLoadingStage.classList.remove('active');
                webpaySuccessStage.classList.add('active');
                
                // Clear cart state
                cart = [];
                saveCart();
                
                // Restore loading texts to original
                if (loadingText) loadingText.textContent = 'Conectando con Transbank...';
                if (loadingDesc) loadingDesc.textContent = 'Por favor, no cierres esta ventana ni refresques el navegador.';
                
                // Auto close simulator after 4.5 seconds
                setTimeout(() => {
                    webpaySimulator.classList.remove('open');
                    document.body.style.overflow = '';
                }, 4500);
            }, 1800);
        });
    }

    // Initial render
    updateCartUI();

    // ==========================================================================
    // 5. SCROLL REVEAL ANIMATIONS (Intersection Observer)
    // ==========================================================================
    const revealOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                // stop observing once it is animated
                observer.unobserve(entry.target);
            }
        });
    }, revealOptions);

    document.querySelectorAll('.reveal-item').forEach(item => {
        revealObserver.observe(item);
    });
});
