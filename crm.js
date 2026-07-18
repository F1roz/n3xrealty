/* ============================================================
   N3X REALTY — AI CRM PAGE
   crm.js

   TABLE OF CONTENTS
   1.  Utilities
   2.  Header Scroll Shadow
   3.  Mobile Menu
   4.  Desktop Dropdown Hover
   5.  Scroll Animations (IntersectionObserver)
   6.  Live Signal Ticker (Hero)
   7.  Animated Counters — easeOutQuart (large numbers)
   8.  FAQ Accordion
   9.  Smart Action Button Feedback
  10.  Smooth Anchor Scroll
  11.  Back-to-Top Button
  12.  Demo Modal — Full 3-Step Funnel State Machine
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

  /* Mobile sub-accordion */
  $$('.mobile-sub-toggle').forEach(btn => {
    btn.addEventListener('click', () => btn.closest('.mobile-has-sub').classList.toggle('open'));
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
   5. SCROLL ANIMATIONS — IntersectionObserver
   ============================================================ */
(function initScrollAnimations() {

  /* .crm-anim elements — CSS transition built in */
  const animEls = $$('.crm-anim');
  if (animEls.length) {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('in-view'); obs.unobserve(e.target); }
      });
    }, { threshold: 0.10, rootMargin: '0px 0px -40px 0px' });
    animEls.forEach(el => obs.observe(el));
  }

  /* Plain card / row elements — staggered fade-up */
  const cardSel = [
    '.crm-pain-card',
    '.crm-signal-item',
    '.crm-how-step',
    '.crm-sa-feat',
    '.crm-list-feat',
    '.crm-compare-item',
    '.crm-int-item',
    '.crm-proof-card',
    '.crm-price-card',
  ].join(',');

  const cards = $$(cardSel);
  if (cards.length) {
    const cardObs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.style.opacity   = '1';
          e.target.style.transform = 'translateY(0)';
          cardObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.08 });

    cards.forEach((el, i) => {
      el.style.opacity    = '0';
      el.style.transform  = 'translateY(20px)';
      el.style.transition =
        `opacity .55s cubic-bezier(.22,1,.36,1) ${(i % 6) * 0.06}s,
         transform .55s cubic-bezier(.22,1,.36,1) ${(i % 6) * 0.06}s`;
      cardObs.observe(el);
    });
  }
})();


/* ============================================================
   6. LIVE SIGNAL TICKER (Hero)
   Cycles through .crm-ticker-item elements with smooth transitions
   ============================================================ */
(function initSignalTicker() {
  const ticker  = $('#crm-ticker');
  if (!ticker) return;
  const items   = $$('.crm-ticker-item', ticker);
  if (items.length < 2) return;

  let current = 0;
  const INTERVAL = 3800; /* ms between rotations */

  function next() {
    const leaving  = items[current];
    current = (current + 1) % items.length;
    const entering = items[current];

    /* Animate out */
    leaving.classList.remove('active');
    leaving.classList.add('leaving');

    /* Animate in after a brief overlap */
    setTimeout(() => {
      leaving.classList.remove('leaving');
      entering.classList.add('active');
    }, 420);
  }

  const timer = setInterval(next, INTERVAL);

  /* Pause on hover */
  ticker.addEventListener('mouseenter', () => clearInterval(timer));
  /* Note: doesn't restart on mouseleave intentionally — avoids jarring resume */
})();


/* ============================================================
   7. ANIMATED COUNTERS — easeOutQuart
   Handles large numbers (millions) with smart formatting
   ============================================================ */
