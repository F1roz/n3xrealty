/* ============================================================
   N3X REALTY — LEAD GENERATION PAGE  lg.js
   1. Utilities
   2. Header Scroll
   3. Mobile Menu
   4. Desktop Dropdown
   5. Scroll Animations (.lg-anim)
   6. Card Stagger
   7. Hero Lead Counter (animated ticker)
   8. Category Tab Switcher (9 tabs)
   9. Animated Stat Counters
  10. How-We-Work Step Highlight
  11. FAQ Accordion
  12. Smooth Anchor Scroll
  13. Back-to-Top
  14. Demo Modal — 3-Step Funnel
   ============================================================ */
'use strict';
const $  = (s, c=document) => c.querySelector(s);
const $$ = (s, c=document) => [...c.querySelectorAll(s)];

/* ── 2. Header scroll shadow ── */
(function(){
  const h = $('#site-header'); if(!h) return;
  const t = () => h.classList.toggle('scrolled', window.scrollY > 60);
  window.addEventListener('scroll', t, {passive:true}); t();
})();

/* ── 3. Mobile Menu ── */
(function(){
  const ham = $('#hamburger'), nav = $('#mobile-nav'),
        ovl = $('#mobile-overlay'), cls = $('#mobile-close');
  if(!ham) return;
  const open  = () => { nav.classList.add('open'); ovl.classList.add('open'); ham.setAttribute('aria-expanded','true'); nav.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden'; };
  const close = () => { nav.classList.remove('open'); ovl.classList.remove('open'); ham.setAttribute('aria-expanded','false'); nav.setAttribute('aria-hidden','true'); document.body.style.overflow=''; };
  ham.addEventListener('click', open);
  cls && cls.addEventListener('click', close);
  ovl && ovl.addEventListener('click', close);
  document.addEventListener('keydown', e => { if(e.key==='Escape' && nav.classList.contains('open')) close(); });
  $$('.mobile-sub-toggle').forEach(b => b.addEventListener('click', () => b.closest('.mobile-has-sub').classList.toggle('open')));
})();

/* ── 4. Desktop Dropdown ── */
$$('.has-dropdown').forEach(item => {
  let t;
  item.addEventListener('mouseenter', () => { clearTimeout(t); item.classList.add('open'); });
  item.addEventListener('mouseleave', () => { t = setTimeout(() => item.classList.remove('open'), 180); });
});

/* ── 5. Scroll Animations ── */
(function(){
  const els = $$('.lg-anim'); if(!els.length) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if(e.isIntersecting){ e.target.classList.add('in-view'); obs.unobserve(e.target); } });
  }, {threshold:0.10, rootMargin:'0px 0px -40px 0px'});
  els.forEach(el => obs.observe(el));
})();

/* ── 6. Card Stagger ── */
(function(){
  const sel = ['.lg-pain-card','.lg-srv-card','.lg-stat-card','.lg-price-card','.lg-how-step','.lg-faq-item'].join(',');
  const cards = $$(sel); if(!cards.length) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if(e.isIntersecting){ e.target.style.opacity='1'; e.target.style.transform='translateY(0)'; obs.unobserve(e.target); } });
  }, {threshold:0.07});
  cards.forEach((el,i) => {
    if(el.closest('.mobile-nav, header')) return;
    el.style.opacity='0'; el.style.transform='translateY(18px)';
    el.style.transition=`opacity .55s cubic-bezier(.22,1,.36,1) ${(i%6)*0.065}s,transform .55s cubic-bezier(.22,1,.36,1) ${(i%6)*0.065}s`;
    obs.observe(el);
  });
})();

/* ── 7. Hero Lead Counter ── */
(function(){
  const el = $('#lg-lead-counter'); if(!el) return;
  const START = 31, END = 64, DURATION = 12000;
  let current = START, start = null;
  const ease = t => t < .5 ? 2*t*t : -1+(4-2*t)*t;
  function tick(ts){
    if(!start) start = ts;
    const prog = Math.min((ts-start)/DURATION,1);
    current = Math.round(START + ease(prog)*(END-START));
    el.textContent = current;
    if(prog < 1) requestAnimationFrame(tick);
    else {
      /* After reaching end, slowly increment every 8–20s */
      setInterval(() => { current++; el.textContent = current; }, 8000 + Math.random()*12000);
    }
  }
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if(e.isIntersecting){ requestAnimationFrame(tick); obs.unobserve(e.target); } });
  }, {threshold:0.5});
  obs.observe(el);
})();

