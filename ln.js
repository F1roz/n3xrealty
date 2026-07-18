/* ============================================================
   N3X REALTY — AI LEAD NURTURE PAGE
   ln.js  (complete — all selectors match ln.html class names)

   TABLE OF CONTENTS
    1.  Utilities
    2.  Header Scroll Shadow
    3.  Mobile Menu
    4.  Desktop Dropdown Hover
    5.  Scroll Animations (IntersectionObserver on .ln-anim)
    6.  Card Stagger Animation
    7.  Hero Phone SMS Reveal (sequential message appearance)
    8.  Hero Timer (id="ln-timer" → counts 0:00 → 0:43)
    9.  Animated Counters (.ln-result-card → .ln-result-num)
   10.  Progress Bar Animation (.ln-prob-fill, .ln-fu-fill)
   11.  Sequence Timeline Reveal (.ln-seq-item)
   12.  Handoff Button Feedback (.ln-ha-btn)
   13.  FAQ Accordion (.ln-faq-item → .ln-faq-q / .ln-faq-a)
   14.  Smooth Anchor Scroll
   15.  Back-to-Top Button
   16.  Demo Modal — Full 3-Step Funnel State Machine
   ============================================================ */

'use strict';

/* ============================================================
   1. UTILITIES
   ============================================================ */
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
   5. SCROLL ANIMATIONS — .ln-anim elements
   ============================================================ */