(function initCounters() {
  const cards = $$('.crm-proof-card');
  if (!cards.length) return;

  /* Easing: easeOutQuart — fast start, luxurious deceleration */
  const easeOutQuart = t => 1 - Math.pow(1 - t, 4);

  /**
   * Format large numbers with K/M suffixes for readability
   * e.g. 3500000 → "3.5M", 920000 → "920K", 68 → "68"
   */
  function formatNum(n) {
    if (n >= 1_000_000) {
      const val = n / 1_000_000;
      return Number.isInteger(val) ? `${val}M` : `${val.toFixed(1)}M`;
    }
    if (n >= 1_000) {
      const val = n / 1_000;
      return Number.isInteger(val) ? `${val}K` : `${val.toFixed(0)}K`;
    }
    return n.toLocaleString();
  }

  function runCounter(card, target, duration = 2000) {
    const numEl = card.querySelector('.crm-proof-num');
    if (!numEl) return;
    const start = performance.now();

    (function tick(now) {
      const prog  = Math.min((now - start) / duration, 1);
      const value = Math.round(easeOutQuart(prog) * target);
      numEl.textContent = formatNum(value);
      if (prog < 1) requestAnimationFrame(tick);
      else {
        numEl.textContent = formatNum(target);
        card.classList.add('counted'); /* triggers top-border CSS animation */
      }
    })(start);
  }

  const obs = new IntersectionObserver(entries => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        const target = parseInt(entry.target.dataset.target, 10);
        if (!isNaN(target)) {
          /* Stagger each card slightly */
          setTimeout(() => runCounter(entry.target, target), i * 150);
        }
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  cards.forEach(c => obs.observe(c));
})();


/* ============================================================
   8. FAQ ACCORDION
   ============================================================ */
(function initFAQ() {
  const items = $$('.crm-faq-item');
  if (!items.length) return;

  items.forEach(item => {
    const btn    = item.querySelector('.crm-faq-q');
    const answer = item.querySelector('.crm-faq-a');
    if (!btn || !answer) return;

    btn.addEventListener('click', () => {
      const isOpen = btn.getAttribute('aria-expanded') === 'true';

      /* Close all other items */
      items.forEach(other => {
        if (other === item) return;
        const ob = other.querySelector('.crm-faq-q');
        const oa = other.querySelector('.crm-faq-a');
        if (ob) ob.setAttribute('aria-expanded', 'false');
        if (oa) oa.classList.remove('open');
      });

      /* Toggle current */
      btn.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
      answer.classList.toggle('open', !isOpen);
    });

    /* Keyboard: Enter / Space */
    btn.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); btn.click(); }
    });
  });
})();


/* ============================================================
   9. SMART ACTION BUTTON FEEDBACK (dashboard visual)
   Gives tactile feedback on Send / Edit / Skip clicks
   ============================================================ */
(function initSmartActionBtns() {
  /* Send button */
  const sendBtn = $('.crm-sa-send');
  if (sendBtn) {
    sendBtn.addEventListener('click', () => {
      const orig = sendBtn.textContent;
      sendBtn.textContent = '✓ Sent!';
      sendBtn.style.background = 'var(--teal)';
      sendBtn.style.color = 'var(--dark)';
      sendBtn.disabled = true;
      setTimeout(() => {
        sendBtn.textContent = orig;
        sendBtn.style.background = '';
        sendBtn.style.color = '';
        sendBtn.disabled = false;
      }, 2200);
    });
  }

  /* Edit button */
  const editBtn = $('.crm-sa-edit');
  if (editBtn) {
    editBtn.addEventListener('click', () => {
      const draftText = $('.crm-sa-draft-text');
      if (!draftText) return;
      draftText.setAttribute('contenteditable', 'true');
      draftText.focus();
      draftText.style.border = '1.5px solid var(--teal)';
      draftText.style.borderRadius = '8px';
      editBtn.textContent = 'Done Editing';
      editBtn.addEventListener('click', () => {
        draftText.removeAttribute('contenteditable');
        draftText.style.border = '';
        editBtn.textContent = 'Edit First';
      }, { once: true });
    });
  }

  /* Skip button */
  const skipBtn = $('.crm-sa-skip');
  if (skipBtn) {
    skipBtn.addEventListener('click', () => {
      const card = skipBtn.closest('.crm-sa-card');
      if (!card) return;
      card.style.opacity    = '0.4';
      card.style.transform  = 'translateX(20px)';
      card.style.transition = 'all .3s ease';
      setTimeout(() => {
        card.style.opacity   = '1';
        card.style.transform = 'translateX(0)';
      }, 1400);
    });
  }

  /* CRM dashboard contact action buttons */
  $$('.crm-action-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const orig = btn.textContent;
      btn.textContent = '✓';
      btn.style.background = 'rgba(31,235,176,.2)';
      btn.disabled = true;
      setTimeout(() => {
        btn.textContent  = orig;
        btn.style.background = '';
        btn.disabled     = false;
      }, 1800);
    });
  });
})();