/* ── 8. Category Tab Switcher ── */
(function(){
  const tabs   = $$('.lg-cat-tab');
  const panels = $$('.lg-cat-panel');
  if(!tabs.length) return;

  function scrollTabIntoView(tab){
    const nav = $('#lg-cat-nav'); if(!nav) return;
    const left = tab.offsetLeft - nav.offsetWidth/2 + tab.offsetWidth/2;
    nav.scrollTo({left, behavior:'smooth'});
  }

  function activate(cat){
    tabs.forEach(t => { const on = t.dataset.cat===cat; t.classList.toggle('active',on); t.setAttribute('aria-selected',on?'true':'false'); if(on) scrollTabIntoView(t); });
    panels.forEach(p => { const show = p.dataset.cat===cat; p.classList.toggle('active',show); });

    /* Re-stagger cards in the newly visible panel */
    const panel = $(`.lg-cat-panel[data-cat="${cat}"]`);
    if(panel){
      $$('.lg-srv-card', panel).forEach((card,i) => {
        card.style.opacity='0'; card.style.transform='translateY(16px)';
        card.style.transition=`opacity .45s cubic-bezier(.22,1,.36,1) ${i*0.06}s,transform .45s cubic-bezier(.22,1,.36,1) ${i*0.06}s`;
        requestAnimationFrame(() => requestAnimationFrame(() => { card.style.opacity='1'; card.style.transform='translateY(0)'; }));
      });
    }
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => activate(tab.dataset.cat));
    tab.addEventListener('keydown', e => {
      const cats = tabs.map(t=>t.dataset.cat), cur = tab.dataset.cat;
      if(e.key==='ArrowRight'||e.key==='ArrowDown'){ e.preventDefault(); const n=cats[(cats.indexOf(cur)+1)%cats.length]; activate(n); $(`[data-cat="${n}"].lg-cat-tab`).focus(); }
      if(e.key==='ArrowLeft' ||e.key==='ArrowUp')  { e.preventDefault(); const p=cats[(cats.indexOf(cur)-1+cats.length)%cats.length]; activate(p); $(`[data-cat="${p}"].lg-cat-tab`).focus(); }
    });
  });

  activate('high-intent');
})();

/* ── 9. Animated Stat Counters ── */
(function(){
  const cards = $$('.lg-stat-card'); if(!cards.length) return;
  const easeOutQuart = t => 1-Math.pow(1-t,4);
  function run(card, target, dur=1800){
    const numEl = card.querySelector('.lg-stat-num'); if(!numEl) return;
    const start = performance.now();
    (function tick(now){
      const prog = Math.min((now-start)/dur,1);
      numEl.textContent = Math.round(easeOutQuart(prog)*target).toLocaleString();
      if(prog<1) requestAnimationFrame(tick);
      else { numEl.textContent=target.toLocaleString(); card.classList.add('counted'); }
    })(start);
  }
  const obs = new IntersectionObserver(entries => {
    entries.forEach((e,i) => { if(e.isIntersecting){ const t=parseInt(e.target.dataset.target,10); if(!isNaN(t)) setTimeout(()=>run(e.target,t),i*130); obs.unobserve(e.target); } });
  }, {threshold:0.4});
  cards.forEach(c => obs.observe(c));
})();

/* ── 10. Workflow Step Highlight ── */
(function(){
  const steps = $$('.lg-how-step'); if(!steps.length) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if(e.isIntersecting){
        e.target.style.borderColor='rgba(31,235,176,.25)';
        e.target.style.boxShadow='0 0 0 1px rgba(31,235,176,.08),0 8px 32px rgba(0,0,0,.25)';
        setTimeout(()=>{ e.target.style.borderColor=''; e.target.style.boxShadow=''; }, 1600);
      }
    });
  }, {threshold:0.5});
  steps.forEach(s => obs.observe(s));
})();

