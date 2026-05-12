/* =========================================
   PRIME CLEANING SERVICES — main.js
   ========================================= */

'use strict';

// === YEAR ===
document.getElementById('year').textContent = new Date().getFullYear();

// === NAVBAR: scroll effect + mobile menu ===
const navbar   = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

hamburger.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  hamburger.classList.toggle('active', isOpen);
  hamburger.setAttribute('aria-expanded', String(isOpen));
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

// Close mobile nav on link click
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    hamburger.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  });
});

// Close on backdrop click (mobile)
document.addEventListener('click', (e) => {
  if (navLinks.classList.contains('open') &&
      !navLinks.contains(e.target) &&
      !hamburger.contains(e.target)) {
    navLinks.classList.remove('open');
    hamburger.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
});

// === SCROLL REVEAL ANIMATIONS ===
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      // Don't unobserve — keeps animation on repeated views
    }
  });
}, {
  threshold: 0.12,
  rootMargin: '0px 0px -48px 0px'
});

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// === ACTIVE NAV LINK on scroll ===
const sections = document.querySelectorAll('section[id], div[id]');
const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');

const activeObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.getAttribute('id');
      navAnchors.forEach(a => {
        a.classList.toggle('active', a.getAttribute('href') === `#${id}`);
      });
    }
  });
}, { threshold: 0.35 });

sections.forEach(s => activeObserver.observe(s));

// === SMOOTH SCROLL POLYFILL for older Safari ===
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = navbar.offsetHeight + 16;
      const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

// === LAZY IMAGE LOADING (native + fallback) ===
if ('loading' in HTMLImageElement.prototype) {
  // Browser supports native lazy loading — done.
} else {
  // Fallback: IntersectionObserver for older browsers
  const lazyImgs = document.querySelectorAll('img[loading="lazy"]');
  const imgObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src || img.src;
        imgObserver.unobserve(img);
      }
    });
  });
  lazyImgs.forEach(img => imgObserver.observe(img));
}

// === GALLERY LIGHTBOX (simple, accessible) ===
const galleryItems = document.querySelectorAll('.gallery-item');

// Create lightbox elements
const lightbox = document.createElement('div');
lightbox.id = 'lightbox';
lightbox.setAttribute('role', 'dialog');
lightbox.setAttribute('aria-modal', 'true');
lightbox.setAttribute('aria-label', 'Image viewer');
lightbox.innerHTML = `
  <div class="lb-overlay"></div>
  <div class="lb-inner">
    <button class="lb-close" aria-label="Close image viewer">&times;</button>
    <img class="lb-img" src="" alt="" />
    <p class="lb-caption"></p>
  </div>
`;
document.body.appendChild(lightbox);

// Inject lightbox styles
const lbStyle = document.createElement('style');
lbStyle.textContent = `
  #lightbox {
    display: none;
    position: fixed;
    inset: 0;
    z-index: 9999;
    align-items: center;
    justify-content: center;
  }
  #lightbox.active { display: flex; }
  .lb-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0,0,0,0.92);
    cursor: zoom-out;
    backdrop-filter: blur(8px);
  }
  .lb-inner {
    position: relative;
    z-index: 1;
    max-width: 90vw;
    max-height: 88vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    animation: lbPop 0.25s ease;
  }
  @keyframes lbPop {
    from { opacity: 0; transform: scale(0.92); }
    to   { opacity: 1; transform: scale(1); }
  }
  .lb-img {
    max-width: 90vw;
    max-height: 80vh;
    object-fit: contain;
    border-radius: 12px;
    box-shadow: 0 24px 80px rgba(0,0,0,0.6);
  }
  .lb-caption {
    color: rgba(255,255,255,0.7);
    font-size: 0.9rem;
    font-family: 'DM Sans', sans-serif;
  }
  .lb-close {
    position: absolute;
    top: -48px;
    right: -8px;
    background: rgba(255,255,255,0.12);
    border: none;
    color: white;
    font-size: 1.8rem;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
    transition: background 0.2s;
  }
  .lb-close:hover { background: rgba(255,255,255,0.25); }
`;
document.head.appendChild(lbStyle);

const lbImg = lightbox.querySelector('.lb-img');
const lbCaption = lightbox.querySelector('.lb-caption');
const lbClose = lightbox.querySelector('.lb-close');
const lbOverlay = lightbox.querySelector('.lb-overlay');

function openLightbox(src, alt, caption) {
  lbImg.src = src;
  lbImg.alt = alt;
  lbCaption.textContent = caption;
  lightbox.classList.add('active');
  document.body.style.overflow = 'hidden';
  lbClose.focus();
}

function closeLightbox() {
  lightbox.classList.remove('active');
  document.body.style.overflow = '';
}

galleryItems.forEach(item => {
  const img = item.querySelector('img');
  const caption = item.querySelector('.gallery-caption');
  if (!img) return;
  item.style.cursor = 'zoom-in';
  item.addEventListener('click', () => {
    const src = img.src.replace(/w=\d+/, 'w=1400');
    openLightbox(src, img.alt, caption ? caption.textContent : img.alt);
  });
  item.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      item.click();
    }
  });
  item.setAttribute('tabindex', '0');
  item.setAttribute('role', 'button');
  item.setAttribute('aria-label', `View larger: ${img.alt}`);
});

lbClose.addEventListener('click', closeLightbox);
lbOverlay.addEventListener('click', closeLightbox);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeLightbox();
});

// === SERVICE CARD hover pulse === 
document.querySelectorAll('.service-card').forEach(card => {
  card.addEventListener('mouseenter', () => {
    card.style.transition = 'transform 0.35s cubic-bezier(0.4,0,0.2,1), box-shadow 0.35s ease, border-color 0.35s ease';
  });
});

// === FLOATING BUTTON: hide in instagram CTA section ===
const floatBtn = document.querySelector('.float-insta');
const instaCta = document.getElementById('contact');

if (floatBtn && instaCta) {
  const floatObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      floatBtn.style.opacity = entry.isIntersecting ? '0' : '1';
      floatBtn.style.pointerEvents = entry.isIntersecting ? 'none' : 'auto';
    });
  }, { threshold: 0.3 });
  floatObserver.observe(instaCta);
}

console.log('%c🌿 Prime Cleaning Services', 'color:#2d8653;font-size:16px;font-weight:bold;');
console.log('%cTipp City, Ohio | @primecleanproperty', 'color:#40a366;font-size:12px;');
