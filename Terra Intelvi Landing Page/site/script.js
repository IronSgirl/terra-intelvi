/* ==========================================================================
   Terra Intelvi — script.js
   Vanilla JS: language toggle, lightbox over all 18 photos, scroll animations.
   ========================================================================== */
(function () {
  'use strict';

  /* ---------- Language toggle (EN / IT) ----------
     Every translatable element carries its own copy in data-en / data-it, so
     the markup stays readable and English still renders without JS. Text-
     carrying attributes use the data-<lang>-<attr> form (e.g. data-it-title).
     Nothing here touches the WhatsApp links — those are plain links. */
  var LANG_ATTRS = ['title', 'aria-label'];
  var lang = 'en';

  function applyLang(next) {
    lang = next;
    document.documentElement.lang = next;

    document.querySelectorAll('[data-en]').forEach(function (el) {
      var copy = el.getAttribute('data-' + next);
      /* Values are authored inline in index.html, hence innerHTML: a few
         strings carry their own <em> or <br>. */
      if (copy !== null) el.innerHTML = copy;
    });

    LANG_ATTRS.forEach(function (attr) {
      document.querySelectorAll('[data-en-' + attr + ']').forEach(function (el) {
        var copy = el.getAttribute('data-' + next + '-' + attr);
        if (copy !== null) el.setAttribute(attr, copy);
      });
    });

    document.querySelectorAll('.lang a[data-lang]').forEach(function (el) {
      var on = el.getAttribute('data-lang') === next;
      el.classList.toggle('is-active', on);
      if (on) { el.setAttribute('aria-current', 'true'); }
      else { el.removeAttribute('aria-current'); }
    });

    /* The gallery button's label is owned by JS, so it is restated last */
    refreshGalleryLabel();
  }

  document.querySelectorAll('.lang a[data-lang]').forEach(function (el) {
    el.addEventListener('click', function (e) {
      e.preventDefault();
      applyLang(el.getAttribute('data-lang'));
    });
  });

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

  /* The collapsed label lives in the markup (data-en / data-it); only the
     expanded one needs a home here. */
  var HIDE_LABEL = { en: 'Hide photos', it: 'Nascondi le foto' };

  function refreshGalleryLabel() {
    moreLabel.textContent = expanded
      ? HIDE_LABEL[lang]
      : moreLabel.getAttribute('data-' + lang);
  }

  function expandGallery() {
    expanded = true;
    extraWrap.style.maxHeight = extraWrap.scrollHeight + 'px';
    extraWrap.classList.add('is-open');
    extraWrap.setAttribute('aria-hidden', 'false');
    moreBtn.classList.add('is-open');
    moreBtn.setAttribute('aria-expanded', 'true');
    refreshGalleryLabel();
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
    refreshGalleryLabel();
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
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
    /* The negative bottom inset holds the trigger until the element is properly
       inside the viewport, so the rise plays where it can actually be seen
       rather than half-finished below the fold. */
  }, { threshold: 0.1, rootMargin: '0px 0px -12% 0px' });

  /* Siblings arrive one after another, 90ms apart — enough to read as
     sequence, not enough to read as an effect. */
  var groups = new Map();
  document.querySelectorAll('.fade-up').forEach(function (el) {
    var n = groups.get(el.parentNode) || 0;
    groups.set(el.parentNode, n + 1);
    el.style.setProperty('--stagger', Math.min(n, 5) * 90 + 'ms');
    observer.observe(el);
  });

  /* ---------- Header: soft blur once the page has moved ---------- */
  var header = document.querySelector('.header');
  var heroImg = document.querySelector('.hero__figure-inner img');
  var ticking = false;

  function onScroll() {
    var y = window.pageYOffset;
    header.classList.toggle('is-scrolled', y > 8);
    /* Very slow parallax: the photo drifts at ~6% of scroll speed, capped
       inside the 6% overscan of its frame so no edge is ever exposed. */
    if (heroImg && !reduceMotion) {
      var shift = Math.max(-40, Math.min(40, y * 0.06));
      heroImg.style.transform = 'translate3d(0,' + shift + 'px,0)';
    }
    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(onScroll);
    }
  }, { passive: true });
  onScroll();
})();