/* ── 11. FAQ Accordion ── */
(function(){
  const items = $$('.lg-faq-item'); if(!items.length) return;
  items.forEach(item => {
    const btn = item.querySelector('.lg-faq-q'), ans = item.querySelector('.lg-faq-a');
    if(!btn||!ans) return;
    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded')==='true';
      items.forEach(o => { const ob=o.querySelector('.lg-faq-q'),oa=o.querySelector('.lg-faq-a'); if(ob) ob.setAttribute('aria-expanded','false'); if(oa) oa.classList.remove('open'); });
      btn.setAttribute('aria-expanded', open?'false':'true');
      ans.classList.toggle('open',!open);
    });
    btn.addEventListener('keydown',e=>{ if(e.key==='Enter'||e.key===' '){e.preventDefault();btn.click();} });
  });
})();

/* ── 12. Smooth Anchor Scroll ── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id=a.getAttribute('href'), target=id==='#'?null:document.querySelector(id);
    if(!target) return; e.preventDefault();
    window.scrollTo({top:target.getBoundingClientRect().top+window.scrollY-80,behavior:'smooth'});
  });
});

/* ── 13. Back-to-Top ── */
(function(){
  const btn = $('#back-to-top'); if(!btn) return;
  window.addEventListener('scroll', ()=>btn.classList.toggle('visible',window.scrollY>400), {passive:true});
  btn.addEventListener('click', ()=>window.scrollTo({top:0,behavior:'smooth'}));
})();

