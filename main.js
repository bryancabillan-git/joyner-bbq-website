// ── Menu overlay toggle ──────────────────────────────────────────────────────
const menuBtn     = document.querySelector('.nav__menu');
const menuOverlay = document.getElementById('menuOverlay');
const menuClose   = document.getElementById('menuClose');
const menuLinks   = document.querySelectorAll('.menu-overlay__link');

function openMenu() {
  menuOverlay.classList.add('is-open');
  menuBtn.setAttribute('aria-expanded', 'true');
  menuClose.focus();
  document.body.style.overflow = 'hidden';
}

function closeMenu() {
  menuOverlay.classList.remove('is-open');
  menuBtn.setAttribute('aria-expanded', 'false');
  menuBtn.focus();
  document.body.style.overflow = '';
}

// Use event delegation and validate event targets
menuBtn.addEventListener('click', (e) => {
  e.preventDefault();
  openMenu();
});

menuClose.addEventListener('click', (e) => {
  e.preventDefault();
  closeMenu();
});

// Close when a nav link is clicked
menuLinks.forEach(link => link.addEventListener('click', (e) => {
  // Validate that the link is internal before closing
  const href = link.getAttribute('href');
  if (href && href.startsWith('#')) {
    closeMenu();
  }
}));

// Close on Escape key
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && menuOverlay.classList.contains('is-open')) {
    e.preventDefault();
    closeMenu();
  }
});

// ── Smooth scroll for CTA ────────────────────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    // Validate href is a proper anchor link
    if (href && href.length > 1 && href.startsWith('#')) {
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }
  });
});

// ── Subtle parallax on hero background ──────────────────────────────────────
const hero = document.querySelector('.hero');

if (hero) {
  let ticking = false;
  
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        if (scrollY < window.innerHeight) {
          hero.style.backgroundPositionY = `calc(50% + ${scrollY * 0.3}px)`;
        }
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

// ── Fade-in on scroll (Intersection Observer) ────────────────────────────────
const fadeEls = document.querySelectorAll('.about__text, .about__image-wrap, .contact__item');

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  fadeEls.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });

  // Add visible state via JS (avoids needing extra CSS class)
  const style = document.createElement('style');
  style.textContent = `
    .is-visible {
      opacity: 1 !important;
      transform: translateY(0) !important;
    }
  `;
  document.head.appendChild(style);
} else {
  // Fallback for browsers without IntersectionObserver
  fadeEls.forEach(el => {
    el.style.opacity = '1';
    el.style.transform = 'translateY(0)';
  });
}

// ── Catering Slideshow ───────────────────────────────────────────────────────
(function () {
  'use strict';
  
  const slides   = document.querySelectorAll('.slideshow__slide');
  const dotsWrap = document.querySelector('.slideshow__dots');

  if (!slides.length || !dotsWrap) return;

  let current  = 0;
  let timer    = null;
  const DELAY  = 3000;  // 3 seconds per image
  const TOTAL  = slides.length;

  // Build dot indicators
  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.classList.add('slideshow__dot');
    dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
    if (i === 0) dot.classList.add('is-active');
    dot.addEventListener('click', () => {
      stopTimer();
      goTo(i);
      startTimer();
    });
    dotsWrap.appendChild(dot);
  });

  const dots = dotsWrap.querySelectorAll('.slideshow__dot');

  function goTo(index) {
    // Validate index is within bounds
    if (index < 0 || index >= TOTAL) return;
    
    slides[current].classList.remove('is-active');
    dots[current].classList.remove('is-active');
    current = index;
    slides[current].classList.add('is-active');
    dots[current].classList.add('is-active');
  }

  function next() {
    goTo((current + 1) % TOTAL);
  }

  function startTimer() {
    if (timer) clearInterval(timer);
    timer = setInterval(next, DELAY);
  }

  function stopTimer() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  // Pause on hover, resume on leave
  const track = document.querySelector('.slideshow__track');
  if (track) {
    track.addEventListener('mouseenter', stopTimer);
    track.addEventListener('mouseleave', startTimer);
  }

  // Kick it off
  startTimer();
  
  // Clean up on page unload
  window.addEventListener('beforeunload', stopTimer);
})();

