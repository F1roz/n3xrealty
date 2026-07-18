/* ============================================================
   N3X REALTY — SOCIAL MEDIA MARKETING PAGE
   smm.js

   TABLE OF CONTENTS
   1.  Utilities
   2.  Header Scroll Shadow
   3.  Mobile Menu
   4.  Desktop Dropdown Hover
   5.  Scroll Animations (IntersectionObserver)
   6.  Paid Ads Tab Switcher
   7.  Animated Counters
   8.  FAQ Accordion
   9.  Back-to-Top Button
  10.  Smooth Anchor Scroll (pricing / packages links)
  11.  Demo Modal — Full 3-Step Funnel State Machine
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
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 60);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); /* run once on load */
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

  function openMenu() {
    mobileNav.classList.add('open');
    mobileOverlay.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    mobileNav.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    mobileNav.classList.remove('open');
    mobileOverlay.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    mobileNav.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', openMenu);
  mobileClose   && mobileClose.addEventListener('click', closeMenu);
  mobileOverlay && mobileOverlay.addEventListener('click', closeMenu);

  /* Keyboard: Escape closes menu */
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && mobileNav.classList.contains('open')) closeMenu();
  });

  /* Mobile sub-menu accordions */
  $$('.mobile-sub-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const li = btn.closest('.mobile-has-sub');
      li.classList.toggle('open');
    });
  });
})();


/* ============================================================
   4. DESKTOP DROPDOWN HOVER
   ============================================================ */
$$('.has-dropdown').forEach(item => {
  let timer;
  item.addEventListener('mouseenter', () => { clearTimeout(timer); item.classList.add('open'); });
  item.addEventListener('mouseleave', () => { timer = setTimeout(() => item.classList.remove('open'), 180); });
});


/* ============================================================
   5. SCROLL ANIMATIONS — IntersectionObserver
   Targets all .smm-anim elements and standard shared classes
   ============================================================ */
(function initScrollAnimations() {
  const targets = $$([
    '.smm-anim',
    '.smm-pain-card',
    '.smm-content-card',
    '.smm-result-card',
    '.smm-li-opp-card',
    '.smm-li-aud-card',
    '.smm-li-pillar',
    '.smm-li-step',
    '.smm-timeline-step',
    '.smm-price-card',
    '.smm-funnel-stage',
    '.smm-campaign',
    '.smm-addon',
  ].join(','));

  if (!targets.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.10, rootMargin: '0px 0px -40px 0px' });

  targets.forEach((el, i) => {
    /* Cards that aren't already .smm-anim get staggered fade-up via inline style */
    if (!el.classList.contains('smm-anim')) {
      el.style.opacity    = '0';
      el.style.transform  = 'translateY(22px)';
      el.style.transition = `opacity .58s cubic-bezier(.22,1,.36,1) ${(i % 6) * 0.07}s,
                             transform .58s cubic-bezier(.22,1,.36,1) ${(i % 6) * 0.07}s`;
    }
    observer.observe(el);
  });

  /* Handle non-.smm-anim elements being marked in-view */
  const plainObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity   = '1';
        entry.target.style.transform = 'translateY(0)';
        plainObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.10 });

  $$([
    '.smm-pain-card',
    '.smm-content-card',
    '.smm-li-opp-card',
    '.smm-li-aud-card',
    '.smm-li-pillar',
    '.smm-li-step',
    '.smm-timeline-step',
    '.smm-price-card',
    '.smm-funnel-stage',
    '.smm-campaign',
    '.smm-addon',
  ].join(',')).forEach(el => plainObserver.observe(el));
})();


/* ============================================================
   6. PAID ADS TAB SWITCHER
   ============================================================ */
(function initAdsTabs() {
  const tabs   = $$('.smm-ads-tab');
  const panels = $$('.smm-ads-panel');
  if (!tabs.length) return;

  function activateTab(tabKey) {
    tabs.forEach(t => {
      const active = t.dataset.tab === tabKey;
      t.classList.toggle('active', active);
      t.setAttribute('aria-selected', active ? 'true' : 'false');
    });
    panels.forEach(p => {
      const active = p.id === `smm-tab-${tabKey}`;
      p.classList.toggle('active', active);
    });
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => activateTab(tab.dataset.tab));

    /* Keyboard navigation: left/right arrows */
    tab.addEventListener('keydown', e => {
      const keys  = tabs.map(t => t.dataset.tab);
      const cur   = keys.indexOf(tab.dataset.tab);
      if (e.key === 'ArrowRight') { e.preventDefault(); activateTab(keys[(cur + 1) % keys.length]); tabs[(cur + 1) % keys.length].focus(); }
      if (e.key === 'ArrowLeft')  { e.preventDefault(); activateTab(keys[(cur - 1 + keys.length) % keys.length]); tabs[(cur - 1 + keys.length) % keys.length].focus(); }
    });
  });
})();


