/* ==========================================================================
   Terra Intelvi — script.js
   Vanilla JS: lightbox over all 18 photos, scroll animations.
   ========================================================================== */
(function () {
  'use strict';

  /* ---------- All 18 photos, in browsing order ---------- */
  var IMG = 'images/apartment/';
  /* Standalone bundles expose inlined blob URLs on window.__resources */
  function src(file) {
    var id = 'p_' + file.replace(/[^A-Za-z0-9]/g, '_');
    return (window.__resources && window.__resources[id]) || IMG + file;
  }
  var PHOTOS = [
    'Living-dining-1.jpg', 'Living-dining-2.jpg',
    'Kitchen-1.jpg', 'Kitchen-2.jpg', 'Kitchen-3.jpg',
    'Bedrooms-1.jpg', 'Bedrooms-2.jpg', 'Bedrooms-3.jpg',
    'Bedrooms-4.jpg', 'Bedrooms-5.jpg', 'Bedrooms-6.jpg',
    'Bathroom-1.jpg', 'Bathroom-2.jpg', 'Bathroom-3.jpg',
    'Spiral-staircase.jpg',
    'Little-details-1.jpg', 'Little-details-2.jpg', 'detail-door.jpg'
  ];

  /* ---------- Lightbox ---------- */
  var lightbox  = document.getElementById('lightbox');
  var lbImg     = lightbox.querySelector('.lightbox__img');
  var lbCounter = lightbox.querySelector('.lightbox__counter');
  var lbClose   = lightbox.querySelector('.lightbox__close');
  var lbPrev    = lightbox.querySelector('.lightbox__prev');
  var lbNext    = lightbox.querySelector('.lightbox__next');
  var current   = 0;

  function openLightbox(index) {
    current = index;
    updateLightbox(false);
    lightbox.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  function step(dir) {
    current = (current + dir + PHOTOS.length) % PHOTOS.length;
    updateLightbox(true);
  }

  function updateLightbox(fade) {
    var apply = function () {
      lbImg.src = src(PHOTOS[current]);
      lbImg.alt = 'Apartment photo ' + (current + 1) + ' of ' + PHOTOS.length;
      lbCounter.textContent = (current + 1) + ' / ' + PHOTOS.length;
    };
    if (fade) {
      lbImg.classList.add('is-fading');
      setTimeout(function () {
        apply();
        lbImg.onload = function () { lbImg.classList.remove('is-fading'); };
      }, 200);
    } else {
      apply();
    }
  }

  /* Preview tiles open the lightbox at their own photo */
  function bindTile(tile) {
    tile.addEventListener('click', function () {
      var index = PHOTOS.indexOf(tile.getAttribute('data-photo'));
      openLightbox(index < 0 ? 0 : index);
    });
  }
  document.querySelectorAll('.gallery__preview .gallery__tile').forEach(bindTile);

  /* ---------- Expandable inline gallery (remaining 13 photos) ---------- */
  var PREVIEW = ['Kitchen-1.jpg', 'Living-dining-1.jpg', 'Bedrooms-1.jpg', 'Spiral-staircase.jpg', 'Bathroom-2.jpg'];
  var EXTRA = PHOTOS.filter(function (f) { return PREVIEW.indexOf(f) < 0; });

  var extraWrap = document.getElementById('gallery-extra');
  var extraGrid = document.getElementById('gallery-extra-grid');
  var moreBtn   = document.getElementById('view-all-photos');
  var moreLabel = document.getElementById('view-all-label');
  var expanded  = false;

  EXTRA.forEach(function (file, i) {
    var tile = document.createElement('button');
    tile.className = 'gallery__tile' + (i % 5 === 0 ? ' gallery__tile--wide' : '');
    tile.setAttribute('data-photo', file);
    tile.setAttribute('aria-label', 'Open photo ' + file.replace('.jpg', '').replace(/-/g, ' '));
    // Staggered fade + slide-up when the section expands
    tile.style.transitionDelay = (i * 35) + 'ms';
    tile.innerHTML = '<img src="' + src(file) + '" alt="Apartment photo" loading="lazy">';
    bindTile(tile);
    extraGrid.appendChild(tile);
  });

  function expandGallery() {
    expanded = true;
    extraWrap.style.maxHeight = extraWrap.scrollHeight + 'px';
    extraWrap.classList.add('is-open');
    extraWrap.setAttribute('aria-hidden', 'false');
    moreBtn.classList.add('is-open');
    moreBtn.setAttribute('aria-expanded', 'true');
    moreLabel.textContent = 'Hide photos';
    // Let it grow freely after the transition (e.g. on window resize)
    setTimeout(function () { if (expanded) extraWrap.style.maxHeight = 'none'; }, 450);
  }

  function collapseGallery() {
    expanded = false;
    extraWrap.style.maxHeight = extraWrap.scrollHeight + 'px'; // fix height first
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { extraWrap.style.maxHeight = '0px'; });
    });
    extraWrap.classList.remove('is-open');
    extraWrap.setAttribute('aria-hidden', 'true');
    moreBtn.classList.remove('is-open');
    moreBtn.setAttribute('aria-expanded', 'false');
    moreLabel.textContent = 'View all 18 photos';
  }

  moreBtn.addEventListener('click', function () {
    if (expanded) { collapseGallery(); } else { expandGallery(); }
  });

  lbClose.addEventListener('click', closeLightbox);
  lbPrev.addEventListener('click', function () { step(-1); });
  lbNext.addEventListener('click', function () { step(1); });

  /* Click on the dark backdrop (not the photo or buttons) closes */
  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox) closeLightbox();
  });

  /* Keyboard: Esc closes, arrows navigate */
  document.addEventListener('keydown', function (e) {
    if (!lightbox.classList.contains('is-open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') step(-1);
    if (e.key === 'ArrowRight') step(1);
  });

  /* Touch: swipe left/right to navigate */
  var touchX = null;
  lightbox.addEventListener('touchstart', function (e) {
    touchX = e.touches[0].clientX;
  }, { passive: true });
  lightbox.addEventListener('touchend', function (e) {
    if (touchX === null) return;
    var dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 48) step(dx < 0 ? 1 : -1);
    touchX = null;
  }, { passive: true });

  /* ---------- Fade-in-up on scroll ---------- */
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.fade-up').forEach(function (el) {
    observer.observe(el);
  });
})();