/* ── 14. Demo Modal — 3-Step Funnel ── */
(function(){
  const overlay=$('#demo-overlay'),closeBtn=$('#demo-close'),form=$('#demo-form'),
        visualPane=$('#demo-visual-pane'),formPane=$('#demo-form-pane'),
        progressFill=$('#demo-progress-fill'),step2Back=$('#step2-back'),
        confirmDone=$('#confirm-done'),confirmAck=$('#confirm-acknowledge'),
        confirmCal=$('#confirm-add-cal'),reschedule=$('#confirm-reschedule');
  if(!overlay) return;

  let currentStep=1, selectedDate=null, selectedTime=null, calViewDate=new Date();

  /* ─ Navigation ─ */
  function goToStep(n){
    const leaving=$(`#modal-step-${currentStep}`), entering=$(`#modal-step-${n}`);
    if(!leaving||!entering) return;
    leaving.classList.add('demo-step-leaving');
    setTimeout(()=>{
      leaving.classList.add('demo-step-hidden'); leaving.classList.remove('demo-step-leaving');
      entering.classList.remove('demo-step-hidden'); entering.classList.add('demo-step-entering');
      requestAnimationFrame(()=>requestAnimationFrame(()=>entering.classList.remove('demo-step-entering')));
      currentStep=n; updateProgress(n); syncVisualPane(n);
      if(formPane) formPane.scrollTop=0;
      const f=entering.querySelector('h2,button,input,select'); if(f) setTimeout(()=>f.focus(),80);
    },260);
  }
  function updateProgress(step){
    const pct={1:'33%',2:'66%',3:'100%'};
    if(progressFill) progressFill.style.width=pct[step]||'33%';
    $$('.progress-label').forEach(el=>{ el.classList.toggle('progress-label-active',+el.dataset.step===step); el.classList.toggle('progress-label-done',+el.dataset.step<step); });
    $$('.step-pill').forEach(el=>{ el.classList.toggle('step-pill-active',+el.dataset.forStep===step); el.classList.toggle('step-pill-done',+el.dataset.forStep<step); });
  }
  function syncVisualPane(step){
    if(!visualPane||!formPane) return;
    visualPane.classList.toggle('demo-visual-hidden',step===3);
    formPane.classList.toggle('demo-pane-full',step===3);
  }

  /* ─ Open / Close ─ */
  function openModal(){
    overlay.removeAttribute('aria-hidden'); overlay.classList.add('open');
    document.body.style.overflow='hidden';
    setTimeout(()=>{ const f=form&&form.querySelector('input,select'); if(f) f.focus(); },340);
  }
  function closeModal(){
    overlay.classList.remove('open'); document.body.style.overflow='';
    setTimeout(()=>{ overlay.setAttribute('aria-hidden','true'); resetModal(); },420);
  }
  function resetModal(){
    if(form){ form.reset(); clearAllErrors(); }
    selectedDate=null; selectedTime=null; calViewDate=new Date();
    $$('.demo-step').forEach(s=>s.classList.add('demo-step-hidden'));
    const s1=$('#modal-step-1'); if(s1) s1.classList.remove('demo-step-hidden');
    currentStep=1; updateProgress(1); syncVisualPane(1);
    const sb=form&&form.querySelector('.demo-submit'); if(sb){ sb.textContent='NEXT: SELECT A TIME →'; sb.disabled=false; }
  }

  document.addEventListener('click',e=>{
    if(e.target.closest('.lg-open-modal')){ e.preventDefault(); openModal(); return; }
    const btn=e.target.closest('.btn-primary,.btn-ghost'); if(!btn) return;
    if(btn.type==='submit') return; if(btn.closest('#demo-modal')) return;
    const href=btn.getAttribute('href')||''; if(href.startsWith('#')&&href!='#') return;
    e.preventDefault(); openModal();
  });

  closeBtn && closeBtn.addEventListener('click',closeModal);
  confirmAck && confirmAck.addEventListener('click',closeModal);
  confirmDone && confirmDone.addEventListener('click',closeModal);
  overlay.addEventListener('click',e=>{ if(e.target===overlay) closeModal(); });
  document.addEventListener('keydown',e=>{ if(e.key==='Escape'&&overlay.classList.contains('open')) closeModal(); });

  /* ─ Step 1 Validation ─ */
  const rules={
    'first-name':{required:true,label:'First name'},
    'last-name':{required:true,label:'Last name'},
    'email':{required:true,label:'Email',pattern:/^[^\s@]+@[^\s@]+\.[^\s@]+$/,patternMsg:'Please enter a valid email address.'},
    'phone':{required:true,label:'Phone number',pattern:/^[\d\s()\-+.]{7,}$/,patternMsg:'Please enter a valid phone number.'},
    'agent-type':{required:true,label:'Business type'},
    'is-customer':{required:true,label:'Customer status'},
  };
  function showError(id,msg){ const f=$(`#field-${id}`),e=$(`#err-${id}`); if(f) f.classList.add('has-error'); if(e) e.textContent=msg; }
  function clearError(id){ const f=$(`#field-${id}`),e=$(`#err-${id}`); if(f) f.classList.remove('has-error'); if(e) e.textContent=''; }
  function clearAllErrors(){ Object.keys(rules).forEach(id=>clearError(id)); }
  function validateField(id){
    const rule=rules[id]; if(!rule) return true;
    const el=$(`#${id}`); if(!el) return true;
    const val=el.value.trim();
    if(rule.required&&!val){ showError(id,`${rule.label} is required.`); return false; }
    if(rule.pattern&&val&&!rule.pattern.test(val)){ showError(id,rule.patternMsg); return false; }
    clearError(id); return true;
  }
  if(form){
    Object.keys(rules).forEach(id=>{ const el=$(`#${id}`); if(!el) return; el.addEventListener('blur',()=>validateField(id)); el.addEventListener('input',()=>{ const f=$(`#field-${id}`); if(f&&f.classList.contains('has-error')) validateField(id); }); });
    form.addEventListener('submit',e=>{
      e.preventDefault();
      const valid=Object.keys(rules).map(id=>validateField(id)).every(Boolean);
      if(!valid){ const fe=form.querySelector('.has-error .demo-input,.has-error .demo-select'); if(fe) fe.focus(); return; }
      const sb=form.querySelector('.demo-submit'); sb.textContent='Just a moment…'; sb.disabled=true;
      setTimeout(()=>{ sb.textContent='NEXT: SELECT A TIME →'; sb.disabled=false; buildCalendar(calViewDate); goToStep(2); },700);
    });
  }

  /* ─ Step 2 Calendar ─ */
  const TIME_SLOTS=['9:00 AM','9:30 AM','10:00 AM','10:30 AM','11:00 AM','11:30 AM','1:00 PM','1:30 PM','2:00 PM','2:30 PM','3:00 PM','3:30 PM','4:00 PM'];
  const isWeekend=d=>[0,6].includes(d.getDay());
  const isPast=d=>{ const t=new Date(); t.setHours(0,0,0,0); return d<t; };

  function buildCalendar(vd){
    const grid=$('#cal-grid'), lbl=$('#cal-month-label'); if(!grid||!lbl) return;
    const yr=vd.getFullYear(), mo=vd.getMonth();
    lbl.textContent=vd.toLocaleDateString('en-US',{month:'long',year:'numeric'});
    const firstDay=new Date(yr,mo,1).getDay(), daysInMo=new Date(yr,mo+1,0).getDate();
    grid.innerHTML='';
    for(let i=0;i<firstDay;i++){ const b=document.createElement('div'); b.className='cal-cell cal-blank'; grid.appendChild(b); }
    for(let d=1;d<=daysInMo;d++){
      const date=new Date(yr,mo,d), cell=document.createElement('button');
      cell.type='button'; cell.textContent=d; cell.className='cal-cell';
      cell.setAttribute('aria-label',date.toLocaleDateString('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric'}));
      if(isPast(date)||isWeekend(date)){ cell.classList.add('cal-cell-disabled'); cell.disabled=true; cell.setAttribute('aria-disabled','true'); }
      else {
        if(selectedDate&&selectedDate.getDate()===d&&selectedDate.getMonth()===mo&&selectedDate.getFullYear()===yr) cell.classList.add('cal-cell-selected');
        cell.addEventListener('click',()=>selectDate(date,cell));
      }
      grid.appendChild(cell);
    }
    renderTimeSlots();
  }
  function selectDate(date,cell){ selectedDate=date; selectedTime=null; $$('.cal-cell-selected').forEach(c=>c.classList.remove('cal-cell-selected')); cell.classList.add('cal-cell-selected'); renderTimeSlots(); }
  function renderTimeSlots(){
    const wrap=$('#cal-times-wrap'),lbl=$('#cal-times-label'),tGrid=$('#cal-times-grid');
    if(!wrap||!lbl||!tGrid) return;
    if(!selectedDate){ lbl.textContent='Select a date to see available times'; tGrid.innerHTML=''; return; }
    lbl.textContent=`Available times for ${selectedDate.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'})}`;
    tGrid.innerHTML='';
    TIME_SLOTS.forEach(slot=>{ const btn=document.createElement('button'); btn.type='button'; btn.className='cal-time-btn'; btn.textContent=slot; if(selectedTime===slot) btn.classList.add('cal-time-selected'); btn.addEventListener('click',()=>selectTime(slot,btn)); tGrid.appendChild(btn); });
  }
  function selectTime(slot,btn){ selectedTime=slot; $$('.cal-time-selected').forEach(b=>b.classList.remove('cal-time-selected')); btn.classList.add('cal-time-selected'); btn.disabled=true; setTimeout(()=>{ btn.disabled=false; populateConfirmation(); goToStep(3); },450); }
  const calPrev=$('#cal-prev-month'), calNext=$('#cal-next-month');
  calPrev&&calPrev.addEventListener('click',()=>{ calViewDate.setMonth(calViewDate.getMonth()-1); buildCalendar(calViewDate); });
  calNext&&calNext.addEventListener('click',()=>{ calViewDate.setMonth(calViewDate.getMonth()+1); buildCalendar(calViewDate); });
  step2Back&&step2Back.addEventListener('click',()=>goToStep(1));

  /* ─ Step 3 Confirmation ─ */
  function populateConfirmation(){
    if(selectedDate&&selectedTime){
      const ds=selectedDate.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'});
      const tz=Intl.DateTimeFormat().resolvedOptions().timeZone.replace(/_/g,' ');
      const dtEl=$('#confirm-datetime'); if(dtEl) dtEl.textContent=`${ds} · ${selectedTime} (${tz})`;
    }
    const emailEl=$('#email'), guestEl=$('#confirm-guests');
    if(emailEl&&guestEl) guestEl.textContent=emailEl.value.trim()||'—';
  }
  confirmCal&&confirmCal.addEventListener('click',()=>{
    if(!selectedDate||!selectedTime) return;
    const [tp,mer]=selectedTime.split(' '); let [h,m]=tp.split(':').map(Number);
    if(mer==='PM'&&h!==12) h+=12; if(mer==='AM'&&h===12) h=0;
    const start=new Date(selectedDate); start.setHours(h,m,0,0);
    const end=new Date(start.getTime()+30*60*1000);
    const fmt=d=>d.toISOString().replace(/[-:]/g,'').split('.')[0]+'Z';
    window.open(`https://calendar.google.com/calendar/r/eventedit?text=N3X+Lead+Generation+Audit&dates=${fmt(start)}/${fmt(end)}&details=Free+lead+generation+audit+with+N3X+Realty.+We'll+map+every+lead+source+opportunity+in+your+market+and+show+you+exactly+what+we'd+build.&location=Zoom+/+Phone`,'_blank','noopener,noreferrer');
  });
  reschedule&&reschedule.addEventListener('click',e=>{ e.preventDefault(); selectedTime=null; goToStep(2); });
})();
