/* ============================================================
   N3X REALTY — ABOUT PAGE
   about.js

   TABLE OF CONTENTS
    1.  Utilities
    2.  Header Scroll Shadow
    3.  Mobile Menu
    4.  Desktop Dropdown Hover
    5.  Scroll Animations (.ab-anim)
    6.  Card Stagger Animation
    7.  Animated Counters (.ab-stat-card)
    8.  Timeline Step Reveal
    9.  Workflow Step Highlight on Scroll
   10.  Company Card Tilt (desktop 3D hover)
   11.  Smooth Anchor Scroll
   12.  Back-to-Top Button
   ============================================================ */

'use strict';

const $  = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];


/* ============================================================
   2. HEADER SCROLL SHADOW
   ============================================================ */
(function initHeader() {
  const header = $('#site-header');
  if (!header) return;
  const tick = () => header.classList.toggle('scrolled', window.scrollY > 60);
  window.addEventListener('scroll', tick, { passive: true });
  tick();
})();


/* ============================================================
   3. MOBILE MENU
   ============================================================ */
(function initMobileMenu() {
  const hamburger     = $('#hamburger');
  const mobileNav     = $('#mobile-nav');
  const mobileOverlay = $('#mobile-overlay');
  const mobileClose   = $('#mobile-close');
  if (!hamburger) return;

  const open = () => {
    mobileNav.classList.add('open');
    mobileOverlay.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    mobileNav.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };
  const close = () => {
    mobileNav.classList.remove('open');
    mobileOverlay.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    mobileNav.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  hamburger.addEventListener('click', open);
  mobileClose   && mobileClose.addEventListener('click', close);
  mobileOverlay && mobileOverlay.addEventListener('click', close);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && mobileNav.classList.contains('open')) close();
  });

  $$('.mobile-sub-toggle').forEach(btn => {
    btn.addEventListener('click', () =>
      btn.closest('.mobile-has-sub').classList.toggle('open')
    );
  });
})();


/* ============================================================
   4. DESKTOP DROPDOWN HOVER
   ============================================================ */
$$('.has-dropdown').forEach(item => {
  let t;
  item.addEventListener('mouseenter', () => { clearTimeout(t); item.classList.add('open'); });
  item.addEventListener('mouseleave', () => { t = setTimeout(() => item.classList.remove('open'), 180); });
});


/* ============================================================
   5. SCROLL ANIMATIONS — .ab-anim elements
   ============================================================ */
(function initScrollAnimations() {
  const els = $$('.ab-anim');
  if (!els.length) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in-view'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.10, rootMargin: '0px 0px -40px 0px' });
  els.forEach(el => obs.observe(el));
})();


/* ============================================================
   6. CARD STAGGER ANIMATION
   Staggered fade-up for plain card elements (no .ab-anim class).
   Guards against touching elements inside mobile-nav or header.
   ============================================================ */
(function initCardStagger() {
  const sel = [
    '.ab-mv-card',
    '.ab-val-card',
    '.ab-exp-card',
    '.ab-why-card',
    '.ab-office-card',
    '.ab-company-card',
    '.ab-wf-step',
    '.ab-tl-item',
  ].join(',');

  const cards = $$(sel);
  if (!cards.length) return;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.opacity   = '1';
        e.target.style.transform = 'translateY(0)';
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.08 });

  cards.forEach((el, i) => {
    /* Never touch elements inside fixed nav or header */
    if (el.closest('.mobile-nav, header')) return;
    el.style.opacity    = '0';
    el.style.transform  = 'translateY(20px)';
    el.style.transition =
      `opacity .55s cubic-bezier(.22,1,.36,1) ${(i % 6) * 0.065}s,
       transform .55s cubic-bezier(.22,1,.36,1) ${(i % 6) * 0.065}s`;
    obs.observe(el);
  });
})();


/* ============================================================
   7. ANIMATED COUNTERS — .ab-stat-card → .ab-stat-num
   Handles special formats:
     data-format="year"  → shows static year (no count-up)
     data-suffix="B+"    → "$1B+" — dollar prefix handled
     data-suffix="%"     → "96%"
     default             → plain number count-up
   ============================================================ */
