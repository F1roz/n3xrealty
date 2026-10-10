/* ==========================================================================
   N3X Realty — main.js
   One script for every page. Each module checks for its own markup first,
   so it does nothing on pages where that markup is absent.

   1.  Helpers
   2.  Header (scroll state, desktop dropdowns)
   3.  Mobile navigation
   4.  Back-to-top button
   5.  Scroll reveal
   6.  Number counters
   7.  Tabs (automation, lead generation, SEO, social ads, websites)
   8.  FAQ accordions
   9.  Live tickers (automation + CRM heroes)
   10. Progress bars (lead nurture + SEO)
   11. Home: feature accordions with image swap
   12. Home: testimonial carousel + video cards
   13. AI CRM: smart-action demo buttons
   14. AI Lead Nurture: SMS thread, response timer, handoff buttons
   15. Lead Generation: hero lead counter
   16. Real Estate Websites: system progress bar
   17. Book-a-demo modal (details → Calendly → confirmation)
   18. Footer year
   ========================================================================== */

(function () {
  'use strict';

  /* ------------------------------------------------------------------------
     1. Helpers
     ------------------------------------------------------------------------ */
  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const root = document.documentElement;
  root.classList.add('js');

  // A photo that fails to load leaves its branded frame instead of a broken icon.
  document.addEventListener('error', (e) => {
    if (e.target && e.target.tagName === 'IMG') e.target.classList.add('img-failed');
  }, true);

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const prefersReduced = () => reducedMotion.matches;

  /** Run cb once when el scrolls into view. */
  function onceVisible(el, cb, options = {}) {
    if (!('IntersectionObserver' in window)) { cb(el); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { io.unobserve(entry.target); cb(entry.target); }
      });
    }, { threshold: options.threshold ?? 0.15, rootMargin: options.rootMargin ?? '0px 0px -40px 0px' });
    io.observe(el);
  }

  let scrollLocks = 0;
  function lockScroll()   { if (scrollLocks++ === 0) document.body.style.overflow = 'hidden'; }
  function unlockScroll() { if (scrollLocks > 0 && --scrollLocks === 0) document.body.style.overflow = ''; }

  const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), iframe, [tabindex]:not([tabindex="-1"])';

  /** Keep Tab focus inside container while it is open. */
  function trapFocus(container, e) {
    if (e.key !== 'Tab') return;
    const items = $$(FOCUSABLE, container).filter((el) => el.offsetParent !== null);
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  /* ------------------------------------------------------------------------
     2. Header
     ------------------------------------------------------------------------ */
  (function header() {
    const el = $('#site-header');
    if (!el) return;
    const update = () => el.classList.toggle('scrolled', window.scrollY > 24);
    window.addEventListener('scroll', update, { passive: true });
    update();

    // Desktop dropdowns: open on hover (pointer) and on click/keyboard (everyone).
    $$('.has-dropdown').forEach((item) => {
      const trigger = $('.nav-link', item);
      const panel = $('.dropdown-panel', item);
      if (!trigger || !panel) return;
      let timer;
      const setOpen = (open) => {
        item.classList.toggle('open', open);
        trigger.setAttribute('aria-expanded', String(open));
      };
      item.addEventListener('mouseenter', () => { clearTimeout(timer); setOpen(true); });
      item.addEventListener('mouseleave', () => { timer = setTimeout(() => setOpen(false), 150); });
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        // With a mouse the panel is already open from hover, so a click keeps it open.
        if (e.detail > 0 && item.matches(':hover')) setOpen(true);
        else setOpen(!item.classList.contains('open'));
      });
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') { setOpen(false); trigger.focus(); }
      });
      item.addEventListener('focusout', (e) => {
        if (!item.contains(e.relatedTarget)) setOpen(false);
      });
    });

    // Mark the current page in the navigation.
    const here = location.pathname.split('/').pop().replace(/\.html$/, '') || 'index';
    $$('.main-nav a[href], .mobile-nav a[href], .site-footer a[href]').forEach((a) => {
      const target = (a.getAttribute('href') || '').split('#')[0].replace(/\.html$/, '').replace(/^\.?\//, '') || null;
      if (target && target === here) {
        a.setAttribute('aria-current', 'page');
        const parent = a.closest('.has-dropdown');
        if (parent) parent.classList.add('is-current');
      }
    });
  })();

  /* ------------------------------------------------------------------------
     3. Mobile navigation
     ------------------------------------------------------------------------ */
  (function mobileNav() {
    const burger = $('#hamburger');
    const panel = $('#mobile-nav');
    const overlay = $('#mobile-overlay');
    const closeBtn = $('#mobile-close');
    if (!burger || !panel) return;

    const open = () => {
      panel.classList.add('open');
      overlay && overlay.classList.add('open');
      burger.setAttribute('aria-expanded', 'true');
      panel.setAttribute('aria-hidden', 'false');
      panel.removeAttribute('inert');
      lockScroll();
      setTimeout(() => closeBtn && closeBtn.focus(), 50);
    };
    const close = () => {
      if (!panel.classList.contains('open')) return;
      panel.classList.remove('open');
      overlay && overlay.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
      panel.setAttribute('aria-hidden', 'true');
      panel.setAttribute('inert', '');
      unlockScroll();
      burger.focus();
    };

    panel.setAttribute('inert', '');
    burger.addEventListener('click', open);
    closeBtn && closeBtn.addEventListener('click', close);
    overlay && overlay.addEventListener('click', close);
    panel.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') close();
      trapFocus(panel, e);
    });
    // Following a link inside the menu should also close it (same-page anchors).
    $$('a', panel).forEach((a) => a.addEventListener('click', close));

    $$('.mobile-sub-toggle', panel).forEach((btn) => {
      btn.setAttribute('aria-expanded', 'false');
      btn.addEventListener('click', () => {
        const li = btn.closest('.mobile-has-sub');
        const isOpen = li.classList.toggle('open');
        btn.setAttribute('aria-expanded', String(isOpen));
      });
    });

    // Close if the viewport grows past the mobile breakpoint.
    window.matchMedia('(min-width: 1101px)').addEventListener('change', (e) => { if (e.matches) close(); });
  })();

  /* ------------------------------------------------------------------------
     4. Back-to-top
     ------------------------------------------------------------------------ */
  (function backToTop() {
    const btn = $('#back-to-top');
    if (!btn) return;
    const update = () => btn.classList.toggle('visible', window.scrollY > 600);
    window.addEventListener('scroll', update, { passive: true });
    update();
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: prefersReduced() ? 'auto' : 'smooth' }));
  })();

  /* ------------------------------------------------------------------------
     5. Scroll reveal
     Elements with .reveal fade up once. Cards in this list get the same
     treatment, staggered by their position among siblings (30ms steps,
     capped at 200ms).
     ------------------------------------------------------------------------ */
  (function reveal() {
    const CARD_SELECTORS = [
      // home
      '.stat-card',
      // about
      '.ab-mv-card', '.ab-val-card', '.ab-exp-card', '.ab-why-card', '.ab-office-card', '.ab-company-card', '.ab-wf-step', '.ab-tl-item', '.ab-team-card',
      // ai automation
      '.aa-prod-card', '.aa-prem-card', '.aa-stat-card', '.aa-price-card', '.aa-auto-row',
      // ai crm
      '.crm-pain-card', '.crm-signal-item', '.crm-how-step', '.crm-sa-feat', '.crm-list-feat', '.crm-compare-item', '.crm-int-item', '.crm-proof-card', '.crm-price-card',
      // lead generation
      '.lg-pain-card', '.lg-stat-card', '.lg-price-card', '.lg-how-step',
      // ai lead nurture
      '.ln-prob-card', '.ln-pillar', '.ln-inst-feat', '.ln-qual-dim', '.ln-niche-card', '.ln-cmp-item', '.ln-result-card', '.ln-price-card', '.ln-hf-feat', '.ln-seq-item',
      // seo & geo
      '.sg-prob-card', '.sg-ai-factor', '.sg-niche-card', '.sg-timeline-item', '.sg-price-card', '.sg-compare-card', '.sg-result-card',
      // social media marketing
      '.smm-pain-card', '.smm-content-card', '.smm-result-card', '.smm-li-opp-card', '.smm-li-aud-card', '.smm-li-pillar', '.smm-li-step', '.smm-timeline-step', '.smm-price-card', '.smm-funnel-stage', '.smm-campaign', '.smm-addon',
      // real estate websites
      '.rew-pain-card', '.rew-proof-stat', '.rew-sum-pillar', '.rew-price-card',
    ].join(',');

    $$(CARD_SELECTORS).forEach((el) => {
      if (el.closest('.mobile-nav, .site-header, .demo-overlay')) return;
      if (el.classList.contains('reveal')) return;
      el.classList.add('reveal');
      const siblings = Array.from(el.parentElement.children).filter((c) => c.matches(CARD_SELECTORS));
      const i = siblings.indexOf(el);
      if (!el.style.getPropertyValue('--d')) el.style.setProperty('--d', `${Math.min(i * 30, 200)}ms`);
    });

    const targets = $$('.reveal');
    if (prefersReduced() || !('IntersectionObserver' in window)) {
      targets.forEach((el) => el.classList.add('in-view'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { entry.target.classList.add('in-view'); io.unobserve(entry.target); }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -24px 0px' });
    targets.forEach((el) => io.observe(el));

    // Safety net: anything still hidden after load and already above the fold gets shown.
    window.addEventListener('load', () => {
      setTimeout(() => {
        targets.forEach((el) => {
          if (!el.classList.contains('in-view') && el.getBoundingClientRect().top < window.innerHeight) el.classList.add('in-view');
        });
      }, 400);
    });
  })();

  /* ------------------------------------------------------------------------
     6. Number counters
     Any element with data-target counts up once visible. The final number
     is already in the HTML, so the value is correct without JavaScript.
       data-format="year"     → no animation
       data-format="compact"  → 3.5M / 920K
       data-prefix="$"        → prefix (auto-detected from existing text)
       data-suffix="+"        → suffix
     ------------------------------------------------------------------------ */
  (function counters() {
    const els = $$('[data-target]');
    if (!els.length) return;

    const compact = (n) => {
      if (n >= 1e6) { const v = n / 1e6; return (Number.isInteger(v) ? v : v.toFixed(1)) + 'M'; }
      if (n >= 1e3) { const v = n / 1e3; return (Number.isInteger(v) ? v : v.toFixed(0)) + 'K'; }
      return n.toLocaleString();
    };
    const easeOut = (t) => 1 - Math.pow(1 - t, 4);

    els.forEach((el) => {
      const target = parseFloat(el.dataset.target);
      if (Number.isNaN(target)) return;
      const format = el.dataset.format || (target >= 100000 ? 'compact' : '');
      const prefix = el.dataset.prefix ?? (el.textContent.trim().startsWith('$') ? '$' : '');
      const suffix = el.dataset.suffix || '';
      const render = (v) => prefix + (format === 'compact' ? compact(v) : Math.round(v).toLocaleString()) + suffix;
      const card = el.closest('[class*="-card"], [class*="-stat"]') || el;

      if (format === 'year') { el.textContent = String(target); return; }
      el.textContent = render(target); // correct value even before animating

      if (prefersReduced()) { card.classList.add('counted'); return; }

      onceVisible(el, () => {
        const duration = 1200;
        const start = performance.now();
        const tick = (now) => {
          const p = Math.min((now - start) / duration, 1);
          el.textContent = render(easeOut(p) * target);
          if (p < 1) requestAnimationFrame(tick);
          else { el.textContent = render(target); card.classList.add('counted'); }
        };
        requestAnimationFrame(tick);
      }, { threshold: 0.5 });
    });
  })();

  /* ------------------------------------------------------------------------
     7. Tabs — one implementation for every tabbed section.
     ------------------------------------------------------------------------ */
  (function tabs() {
    const GROUPS = [
      { tab: '.aa-cat-tab',        panel: '.aa-cat-panel',  key: 'cat',  scroller: '#aa-cat-nav' },
      { tab: '.lg-cat-tab',        panel: '.lg-cat-panel',  key: 'cat',  scroller: '#lg-cat-nav' },
      { tab: '.sg-srv-tab',        panel: '.sg-srv-panel',  key: 'srv' },
      { tab: '.smm-ads-tab',       panel: '.smm-ads-panel', key: 'tab',  panelId: (k) => `smm-tab-${k}` },
      { tab: '.rew-feat-nav-btn',  panel: '.rew-feat-panel', key: 'feat' },
    ];

    GROUPS.forEach((g) => {
      const tabEls = $$(g.tab);
      const panels = $$(g.panel);
      if (!tabEls.length || !panels.length) return;

      const keyOf = (el) => el.dataset[g.key];
      const panelFor = (k) => g.panelId ? document.getElementById(g.panelId(k)) : panels.find((p) => p.dataset[g.key] === k);

      const activate = (k, focus = false) => {
        tabEls.forEach((t) => {
          const on = keyOf(t) === k;
          t.classList.toggle('active', on);
          t.setAttribute('aria-selected', String(on));
          t.setAttribute('tabindex', on ? '0' : '-1');
          if (on && focus) t.focus();
          if (on && g.scroller) {
            const nav = $(g.scroller);
            if (nav && nav.scrollWidth > nav.clientWidth) {
              nav.scrollTo({ left: t.offsetLeft - nav.clientWidth / 2 + t.offsetWidth / 2, behavior: prefersReduced() ? 'auto' : 'smooth' });
            }
          }
        });
        panels.forEach((p) => {
          const on = p === panelFor(k);
          p.classList.toggle('active', on);
          p.setAttribute('aria-hidden', String(!on));
          if (on) $$('.sg-cite-fill', p).forEach(fillBar);
        });
      };

      tabEls.forEach((t) => {
        t.setAttribute('role', 'tab');
        t.addEventListener('click', () => activate(keyOf(t)));
        t.addEventListener('keydown', (e) => {
          const keys = tabEls.map(keyOf);
          const i = keys.indexOf(keyOf(t));
          let next = null;
          if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = keys[(i + 1) % keys.length];
          if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = keys[(i - 1 + keys.length) % keys.length];
          if (e.key === 'Home') next = keys[0];
          if (e.key === 'End') next = keys[keys.length - 1];
          if (next !== null) { e.preventDefault(); activate(next, true); }
        });
      });
      panels.forEach((p) => p.setAttribute('role', 'tabpanel'));

      const initial = tabEls.find((t) => t.classList.contains('active')) || tabEls[0];
      activate(keyOf(initial));
    });
  })();

  /* ------------------------------------------------------------------------
     8. FAQ accordions — all pages use <prefix>-faq-item / -faq-q / -faq-a
     ------------------------------------------------------------------------ */
  (function faqs() {
    ['aa', 'crm', 'lg', 'ln', 'sg', 'smm', 'rew', 'ab'].forEach((p) => {
      const items = $$(`.${p}-faq-item`);
      items.forEach((item, idx) => {
        const q = $(`.${p}-faq-q`, item);
        const a = $(`.${p}-faq-a`, item);
        if (!q || !a) return;
        if (!a.id) a.id = `${p}-faq-answer-${idx + 1}`;
        q.setAttribute('aria-controls', a.id);
        if (!q.hasAttribute('aria-expanded')) q.setAttribute('aria-expanded', 'false');
        q.addEventListener('click', () => {
          const wasOpen = q.getAttribute('aria-expanded') === 'true';
          items.forEach((other) => {
            const oq = $(`.${p}-faq-q`, other);
            const oa = $(`.${p}-faq-a`, other);
            if (oq) oq.setAttribute('aria-expanded', 'false');
            if (oa) oa.classList.remove('open');
            other.classList.remove('open');
          });
          if (!wasOpen) { q.setAttribute('aria-expanded', 'true'); a.classList.add('open'); item.classList.add('open'); }
        });
      });
    });
  })();

  /* ------------------------------------------------------------------------
     9. Live tickers (rotating status lines in hero mockups)
     ------------------------------------------------------------------------ */
  (function tickers() {
    [['#aa-ticker', '.aa-tick'], ['#crm-ticker', '.crm-ticker-item']].forEach(([wrapSel, itemSel]) => {
      const wrap = $(wrapSel);
      if (!wrap) return;
      const items = $$(itemSel, wrap);
      if (items.length < 2) return;
      let i = Math.max(0, items.findIndex((el) => el.classList.contains('active')));
      items.forEach((el, n) => el.classList.toggle('active', n === i));
      let timer = null;
      const step = () => {
        const leaving = items[i];
        i = (i + 1) % items.length;
        leaving.classList.remove('active');
        leaving.classList.add('leaving');
        setTimeout(() => { leaving.classList.remove('leaving'); items[i].classList.add('active'); }, 200);
      };
      const start = () => { if (!timer) timer = setInterval(step, 3600); };
      const stop = () => { clearInterval(timer); timer = null; };
      wrap.addEventListener('mouseenter', stop);
      wrap.addEventListener('mouseleave', start);
      document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
      start();
    });
  })();

  /* ------------------------------------------------------------------------
     10. Progress bars — animate with transform (scaleX) from their set width
     ------------------------------------------------------------------------ */
  function fillBar(bar) {
    if (bar.dataset.filled) return;
    bar.dataset.filled = '1';
    bar.classList.add('is-filled');
  }
  (function progressBars() {
    const bars = $$('.ln-prob-fill, .ln-fu-fill, .sg-cite-fill');
    bars.forEach((bar) => {
      bar.classList.add('bar-fill');
      if (prefersReduced()) { fillBar(bar); return; }
      onceVisible(bar, fillBar, { threshold: 0.6 });
    });
  })();

  /* ------------------------------------------------------------------------
     11. Home: feature accordions (one open at a time) + image swap
     ------------------------------------------------------------------------ */
  (function featureAccordions() {
    $$('[data-accordion]').forEach((acc) => {
      const items = $$('.acc-item', acc);
      const visual = document.getElementById(acc.dataset.accordion);
      const slides = visual ? $$('[data-slide]', visual) : [];

      const select = (item) => {
        items.forEach((it) => {
          const on = it === item;
          it.classList.toggle('acc-active', on);
          const btn = $('.acc-header', it);
          if (btn) btn.setAttribute('aria-expanded', String(on));
        });
        const key = item.dataset.slide;
        slides.forEach((s) => s.classList.toggle('is-active', s.dataset.slide === key));
      };

      items.forEach((it) => {
        const btn = $('.acc-header', it);
        if (btn) btn.addEventListener('click', () => select(it));
      });
      const first = items.find((it) => it.classList.contains('acc-active')) || items[0];
      if (first) select(first);
    });
  })();

  /* ------------------------------------------------------------------------
     12. Home: testimonial carousel (native scroll-snap + buttons) and videos
     ------------------------------------------------------------------------ */
  (function carousel() {
    const track = $('#testimonials-carousel');
    if (!track) return;
    const prev = $('#carousel-prev');
    const next = $('#carousel-next');
    const dots = $('#carousel-dots');
    const cards = $$('.tcard', track);

    const cardStep = () => (cards[1] ? cards[1].offsetLeft - cards[0].offsetLeft : track.clientWidth);
    const pages = () => Math.max(1, Math.ceil((track.scrollWidth - track.clientWidth) / cardStep()) + 1);
    const current = () => Math.round(track.scrollLeft / cardStep());
    const go = (n) => track.scrollTo({ left: n * cardStep(), behavior: prefersReduced() ? 'auto' : 'smooth' });

    const buildDots = () => {
      if (!dots) return;
      dots.innerHTML = '';
      for (let i = 0; i < pages(); i++) {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'carousel-dot';
        b.setAttribute('aria-label', `Show testimonial ${i + 1}`);
        b.addEventListener('click', () => go(i));
        dots.appendChild(b);
      }
      sync();
    };
    const sync = () => {
      const c = current();
      if (dots) $$('.carousel-dot', dots).forEach((d, i) => d.classList.toggle('active', i === c));
      if (prev) prev.disabled = track.scrollLeft <= 4;
      if (next) next.disabled = track.scrollLeft >= track.scrollWidth - track.clientWidth - 4;
    };

    prev && prev.addEventListener('click', () => go(current() - 1));
    next && next.addEventListener('click', () => go(current() + 1));
    track.addEventListener('scroll', () => requestAnimationFrame(sync), { passive: true });
    window.addEventListener('resize', buildDots, { passive: true });
    buildDots();
  })();

  (function videoCards() {
    $$('.video-wrap').forEach((wrap) => {
      const video = $('video', wrap);
      const btn = $('.video-play-btn', wrap);
      if (!video || !btn) return;
      const hasSource = video.querySelector('source') || video.getAttribute('src');
      if (!hasSource) { wrap.classList.add('no-video'); btn.hidden = true; return; }
      btn.addEventListener('click', () => {
        if (video.paused) { video.play(); wrap.classList.add('playing'); video.setAttribute('controls', ''); }
        else { video.pause(); wrap.classList.remove('playing'); }
      });
      video.addEventListener('ended', () => wrap.classList.remove('playing'));
    });
  })();

  /* ------------------------------------------------------------------------
     13. AI CRM: demo buttons inside the dashboard mockups
     ------------------------------------------------------------------------ */
  (function crmDemoButtons() {
    const flash = (btn, label, ms = 1800) => {
      const original = btn.textContent;
      btn.textContent = label;
      btn.classList.add('is-done');
      btn.disabled = true;
      setTimeout(() => { btn.textContent = original; btn.classList.remove('is-done'); btn.disabled = false; }, ms);
    };
    const send = $('.crm-sa-send');
    send && send.addEventListener('click', () => flash(send, 'Sent'));

    const edit = $('.crm-sa-edit');
    const draft = $('.crm-sa-draft-text');
    if (edit && draft) {
      edit.addEventListener('click', () => {
        const editing = draft.getAttribute('contenteditable') === 'true';
        if (editing) {
          draft.removeAttribute('contenteditable');
          draft.classList.remove('is-editing');
          edit.textContent = 'Edit first';
        } else {
          draft.setAttribute('contenteditable', 'true');
          draft.classList.add('is-editing');
          draft.focus();
          edit.textContent = 'Done editing';
        }
      });
    }

    const skip = $('.crm-sa-skip');
    skip && skip.addEventListener('click', () => {
      const card = skip.closest('.crm-sa-card');
      if (!card) return;
      card.classList.add('is-skipped');
      setTimeout(() => card.classList.remove('is-skipped'), 1400);
    });

    $$('.crm-action-btn').forEach((btn) => btn.addEventListener('click', () => flash(btn, '✓')));
  })();

  /* ------------------------------------------------------------------------
     14. AI Lead Nurture: SMS thread, response timer, handoff buttons
     ------------------------------------------------------------------------ */
  (function leadNurtureHero() {
    const thread = $('.ln-sms-thread');
    if (thread && !prefersReduced()) {
      const msgs = Array.from(thread.children);
      msgs.forEach((m) => m.classList.add('sms-pending'));
      onceVisible(thread, () => {
        msgs.forEach((m, i) => setTimeout(() => m.classList.remove('sms-pending'), 300 + i * 450));
      }, { threshold: 0.3 });
    }

    const timer = $('#ln-timer');
    if (timer) {
      const TARGET = 43;
      const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
      timer.textContent = fmt(TARGET);
      if (!prefersReduced()) {
        onceVisible(timer, () => {
          let s = 0;
          timer.textContent = fmt(0);
          const id = setInterval(() => {
            s += 1;
            timer.textContent = fmt(s);
            if (s >= TARGET) clearInterval(id);
          }, 45);
        }, { threshold: 0.5 });
      }
    }

    const flash = (btn, label) => {
      if (!btn) return;
      btn.addEventListener('click', () => {
        const original = btn.textContent;
        btn.textContent = label;
        btn.disabled = true;
        setTimeout(() => { btn.textContent = original; btn.disabled = false; }, 1800);
      });
    };
    flash($('.ln-ha-primary'), 'Opening conversation…');
    flash($('.ln-ha-secondary'), 'Calling…');
  })();

  /* ------------------------------------------------------------------------
     15. Lead Generation: hero "leads today" counter
     ------------------------------------------------------------------------ */
  (function leadCounter() {
    const el = $('#lg-lead-counter');
    if (!el) return;
    const START = 31;
    const END = 64;
    el.textContent = String(END);
    if (prefersReduced()) return;
    onceVisible(el, () => {
      const start = performance.now();
      const duration = 2400;
      const tick = (now) => {
        const p = Math.min((now - start) / duration, 1);
        el.textContent = String(Math.round(START + (1 - Math.pow(1 - p, 3)) * (END - START)));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.5 });
  })();

  /* ------------------------------------------------------------------------
     16. Real Estate Websites: "system" progress bar
     ------------------------------------------------------------------------ */
  (function systemBar() {
    const fill = $('#rew-system-bar-fill');
    if (!fill) return;
    const bar = fill.closest('.rew-system-bar') || fill;
    onceVisible(bar, () => fill.classList.add('animated'), { threshold: 0.4 });
  })();

  /* ------------------------------------------------------------------------
     17. Book-a-demo modal
     Step 1 collects details, step 2 embeds Calendly (pre-filled with name,
     email and phone), step 3 confirms once Calendly reports a booking.
     Markup is built here so every page shares one copy.
     ------------------------------------------------------------------------ */
  const DEMO = {
    calendly: 'https://calendar.app.google/GkKuokrXA2DLxS4R6',
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
        <img class="demo-visual-logo" src="assets/images/brand/n3x-realty-logo.png" alt="" width="178" height="46">
        <ol class="demo-steps">
          <li class="demo-step-pill is-active" data-for-step="1"><span>1</span>Your details</li>
          <li class="demo-step-pill" data-for-step="2"><span>2</span>Pick a time</li>
          <li class="demo-step-pill" data-for-step="3"><span>3</span>Confirmed</li>
        </ol>
        <p class="demo-visual-note">A 15-minute call with a platform specialist. We look at your market, your current site and your lead flow, then show you exactly what we'd change.</p>
        <dl class="demo-visual-stats">
          <div><dt>3,000+</dt><dd>Professionals served</dd></div>
          <div><dt>$200M</dt><dd>Volume closed</dd></div>
          <div><dt>43 sec</dt><dd>Avg. lead response</dd></div>
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
          <p class="demo-legal">By continuing you agree to our <a href="terms-of-service.html">Terms</a> and <a href="privacy-policy.html">Privacy Policy</a>. We never sell your information.</p>
        </form>
      </section>

      <section class="demo-step" data-step="2" hidden>
        <p class="demo-kicker">Step 2 of 3</p>
        <h2 class="demo-title" tabindex="-1">Pick a time</h2>
        <p class="demo-sub">Times are shown in your time zone.</p>
        <div class="demo-calendar"><div class="demo-calendar-loading">Loading available times…</div></div>
        <div class="demo-step-actions">
          <button type="button" class="demo-link" data-demo-back>Edit my details</button>
          <a class="demo-link" data-demo-external target="_blank" rel="noopener">Open the calendar in a new tab</a>
        </div>
      </section>

      <section class="demo-step demo-step-confirm" data-step="3" hidden>
        <div class="demo-check" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><path d="m5 12.5 4.5 4.5L19 7.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
        <h2 class="demo-title" tabindex="-1">You're booked</h2>
        <p class="demo-sub">A calendar invite is on its way to <strong data-demo-email></strong>. It includes the meeting link and options to reschedule.</p>
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

    function loadCalendly() {
      const params = new URLSearchParams({
        hide_gdpr_banner: '1',
        hide_landing_page_details: '1',
        primary_color: '1febb0',
        embed_domain: location.hostname || 'n3xrealty.com',
        embed_type: 'Inline',
        name: `${data.firstName} ${data.lastName}`.trim(),
        email: data.email,
        a1: data.phone,
      });
      const url = `${DEMO.calendly}?${params}`;
      const box = $('.demo-calendar', overlay);
      box.innerHTML = `<iframe title="Choose a time for your demo" src="${url}" loading="lazy"></iframe>`;
      $('[data-demo-external]', overlay).href = url;
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
        loadCalendly();
        showStep(2);
      });

      $('[data-demo-back]', overlay).addEventListener('click', () => showStep(1));
      $('[data-demo-done]', overlay).addEventListener('click', close);

      // Calendly posts a message when the visitor books.
      window.addEventListener('message', (e) => {
        let host = '';
        try { host = new URL(e.origin).hostname; } catch (err) { return; }
        if (!/(^|\.)calendly\.com$/.test(host)) return;
        if (e.data && e.data.event === 'calendly.event_scheduled') {
          $('[data-demo-email]', overlay).textContent = data.email || 'your inbox';
          showStep(3);
        }
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

  /* ------------------------------------------------------------------------
     18. Footer year
     ------------------------------------------------------------------------ */
  $$('[data-year]').forEach((el) => { el.textContent = String(new Date().getFullYear()); });
})();
