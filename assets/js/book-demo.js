/* ==========================================================================
   N3X Realty — book-demo.js
   The "Book a demo" form used on every page.

   Step 1  collects name, email, phone and business type
   Step 2  shows your Google Calendar booking page to pick a time
   Step 3  confirms once the visitor says they've booked

   The form markup is built here, so no page needs to contain it.
   Anything linking to "#book-demo" (or with data-open-demo) opens it, and
   any-page.html#book-demo opens it on arrival.

   Load after main.js:
     <script src="assets/js/main.js" defer></script>
     <script src="assets/js/book-demo.js" defer></script>
   ========================================================================== */

(function () {
  'use strict';

  // Site root, worked out from this script's own URL (assets/js/book-demo.js),
  // so links and images also work on pages inside sub-folders such as /blog/.
  const ROOT = (() => {
    try { return new URL('../../', document.currentScript.src).href; } catch (e) { return ''; }
  })();

  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  // Shared helpers come from main.js; simple fallbacks keep this file usable alone.
  const shared = window.N3X || {};
  const lockScroll = shared.lockScroll || (() => { document.body.style.overflow = 'hidden'; });
  const unlockScroll = shared.unlockScroll || (() => { document.body.style.overflow = ''; });
  const trapFocus = shared.trapFocus || (() => {});

  /* ------------------------------------------------------------------------
     Book-a-demo modal
     Step 1 collects details, step 2 shows the Google Calendar booking page,
     step 3 confirms once the visitor says they've booked.
     Markup is built here so every page shares one copy.
     ------------------------------------------------------------------------ */
  const DEMO = {
    // Your Google Calendar appointment schedule (opens in a new tab).
    booking: 'https://calendar.app.google/GkKuokrXA2DLxS4R6',
    // Optional: to show the calendar inside the popup instead, paste the "src" from
    // Google Calendar → your booking page → Share → Website embed. It looks like
    // https://calendar.google.com/calendar/appointments/schedules/XXXX?gv=true
    bookingEmbed: '',
    phoneDisplay: '404-981-1910',
    phoneHref: 'https://wa.me/14049811910',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=900&q=75',
  };

  function buildDemoModal() {
    const wrap = document.createElement('div');
    wrap.className = 'demo-overlay';
    wrap.id = 'demo-overlay';
    wrap.hidden = true;
    wrap.innerHTML = `
  <div class="demo-modal" role="dialog" aria-modal="true" aria-labelledby="demo-title">
    <aside class="demo-visual" aria-hidden="true">
      <img class="demo-visual-img" src="${DEMO.image}" alt="" loading="lazy" decoding="async">
      <div class="demo-visual-content">
        <img class="demo-visual-logo" src="${ROOT}assets/images/brand/n3x-realty-logo.png" alt="" width="178" height="46">
        <ol class="demo-steps">
          <li class="demo-step-pill is-active" data-for-step="1"><span>1</span>Your details</li>
          <li class="demo-step-pill" data-for-step="2"><span>2</span>Pick a time</li>
          <li class="demo-step-pill" data-for-step="3"><span>3</span>Confirmed</li>
        </ol>
        <p class="demo-visual-note">A short call with a platform specialist. We look at your market, your current site and your lead flow, then show you exactly what we'd change.</p>
        <dl class="demo-visual-stats">
          <div><dt>$149</dt><dd>3-page starter website</dd></div>
          <div><dt>24/7</dt><dd>AI lead follow-up</dd></div>
          <div><dt>0</dt><dd>Long-term contracts</dd></div>
        </dl>
      </div>
    </aside>

    <div class="demo-pane">
      <button type="button" class="demo-close" aria-label="Close">
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
      </button>

      <div class="demo-progress" aria-hidden="true"><span class="demo-progress-fill"></span></div>

      <section class="demo-step" data-step="1">
        <p class="demo-kicker">Step 1 of 3</p>
        <h2 class="demo-title" id="demo-title" tabindex="-1">Book a demo</h2>
        <p class="demo-sub">Tell us a little about your business. Prefer to talk now? Call <a href="${DEMO.phoneHref}">${DEMO.phoneDisplay}</a>.</p>
        <form class="demo-form" novalidate>
          <div class="demo-row">
            <div class="demo-field"><label for="demo-first">First name</label><input id="demo-first" name="firstName" autocomplete="given-name" required><p class="demo-error" aria-live="polite"></p></div>
            <div class="demo-field"><label for="demo-last">Last name</label><input id="demo-last" name="lastName" autocomplete="family-name" required><p class="demo-error" aria-live="polite"></p></div>
          </div>
          <div class="demo-field"><label for="demo-email">Email</label><input id="demo-email" type="email" name="email" autocomplete="email" required><p class="demo-error" aria-live="polite"></p></div>
          <div class="demo-field"><label for="demo-phone">Phone</label><input id="demo-phone" type="tel" name="phone" autocomplete="tel" required><p class="demo-error" aria-live="polite"></p></div>
          <div class="demo-field">
            <label for="demo-type">Which best describes you?</label>
            <select id="demo-type" name="businessType" required>
              <option value="">Choose one</option>
              <option>Solo agent</option>
              <option>Real estate team</option>
              <option>Brokerage</option>
              <option>Investor or developer</option>
              <option>Other business</option>
            </select>
            <p class="demo-error" aria-live="polite"></p>
          </div>
          <div class="demo-field"><label for="demo-site">Current website <span class="demo-optional">(optional)</span></label><input id="demo-site" type="url" name="website" inputmode="url" placeholder="https://" autocomplete="url"><p class="demo-error" aria-live="polite"></p></div>
          <button type="submit" class="btn btn-primary btn-full">Continue to scheduling</button>
          <p class="demo-legal">By continuing you agree to our <a href="${ROOT}terms-of-service.html">Terms</a> and <a href="${ROOT}privacy-policy.html">Privacy Policy</a>. We never sell your information.</p>
        </form>
      </section>

      <section class="demo-step" data-step="2" hidden>
        <p class="demo-kicker">Step 2 of 3</p>
        <h2 class="demo-title" tabindex="-1">Pick a time</h2>
        <p class="demo-sub">Choose a time on our Google Calendar. Times are shown in your time zone.</p>
        <div class="demo-calendar" hidden></div>
        <div class="demo-booking-card" data-demo-card>
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" stroke-width="1.6"/><path d="M3 10h18M8 3v4M16 3v4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
          <p>Our booking calendar opens in a new tab. Pick a time, then come back here to finish.</p>
          <a class="btn btn-primary" data-demo-external href="${DEMO.booking}" target="_blank" rel="noopener">Open booking calendar</a>
        </div>
        <button type="button" class="btn btn-ghost-dark btn-full" data-demo-booked>I've booked my time</button>
        <div class="demo-step-actions">
          <button type="button" class="demo-link" data-demo-back>Edit my details</button>
        </div>
      </section>

      <section class="demo-step demo-step-confirm" data-step="3" hidden>
        <div class="demo-check" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><path d="m5 12.5 4.5 4.5L19 7.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
        <h2 class="demo-title" tabindex="-1">You're booked</h2>
        <p class="demo-sub">Thanks<span data-demo-name></span>. Google Calendar sends your invite, with the meeting link and options to reschedule, to the email you booked with. We'll reach you at <strong data-demo-phone></strong> if anything changes.</p>
        <button type="button" class="btn btn-primary" data-demo-done>Done</button>
      </section>
    </div>
  </div>`;
    document.body.appendChild(wrap);
    return wrap;
  }

  (function demoModal() {
    let overlay = null;
    let lastTrigger = null;
    let step = 1;
    const data = {};

    const ensure = () => {
      if (overlay) return overlay;
      overlay = buildDemoModal();
      wire();
      return overlay;
    };

    const showStep = (n) => {
      step = n;
      $$('.demo-step', overlay).forEach((s) => { s.hidden = Number(s.dataset.step) !== n; });
      $$('.demo-step-pill', overlay).forEach((p) => {
        const k = Number(p.dataset.forStep);
        p.classList.toggle('is-active', k === n);
        p.classList.toggle('is-done', k < n);
      });
      overlay.style.setProperty('--demo-progress', String(n / 3));
      $('.demo-pane', overlay).scrollTop = 0;
      const title = $(`.demo-step[data-step="${n}"] .demo-title`, overlay);
      if (title) title.focus({ preventScroll: true });
    };

    const open = (trigger) => {
      ensure();
      lastTrigger = trigger || document.activeElement;
      overlay.hidden = false;
      lockScroll();
      requestAnimationFrame(() => {
        overlay.classList.add('open');
        const first = step === 1 ? $('#demo-first', overlay) : $(`.demo-step[data-step="${step}"] .demo-title`, overlay);
        setTimeout(() => first && first.focus(), 60);
      });
    };

    const close = () => {
      if (!overlay || overlay.hidden) return;
      overlay.classList.remove('open');
      unlockScroll();
      if (step === 3) { // start fresh next time after a completed booking
        $('.demo-form', overlay).reset();
        showStep(1);
      }
      setTimeout(() => { overlay.hidden = true; }, 150);
      if (lastTrigger && lastTrigger.focus) lastTrigger.focus();
      if (location.hash === '#book-demo') history.replaceState(null, '', location.pathname + location.search);
    };

    function validate(form) {
      const checks = [
        ['#demo-first', (v) => v ? '' : 'Enter your first name.'],
        ['#demo-last', (v) => v ? '' : 'Enter your last name.'],
        ['#demo-email', (v) => !v ? 'Enter your email.' : /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? '' : 'Enter an email like name@company.com.'],
        ['#demo-phone', (v) => !v ? 'Enter a phone number we can reach you on.' : v.replace(/\D/g, '').length >= 7 ? '' : 'Enter a phone number with at least 7 digits.'],
        ['#demo-type', (v) => v ? '' : 'Choose the option that fits best.'],
        ['#demo-site', (v) => !v || /^https?:\/\/\S+\.\S+/.test(v) || /^\S+\.\S+$/.test(v) ? '' : 'Enter a web address like yoursite.com, or leave it blank.'],
      ];
      let firstBad = null;
      checks.forEach(([sel, test]) => {
        const input = $(sel, form);
        const msg = test(input.value.trim());
        const field = input.closest('.demo-field');
        field.classList.toggle('has-error', !!msg);
        input.setAttribute('aria-invalid', String(!!msg));
        $('.demo-error', field).textContent = msg;
        if (msg && !firstBad) firstBad = input;
      });
      return firstBad;
    }

    function loadBooking() {
      if (!DEMO.bookingEmbed) return;
      const box = $('.demo-calendar', overlay);
      if (!box.firstChild) box.innerHTML = `<iframe title="Choose a time for your demo" src="${DEMO.bookingEmbed}" loading="lazy"></iframe>`;
      box.hidden = false;
      $('[data-demo-card]', overlay).hidden = true;
    }

    function wire() {
      const form = $('.demo-form', overlay);

      $('.demo-close', overlay).addEventListener('click', close);
      overlay.addEventListener('mousedown', (e) => { if (e.target === overlay) close(); });
      overlay.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') { e.preventDefault(); close(); }
        trapFocus($('.demo-modal', overlay), e);
      });

      const recheck = (e) => {
        const field = e.target.closest('.demo-field');
        if (field && field.classList.contains('has-error')) validate(form);
      };
      form.addEventListener('input', recheck);
      form.addEventListener('change', recheck);

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const bad = validate(form);
        if (bad) { bad.focus(); return; }
        new FormData(form).forEach((v, k) => { data[k] = String(v).trim(); });
        loadBooking();
        showStep(2);
      });

      $('[data-demo-back]', overlay).addEventListener('click', () => showStep(1));
      $('[data-demo-done]', overlay).addEventListener('click', close);

      $('[data-demo-booked]', overlay).addEventListener('click', () => {
        $('[data-demo-name]', overlay).textContent = data.firstName ? `, ${data.firstName}` : '';
        $('[data-demo-phone]', overlay).textContent = data.phone || 'the number you gave us';
        showStep(3);
      });
    }

    // Anything that asks for a demo opens the modal.
    const TRIGGERS = [
      'a[href="#book-demo"]',
      '[data-open-demo]',
      '[class*="-open-modal"]',
      '.rew-cta-demo',
    ].join(',');

    document.addEventListener('click', (e) => {
      const el = e.target.closest(TRIGGERS);
      if (!el || el.closest('.demo-overlay')) return;
      e.preventDefault();
      open(el);
    });

    if (location.hash === '#book-demo') open();
  })();

})();