// ── Shopping Cart System ─────────────────────────────────────────────────────
(function () {
  'use strict';

  let cart = [];
  
  const cartSidebar = document.getElementById('cartSidebar');
  const cartToggle = document.getElementById('cartToggle');
  const cartClose = document.getElementById('cartClose');
  const cartItems = document.getElementById('cartItems');
  const cartEmpty = document.getElementById('cartEmpty');
  const cartTotal = document.getElementById('cartTotal');
  const cartBadge = document.getElementById('cartBadge');
  const checkoutBtn = document.getElementById('checkoutBtn');

  if (!cartSidebar || !cartToggle) return;

  // Load cart from localStorage
  function loadCart() {
    try {
      const saved = localStorage.getItem('joynerbbq_cart');
      if (saved) {
        cart = JSON.parse(saved);
        updateCartUI();
      }
    } catch (e) {
      console.error('Failed to load cart:', e);
      cart = [];
    }
  }

  // Save cart to localStorage
  function saveCart() {
    try {
      localStorage.setItem('joynerbbq_cart', JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to save cart:', e);
    }
  }

  // Open cart sidebar
  function openCart() {
    cartSidebar.classList.add('is-open');
  }

  // Close cart sidebar
  function closeCart() {
    cartSidebar.classList.remove('is-open');
  }

  // Add item to cart
  function addToCart(id, name, price, unit, quantity) {
    // Validate inputs
    if (!id || !name || !price || quantity < 1) return;
    
    const existingItem = cart.find(item => item.id === id);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push({ id, name, price, unit, quantity });
    }
    
    saveCart();
    updateCartUI();
    openCart();
  }

  // Remove item from cart
  function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    saveCart();
    updateCartUI();
  }

  // Calculate total
  function calculateTotal() {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  // Update cart UI
  function updateCartUI() {
    const total = calculateTotal();
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    // Update badge
    if (cartBadge) {
      cartBadge.textContent = itemCount > 0 ? itemCount : '';
    }
    
    // Update total
    if (cartTotal) {
      cartTotal.textContent = `$${total.toFixed(2)}`;
    }
    
    // Update cart items
    if (cart.length === 0) {
      if (cartEmpty) cartEmpty.style.display = 'block';
      if (cartItems) cartItems.innerHTML = '';
      if (checkoutBtn) checkoutBtn.disabled = true;
    } else {
      if (cartEmpty) cartEmpty.style.display = 'none';
      if (checkoutBtn) checkoutBtn.disabled = false;
      
      if (cartItems) {
        cartItems.innerHTML = cart.map(item => `
          <div class="cart-item">
            <div class="cart-item__header">
              <span class="cart-item__name">${escapeHtml(item.name)}</span>
              <button class="cart-item__remove" data-id="${escapeHtml(item.id)}" aria-label="Remove ${escapeHtml(item.name)}">×</button>
            </div>
            <div class="cart-item__details">
              <span class="cart-item__qty">${item.quantity} × $${item.price} / ${escapeHtml(item.unit)}</span>
              <span class="cart-item__price">$${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          </div>
        `).join('');
        
        // Attach remove handlers
        cartItems.querySelectorAll('.cart-item__remove').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.preventDefault();
            const id = btn.getAttribute('data-id');
            if (id) removeFromCart(id);
          });
        });
      }
    }
  }

  // Escape HTML to prevent XSS
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Event listeners
  if (cartToggle) {
    cartToggle.addEventListener('click', (e) => {
      e.preventDefault();
      openCart();
    });
  }

  if (cartClose) {
    cartClose.addEventListener('click', (e) => {
      e.preventDefault();
      closeCart();
    });
  }

  // Close cart on escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && cartSidebar.classList.contains('is-open')) {
      e.preventDefault();
      closeCart();
    }
  });

  // Checkout button
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (cart.length === 0) return;
      
      // For now, just show an alert. In production, this would go to a checkout page
      alert(`Checkout functionality coming soon!\n\nYour order total: $${calculateTotal().toFixed(2)}\n\nItems: ${cart.length}`);
    });
  }

  // Handle add to cart buttons
  document.querySelectorAll('.order-item').forEach(item => {
    const addBtn = item.querySelector('.btn-add-cart');
    const qtyInput = item.querySelector('.qty-input');
    const minusBtn = item.querySelector('.qty-btn--minus');
    const plusBtn = item.querySelector('.qty-btn--plus');
    
    if (!addBtn || !qtyInput) return;
    
    // Check if this is the wings item with size selector
    const isWings = item.classList.contains('order-item--wings');
    const sizeSelect = isWings ? item.querySelector('.size-select') : null;
    
    // Quantity controls
    if (minusBtn) {
      minusBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const current = parseInt(qtyInput.value) || 1;
        if (current > 1) {
          qtyInput.value = current - 1;
        }
      });
    }
    
    if (plusBtn) {
      plusBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const current = parseInt(qtyInput.value) || 1;
        const max = parseInt(qtyInput.getAttribute('max')) || 99;
        if (current < max) {
          qtyInput.value = current + 1;
        }
      });
    }
    
    // Validate input
    qtyInput.addEventListener('input', () => {
      let val = parseInt(qtyInput.value);
      const min = parseInt(qtyInput.getAttribute('min')) || 1;
      const max = parseInt(qtyInput.getAttribute('max')) || 99;
      
      if (isNaN(val) || val < min) {
        qtyInput.value = min;
      } else if (val > max) {
        qtyInput.value = max;
      }
    });
    
    // Add to cart
    addBtn.addEventListener('click', (e) => {
      e.preventDefault();
      
      let id, name, price, unit;
      const quantity = parseInt(qtyInput.value) || 1;
      
      if (isWings && sizeSelect) {
        // Handle wings with size selector
        const selectedValue = sizeSelect.value;
        const [count, priceValue] = selectedValue.split('|');
        id = `wings-${count}`;
        name = `${count} Wings`;
        price = parseFloat(priceValue);
        unit = 'order';
      } else {
        // Handle regular items
        id = item.getAttribute('data-id');
        name = item.getAttribute('data-name');
        price = parseFloat(item.getAttribute('data-price'));
        unit = item.getAttribute('data-unit');
      }
      
      if (id && name && price && unit) {
        addToCart(id, name, price, unit, quantity);
        qtyInput.value = 1; // Reset quantity
      }
    });
  });

  // Initialize
  loadCart();
})();