(function initScrollAnimations() {
  const els = $$('.ln-anim');
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
   Plain card elements fade-up with inter-card stagger delay.
   ============================================================ */
(function initCardStagger() {
  const sel = [
    '.ln-prob-card',
    '.ln-pillar',
    '.ln-inst-feat',
    '.ln-qual-dim',
    '.ln-niche-card',
    '.ln-cmp-item',
    '.ln-result-card',
    '.ln-price-card',
    '.ln-hf-feat',
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
    el.style.opacity    = '0';
    el.style.transform  = 'translateY(20px)';
    el.style.transition =
      `opacity .55s cubic-bezier(.22,1,.36,1) ${(i % 6) * 0.065}s,
       transform .55s cubic-bezier(.22,1,.36,1) ${(i % 6) * 0.065}s`;
    obs.observe(el);
  });
})();


/* ============================================================
   7. HERO PHONE SMS REVEAL
   Makes hero phone SMS messages appear one by one with a
   typing indicator when the hero section scrolls into view.
   All messages are already in the DOM — we just control visibility.
   ============================================================ */
(function initHeroSMSReveal() {
  const thread = $('.ln-sms-thread');
  if (!thread) return;

  /* Collect all direct children (messages + timestamp + handoff) */
  const children = Array.from(thread.children);
  if (!children.length) return;

  /* Initially hide everything */
  children.forEach(el => {
    el.style.opacity   = '0';
    el.style.transform = 'translateY(8px)';
    el.style.transition = 'opacity .35s ease, transform .35s ease';
  });

  let revealed = false;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !revealed) {
        revealed = true;

        /* Reveal each child with staggered delay */
        children.forEach((el, i) => {
          setTimeout(() => {
            el.style.opacity   = '1';
            el.style.transform = 'translateY(0)';
          }, 400 + i * 320);
        });

        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  obs.observe(thread);
})();


/* ============================================================
   8. HERO TIMER — id="ln-timer"
   Counts 0:00 → 0:43 to show the 43-second avg response time,
   pauses, then resets — looping to reinforce the speed message.
   ============================================================ */
(function initHeroTimer() {
  const el = $('#ln-timer');
  if (!el) return;

  const TARGET_SEC = 43;   /* counts to this */
  const STEP_MS    = 80;   /* interval per second tick */
  const PAUSE_MS   = 2200; /* pause at 0:43 before reset */
  const RESET_MS   = 900;  /* pause at 0:00 before restarting */

  let sec     = 0;
  let running = false;
  let timer   = null;

  function fmt(s) {
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${m}:${r.toString().padStart(2, '0')}`;
  }

  function tick() {
    sec++;
    el.textContent = fmt(sec);
    if (sec >= TARGET_SEC) {
      clearInterval(timer);
      /* Pause at target, then reset */
      setTimeout(() => {
        el.textContent = '0:00';
        setTimeout(() => {
          sec = 0;
          timer = setInterval(tick, STEP_MS);
        }, RESET_MS);
      }, PAUSE_MS);
    }
  }

  function start() {
    if (running) return;
    running = true;
    el.textContent = '0:00';
    setTimeout(() => { timer = setInterval(tick, STEP_MS); }, 600);
  }

  /* Start when visible */
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { start(); obs.unobserve(e.target); } });
  }, { threshold: 0.5 });

  obs.observe(el);
})();


/* ============================================================
   9. ANIMATED COUNTERS
   Targets .ln-result-card → .ln-result-num [data-target]
   Uses easeOutQuart for premium deceleration feel.
   ============================================================ */
(function initCounters() {
  const cards = $$('.ln-result-card');
  if (!cards.length) return;

  const easeOutQuart = t => 1 - Math.pow(1 - t, 4);

  function runCounter(card, target, duration = 1800) {
    const numEl = card.querySelector('.ln-result-num');
    if (!numEl) return;
    const start = performance.now();

    (function tick(now) {
      const prog  = Math.min((now - start) / duration, 1);
      const value = Math.round(easeOutQuart(prog) * target);
      numEl.textContent = value;
      if (prog < 1) requestAnimationFrame(tick);
      else {
        numEl.textContent = target;
        card.classList.add('counted'); /* triggers top-bar CSS reveal */
      }
    })(start);
  }

  const obs = new IntersectionObserver(entries => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        const target = parseInt(entry.target.dataset.target, 10);
        if (!isNaN(target)) {
          setTimeout(() => runCounter(entry.target, target), i * 130);
        }
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  cards.forEach(c => obs.observe(c));
})();


/* ============================================================
  10. PROGRESS BAR ANIMATION
  Handles .ln-prob-fill (response-time bars) and
  .ln-fu-fill (follow-up sequence bars).
  ============================================================ */
(function initProgressBars() {
  const bars = $$('.ln-prob-fill, .ln-fu-fill');
  if (!bars.length) return;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        /* Cache natural width, reset to 0, then animate */
        const target = e.target.dataset.width || e.target.style.width || '100%';
        e.target.dataset.width = target;
        e.target.style.width      = '0%';
        e.target.style.transition = 'none';

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            e.target.style.transition = 'width 1.4s cubic-bezier(.22,1,.36,1) .1s';
            e.target.style.width      = target;
          });
        });

        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });

  bars.forEach(b => {
    /* Store natural width before zeroing */
    if (!b.dataset.width) b.dataset.width = b.style.width || '100%';
    b.style.width = '0%';
    obs.observe(b);
  });
})();


/* ============================================================
  11. SEQUENCE TIMELINE REVEAL
  Staggered reveal of .ln-seq-item elements when the
  sequence section (#ln-sequence) scrolls into view.
  ============================================================ */
(function initTimelineReveal() {
  const section = $('#ln-sequence');
  if (!section) return;

  const steps = $$('.ln-seq-item', section);
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
          }, i * 150);
        });
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });

  obs.observe(section);
})();


/* ============================================================
  12. HANDOFF BUTTON FEEDBACK
  Gives tactile responses to .ln-ha-primary and .ln-ha-secondary.
  ============================================================ */
(function initHandoffButtons() {
  const primary   = $('.ln-ha-primary');
  const secondary = $('.ln-ha-secondary');

  if (primary) {
    primary.addEventListener('click', () => {
      const orig = primary.textContent;
      primary.textContent  = '✓ Opening conversation…';
      primary.style.opacity = '0.8';
      primary.disabled = true;
      setTimeout(() => {
        primary.textContent  = orig;
        primary.style.opacity = '';
        primary.disabled = false;
      }, 2000);
    });
  }

  if (secondary) {
    secondary.addEventListener('click', () => {
      const orig = secondary.textContent;
      secondary.textContent = '📞 Dialing…';
      secondary.style.borderColor = 'var(--teal)';
      secondary.style.color = 'var(--teal)';
      setTimeout(() => {
        secondary.textContent = orig;
        secondary.style.borderColor = '';
        secondary.style.color = '';
      }, 1800);
    });
  }
})();


/* ============================================================
  13. FAQ ACCORDION
  Selectors: .ln-faq-item → .ln-faq-q / .ln-faq-a / .ln-faq-arrow
  ============================================================ */
(function initFAQ() {
  const items = $$('.ln-faq-item');
  if (!items.length) return;

  items.forEach(item => {
    const btn    = item.querySelector('.ln-faq-q');
    const answer = item.querySelector('.ln-faq-a');
    if (!btn || !answer) return;

    btn.addEventListener('click', () => {
      const isOpen = btn.getAttribute('aria-expanded') === 'true';

      /* Close all others */
      items.forEach(other => {
        if (other === item) return;
        const ob = other.querySelector('.ln-faq-q');
        const oa = other.querySelector('.ln-faq-a');
        if (ob) ob.setAttribute('aria-expanded', 'false');
        if (oa) oa.classList.remove('open');
      });

      /* Toggle current */
      btn.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
      answer.classList.toggle('open', !isOpen);
    });

    btn.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); btn.click(); }
    });
  });
})();


/* ============================================================
  14. SMOOTH ANCHOR SCROLL
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
  15. BACK-TO-TOP BUTTON
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


/* ============================================================
  16. DEMO MODAL — FULL 3-STEP FUNNEL STATE MACHINE
  Trigger class: .ln-open-modal
  Steps: 1 = Lead Capture → 2 = Calendar → 3 = Confirmation
  ============================================================ */
(function initDemoModal() {

  /* ── DOM refs ── */
  const overlay      = $('#demo-overlay');
  const closeBtn     = $('#demo-close');
  const form         = $('#demo-form');
  const visualPane   = $('#demo-visual-pane');
  const formPane     = $('#demo-form-pane');
  const progressFill = $('#demo-progress-fill');
  const step2Back    = $('#step2-back');
  const confirmDone  = $('#confirm-done');
  const confirmAck   = $('#confirm-acknowledge');
  const confirmCal   = $('#confirm-add-cal');
  const reschedule   = $('#confirm-reschedule');

  if (!overlay) {
    /* Modal HTML not pasted in yet — silently bail */
    return;
  }

  /* ── State ── */
  let currentStep  = 1;
  let selectedDate = null;
  let selectedTime = null;
  let calViewDate  = new Date();

  /* ─────────────────────────────────────────────────────────
     STEP NAVIGATION
  ───────────────────────────────────────────────────────── */
  function goToStep(n) {
    const leaving  = $(`#modal-step-${currentStep}`);
    const entering = $(`#modal-step-${n}`);
    if (!leaving || !entering) return;

    leaving.classList.add('demo-step-leaving');
    setTimeout(() => {
      leaving.classList.add('demo-step-hidden');
      leaving.classList.remove('demo-step-leaving');
      entering.classList.remove('demo-step-hidden');
      entering.classList.add('demo-step-entering');
      requestAnimationFrame(() => requestAnimationFrame(() =>
        entering.classList.remove('demo-step-entering')
      ));
      currentStep = n;
      updateProgress(n);
      syncVisualPane(n);
      if (formPane) formPane.scrollTop = 0;
      const focusEl = entering.querySelector('h2, button, input, select');
      if (focusEl) setTimeout(() => focusEl.focus(), 80);
    }, 260);
  }

  function updateProgress(step) {
    const pct = { 1: '33%', 2: '66%', 3: '100%' };
    if (progressFill) progressFill.style.width = pct[step] || '33%';
    $$('.progress-label').forEach(el => {
      el.classList.toggle('progress-label-active', +el.dataset.step === step);
      el.classList.toggle('progress-label-done',   +el.dataset.step <  step);
    });
    $$('.step-pill').forEach(el => {
      el.classList.toggle('step-pill-active', +el.dataset.forStep === step);
      el.classList.toggle('step-pill-done',   +el.dataset.forStep <  step);
    });
  }

  function syncVisualPane(step) {
    if (!visualPane || !formPane) return;
    visualPane.classList.toggle('demo-visual-hidden', step === 3);
    formPane.classList.toggle('demo-pane-full', step === 3);
  }

  /* ─────────────────────────────────────────────────────────
     OPEN / CLOSE
  ───────────────────────────────────────────────────────── */
  function openModal() {
    overlay.removeAttribute('aria-hidden');
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    setTimeout(() => {
      const first = form && form.querySelector('input, select');
      if (first) first.focus();
    }, 340);
  }

  function closeModal() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(() => {
      overlay.setAttribute('aria-hidden', 'true');
      resetModal();
    }, 420);
  }

  function resetModal() {
    if (form) { form.reset(); clearAllErrors(); }
    selectedDate = null;
    selectedTime = null;
    calViewDate  = new Date();
    $$('.demo-step').forEach(s => s.classList.add('demo-step-hidden'));
    const s1 = $('#modal-step-1');
    if (s1) s1.classList.remove('demo-step-hidden');
    currentStep = 1;
    updateProgress(1);
    syncVisualPane(1);
    const sb = form && form.querySelector('.demo-submit');
    if (sb) { sb.textContent = 'NEXT: SELECT A TIME →'; sb.disabled = false; }
  }

  /* ── Global click delegation ── */
  document.addEventListener('click', e => {
    /* .ln-open-modal triggers */
    if (e.target.closest('.ln-open-modal')) { e.preventDefault(); openModal(); return; }

    /* Generic .btn-primary / .btn-ghost outside modal as fallback */
    const btn = e.target.closest('.btn-primary, .btn-ghost');
    if (!btn) return;
    if (btn.type === 'submit') return;
    if (btn.closest('#demo-modal')) return;
    const href = btn.getAttribute('href') || '';
    /* Skip anchor-only links (they smooth-scroll) */
    if (href.startsWith('#')) return;
    e.preventDefault();
    openModal();
  });

  closeBtn    && closeBtn.addEventListener('click', closeModal);
  confirmAck  && confirmAck.addEventListener('click', closeModal);
  confirmDone && confirmDone.addEventListener('click', closeModal);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) closeModal();
  });

  /* ─────────────────────────────────────────────────────────
     STEP 1 — FORM VALIDATION
  ───────────────────────────────────────────────────────── */
  const rules = {
    'first-name':  { required: true, label: 'First name' },
    'last-name':   { required: true, label: 'Last name' },
    'email': {
      required: true, label: 'Email',
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      patternMsg: 'Please enter a valid email address.',
    },
    'phone': {
      required: true, label: 'Phone number',
      pattern: /^[\d\s()\-+.]{7,}$/,
      patternMsg: 'Please enter a valid phone number.',
    },
    'agent-type':  { required: true, label: 'Business type' },
    'is-customer': { required: true, label: 'Customer status' },
  };

  function showError(id, msg) {
    const f = $(`#field-${id}`); const errEl = $(`#err-${id}`);
    if (f) f.classList.add('has-error'); if (errEl) errEl.textContent = msg;
  }
  function clearError(id) {
    const f = $(`#field-${id}`); const errEl = $(`#err-${id}`);
    if (f) f.classList.remove('has-error'); if (errEl) errEl.textContent = '';
  }
  function clearAllErrors() { Object.keys(rules).forEach(id => clearError(id)); }

  function validateField(id) {
    const rule = rules[id]; if (!rule) return true;
    const el = $(`#${id}`); if (!el) return true;
    const val = el.value.trim();
    if (rule.required && !val)                          { showError(id, `${rule.label} is required.`); return false; }
    if (rule.pattern && val && !rule.pattern.test(val)) { showError(id, rule.patternMsg);              return false; }
    clearError(id); return true;
  }

  if (form) {
    Object.keys(rules).forEach(id => {
      const el = $(`#${id}`); if (!el) return;
      el.addEventListener('blur',  () => validateField(id));
      el.addEventListener('input', () => {
        const f = $(`#field-${id}`);
        if (f && f.classList.contains('has-error')) validateField(id);
      });
    });

    form.addEventListener('submit', e => {
      e.preventDefault();
      const valid = Object.keys(rules).map(id => validateField(id)).every(Boolean);
      if (!valid) {
        const firstErr = form.querySelector('.has-error .demo-input, .has-error .demo-select');
        if (firstErr) firstErr.focus();
        return;
      }
      const sb = form.querySelector('.demo-submit');
      sb.textContent = 'Just a moment…'; sb.disabled = true;
      setTimeout(() => {
        sb.textContent = 'NEXT: SELECT A TIME →'; sb.disabled = false;
        buildCalendar(calViewDate);
        goToStep(2);
      }, 700);
    });
  }

  /* ─────────────────────────────────────────────────────────
     STEP 2 — CALENDAR
  ───────────────────────────────────────────────────────── */
  const TIME_SLOTS = [
    '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM',
    '11:00 AM', '11:30 AM', '1:00 PM', '1:30 PM',
    '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM',
  ];

  const isWeekend = d => [0, 6].includes(d.getDay());
  const isPast    = d => { const t = new Date(); t.setHours(0,0,0,0); return d < t; };

  function buildCalendar(viewDate) {
    const grid = $('#cal-grid'), lbl = $('#cal-month-label');
    if (!grid || !lbl) return;

    const yr = viewDate.getFullYear(), mo = viewDate.getMonth();
    lbl.textContent = viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    const firstDay = new Date(yr, mo, 1).getDay();
    const daysInMo = new Date(yr, mo + 1, 0).getDate();
    grid.innerHTML  = '';

    for (let i = 0; i < firstDay; i++) {
      const b = document.createElement('div'); b.className = 'cal-cell cal-blank'; grid.appendChild(b);
    }
    for (let d = 1; d <= daysInMo; d++) {
      const date = new Date(yr, mo, d);
      const cell = document.createElement('button');
      cell.type = 'button'; cell.textContent = d; cell.className = 'cal-cell';
      cell.setAttribute('aria-label',
        date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
      );
      if (isPast(date) || isWeekend(date)) {
        cell.classList.add('cal-cell-disabled'); cell.disabled = true; cell.setAttribute('aria-disabled', 'true');
      } else {
        if (selectedDate &&
          selectedDate.getDate() === d && selectedDate.getMonth() === mo &&
          selectedDate.getFullYear() === yr) { cell.classList.add('cal-cell-selected'); }
        cell.addEventListener('click', () => selectDate(date, cell));
      }
      grid.appendChild(cell);
    }
    renderTimeSlots();
  }

  function selectDate(date, cell) {
    selectedDate = date; selectedTime = null;
    $$('.cal-cell-selected').forEach(c => c.classList.remove('cal-cell-selected'));
    cell.classList.add('cal-cell-selected');
    renderTimeSlots();
  }

  function renderTimeSlots() {
    const wrap  = $('#cal-times-wrap');
    const lbl   = $('#cal-times-label');
    const tGrid = $('#cal-times-grid');
    if (!wrap || !lbl || !tGrid) return;

    if (!selectedDate) {
      lbl.textContent = 'Select a date to see available times'; tGrid.innerHTML = ''; return;
    }
    lbl.textContent = `Available times for ${selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}`;
    tGrid.innerHTML = '';

    TIME_SLOTS.forEach(slot => {
      const btn = document.createElement('button');
      btn.type = 'button'; btn.className = 'cal-time-btn'; btn.textContent = slot;
      if (selectedTime === slot) btn.classList.add('cal-time-selected');
      btn.addEventListener('click', () => selectTime(slot, btn));
      tGrid.appendChild(btn);
    });
  }

  function selectTime(slot, btn) {
    selectedTime = slot;
    $$('.cal-time-selected').forEach(b => b.classList.remove('cal-time-selected'));
    btn.classList.add('cal-time-selected'); btn.disabled = true;
    setTimeout(() => { btn.disabled = false; populateConfirmation(); goToStep(3); }, 450);
  }

  const calPrev = $('#cal-prev-month');
  const calNext = $('#cal-next-month');
  calPrev && calPrev.addEventListener('click', () => {
    calViewDate.setMonth(calViewDate.getMonth() - 1); buildCalendar(calViewDate);
  });
  calNext && calNext.addEventListener('click', () => {
    calViewDate.setMonth(calViewDate.getMonth() + 1); buildCalendar(calViewDate);
  });
  step2Back && step2Back.addEventListener('click', () => goToStep(1));

  /* ─────────────────────────────────────────────────────────
     STEP 3 — CONFIRMATION
  ───────────────────────────────────────────────────────── */
  function populateConfirmation() {
    if (selectedDate && selectedTime) {
      const ds   = selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
      const tz   = Intl.DateTimeFormat().resolvedOptions().timeZone.replace(/_/g, ' ');
      const dtEl = $('#confirm-datetime');
      if (dtEl) dtEl.textContent = `${ds} · ${selectedTime} (${tz})`;
    }
    const emailEl = $('#email'), guestEl = $('#confirm-guests');
    if (emailEl && guestEl) guestEl.textContent = emailEl.value.trim() || '—';
  }

  /* Add to Google Calendar */
  confirmCal && confirmCal.addEventListener('click', () => {
    if (!selectedDate || !selectedTime) return;
    const [tp, mer] = selectedTime.split(' ');
    let [h, m] = tp.split(':').map(Number);
    if (mer === 'PM' && h !== 12) h += 12;
    if (mer === 'AM' && h === 12) h  = 0;
    const start = new Date(selectedDate); start.setHours(h, m, 0, 0);
    const end   = new Date(start.getTime() + 30 * 60 * 1000);
    const fmt   = d => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const url   = `https://calendar.google.com/calendar/r/eventedit?text=N3X+AI+Lead+Nurture+Demo&dates=${fmt(start)}/${fmt(end)}&details=30-min+demo:+see+how+N3X+AI+Lead+Nurture+responds+to+every+lead+in+under+2+minutes+and+hands+off+qualified+prospects+with+full+context.&location=Zoom+/+Phone`;
    window.open(url, '_blank', 'noopener,noreferrer');
  });

  /* Reschedule → back to calendar */
  reschedule && reschedule.addEventListener('click', e => {
    e.preventDefault(); selectedTime = null; goToStep(2);
  });

})(); /* end initDemoModal */