/* ============================================================
   7. ANIMATED COUNTERS
   Counts from 0 → data-target when card enters viewport.
   Uses easeOutQuart for a premium deceleration feel.
   ============================================================ */
(function initCounters() {
  const cards = $$('.smm-result-card');
  if (!cards.length) return;

  /* Easing function: easeOutQuart */
  const easeOutQuart = t => 1 - Math.pow(1 - t, 4);

  function animateCounter(el, target, duration = 1800) {
    const numEl = el.querySelector('.smm-result-num');
    if (!numEl) return;
    const start = performance.now();

    function update(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const value    = Math.round(easeOutQuart(progress) * target);
      numEl.textContent = value.toLocaleString();
      if (progress < 1) requestAnimationFrame(update);
      else {
        numEl.textContent = target.toLocaleString();
        el.classList.add('counted'); /* triggers the top-border animation */
      }
    }
    requestAnimationFrame(update);
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = parseInt(entry.target.dataset.target, 10);
        if (!isNaN(target)) {
          /* Small stagger per card position */
          const delay = [...cards].indexOf(entry.target) * 120;
          setTimeout(() => animateCounter(entry.target, target), delay);
        }
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  cards.forEach(card => observer.observe(card));
})();


/* ============================================================
   8. FAQ ACCORDION
   ============================================================ */
(function initFAQ() {
  const items = $$('.smm-faq-item');
  if (!items.length) return;

  items.forEach(item => {
    const btn    = item.querySelector('.smm-faq-q');
    const answer = item.querySelector('.smm-faq-a');
    if (!btn || !answer) return;

    btn.addEventListener('click', () => {
      const isOpen = btn.getAttribute('aria-expanded') === 'true';

      /* Close all others */
      items.forEach(other => {
        const otherBtn = other.querySelector('.smm-faq-q');
        const otherAns = other.querySelector('.smm-faq-a');
        if (otherBtn && otherAns && other !== item) {
          otherBtn.setAttribute('aria-expanded', 'false');
          otherAns.classList.remove('open');
        }
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
   9. BACK-TO-TOP BUTTON
   ============================================================ */
(function initBackToTop() {
  const btn = $('#back-to-top');
  if (!btn) return;
  window.addEventListener('scroll', () => btn.classList.toggle('visible', window.scrollY > 400), { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
})();


/* ============================================================
   10. SMOOTH ANCHOR SCROLL
   Handles all in-page anchor links (#smm-pricing etc.)
   ============================================================ */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = 80; /* header height */
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});


/* ============================================================
   11. DEMO MODAL — FULL 3-STEP FUNNEL STATE MACHINE
   Identical logic to index.html / real-estate-websites.js
   All .smm-open-modal triggers open the booking modal.
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

  /* If modal HTML hasn't been pasted in yet, bail gracefully */
  if (!overlay) {
    console.warn('N3X Modal: #demo-overlay not found. Paste the modal HTML block into smm.html.');
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

      requestAnimationFrame(() => requestAnimationFrame(() => {
        entering.classList.remove('demo-step-entering');
      }));

      currentStep = n;
      updateProgress(n);
      syncVisualPane(n);
      if (formPane) formPane.scrollTop = 0;

      /* Focus first interactive element */
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
    const step1 = $('#modal-step-1');
    if (step1) step1.classList.remove('demo-step-hidden');

    currentStep = 1;
    updateProgress(1);
    syncVisualPane(1);

    const submitBtn = form && form.querySelector('.demo-submit');
    if (submitBtn) { submitBtn.textContent = 'NEXT: SELECT A TIME →'; submitBtn.disabled = false; }
  }

  /* ── Trigger: .smm-open-modal + any .btn-primary / .btn-ghost outside modal ── */
  document.addEventListener('click', e => {
    /* Explicit SMM open triggers */
    if (e.target.closest('.smm-open-modal')) {
      e.preventDefault();
      openModal();
      return;
    }
    /* Global fallback for any primary/ghost button not inside modal */
    const btn = e.target.closest('.btn-primary, .btn-ghost');
    if (!btn) return;
    if (btn.type === 'submit') return;
    if (btn.closest('#demo-modal')) return;
    /* Anchor links — let them scroll, don't open modal */
    const href = btn.getAttribute('href') || '';
    if (href.startsWith('#')) return;
    e.preventDefault();
    openModal();
  });

  closeBtn   && closeBtn.addEventListener('click', closeModal);
  confirmAck && confirmAck.addEventListener('click', closeModal);
  confirmDone && confirmDone.addEventListener('click', closeModal);

  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) closeModal();
  });

  /* ─────────────────────────────────────────────────────────
     STEP 1 — VALIDATION
     ───────────────────────────────────────────────────────── */
  const rules = {
    'first-name':  { required: true,  label: 'First name' },
    'last-name':   { required: true,  label: 'Last name' },
    'email':       { required: true,  label: 'Email',
                     pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                     patternMsg: 'Please enter a valid email address.' },
    'phone':       { required: true,  label: 'Phone number',
                     pattern: /^[\d\s()\-+.]{7,}$/,
                     patternMsg: 'Please enter a valid phone number.' },
    'agent-type':  { required: true,  label: 'Business type' },
    'is-customer': { required: true,  label: 'Customer status' },
  };

  function showError(id, msg) {
    const field = $(`#field-${id}`);
    const errEl = $(`#err-${id}`);
    if (field) field.classList.add('has-error');
    if (errEl) errEl.textContent = msg;
  }

  function clearError(id) {
    const field = $(`#field-${id}`);
    const errEl = $(`#err-${id}`);
    if (field) field.classList.remove('has-error');
    if (errEl) errEl.textContent = '';
  }

  function clearAllErrors() { Object.keys(rules).forEach(id => clearError(id)); }

  function validateField(id) {
    const rule = rules[id];
    if (!rule) return true;
    const el  = $(`#${id}`);
    if (!el) return true;
    const val = el.value.trim();
    if (rule.required && !val)                     { showError(id, `${rule.label} is required.`);  return false; }
    if (rule.pattern && val && !rule.pattern.test(val)) { showError(id, rule.patternMsg);          return false; }
    clearError(id);
    return true;
  }

  /* Live blur / input validation */
  if (form) {
    Object.keys(rules).forEach(id => {
      const el = $(`#${id}`);
      if (!el) return;
      el.addEventListener('blur',  () => validateField(id));
      el.addEventListener('input', () => {
        const f = $(`#field-${id}`);
        if (f && f.classList.contains('has-error')) validateField(id);
      });
    });

    /* Form submit → advance to Step 2 */
    form.addEventListener('submit', e => {
      e.preventDefault();
      const valid = Object.keys(rules).map(id => validateField(id)).every(Boolean);
      if (!valid) {
        const firstErr = form.querySelector('.has-error .demo-input, .has-error .demo-select');
        if (firstErr) firstErr.focus();
        return;
      }
      const submitBtn = form.querySelector('.demo-submit');
      submitBtn.textContent = 'Just a moment…';
      submitBtn.disabled = true;
      setTimeout(() => {
        submitBtn.textContent = 'NEXT: SELECT A TIME →';
        submitBtn.disabled    = false;
        buildCalendar(calViewDate);
        goToStep(2);
      }, 700);
    });
  }

  /* ─────────────────────────────────────────────────────────
     STEP 2 — INTERACTIVE CALENDAR
     ───────────────────────────────────────────────────────── */
  const TIME_SLOTS = [
    '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM',
    '11:00 AM', '11:30 AM', '1:00 PM', '1:30 PM',
    '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM',
  ];

  function isUnavailable(date) { const d = date.getDay(); return d === 0 || d === 6; }

  function isPast(date) {
    const today = new Date(); today.setHours(0, 0, 0, 0); return date < today;
  }

  function buildCalendar(viewDate) {
    const grid     = $('#cal-grid');
    const monthLbl = $('#cal-month-label');
    if (!grid || !monthLbl) return;

    const year     = viewDate.getFullYear();
    const month    = viewDate.getMonth();
    monthLbl.textContent = viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMo = new Date(year, month + 1, 0).getDate();
    grid.innerHTML = '';

    /* Leading blanks */
    for (let i = 0; i < firstDay; i++) {
      const blank = document.createElement('div');
      blank.className = 'cal-cell cal-blank';
      grid.appendChild(blank);
    }

    /* Day cells */
    for (let d = 1; d <= daysInMo; d++) {
      const date = new Date(year, month, d);
      const cell = document.createElement('button');
      cell.type      = 'button';
      cell.textContent = d;
      cell.className = 'cal-cell';
      cell.setAttribute('aria-label',
        date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
      );

      if (isPast(date) || isUnavailable(date)) {
        cell.classList.add('cal-cell-disabled');
        cell.disabled = true;
        cell.setAttribute('aria-disabled', 'true');
      } else {
        if (
          selectedDate &&
          selectedDate.getDate()     === d &&
          selectedDate.getMonth()    === month &&
          selectedDate.getFullYear() === year
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
    const label = $('#cal-times-label');
    const grid  = $('#cal-times-grid');
    if (!wrap || !label || !grid) return;

    if (!selectedDate) {
      label.textContent = 'Select a date to see available times';
      grid.innerHTML = '';
      return;
    }

    const dateStr = selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    label.textContent = `Available times for ${dateStr}`;
    grid.innerHTML = '';

    TIME_SLOTS.forEach(slot => {
      const btn = document.createElement('button');
      btn.type      = 'button';
      btn.className = 'cal-time-btn';
      btn.textContent = slot;
      if (selectedTime === slot) btn.classList.add('cal-time-selected');
      btn.addEventListener('click', () => selectTime(slot, btn));
      grid.appendChild(btn);
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

  /* Month nav buttons */
  const calPrev = $('#cal-prev-month');
  const calNext = $('#cal-next-month');
  calPrev && calPrev.addEventListener('click', () => { calViewDate.setMonth(calViewDate.getMonth() - 1); buildCalendar(calViewDate); });
  calNext && calNext.addEventListener('click', () => { calViewDate.setMonth(calViewDate.getMonth() + 1); buildCalendar(calViewDate); });

  /* Back link: Step 2 → Step 1 */
  step2Back && step2Back.addEventListener('click', () => goToStep(1));

  /* ─────────────────────────────────────────────────────────
     STEP 3 — CONFIRMATION
     ───────────────────────────────────────────────────────── */
  function populateConfirmation() {
    /* Dynamic datetime */
    if (selectedDate && selectedTime) {
      const dateStr = selectedDate.toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
      });
      const tzName    = Intl.DateTimeFormat().resolvedOptions().timeZone.replace(/_/g, ' ');
      const confirmDT = $('#confirm-datetime');
      if (confirmDT) confirmDT.textContent = `${dateStr} · ${selectedTime} (${tzName})`;
    }

    /* Dynamic guest email */
    const emailInput    = $('#email');
    const confirmGuests = $('#confirm-guests');
    if (emailInput && confirmGuests) confirmGuests.textContent = emailInput.value.trim() || '—';
  }

  /* Add to Calendar — Google Calendar URL */
  confirmCal && confirmCal.addEventListener('click', () => {
    if (!selectedDate || !selectedTime) return;
    const [timePart, meridiem] = selectedTime.split(' ');
    let [hours, minutes] = timePart.split(':').map(Number);
    if (meridiem === 'PM' && hours !== 12) hours += 12;
    if (meridiem === 'AM' && hours === 12) hours = 0;

    const start = new Date(selectedDate);
    start.setHours(hours, minutes, 0, 0);
    const end = new Date(start.getTime() + 30 * 60 * 1000);

    const fmt = d => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const url = `https://calendar.google.com/calendar/r/eventedit?text=N3X+Realty+Strategy+Call&dates=${fmt(start)}/${fmt(end)}&details=Social+media+strategy+session+with+an+N3X+specialist.&location=Zoom+/+Phone`;
    window.open(url, '_blank', 'noopener,noreferrer');
  });

  /* Reschedule → back to calendar */
  reschedule && reschedule.addEventListener('click', e => {
    e.preventDefault();
    selectedTime = null;
    goToStep(2);
  });

})(); /* end initDemoModal */