// ── See-through page overlays (food menu, order online) ─────────────────────
// Links to #menu or #order open the matching overlay over the page instead of scrolling.
// Kept below the cart code so Escape closes an open cart first (it marks the key as handled).
(function () {
  'use strict';

  const cartSidebar = document.getElementById('cartSidebar');
  const isCartOpen = () => !!cartSidebar && cartSidebar.classList.contains('is-open');

  function setupOverlay({ overlayId, closeId, hash, keepOpenSelector, cartOnTop }) {
    const overlay  = document.getElementById(overlayId);
    const closeBtn = document.getElementById(closeId);

    if (!overlay || !closeBtn) return;

    let lastFocus = null;

    function openOverlay() {
      lastFocus = document.activeElement;
      overlay.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      closeBtn.focus();
    }

    function closeOverlay() {
      overlay.classList.remove('is-open');
      document.body.style.overflow = '';
      if (lastFocus && typeof lastFocus.focus === 'function') {
        lastFocus.focus();
      }
    }

    document.querySelectorAll(`a[href="${hash}"]`).forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        openOverlay();
      });
    });

    closeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      closeOverlay();
    });

    // Close when clicking the see-through background (anywhere outside the cards and heading).
    // While the cart is open on top, a background click is ignored so it can't close the order screen by accident.
    overlay.addEventListener('click', (e) => {
      if (e.target.closest(keepOpenSelector)) return;
      if (cartOnTop && isCartOpen()) return;
      closeOverlay();
    });

    // Close on Escape key, unless something on top (nav overlay, cart) already handled it
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !e.defaultPrevented && overlay.classList.contains('is-open')) {
        e.preventDefault();
        closeOverlay();
      }
    });

    // Old links such as joynerbsbbq.com/#menu still open the overlay
    if (window.location.hash === hash) {
      openOverlay();
    }
  }

  setupOverlay({
    overlayId: 'foodMenu',
    closeId: 'foodMenuClose',
    hash: '#menu',
    keepOpenSelector: '.food-menu__item, .section__eyebrow, .section__title, .page-overlay__close',
    cartOnTop: false
  });

  setupOverlay({
    overlayId: 'orderOverlay',
    closeId: 'orderOverlayClose',
    hash: '#order',
    keepOpenSelector: '.order-item, .order-notice, .section__eyebrow, .section__title, .page-overlay__close',
    cartOnTop: true
  });
})();