(function initCounters() {
  const cards = $$('.ab-stat-card');
  if (!cards.length) return;

  const easeOutQuart = t => 1 - Math.pow(1 - t, 4);

  function runCounter(card, target, duration = 1800) {
    const numEl  = card.querySelector('.ab-stat-num');
    if (!numEl) return;

    const fmt    = card.dataset.format  || '';
    const suffix = card.dataset.suffix  || '';
    const isDollar = numEl.textContent.startsWith('$');

    /* Year cards: just flash in, no count-up */
    if (fmt === 'year') {
      numEl.textContent = target;
      card.classList.add('counted');
      return;
    }

    /* $1B+ special case */
    if (isDollar && suffix.includes('B')) {
      numEl.textContent = '$1B+';
      card.classList.add('counted');
      return;
    }

    const start = performance.now();
    (function tick(now) {
      const prog  = Math.min((now - start) / duration, 1);
      const value = Math.round(easeOutQuart(prog) * target);
      numEl.textContent = (isDollar ? '$' : '') + value.toLocaleString() + suffix;
      if (prog < 1) requestAnimationFrame(tick);
      else {
        numEl.textContent = (isDollar ? '$' : '') + target.toLocaleString() + suffix;
        card.classList.add('counted');
      }
    })(start);
  }

  const obs = new IntersectionObserver(entries => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        const numEl  = entry.target.querySelector('.ab-stat-num');
        const target = parseInt(numEl && numEl.dataset.target, 10);
        if (!isNaN(target)) setTimeout(() => runCounter(entry.target, target), i * 120);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  cards.forEach(c => obs.observe(c));
})();


/* ============================================================
   8. TIMELINE STEP REVEAL
   Sequential reveal of .ab-tl-item inside #ab-story.
   ============================================================ */
(function initTimelineReveal() {
  const section = $('#ab-story');
  if (!section) return;
  const steps = $$('.ab-tl-item', section);
  if (!steps.length) return;

  /* Pre-hide */
  steps.forEach(s => {
    s.style.opacity    = '0';
    s.style.transform  = 'translateX(-12px)';
    s.style.transition = 'opacity .5s ease, transform .5s ease';
  });

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        steps.forEach((step, i) => {
          setTimeout(() => {
            step.style.opacity   = '1';
            step.style.transform = 'translateX(0)';
          }, i * 160);
        });
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });

  obs.observe(section);
})();


/* ============================================================
   9. WORKFLOW STEP ACTIVE HIGHLIGHT ON SCROLL
   As user scrolls through the workflow section, each step
   gets a highlighted border when it enters the center viewport.
   ============================================================ */
(function initWorkflowHighlight() {
  const steps = $$('.ab-wf-step');
  if (!steps.length) return;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        /* Briefly pulse the entering step */
        e.target.style.borderColor = 'rgba(31,235,176,.28)';
        e.target.style.boxShadow   = '0 0 0 1px rgba(31,235,176,.1), 0 8px 32px rgba(0,0,0,.25)';
        setTimeout(() => {
          if (!e.target.classList.contains('ab-wf-step-final')) {
            e.target.style.borderColor = '';
            e.target.style.boxShadow   = '';
          }
        }, 1800);
      }
    });
  }, { threshold: 0.5 });

  steps.forEach(s => obs.observe(s));
})();


/* ============================================================
  10. COMPANY CARD 3D TILT EFFECT (desktop only)
   ============================================================ */
(function initCardTilt() {
  if (window.matchMedia('(pointer: coarse)').matches) return;

  const cards = $$('.ab-company-card, .ab-mv-card, .ab-office-card');
  const MAX   = 5;

  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect   = card.getBoundingClientRect();
      const dx     = (e.clientX - rect.left - rect.width  / 2) / (rect.width  / 2);
      const dy     = (e.clientY - rect.top  - rect.height / 2) / (rect.height / 2);
      card.style.transform  = `translateY(-6px) rotateX(${-dy * MAX}deg) rotateY(${dx * MAX}deg)`;
      card.style.transition = 'transform .08s ease';
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform  = '';
      card.style.transition = 'transform .45s cubic-bezier(.22,1,.36,1), box-shadow .3s ease, border-color .2s ease';
    });
  });
})();


/* ============================================================
  11. SMOOTH ANCHOR SCROLL
   ============================================================ */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    const target = id === '#' ? null : document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    const top = target.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});


/* ============================================================
  12. BACK-TO-TOP BUTTON
   ============================================================ */
(function initBackToTop() {
  const btn = $('#back-to-top');
  if (!btn) return;
  window.addEventListener('scroll',
    () => btn.classList.toggle('visible', window.scrollY > 400),
    { passive: true }
  );
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
})();