/* ============================================================
  10. SMOOTH ANCHOR SCROLL
   ============================================================ */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const top = target.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});


/* ============================================================
  11. BACK-TO-TOP BUTTON
   ============================================================ */
(function initBackToTop() {
  const btn = $('#back-to-top');
  if (!btn) return;
  window.addEventListener('scroll', () => btn.classList.toggle('visible', window.scrollY > 400), { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
})();


/* ============================================================
  12. DEMO MODAL — FULL 3-STEP FUNNEL STATE MACHINE
  Triggers: .crm-open-modal + .btn-primary/.btn-ghost fallback
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
    console.warn('N3X Modal: #demo-overlay not found. Paste the modal HTML block into crm.html.');
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
      const el = entering.querySelector('h2, button, input, select');
      if (el) setTimeout(() => el.focus(), 80);
    }, 260);
  }

  function updateProgress(step) {
    const pct = { 1: '33%', 2: '66%', 3: '100%' };
    if (progressFill) progressFill.style.width = pct[step] || '33%';
    $$('.progress-label').forEach(el => {
      el.classList.toggle('progress-label-active', +el.dataset.step === step);
      el.classList.toggle('progress-label-done',   +el.dataset.step < step);
    });
    $$('.step-pill').forEach(el => {
      el.classList.toggle('step-pill-active', +el.dataset.forStep === step);
      el.classList.toggle('step-pill-done',   +el.dataset.forStep < step);
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
    /* Explicit .crm-open-modal triggers */
    if (e.target.closest('.crm-open-modal')) { e.preventDefault(); openModal(); return; }

    /* Generic button fallback */
    const btn = e.target.closest('.btn-primary, .btn-ghost');
    if (!btn) return;
    if (btn.type === 'submit') return;
    if (btn.closest('#demo-modal')) return;
    const href = btn.getAttribute('href') || '';
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
    'first-name':  { required: true,  label: 'First name' },
    'last-name':   { required: true,  label: 'Last name' },
    'email':       {
      required: true, label: 'Email',
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      patternMsg: 'Please enter a valid email address.'
    },
    'phone':       {
      required: true, label: 'Phone number',
      pattern: /^[\d\s()\-+.]{7,}$/,
      patternMsg: 'Please enter a valid phone number.'
    },
    'agent-type':  { required: true, label: 'Business type' },
    'is-customer': { required: true, label: 'Customer status' },
  };

  function showError(id, msg) {
    const f = $(`#field-${id}`); const e = $(`#err-${id}`);
    if (f) f.classList.add('has-error'); if (e) e.textContent = msg;
  }
  function clearError(id) {
    const f = $(`#field-${id}`); const e = $(`#err-${id}`);
    if (f) f.classList.remove('has-error'); if (e) e.textContent = '';
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
        buildCalendar(calViewDate); goToStep(2);
      }, 700);
    });
  }

  /* ─────────────────────────────────────────────────────────
     STEP 2 — CALENDAR
  ───────────────────────────────────────────────────────── */
  const TIME_SLOTS = [
    '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM',
    '11:00 AM', '11:30 AM', '1:00 PM', '1:30 PM',
    '2:00 PM',  '2:30 PM',  '3:00 PM', '3:30 PM', '4:00 PM',
  ];

  const isWeekend = d => { const day = d.getDay(); return day === 0 || day === 6; };
  const isPast    = d => { const t = new Date(); t.setHours(0, 0, 0, 0); return d < t; };

  function buildCalendar(viewDate) {
    const grid = $('#cal-grid'), lbl = $('#cal-month-label');
    if (!grid || !lbl) return;

    const yr = viewDate.getFullYear(), mo = viewDate.getMonth();
    lbl.textContent = viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    const firstDay = new Date(yr, mo, 1).getDay();
    const days     = new Date(yr, mo + 1, 0).getDate();
    grid.innerHTML  = '';

    /* Blank cells before month starts */
    for (let i = 0; i < firstDay; i++) {
      const b = document.createElement('div');
      b.className = 'cal-cell cal-blank';
      grid.appendChild(b);
    }

    /* Day cells */
    for (let d = 1; d <= days; d++) {
      const date = new Date(yr, mo, d);
      const cell = document.createElement('button');
      cell.type        = 'button';
      cell.textContent = d;
      cell.className   = 'cal-cell';
      cell.setAttribute('aria-label',
        date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
      );

      if (isPast(date) || isWeekend(date)) {
        cell.classList.add('cal-cell-disabled');
        cell.disabled = true;
        cell.setAttribute('aria-disabled', 'true');
      } else {
        if (
          selectedDate &&
          selectedDate.getDate()     === d &&
          selectedDate.getMonth()    === mo &&
          selectedDate.getFullYear() === yr
        ) { cell.classList.add('cal-cell-selected'); }
        cell.addEventListener('click', () => selectDate(date, cell));
      }
      grid.appendChild(cell);
    }
    renderTimeSlots();
  }

  function selectDate(date, cell) {
    selectedDate = date;
    selectedTime = null;
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
      lbl.textContent  = 'Select a date to see available times';
      tGrid.innerHTML  = '';
      return;
    }

    lbl.textContent = `Available times for ${selectedDate.toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric'
    })}`;
    tGrid.innerHTML = '';

    TIME_SLOTS.forEach(slot => {
      const btn = document.createElement('button');
      btn.type      = 'button';
      btn.className = 'cal-time-btn';
      btn.textContent = slot;
      if (selectedTime === slot) btn.classList.add('cal-time-selected');
      btn.addEventListener('click', () => selectTime(slot, btn));
      tGrid.appendChild(btn);
    });
  }

  function selectTime(slot, btn) {
    selectedTime = slot;
    $$('.cal-time-selected').forEach(b => b.classList.remove('cal-time-selected'));
    btn.classList.add('cal-time-selected');
    btn.disabled = true;
    setTimeout(() => {
      btn.disabled = false;
      populateConfirmation();
      goToStep(3);
    }, 450);
  }

  /* Month navigation */
  const calPrev = $('#cal-prev-month');
  const calNext = $('#cal-next-month');
  calPrev && calPrev.addEventListener('click', () => {
    calViewDate.setMonth(calViewDate.getMonth() - 1);
    buildCalendar(calViewDate);
  });
  calNext && calNext.addEventListener('click', () => {
    calViewDate.setMonth(calViewDate.getMonth() + 1);
    buildCalendar(calViewDate);
  });

  /* Back: Step 2 → Step 1 */
  step2Back && step2Back.addEventListener('click', () => goToStep(1));

  /* ─────────────────────────────────────────────────────────
     STEP 3 — CONFIRMATION
  ───────────────────────────────────────────────────────── */
  function populateConfirmation() {
    if (selectedDate && selectedTime) {
      const ds    = selectedDate.toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
      });
      const tz    = Intl.DateTimeFormat().resolvedOptions().timeZone.replace(/_/g, ' ');
      const dtEl  = $('#confirm-datetime');
      if (dtEl) dtEl.textContent = `${ds} · ${selectedTime} (${tz})`;
    }

    const emailEl  = $('#email');
    const guestEl  = $('#confirm-guests');
    if (emailEl && guestEl) guestEl.textContent = emailEl.value.trim() || '—';
  }

  /* Add to Google Calendar */
  confirmCal && confirmCal.addEventListener('click', () => {
    if (!selectedDate || !selectedTime) return;
    const [tp, mer] = selectedTime.split(' ');
    let [h, m] = tp.split(':').map(Number);
    if (mer === 'PM' && h !== 12) h += 12;
    if (mer === 'AM' && h === 12) h  = 0;

    const start = new Date(selectedDate);
    start.setHours(h, m, 0, 0);
    const end = new Date(start.getTime() + 30 * 60 * 1000);

    const fmt = d => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const url = `https://calendar.google.com/calendar/r/eventedit?text=N3X+AI+CRM+Demo&dates=${fmt(start)}/${fmt(end)}&details=N3X+AI+CRM+platform+demo+—+see+how+we+surface+hidden+deals+in+your+contact+database.&location=Zoom+/+Phone`;
    window.open(url, '_blank', 'noopener,noreferrer');
  });

  /* Reschedule → back to calendar */
  reschedule && reschedule.addEventListener('click', e => {
    e.preventDefault();
    selectedTime = null;
    goToStep(2);
  });

})(); /* end initDemoModal */