// ── Catering Form Handler ────────────────────────────────────────────────────
(function () {
  'use strict';
  
  const cateringOverlay = document.getElementById('cateringOverlay');
  const openBtn = document.getElementById('openCateringForm');
  const closeBtn = document.getElementById('closeCateringForm');
  const cateringForm = document.getElementById('cateringForm');
  
  if (!cateringOverlay || !openBtn || !closeBtn || !cateringForm) return;
  
  // Open overlay
  function openOverlay() {
    cateringOverlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    
    // Set minimum date to today to prevent selecting past dates
    const dateInput = document.getElementById('eventDate');
    if (dateInput) {
      const today = new Date();
      const todayString = today.toISOString().split('T')[0];
      dateInput.setAttribute('min', todayString);
      
      // Set default date to today if no date is selected
      if (!dateInput.value) {
        dateInput.value = todayString;
      }
    }
  }
  
  // Make date input open calendar on any click
  const dateInput = document.getElementById('eventDate');
  if (dateInput) {
    dateInput.addEventListener('click', function() {
      this.showPicker();
    });
  }
  
  // Close overlay
  function closeOverlay() {
    cateringOverlay.classList.remove('is-open');
    document.body.style.overflow = '';
  }
  
  openBtn.addEventListener('click', (e) => {
    e.preventDefault();
    openOverlay();
  });
  
  closeBtn.addEventListener('click', (e) => {
    e.preventDefault();
    closeOverlay();
  });
  
  // Close on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && cateringOverlay.classList.contains('is-open')) {
      e.preventDefault();
      closeOverlay();
    }
  });
  
  // Close on overlay background click
  cateringOverlay.addEventListener('click', (e) => {
    if (e.target === cateringOverlay) {
      closeOverlay();
    }
  });
  
  // Form submission
  cateringForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Collect form data
    const formData = {
      firstName: document.getElementById('firstName').value.trim(),
      lastName: document.getElementById('lastName').value.trim(),
      email: document.getElementById('email').value.trim(),
      phone: document.getElementById('phone').value.trim(),
      eventType: document.getElementById('eventType').value.trim(),
      eventDate: document.getElementById('eventDate').value,
      eventHour: document.getElementById('eventHour').value,
      eventMinute: document.getElementById('eventMinute').value,
      eventAmPm: document.getElementById('eventAmPm').value,
      location: document.getElementById('location').value.trim(),
      guestCount: document.getElementById('guestCount').value,
      additionalInfo: document.getElementById('additionalInfo').value.trim()
    };
    
    // Validate required fields
    if (!formData.firstName || !formData.lastName || !formData.email || 
        !formData.phone || !formData.eventType || !formData.eventDate || 
        !formData.eventHour || !formData.eventMinute || !formData.location || 
        !formData.guestCount) {
      alert('Please fill in all required fields.');
      return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert('Please enter a valid email address.');
      return;
    }
    
    // Validate time inputs
    if (!formData.eventHour || !formData.eventMinute) {
      alert('Please select a time for pickup or delivery.');
      return;
    }
    
    // Format the time for display
    const timeString = `${formData.eventHour}:${formData.eventMinute} ${formData.eventAmPm} CST`;
    
    // Add formatted time to form data for email template
    formData.eventTime = timeString;
    
    // Disable submit button and show loading state
    const submitBtn = cateringForm.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
    
    // Send email via EmailJS
    console.log('Attempting to send email with data:', formData);
    
    // Send notification to caterer
    const cateringEmail = emailjs.send('service_yzidqnn', 'template_olimzs6', formData);
    
    // Send confirmation to customer
    const customerEmail = emailjs.send('service_yzidqnn', 'template_1fnpa9n', formData);
    
    // Wait for both emails to send
    Promise.all([cateringEmail, customerEmail])
      .then(function(responses) {
        console.log('Both emails sent successfully!', responses);
        
        // Show success message
        alert(`Thank you, ${formData.firstName}!\n\nYour catering request has been sent successfully!\n\nEvent: ${formData.eventType}\nDate: ${formData.eventDate}\nTime: ${timeString}\nLocation: ${formData.location}\nGuests: ${formData.guestCount}\n\nWe've sent a confirmation email to ${formData.email}. We'll contact you within 24 hours to discuss your event details.`);
        
        // Reset form and close overlay
        cateringForm.reset();
        closeOverlay();
        
        // Re-enable submit button
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
      })
      .catch(function(error) {
        console.error('FAILED...', error);
        
        // Show error message with details
        alert(`Sorry, there was an error sending your request.\n\nError: ${error.text || error.message || 'Unknown error'}\n\nPlease try again or contact us directly at (404) 555-0123.`);
        
        // Re-enable submit button
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
      });
  });
})();
