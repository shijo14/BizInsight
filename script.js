/* ===========================
   BIZINSIGHT — script.js
   =========================== */

// ======= THEME TOGGLE =======
(function initTheme() {
  const html     = document.documentElement;
  const buttons  = document.querySelectorAll('.theme-btn');
  const THEMES   = ['dark', 'modern', 'light'];

  // Restore saved theme
  const saved = localStorage.getItem('bizinsight-theme') || 'light';
  applyTheme(saved);

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      applyTheme(btn.dataset.themeTarget);
    });
  });

  function applyTheme(theme) {
    if (!THEMES.includes(theme)) theme = 'light';
    html.dataset.theme = theme;
    localStorage.setItem('bizinsight-theme', theme);

    // Update active button state
    buttons.forEach(btn => {
      const isActive = btn.dataset.themeTarget === theme;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-pressed', isActive);
    });

    // Re-colour particle canvas for the new theme
    if (window._particleColors) {
      window._particleColors.length = 0;
      if (theme === 'dark') {
        window._particleColors.push('rgba(99,102,241,', 'rgba(6,182,212,', 'rgba(168,85,247,');
      } else if (theme === 'modern') {
        window._particleColors.push('rgba(168,85,247,', 'rgba(236,72,153,', 'rgba(99,102,241,');
      } else {
        window._particleColors.push('rgba(79,70,229,', 'rgba(8,145,178,', 'rgba(124,58,237,');
      }
    }
  }
})();

// ======= NAVBAR SCROLL =======
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
});

// ======= HAMBURGER MENU / SIDEBAR (Logic handled in index.html) =======

// ======= SCROLL REVEAL =======
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ======= ANIMATED COUNTERS =======
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el    = entry.target;
      const target = parseInt(el.dataset.target, 10);
      const duration = 1800;
      const step  = Math.ceil(target / (duration / 16));
      let current = 0;
      const timer = setInterval(() => {
        current = Math.min(current + step, target);
        el.textContent = current;
        if (current >= target) clearInterval(timer);
      }, 16);
      counterObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-num').forEach(el => counterObserver.observe(el));

// ======= TECH BAR ANIMATION =======
const techObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.tech-fill').forEach(bar => {
        setTimeout(() => bar.classList.add('animated'), 200);
      });
      techObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });

document.querySelectorAll('.tech-card').forEach(card => techObserver.observe(card));

// ======= PARTICLE CANVAS =======
(function initParticles() {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, particles = [];

  // Exposed so theme switcher can update live
  window._particleColors = ['rgba(99,102,241,', 'rgba(6,182,212,', 'rgba(168,85,247,'];
  const COLORS = window._particleColors;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }
  window.addEventListener('resize', () => { resize(); initP(); });
  resize();

  function rand(min, max) { return Math.random() * (max - min) + min; }

  function initP() {
    const count = Math.min(Math.floor(W / 20), 80);
    particles = Array.from({ length: count }, () => ({
      x: rand(0, W),
      y: rand(0, H),
      r: rand(0.5, 2.5),
      dx: rand(-0.3, 0.3),
      dy: rand(-0.3, 0.3),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      alpha: rand(0.2, 0.7),
    }));
  }
  initP();

  function draw() {
    ctx.clearRect(0, 0, W, H);
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color + p.alpha + ')';
      ctx.fill();

      // connect nearby particles
      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        const dx = p.x - q.x, dy = p.y - q.y;
        if (Math.abs(dx) > 110 || Math.abs(dy) > 110) continue;
        const distSq = dx * dx + dy * dy;
        if (distSq < 12100) {
          const dist = Math.sqrt(distSq);
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = p.color + (0.08 * (1 - dist / 110)) + ')';
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }

      p.x += p.dx;
      p.y += p.dy;
      if (p.x < 0 || p.x > W) p.dx *= -1;
      if (p.y < 0 || p.y > H) p.dy *= -1;
    }
    requestAnimationFrame(draw);
  }
  draw();
})();

// ======= SVG GRADIENT for chart line =======
(function addSVGGrad() {
  const ns  = 'http://www.w3.org/2000/svg';
  const svg = document.querySelector('.chart-line svg');
  if (!svg) return;
  const defs = document.createElementNS(ns, 'defs');
  const grad = document.createElementNS(ns, 'linearGradient');
  grad.setAttribute('id', 'lineGrad');
  grad.setAttribute('x1', '0%'); grad.setAttribute('y1', '0%');
  grad.setAttribute('x2', '100%'); grad.setAttribute('y2', '0%');
  const s1 = document.createElementNS(ns, 'stop');
  s1.setAttribute('offset', '0%');   s1.setAttribute('stop-color', '#6366f1');
  const s2 = document.createElementNS(ns, 'stop');
  s2.setAttribute('offset', '100%'); s2.setAttribute('stop-color', '#06b6d4');
  grad.appendChild(s1); grad.appendChild(s2);
  defs.appendChild(grad);
  svg.insertBefore(defs, svg.firstChild);
})();

// ======= SMOOTH ACTIVE NAV HIGHLIGHT =======
const sections = document.querySelectorAll('section[id], footer');
const navAnchs = document.querySelectorAll('.sb-item[href]');
window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 120) current = sec.id;
  });
  navAnchs.forEach(a => {
    const href = a.getAttribute('href');
    a.classList.toggle('active', href === '#' + current || (current === 'home' && href === '#home'));
  });
}, { passive: true });

// ======= FEATURE CARD MOUSE TILT =======
document.querySelectorAll('.feature-card, .tech-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width  / 2;
    const y = e.clientY - rect.top  - rect.height / 2;
    const rx =  (y / rect.height) * 6;
    const ry = -(x / rect.width)  * 6;
    card.style.transform = `translateY(-6px) perspective(600px) rotateX(${rx}deg) rotateY(${ry}deg)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});

// ======= TYPING ANIMATION IN HERO BADGE =======
(function typeBadge() {
  const badge = document.querySelector('.hero-badge');
  if (!badge) return;
  const originalText = badge.textContent.trim().replace(/^\s*\S+\s*/, ''); // strip dot
  // already set via HTML — just add a class after load
  badge.style.opacity = '0';
  setTimeout(() => {
    badge.style.transition = 'opacity 0.8s ease';
    badge.style.opacity = '1';
  }, 300);
})();

// ======= ORBIT NODES CONTINUOUS ROTATION =======
(function animateOrbit() {
  const nodes = document.querySelectorAll('.orbit-node');
  const radius = 140;
  let angle = 0;
  const baseAngles = [0, 72, 144, 216, 288];

  function step(ts) {
    angle = ts * 0.02; // degrees per ms * speed
    nodes.forEach((node, i) => {
      const deg = (baseAngles[i] + angle) * (Math.PI / 180);
      const x = Math.cos(deg) * radius;
      const y = Math.sin(deg) * radius;
      node.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
    });
    requestAnimationFrame(step);
  }
  if (nodes.length) requestAnimationFrame(step);
})();

/* ============================================================
   AI & ML DEMO MODAL
   ============================================================ */
(function initAiDemo() {

  /* ── Shared Helpers ── */
  const $ = id => document.getElementById(id);
  const modal   = $('aiDemoModal');
  const openBtn = $('openAiDemo');
  const closeBtn= $('closeAiDemo');
  if (!modal || !openBtn) return;

  // Open / close
  openBtn.addEventListener('click', () => {
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    initAnomalyCanvas();
  });
  const closeModal = () => {
    modal.hidden = true;
    document.body.style.overflow = '';
  };
  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !modal.hidden) closeModal(); });

  /* ── Tab Switching ── */
  document.querySelectorAll('#aiDemoModal .ai-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('#aiDemoModal .ai-tab').forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      document.querySelectorAll('#aiDemoModal .ai-tab-panel').forEach(p => {
        p.classList.remove('active');
        p.hidden = true;
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      const panel = document.getElementById('panel-' + tab.dataset.tab);
      if (panel) { panel.classList.add('active'); panel.hidden = false; }
      if (tab.dataset.tab === 'anomaly') initAnomalyCanvas();
    });
  });

  /* ====================================================
     TAB 1 — ANOMALY DETECTION
     ==================================================== */
  let anomalyPoints = [];
  let anomalyInitialized = false;

  // Seed baseline data
  async function seedBaselinePoints() {
    try {
      const res = await fetch('https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1h&limit=15');
      const data = await res.json();
      const base = data.map(d => parseFloat(d[4])); // Closing prices
      anomalyPoints = base.map((v, i) => ({ x: i, rawY: v, isAnomaly: false, isNew: false }));
      detectAnomalies();
      drawAnomalyCanvas();
      $('anomalyLog').innerHTML = '';
      addAnomalyLog('✅ Loaded live BTC/USDT hourly price data (Binance API)', 'success');
      
      const anomalies = anomalyPoints.filter(p => p.isAnomaly);
      if (anomalies.length > 0) {
        addAnomalyLog(`⚠️ Detected ${anomalies.length} anomaly point(s) in recent data`, 'warn');
      }
    } catch(err) {
      console.warn('Binance API failed, falling back to mock data', err);
      const base = [42,48,45,50,47,44,140,46,43,51,49,45];
      anomalyPoints = base.map((v, i) => ({ x: i, rawY: v, isAnomaly: false, isNew: false }));
      detectAnomalies();
      drawAnomalyCanvas();
      $('anomalyLog').innerHTML = '';
      addAnomalyLog('✅ Baseline model trained on 12 points', 'success');
      addAnomalyLog('⚠️ Point #7 flagged — value deviation: +2.4σ', 'warn');
    }
  }

  function detectAnomalies() {
    const vals = anomalyPoints.map(p => p.rawY);
    const mean = vals.reduce((a,b)=>a+b,0)/vals.length;
    const std  = Math.sqrt(vals.reduce((s,v)=>s+Math.pow(v-mean,2),0)/vals.length) || 1;
    anomalyPoints.forEach(p => { p.isAnomaly = Math.abs(p.rawY - mean) > 2.2 * std; });
    return { mean, std };
  }

  function drawAnomalyCanvas() {
    const canvas = $('anomalyCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    if (anomalyPoints.length === 0) return;
    const vals = anomalyPoints.map(p => p.rawY);
    const minV = Math.min(...vals) - 10;
    const maxV = Math.max(...vals) + 10;
    const padL = 36, padR = 16, padT = 16, padB = 28;
    const cW = W - padL - padR;
    const cH = H - padT - padB;
    const n  = anomalyPoints.length;

    // Grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padT + (cH / 4) * i;
      ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(padL + cW, y); ctx.stroke();
      const label = Math.round(maxV - ((maxV - minV) / 4) * i);
      ctx.fillStyle = 'rgba(148,163,184,0.6)';
      ctx.font = '10px Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(label, padL - 4, y + 4);
    }

    // Line connecting points
    ctx.beginPath();
    anomalyPoints.forEach((p, i) => {
      const x = padL + (i / (n - 1 || 1)) * cW;
      const y = padT + cH - ((p.rawY - minV) / (maxV - minV)) * cH;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.strokeStyle = 'rgba(99,102,241,0.35)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Data points
    anomalyPoints.forEach((p, i) => {
      const x = padL + (i / (n - 1 || 1)) * cW;
      const y = padT + cH - ((p.rawY - minV) / (maxV - minV)) * cH;
      const r = p.isNew ? 7 : 5;

      if (p.isAnomaly) {
        // Glow
        const grd = ctx.createRadialGradient(x, y, 0, x, y, 14);
        grd.addColorStop(0, 'rgba(239,68,68,0.3)');
        grd.addColorStop(1, 'rgba(239,68,68,0)');
        ctx.fillStyle = grd;
        ctx.beginPath(); ctx.arc(x, y, 14, 0, Math.PI*2); ctx.fill();
      }

      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = p.isNew ? '#10b981' : (p.isAnomaly ? '#ef4444' : '#6366f1');
      ctx.fill();
      ctx.strokeStyle = p.isNew ? 'rgba(16,185,129,0.5)' : (p.isAnomaly ? 'rgba(239,68,68,0.4)' : 'rgba(99,102,241,0.4)');
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });

    // X-axis labels
    ctx.fillStyle = 'rgba(100,116,139,0.7)';
    ctx.font = '9px Inter, sans-serif';
    ctx.textAlign = 'center';
    anomalyPoints.forEach((_, i) => {
      if (n <= 20 || i % 2 === 0) {
        const x = padL + (i / (n - 1 || 1)) * cW;
        ctx.fillText('T' + (i + 1), x, H - 6);
      }
    });
  }

  function updateAnomalyUI() {
    const { std } = detectAnomalies();
    drawAnomalyCanvas();
    const anomCount = anomalyPoints.filter(p => p.isAnomaly).length;
    $('totalPoints').textContent  = anomalyPoints.length;
    $('anomalyCount').textContent = anomCount;
    $('anomalyScore').textContent = Math.round(88 + Math.random() * 10) + '%';

    const statusEl = $('anomalyStatus');
    if (anomCount > 0) {
      statusEl.classList.add('danger');
      $('anomalyStatusIcon').textContent  = '🔴';
      $('anomalyStatusTitle').textContent = anomCount + ' Anomal' + (anomCount > 1 ? 'ies' : 'y') + ' Detected';
      $('anomalyStatusSub').textContent   = 'Z-score threshold exceeded';
    } else {
      statusEl.classList.remove('danger');
      $('anomalyStatusIcon').textContent  = '🟢';
      $('anomalyStatusTitle').textContent = 'System Normal';
      $('anomalyStatusSub').textContent   = 'All points within 2.2σ bounds';
    }
  }

  function addAnomalyLog(msg, cls='') {
    const log = $('anomalyLog');
    const div = document.createElement('div');
    div.className = 'log-entry' + (cls ? ' ' + cls : '');
    div.textContent = msg;
    log.appendChild(div);
    log.scrollTop = log.scrollHeight;
  }

  function initAnomalyCanvas() {
    if (anomalyInitialized) { drawAnomalyCanvas(); return; }
    anomalyInitialized = true;
    seedBaselinePoints(); // This is now async, it will draw when ready
    drawAnomalyCanvas(); // Draws empty or initial state immediately

    const wrap = document.querySelector('.anomaly-chart-wrap');
    if (!wrap) return;
    wrap.addEventListener('click', (e) => {
      if (anomalyPoints.length === 0) return; // Wait for data
      const canvas = $('anomalyCanvas');
      const rect   = canvas.getBoundingClientRect();
      const scaleX = canvas.width  / rect.width;
      const scaleY = canvas.height / rect.height;
      const cx = (e.clientX - rect.left) * scaleX;
      const cy = (e.clientY - rect.top)  * scaleY;

      const padL=36,padR=16,padT=16,padB=28;
      const cH = canvas.height - padT - padB;
      const vals = anomalyPoints.map(p=>p.rawY);
      const minV = Math.min(...vals)-10, maxV=Math.max(...vals)+10;
      const rawY = Math.max(0, maxV - ((cy - padT) / cH) * (maxV - minV)); // Remove rounding so floats work for BTC prices

      anomalyPoints.forEach(p => p.isNew = false);
      const newPt = { x: anomalyPoints.length, rawY, isAnomaly: false, isNew: true };
      anomalyPoints.push(newPt);
      updateAnomalyUI();

      const { mean, std } = detectAnomalies();
      const dev = ((rawY - mean) / std).toFixed(2);
      if (newPt.isAnomaly) {
        addAnomalyLog(`⚠️ Point #${anomalyPoints.length} flagged — deviation: ${dev > 0 ? '+' : ''}${dev}σ`, 'warn');
      } else {
        addAnomalyLog(`✅ Point #${anomalyPoints.length} added — Z-score: ${dev > 0 ? '+' : ''}${dev}σ`, 'success');
      }
    });

    $('resetAnomalyBtn').addEventListener('click', () => {
      anomalyPoints = [];
      $('anomalyLog').innerHTML = '<div style="color:var(--text-dim);font-size:0.85rem;">Resetting and fetching latest data...</div>';
      drawAnomalyCanvas();
      seedBaselinePoints();
    });
  }

  /* ====================================================
     TAB 2 — RECOMMENDATION ENGINE
     ==================================================== */
  const sentimentSlider = $('recSentiment');
  const sentimentVal    = $('sentimentVal');
  if (sentimentSlider) {
    sentimentSlider.addEventListener('input', () => {
      sentimentVal.textContent = sentimentSlider.value;
    });
  }

  const REC_TEMPLATES = {
    retail: [
      { icon:'📦', title:'Optimize Inventory Turnover', priority:'high', color:'#ef4444',
        body:'Your current stock velocity suggests overstocking in 3 categories. Reducing reorder points by 18% can free ≈$12K in working capital.',
        metric:'Projected savings', value:'$12,400 / month', score: 88 },
      { icon:'💬', title:'Launch Loyalty SMS Campaign', priority:'medium', color:'#f59e0b',
        body:'Based on your churn pattern, re-engagement campaigns targeting lapsed customers within 30 days increase retention by 22% on average.',
        metric:'Predicted retention lift', value:'+22%', score: 74 },
      { icon:'📊', title:'Expand Peak-Hour Staffing', priority:'low', color:'#10b981',
        body:'Traffic analysis shows 37% of daily revenue concentrates between 5–8 PM. Optimizing shift schedules could reduce lost sales by 9%.',
        metric:'Est. revenue recovery', value:'+9% daily', score: 61 },
    ],
    saas: [
      { icon:'🔔', title:'Reduce Churn with In-App Nudges', priority:'high', color:'#ef4444',
        body:'Users with <3 logins/week have 4× higher churn risk. Trigger an in-app engagement sequence to re-activate them before day 14.',
        metric:'Projected churn reduction', value:'-31%', score: 91 },
      { icon:'💰', title:'Introduce Annual Billing Incentive', priority:'medium', color:'#f59e0b',
        body:'Switching 20% of monthly users to annual plans would improve ARR predictability and reduce payment failure churn by an estimated 18%.',
        metric:'ARR uplift', value:'+$28K', score: 77 },
      { icon:'🧪', title:'A/B Test Onboarding Flow', priority:'low', color:'#10b981',
        body:'Shortening your onboarding from 7 to 4 steps correlates with 40% higher Day-7 activation in similar SaaS profiles.',
        metric:'Activation improvement', value:'+40% D7', score: 65 },
    ],
    finance: [
      { icon:'🛡️', title:'Enhance Fraud Detection Model', priority:'high', color:'#ef4444',
        body:'Transaction velocity spikes detected in 2 customer segments suggest model re-training is overdue. Update threshold parameters immediately.',
        metric:'False-negative reduction', value:'-44%', score: 93 },
      { icon:'📈', title:'Upsell Investment Products', priority:'medium', color:'#f59e0b',
        body:'Customers with >$50K average balance and stable sentiment are prime candidates for wealth management upsell — 68% conversion likelihood.',
        metric:'Upsell conversion', value:'68% prob.', score: 71 },
      { icon:'⚙️', title:'Automate KYC Verification', priority:'low', color:'#10b981',
        body:'Manual KYC processes add 3.2 days average onboarding delay. ML-driven document verification can reduce this to <4 hours.',
        metric:'Onboarding speed', value:'19× faster', score: 58 },
    ],
    healthcare: [
      { icon:'📋', title:'Prioritize High-Risk Patient Follow-Ups', priority:'high', color:'#ef4444',
        body:'Predictive models identify 14% of your patient cohort as high readmission risk within 30 days. Proactive outreach reduces re-admissions by 26%.',
        metric:'Readmission reduction', value:'-26%', score: 89 },
      { icon:'🗓️', title:'Optimize Appointment Scheduling', priority:'medium', color:'#f59e0b',
        body:'No-show pattern analysis shows Tuesday 9–11 AM has 32% higher cancellation rates. Dynamic slot pricing or confirmation nudges can recover 60% of those slots.',
        metric:'Slot recovery', value:'+60% Tue AM', score: 72 },
      { icon:'💊', title:'Medication Adherence Alert System', priority:'low', color:'#10b981',
        body:'Integrating prescription refill data with patient sentiment allows early identification of non-adherence, improving outcomes for chronic conditions.',
        metric:'Adherence improvement', value:'+19%', score: 64 },
    ],
    manufacturing: [
      { icon:'⚠️', title:'Predictive Maintenance Scheduling', priority:'high', color:'#ef4444',
        body:'Vibration and temperature sensor data shows Machine Line 3 has 87% probability of failure within 14 days. Schedule maintenance now to avoid $45K downtime.',
        metric:'Avoided downtime cost', value:'$45,000', score: 94 },
      { icon:'🏭', title:'Reduce Defect Rate with Vision AI', priority:'medium', color:'#f59e0b',
        body:'Computer vision QC can detect surface defects 12× faster than manual inspection and reduce defect escape rate from 2.1% to 0.3%.',
        metric:'Defect escape reduction', value:'-86%', score: 79 },
      { icon:'📦', title:'Just-in-Time Inventory Optimization', priority:'low', color:'#10b981',
        body:'Aligning supplier lead times with production forecasts can reduce raw material holding costs by 23% without impacting throughput.',
        metric:'Inventory cost savings', value:'-23%', score: 67 },
    ],
  };

  function buildRecCard(rec, delay) {
    const div = document.createElement('div');
    div.className = 'rec-card';
    div.style.animationDelay = delay + 'ms';
    div.innerHTML = `
      <div class="rec-card-header">
        <div class="rec-card-icon" style="background:${rec.color}22; border:1px solid ${rec.color}44;">${rec.icon}</div>
        <div class="rec-card-title">${rec.title}</div>
        <span class="rec-card-priority priority-${rec.priority}">${rec.priority}</span>
      </div>
      <div class="rec-card-body">${rec.body}</div>
      <div class="rec-card-metric">📊 ${rec.metric}: <strong>${rec.value}</strong></div>
      <div class="rec-score-bar"><div class="rec-score-fill" style="width:0%; background:linear-gradient(90deg,${rec.color},${rec.color}99);"></div></div>
    `;
    return div;
  }

  $('runRecommendBtn') && $('runRecommendBtn').addEventListener('click', () => {
    const rev      = parseFloat($('recRevenue').value) || 0;
    const growth   = parseFloat($('recGrowth').value)  || 0;
    const churn    = parseFloat($('recChurn').value)    || 0;
    const sentiment= parseInt($('recSentiment').value, 10);
    const industry = $('recIndustry').value;

    const results = $('recResults');
    results.innerHTML = '<div class="rec-loading"><div class="rec-spinner"></div> Analyzing business profile…</div>';

    setTimeout(() => {
      // Pick template; adjust priority based on inputs
      const tpl = JSON.parse(JSON.stringify(REC_TEMPLATES[industry] || REC_TEMPLATES.saas));
      if (churn > 10)    tpl[0].priority = 'high';
      if (growth < 5)    tpl[1].priority = 'high';
      if (sentiment < 50) { tpl[2].priority = 'medium'; tpl[2].icon = '😟'; tpl[2].title = 'Address Negative Sentiment'; }

      results.innerHTML = '';
      const header = document.createElement('div');
      header.style.cssText = 'font-size:0.75rem;color:var(--text-dim);margin-bottom:4px;padding:0 2px;';
      header.textContent = `🤖 AI generated ${tpl.length} recommendations for your ${industry} profile:`;
      results.appendChild(header);

      tpl.forEach((rec, i) => {
        const card = buildRecCard(rec, i * 120);
        results.appendChild(card);
        // Animate score bar after insert
        setTimeout(() => {
          const fill = card.querySelector('.rec-score-fill');
          if (fill) fill.style.width = rec.score + '%';
        }, 200 + i * 120);
      });
    }, 1200);
  });

  /* ====================================================
     TAB 3 — DATA PIPELINE
     ==================================================== */
  let pipelineRunning = false;

  const PIPELINE_STEPS = [
    {
      id: 'ps-ingest', label: 'Data Ingestion', duration: 1800,
      logs: [
        { t:100,  cls:'info',    msg:'[INIT] Connecting to data sources…' },
        { t:400,  cls:'dim',     msg:'[CRM] Fetching 1,240 customer records' },
        { t:700,  cls:'dim',     msg:'[POS] Streaming 8,452 transaction rows' },
        { t:1100, cls:'dim',     msg:'[API] Pulling social sentiment feed' },
        { t:1600, cls:'success', msg:'[DONE] Ingested 9,692 records — 0 errors' },
      ]
    },
    {
      id: 'ps-clean', label: 'Cleaning', duration: 1600,
      logs: [
        { t:100,  cls:'info',  msg:'[CLEAN] Scanning for null values…' },
        { t:500,  cls:'warn',  msg:'[WARN] 34 duplicate records found — removed' },
        { t:900,  cls:'dim',   msg:'[NORM] Normalizing numeric features (min-max)' },
        { t:1400, cls:'success', msg:'[DONE] Dataset cleaned: 9,658 rows retained' },
      ]
    },
    {
      id: 'ps-feature', label: 'Features', duration: 1400,
      logs: [
        { t:100,  cls:'info', msg:'[FEAT] Extracting temporal features…' },
        { t:500,  cls:'dim',  msg:'[FEAT] Computing 12 engineered variables' },
        { t:900,  cls:'dim',  msg:'[FEAT] PCA dimensionality reduction → 8 components' },
        { t:1200, cls:'success', msg:'[DONE] Feature matrix ready: 9,658 × 20' },
      ]
    },
    {
      id: 'ps-model', label: 'ML Inference', duration: 2000,
      logs: [
        { t:100,  cls:'info', msg:'[ML] Loading TensorFlow model v3.2.1…' },
        { t:400,  cls:'dim',  msg:'[ML] Running gradient boosted ensemble' },
        { t:800,  cls:'dim',  msg:'[ML] Inference batch 1/4 complete' },
        { t:1200, cls:'dim',  msg:'[ML] Inference batch 4/4 complete' },
        { t:1700, cls:'success', msg:'[DONE] Predictions generated — confidence: 96.3%' },
      ]
    },
    {
      id: 'ps-output', label: 'Output', duration: 1000,
      logs: [
        { t:100,  cls:'info', msg:'[OUT] Aggregating insight vectors…' },
        { t:500,  cls:'dim',  msg:'[OUT] Formatting dashboard payload' },
        { t:800,  cls:'success', msg:'[DONE] Insights ready — pipeline complete ✅' },
      ]
    },
  ];

  function pipelineLog(msg, cls='') {
    const log = $('pipelineLog');
    const line = document.createElement('div');
    line.className = 'plog-line' + (cls ? ' ' + cls : '');
    line.textContent = msg;
    log.appendChild(line);
    log.scrollTop = log.scrollHeight;
  }

  function resetPipelineUI() {
    document.querySelectorAll('.pipe-stage').forEach(el => {
      el.classList.remove('running', 'done');
      el.querySelector('.ps-status').textContent = 'Idle';
      el.querySelector('.ps-fill').style.width = '0%';
    });
    const result = $('pipelineResult');
    result.hidden = true;
    $('pipelineLog').innerHTML = '<div class="plog-placeholder">Click "Run Pipeline" to start the simulation</div>';
    $('runPipelineBtn').disabled  = false;
    $('resetPipelineBtn').disabled = true;
    pipelineRunning = false;
  }

  function animateStageBar(stageEl, durationMs) {
    const fill = stageEl.querySelector('.ps-fill');
    const start = performance.now();
    function tick(now) {
      const pct = Math.min(100, ((now - start) / durationMs) * 100);
      fill.style.width = pct + '%';
      if (pct < 100) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  async function runPipeline() {
    if (pipelineRunning) return;
    pipelineRunning = true;
    $('runPipelineBtn').disabled  = true;
    $('resetPipelineBtn').disabled = false;
    $('pipelineLog').innerHTML = '';
    $('pipelineResult').hidden = true;

    let elapsed = 0;
    for (const step of PIPELINE_STEPS) {
      const stageEl = $(step.id);
      stageEl.classList.add('running');
      stageEl.querySelector('.ps-status').textContent = 'Running…';
      animateStageBar(stageEl, step.duration);

      await new Promise(resolve => {
        step.logs.forEach(({ t, cls, msg }) => {
          setTimeout(() => pipelineLog(msg, cls), t);
        });
        setTimeout(resolve, step.duration);
      });

      stageEl.classList.remove('running');
      stageEl.classList.add('done');
      stageEl.querySelector('.ps-status').textContent = 'Done ✓';
      elapsed += step.duration;
    }

    // Show results
    const revenue     = (Math.random() * 30000 + 120000).toFixed(0);
    const churnRisk   = (Math.random() * 6 + 3).toFixed(1);
    const opportunity = (Math.random() * 15 + 18).toFixed(1);
    const confidence  = (Math.random() * 4 + 93).toFixed(1);

    $('prRevenue').textContent     = '$' + parseInt(revenue).toLocaleString();
    $('prChurn').textContent       = churnRisk + '%';
    $('prOpportunity').textContent = '+' + opportunity + '%';
    $('prConfidence').textContent  = confidence + '%';
    $('pipelineResult').hidden = false;

    pipelineRunning = false;
  }

  $('runPipelineBtn')   && $('runPipelineBtn').addEventListener('click', runPipeline);
  $('resetPipelineBtn') && $('resetPipelineBtn').addEventListener('click', resetPipelineUI);
  if ($('resetPipelineBtn')) $('resetPipelineBtn').disabled = true;

})();

/* ============================================================
   PREDICTIVE ANALYTICS DEMO MODAL
   ============================================================ */
(function initPredDemo() {
  const $ = id => document.getElementById(id);
  const modal = $('predDemoModal');
  const openBtn = $('openPredDemo');
  const closeBtn = $('closePredDemo');
  if (!modal || !openBtn) return;

  openBtn.addEventListener('click', () => {
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    if (!forecastDrawn) drawForecastChart();
  });
  
  const closeModal = () => {
    modal.hidden = true;
    document.body.style.overflow = '';
  };
  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !modal.hidden) closeModal(); });

  // Tabs
  document.querySelectorAll('#predDemoModal .ai-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('#predDemoModal .ai-tab').forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      document.querySelectorAll('#predDemoModal .ai-tab-panel').forEach(p => {
        p.classList.remove('active');
        p.hidden = true;
      });
      
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      const panel = $('ppanel-' + tab.dataset.ptab);
      if (panel) {
        panel.classList.add('active');
        panel.hidden = false;
      }
      
      if (tab.dataset.ptab === 'forecast' && !forecastDrawn) drawForecastChart();
    });
  });

  /* ── TAB 1: FORECAST CHART ── */
  let forecastDrawn = false;
  
  function drawForecastChart() {
    const canvas = $('forecastCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const baseRev = parseInt($('predBaseRevenue').value) || 45000;
    const period = parseInt($('predPeriod').value) || 12;
    const scenario = $('predScenario').value;
    
    let rate = 0.12; // moderate
    if (scenario === 'conservative') rate = 0.05;
    if (scenario === 'aggressive') rate = 0.22;

    const padL = 60, padR = 20, padT = 20, padB = 30;
    const cW = W - padL - padR;
    const cH = H - padT - padB;

    // Generate Data
    const pastMonths = 6;
    const totalMonths = pastMonths + period;
    const data = [];
    let currentRev = baseRev / Math.pow(1 + rate/12, pastMonths); // roughly back-calculate
    
    // Past data (with some noise)
    for (let i = -pastMonths; i <= 0; i++) {
      data.push({ x: i, y: currentRev, isForecast: false, lower: currentRev, upper: currentRev });
      currentRev = currentRev * (1 + (rate/12) + (Math.random()*0.02 - 0.01));
    }
    
    currentRev = baseRev; // Reset to exact base for month 0
    data[pastMonths].y = currentRev;

    // Future data (forecast + confidence bounds)
    let variance = 0;
    for (let i = 1; i <= period; i++) {
      currentRev = currentRev * (1 + rate/12);
      variance += 0.02; // uncertainty increases over time
      data.push({ 
        x: i, 
        y: currentRev, 
        isForecast: true,
        lower: currentRev * (1 - variance),
        upper: currentRev * (1 + variance)
      });
    }

    const maxY = Math.max(...data.map(d => d.upper)) * 1.1;
    
    // Draw Grid & Y-Axis
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    ctx.fillStyle = 'rgba(148,163,184,0.7)';
    ctx.font = '11px Inter, sans-serif';
    ctx.textAlign = 'right';
    
    for (let i = 0; i <= 4; i++) {
      const y = padT + (cH / 4) * i;
      ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(W - padR, y); ctx.stroke();
      const val = Math.round(maxY - (maxY/4)*i);
      ctx.fillText('$' + (val/1000).toFixed(0) + 'k', padL - 10, y + 4);
    }

    // Draw X-Axis Labels
    ctx.textAlign = 'center';
    data.forEach((d, i) => {
      if (i % Math.ceil(totalMonths/10) === 0 || i === pastMonths || i === totalMonths) {
        const x = padL + (i / totalMonths) * cW;
        ctx.fillText(d.x === 0 ? 'Now' : (d.x < 0 ? 'M'+d.x : 'M+'+d.x), x, H - 10);
      }
    });

    // Draw Confidence Interval (Area)
    ctx.beginPath();
    data.forEach((d, i) => {
      if (!d.isForecast && i !== pastMonths) return;
      const x = padL + (i / totalMonths) * cW;
      const yUpper = padT + cH - (d.upper / maxY) * cH;
      if (i === pastMonths) ctx.moveTo(x, yUpper);
      else ctx.lineTo(x, yUpper);
    });
    for (let i = data.length - 1; i >= pastMonths; i--) {
      const d = data[i];
      const x = padL + (i / totalMonths) * cW;
      const yLower = padT + cH - (d.lower / maxY) * cH;
      ctx.lineTo(x, yLower);
    }
    ctx.closePath();
    ctx.fillStyle = 'rgba(6,182,212,0.15)';
    ctx.fill();

    // Draw Lines
    // Past Line
    ctx.beginPath();
    data.filter(d => !d.isForecast).forEach((d, i) => {
      const x = padL + (i / totalMonths) * cW;
      const y = padT + cH - (d.y / maxY) * cH;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Forecast Line
    ctx.beginPath();
    const forecastData = data.filter(d => d.isForecast || d.x === 0);
    forecastData.forEach((d, i) => {
      const x = padL + ((i + pastMonths) / totalMonths) * cW;
      const y = padT + cH - (d.y / maxY) * cH;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 3;
    ctx.setLineDash([5, 5]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw Points
    data.forEach((d, i) => {
      const x = padL + (i / totalMonths) * cW;
      const y = padT + cH - (d.y / maxY) * cH;
      ctx.beginPath();
      ctx.arc(x, y, d.x === 0 ? 5 : 3, 0, Math.PI*2);
      ctx.fillStyle = d.x === 0 ? '#3b82f6' : (d.isForecast ? '#06b6d4' : '#64748b');
      ctx.fill();
    });

    // Current Point Marker Line
    const curX = padL + (pastMonths / totalMonths) * cW;
    ctx.beginPath();
    ctx.moveTo(curX, padT);
    ctx.lineTo(curX, padT + cH);
    ctx.strokeStyle = 'rgba(59,130,246,0.5)';
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 2]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Update Metrics
    const peakRev = data[data.length-1].upper;
    const totalRev = forecastData.reduce((sum, d) => sum + (d.isForecast ? d.y : 0), 0);
    
    $('fmPeak').textContent = '$' + (peakRev/1000).toFixed(1) + 'k';
    $('fmCAGR').textContent = (rate * 100).toFixed(1) + '%';
    $('fmTotal').textContent = '$' + (totalRev/1000).toFixed(0) + 'k';
    $('fmConfidence').textContent = (95 - (period/12)*10 + (scenario==='conservative'?5:-5)).toFixed(1) + '%';
    
    $('forecastMetrics').hidden = false;
    forecastDrawn = true;
  }

  $('runForecastBtn') && $('runForecastBtn').addEventListener('click', drawForecastChart);

  /* ── TAB 2: MARKET TRENDS ── */
  const TREND_SIGNALS = {
    ecommerce: [
      { icon:'📱', title:'Social Commerce Integration', score:'+8.4', class:'score-positive', desc:'Direct checkouts on social platforms showing 42% YoY growth. Strong indicator for Q4.' },
      { icon:'🚚', title:'Logistics Costs Squeeze', score:'-3.2', class:'score-negative', desc:'Last-mile delivery costs rising. May compress margins by 1.5% in the next 6 months.' },
      { icon:'🤖', title:'AI Personalization', score:'+6.7', class:'score-positive', desc:'Generative AI product descriptions and dynamic pricing correlating with 18% higher conversion.' }
    ],
    fintech: [
      { icon:'💳', title:'B2B BNPL Expansion', score:'+9.1', class:'score-positive', desc:'Buy-Now-Pay-Later moving aggressively into B2B procurement. High adoption velocity.' },
      { icon:'🏦', title:'Regulatory Scrutiny', score:'-4.5', class:'score-negative', desc:'Increased compliance requirements for crypto-adjacent products. Anticipate longer time-to-market.' }
    ],
    default: [
      { icon:'📈', title:'Sector Consolidation', score:'+5.0', class:'score-positive', desc:'M&A activity accelerating. Mid-market players combining to capture enterprise share.' },
      { icon:'💡', title:'Energy Cost Volatility', score:'-2.8', class:'score-negative', desc:'Input costs fluctuating. Recommend hedging strategies for the upcoming quarters.' },
      { icon:'🌍', title:'ESG Compliance Premium', score:'+4.2', class:'score-positive', desc:'Products with verified sustainable supply chains commanding a 9-12% price premium.' }
    ]
  };

  $('runTrendBtn') && $('runTrendBtn').addEventListener('click', () => {
    const results = $('trendResults');
    const sector = $('trendSector').value;
    const horizon = $('trendHorizon').value;
    
    results.innerHTML = '<div class="rec-loading"><div class="rec-spinner"></div> Scanning market signals…</div>';
    
    setTimeout(() => {
      const signals = TREND_SIGNALS[sector] || TREND_SIGNALS.default;
      results.innerHTML = '';
      
      const header = document.createElement('div');
      header.style.cssText = 'font-size:0.8rem;color:var(--text-dim);margin-bottom:8px;';
      header.innerHTML = `Analyzed <strong>14,200+</strong> market signals for <strong>${$('trendSector').options[$('trendSector').selectedIndex].text}</strong> over a ${horizon}-month horizon:`;
      results.appendChild(header);

      signals.forEach((sig, i) => {
        const card = document.createElement('div');
        card.className = 'signal-card';
        card.style.animationDelay = (i * 150) + 'ms';
        card.innerHTML = `
          <div class="signal-icon">${sig.icon}</div>
          <div class="signal-content">
            <div class="signal-header">
              <div class="signal-title">${sig.title}</div>
              <div class="signal-score ${sig.class}">${sig.score} Impact</div>
            </div>
            <div class="signal-desc">${sig.desc}</div>
          </div>
        `;
        results.appendChild(card);
      });
    }, 1000);
  });

  /* ── TAB 3: DEMAND PLANNING ── */
  $('runDemandBtn') && $('runDemandBtn').addEventListener('click', () => {
    const product = $('demandProduct').value || 'Selected Product';
    const stock = parseInt($('demandStock').value) || 0;
    const velocity = parseFloat($('demandVelocity').value) || 0;
    const leadTime = parseInt($('demandLeadTime').value) || 0;
    const season = $('demandSeason').value;
    
    const results = $('demandResults');
    results.innerHTML = '<div class="rec-loading"><div class="rec-spinner"></div> Computing supply chain models…</div>';
    
    setTimeout(() => {
      let adjVelocity = velocity;
      if (season === 'peak') adjVelocity *= 1.4;
      if (season === 'low') adjVelocity *= 0.75;
      if (season === 'holiday') adjVelocity *= 1.8;
      
      const safetyStock = Math.ceil(adjVelocity * leadTime * 0.5); // rule of thumb
      const reorderPoint = Math.ceil((adjVelocity * leadTime) + safetyStock);
      const daysOfInventory = adjVelocity > 0 ? (stock / adjVelocity).toFixed(1) : '∞';
      
      let statusHtml = '';
      if (stock <= reorderPoint * 0.5) {
        statusHtml = `<div class="dp-alert critical">⚠️ <strong>Critical Stockout Risk!</strong> Current stock is severely below the reorder point. Expedite shipping immediately.</div>`;
      } else if (stock <= reorderPoint) {
        statusHtml = `<div class="dp-alert warning">⚡ <strong>Reorder Recommended.</strong> Stock has reached the reorder point. Place PO within 48 hours to maintain safety buffer.</div>`;
      } else {
        statusHtml = `<div class="dp-alert safe">✅ <strong>Healthy Inventory.</strong> Stock levels are optimal for the projected ${adjVelocity.toFixed(1)} units/day velocity.</div>`;
      }

      results.innerHTML = `
        <div style="font-size:0.9rem; font-weight:700; margin-bottom:12px; color:var(--text);">${product} — AI Demand Plan</div>
        ${statusHtml}
        <div class="dp-summary" style="margin-top:16px;">
          <div class="dp-stat">
            <span class="dp-stat-label">Projected Velocity</span>
            <span class="dp-stat-val">${adjVelocity.toFixed(1)} <small style="font-size:0.6em;color:var(--text-muted);">units/day</small></span>
            <span class="dp-stat-sub">Adjusted for ${season} seasonality</span>
          </div>
          <div class="dp-stat">
            <span class="dp-stat-label">Days of Inventory</span>
            <span class="dp-stat-val">${daysOfInventory} <small style="font-size:0.6em;color:var(--text-muted);">days</small></span>
            <span class="dp-stat-sub">Based on current stock & velocity</span>
          </div>
          <div class="dp-stat">
            <span class="dp-stat-label">Recommended Reorder Point</span>
            <span class="dp-stat-val">${reorderPoint} <small style="font-size:0.6em;color:var(--text-muted);">units</small></span>
            <span class="dp-stat-sub">Includes ${safetyStock} safety stock</span>
          </div>
          <div class="dp-stat">
            <span class="dp-stat-label">Suggested Order Qty</span>
            <span class="dp-stat-val">${Math.ceil(adjVelocity * 30)} <small style="font-size:0.6em;color:var(--text-muted);">units</small></span>
            <span class="dp-stat-sub">To cover 30 days post-delivery</span>
          </div>
        </div>
      `;
    }, 900);
  });

})();

/* ============================================================
   CUSTOMER SENTIMENT DEMO MODAL
   ============================================================ */
(function initSentDemo() {
  const $ = id => document.getElementById(id);
  const modal = $('sentDemoModal');
  const openBtn = $('openSentDemo');
  const closeBtn = $('closeSentDemo');
  if (!modal || !openBtn) return;

  openBtn.addEventListener('click', () => {
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
  });
  
  const closeModal = () => {
    modal.hidden = true;
    document.body.style.overflow = '';
  };
  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !modal.hidden) closeModal(); });

  // Tabs
  document.querySelectorAll('#sentDemoModal .ai-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('#sentDemoModal .ai-tab').forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      document.querySelectorAll('#sentDemoModal .ai-tab-panel').forEach(p => {
        p.classList.remove('active');
        p.hidden = true;
      });
      
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      const panel = $('spanel-' + tab.dataset.stab);
      if (panel) {
        panel.classList.add('active');
        panel.hidden = false;
      }
    });
  });

  /* ── TAB 1: REAL-TIME SCORING ── */
  document.querySelectorAll('.p-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      $('sentText').value = chip.dataset.val;
      $('runSentBtn').click();
    });
  });

  $('runSentBtn') && $('runSentBtn').addEventListener('click', async () => {
    const text = $('sentText').value.trim();
    const results = $('sentResults');
    if (!text) return;

    results.innerHTML = '<div class="rec-loading"><div class="rec-spinner"></div> Querying Hugging Face NLP API…</div>';

    try {
      const response = await fetch('https://api-inference.huggingface.co/models/distilbert-base-uncased-finetuned-sst-2-english', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputs: text })
      });
      
      if (!response.ok) throw new Error('API limits reached or model loading');
      
      const data = await response.json();
      const predictions = data[0]; // Array of {label, score}
      
      let score = 50;
      let sentimentText = 'Neutral';
      let scoreColor = '#fbbf24';
      let sentimentClass = 'e-neu';
      
      const pos = predictions.find(p => p.label === 'POSITIVE');
      const neg = predictions.find(p => p.label === 'NEGATIVE');
      
      if (pos && pos.score > 0.6) {
        score = Math.round(pos.score * 100);
        sentimentText = 'Positive';
        scoreColor = '#34d399';
        sentimentClass = 'e-pos';
      } else if (neg && neg.score > 0.6) {
        score = Math.round((1 - neg.score) * 100); // 0-40 range for negative
        sentimentText = 'Negative';
        scoreColor = '#f87171';
        sentimentClass = 'e-neg';
      }

      renderSentiment(score, sentimentText, scoreColor, sentimentClass);
    } catch (err) {
      console.warn("HuggingFace API failed, falling back to local heuristic:", err);
      // Fallback local mock
      const lower = text.toLowerCase();
      let score = 50;
      if (lower.includes('love') || lower.includes('incredible') || lower.includes('good') || lower.includes('phenomenal')) score += 35;
      if (lower.includes('hate') || lower.includes('terrible') || lower.includes('crashing') || lower.includes('frustrating')) score -= 40;
      score = Math.max(0, Math.min(100, score));

      let sentimentClass = 'e-neu';
      let sentimentText = 'Neutral';
      let scoreColor = '#fbbf24';
      if (score > 65) { sentimentClass = 'e-pos'; sentimentText = 'Positive'; scoreColor = '#34d399'; }
      if (score < 40) { sentimentClass = 'e-neg'; sentimentText = 'Negative'; scoreColor = '#f87171'; }
      
      renderSentiment(score, sentimentText, scoreColor, sentimentClass);
    }

    function renderSentiment(score, sentimentText, scoreColor, sentimentClass) {
      results.innerHTML = `
        <div class="score-display">
          <div class="score-circle" style="color: ${scoreColor}">${score}</div>
          <div class="score-meta">
            <h4>Overall Sentiment: <span style="color:${scoreColor}">${sentimentText}</span></h4>
            <p>Confidence: ${score > 50 ? score : (100-score)}%</p>
          </div>
        </div>
        <div style="font-size:0.8rem;color:var(--text-dim);margin-top:10px;">Detected Entities:</div>
        <div class="entity-list">
          <div class="entity-row">
            <span class="entity-name">Product Features</span>
            <span class="${sentimentClass}">${score > 50 ? '+0.8' : '-0.6'} sentiment</span>
          </div>
          <div class="entity-row">
            <span class="entity-name">Support Team</span>
            <span class="e-neu">+0.1 sentiment</span>
          </div>
        </div>
      `;
    }
  });

  /* ── TAB 2: FEEDBACK AGGREGATION ── */
  let aggSynced = false;
  $('simAggBtn') && $('simAggBtn').addEventListener('click', () => {
    if (aggSynced) return;
    const bars = $('channelBars');
    bars.innerHTML = '<div class="rec-loading" style="margin:20px 0;"><div class="rec-spinner"></div> Syncing integrations (Twitter, Trustpilot, Zendesk)...</div>';
    
    setTimeout(() => {
      $('ascTotal').textContent = '1,492';
      $('ascGlobal').innerHTML = '<span style="color:#34d399">78%</span>';
      
      bars.innerHTML = `
        <div class="cb-row">
          <div class="cb-label">Twitter / X</div>
          <div class="cb-track">
            <div class="cb-fill pos" style="width: 45%;"></div>
            <div class="cb-fill neu" style="width: 35%;"></div>
            <div class="cb-fill neg" style="width: 20%;"></div>
          </div>
        </div>
        <div class="cb-row">
          <div class="cb-label">Trustpilot</div>
          <div class="cb-track">
            <div class="cb-fill pos" style="width: 75%;"></div>
            <div class="cb-fill neu" style="width: 15%;"></div>
            <div class="cb-fill neg" style="width: 10%;"></div>
          </div>
        </div>
        <div class="cb-row">
          <div class="cb-label">Zendesk</div>
          <div class="cb-track">
            <div class="cb-fill pos" style="width: 30%;"></div>
            <div class="cb-fill neu" style="width: 40%;"></div>
            <div class="cb-fill neg" style="width: 30%;"></div>
          </div>
        </div>
        <div style="display:flex; gap:16px; font-size:0.75rem; margin-top:12px; justify-content:center;">
          <span style="color:#34d399">● Positive</span>
          <span style="color:#fbbf24">● Neutral</span>
          <span style="color:#f87171">● Negative</span>
        </div>
      `;
      aggSynced = true;
    }, 1500);
  });

  /* ── TAB 3: INTENT CLASSIFICATION ── */
  const TICKET_TEMPLATES = [
    { text: "I've been trying to export the Q3 report but I keep getting a 500 server error.", intent: "Tech Support", class: "t-support" },
    { text: "We found a cheaper alternative that meets our needs. How do we cancel our plan?", intent: "Churn Risk", class: "t-churn" },
    { text: "Can we get a demo for our enterprise team? We are looking to upgrade from the Pro plan.", intent: "Sales Inquiry", class: "t-sales" },
    { text: "It would be great if you could add a dark mode toggle to the dashboard.", intent: "Feature Request", class: "t-feature" },
    { text: "My billing didn't go through and now my account is locked. Help!", intent: "Tech Support", class: "t-support" }
  ];
  let streamInterval;
  let counts = { 't-churn': 0, 't-support': 0, 't-sales': 0, 't-feature': 0 };

  $('startStreamBtn') && $('startStreamBtn').addEventListener('click', (e) => {
    e.target.disabled = true;
    e.target.textContent = "Stream Active...";
    const stream = $('intentStream');
    stream.innerHTML = ''; // clear placeholder

    // Send first ticket immediately
    addTicket();
    
    // Then every 3-6 seconds
    streamInterval = setInterval(() => {
      if (stream.children.length > 20) clearInterval(streamInterval);
      addTicket();
    }, 4000);

    function addTicket() {
      const tpl = TICKET_TEMPLATES[Math.floor(Math.random() * TICKET_TEMPLATES.length)];
      counts[tpl.class]++;
      
      const id = 'TK-' + Math.floor(1000 + Math.random() * 9000);
      const el = document.createElement('div');
      el.className = 'ticket-card';
      el.innerHTML = `
        <div class="ticket-head">
          <span class="ticket-id">#${id}</span>
          <span class="ticket-intent ${tpl.class}">${tpl.intent}</span>
        </div>
        <div class="ticket-text">"${tpl.text}"</div>
      `;
      stream.prepend(el);
      
      // update stats
      if (tpl.class === 't-churn') $('isChurn').textContent = counts['t-churn'];
      if (tpl.class === 't-support') $('isSupport').textContent = counts['t-support'];
      if (tpl.class === 't-sales') $('isSales').textContent = counts['t-sales'];
      if (tpl.class === 't-feature') $('isFeature').textContent = counts['t-feature'];
    }
  });

})();

/* ============================================================
   COMPETITOR ANALYSIS DEMO MODAL
   ============================================================ */
(function initCompDemo() {
  const $ = id => document.getElementById(id);
  const modal = $('compDemoModal');
  const openBtn = $('openCompDemo');
  const closeBtn = $('closeCompDemo');
  if (!modal || !openBtn) return;

  openBtn.addEventListener('click', () => {
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
  });
  
  const closeModal = () => {
    modal.hidden = true;
    document.body.style.overflow = '';
  };
  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !modal.hidden) closeModal(); });

  // Tabs
  document.querySelectorAll('#compDemoModal .ai-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('#compDemoModal .ai-tab').forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      document.querySelectorAll('#compDemoModal .ai-tab-panel').forEach(p => {
        p.classList.remove('active');
        p.hidden = true;
      });
      
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      const panel = $('cpanel-' + tab.dataset.ctab);
      if (panel) {
        panel.classList.add('active');
        panel.hidden = false;
      }
      
      if (tab.dataset.ctab === 'bench' && !benchDrawn) {
        drawRadarChart();
      }
    });
  });

  /* ── TAB 1: MARKET SHARE (SIMILARWEB) ── */
  $('runMarketBtn') && $('runMarketBtn').addEventListener('click', async () => {
    const domain = $('compDomain').value.trim() || 'yourbrand.com';
    const results = $('marketResults');
    results.innerHTML = '<div class="rec-loading"><div class="rec-spinner"></div> Querying Clearbit API for company data...</div>';
    
    try {
      const res = await fetch(`https://autocomplete.clearbit.com/v1/companies/suggest?query=${encodeURIComponent(domain)}`);
      if (!res.ok) throw new Error('Clearbit API error');
      const data = await res.json();
      
      if (data && data.length > 0) {
        const company = data[0];
        results.innerHTML = `
          <div style="display:flex; align-items:center; gap:16px; margin-bottom:16px;">
            <img src="${company.logo}" alt="Logo" style="width:48px; height:48px; border-radius:8px; background:white; padding:4px;">
            <div>
              <h3 style="margin:0;">${company.name}</h3>
              <div style="font-size:0.85rem; color:var(--text-dim);">${company.domain}</div>
            </div>
          </div>
          <div class="ms-grid">
            <div class="ms-card"><span>Live</span><label>Data Connected</label></div>
            <div class="ms-card"><span>Active</span><label>Domain Status</label></div>
          </div>
          <div class="ms-chart-bar">
            <h4>Estimated Market Presence vs Top Competitors</h4>
            <div class="ms-bar-wrap">
              <div class="msb-fill msb-you" style="width: 28%;" title="You">28%</div>
              <div class="msb-fill msb-comp1" style="width: 45%;" title="${company.name}">45%</div>
              <div class="msb-fill msb-comp2" style="width: 27%;" title="Others">27%</div>
            </div>
            <div style="display:flex; gap:16px; font-size:0.75rem; margin-top:12px;">
              <span style="color:#ec4899">● You</span>
              <span style="color:#3b82f6">● ${company.name}</span>
              <span style="color:#10b981">● Others</span>
            </div>
          </div>
        `;
      } else {
        throw new Error('No company found for this domain');
      }
    } catch (err) {
      console.warn("Clearbit API failed:", err);
      // Fallback
      results.innerHTML = `
        <div class="ms-grid">
          <div class="ms-card"><span>1.2M</span><label>Est. Monthly Visits</label></div>
          <div class="ms-card"><span>04:12</span><label>Avg. Time on Site</label></div>
          <div class="ms-card"><span>38%</span><label>Bounce Rate</label></div>
        </div>
        <div class="ms-chart-bar">
          <h4>Market Share vs Top Competitors</h4>
          <div class="ms-bar-wrap">
            <div class="msb-fill msb-you" style="width: 28%;" title="${domain}">28%</div>
            <div class="msb-fill msb-comp1" style="width: 45%;" title="Competitor 1">45%</div>
            <div class="msb-fill msb-comp2" style="width: 27%;" title="Competitor 2">27%</div>
          </div>
          <div style="display:flex; gap:16px; font-size:0.75rem; margin-top:12px;">
            <span style="color:#ec4899">● ${domain}</span>
            <span style="color:#3b82f6">● Competitor A</span>
            <span style="color:#10b981">● Competitor B</span>
          </div>
        </div>
      `;
    }
  });

  /* ── TAB 2: BENCHMARKING (RADAR CHART) ── */
  let benchDrawn = false;
  function drawRadarChart() {
    const canvas = $('benchCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    const cx = W / 2, cy = H / 2;
    const radius = Math.min(cx, cy) - 40;
    
    ctx.clearRect(0, 0, W, H);
    
    const metrics = ['Pricing', 'UX/UI', 'Features', 'Support', 'Performance'];
    const angles = metrics.map((_, i) => (Math.PI * 2 * i) / metrics.length - Math.PI / 2);
    
    // Draw grid
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    for (let j = 1; j <= 5; j++) {
      ctx.beginPath();
      const r = (radius / 5) * j;
      angles.forEach((a, i) => {
        const x = cx + Math.cos(a) * r;
        const y = cy + Math.sin(a) * r;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });
      ctx.closePath();
      ctx.stroke();
    }
    
    // Draw axes & labels
    ctx.fillStyle = 'var(--text-dim)';
    ctx.font = '12px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    angles.forEach((a, i) => {
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(a) * radius, cy + Math.sin(a) * radius);
      ctx.stroke();
      
      const lx = cx + Math.cos(a) * (radius + 20);
      const ly = cy + Math.sin(a) * (radius + 20);
      ctx.fillText(metrics[i], lx, ly);
    });
    
    // Draw Data (Industry Avg)
    const indData = [3.5, 4.0, 3.8, 3.2, 4.2]; // out of 5
    ctx.beginPath();
    angles.forEach((a, i) => {
      const r = (radius / 5) * indData[i];
      const x = cx + Math.cos(a) * r;
      const y = cy + Math.sin(a) * r;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fillStyle = 'rgba(100, 116, 139, 0.4)';
    ctx.fill();
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw Data (User)
    // Add slight random variance on recalculate
    const variance = () => (Math.random() * 1.5 - 0.5);
    const usrData = [Math.min(5, 4.5+variance()), Math.min(5, 3.5+variance()), Math.min(5, 4.8+variance()), Math.min(5, 4.5+variance()), Math.min(5, 3.8+variance())]; 
    ctx.beginPath();
    angles.forEach((a, i) => {
      const r = (radius / 5) * usrData[i];
      const x = cx + Math.cos(a) * r;
      const y = cy + Math.sin(a) * r;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fillStyle = 'rgba(236, 72, 153, 0.4)';
    ctx.fill();
    ctx.strokeStyle = '#ec4899';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    benchDrawn = true;
  }
  
  $('runBenchBtn') && $('runBenchBtn').addEventListener('click', drawRadarChart);

  /* ── TAB 3: STRATEGIC GAPS (OPENAI) ── */
  $('runGapBtn') && $('runGapBtn').addEventListener('click', async () => {
    const comp = $('gapCompetitor').value.trim() || 'Competitor';
    const results = $('gapResults');
    
    results.innerHTML = '<div class="rec-loading"><div class="rec-spinner"></div> Prompting Mistral-7B LLM (Hugging Face) for strategic SWOT...</div>';
    
    try {
      const prompt = `[INST] You are an expert business strategist. Provide a brief 4-point strategic gap analysis (Advantages, Gaps, Opportunities, Threats) for a generic startup competing against ${comp}. Return only bullet points, no fluff. [/INST]`;
      
      const response = await fetch('https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputs: prompt, parameters: { max_new_tokens: 150, temperature: 0.7 } })
      });
      
      if (!response.ok) throw new Error('API limits reached');
      
      const data = await response.json();
      let generatedText = data[0].generated_text.replace(prompt, '').trim();
      
      // format text slightly for html
      generatedText = generatedText.split('\\n').map(line => line.trim().startsWith('-') || line.trim().startsWith('*') ? `<li>${line.substring(1).trim()}</li>` : `<p>${line}</p>`).join('');

      results.innerHTML = `
        <div style="font-size:0.9rem; margin-bottom:16px; color:#34d399;"><strong>Live AI Analysis:</strong> Your Brand vs <strong>${comp}</strong></div>
        <div style="background:var(--bg-layer); padding:16px; border-radius:8px; font-size:0.85rem; line-height:1.6; border:1px solid var(--border-color);">
          <ul style="padding-left:20px;">
            ${generatedText}
          </ul>
        </div>
      `;
    } catch (err) {
      console.warn("Mistral API failed, falling back to mock:", err);
      // Fallback
      results.innerHTML = `
        <div style="font-size:0.9rem; margin-bottom:16px;">AI Strategic Analysis: <strong>Your Brand</strong> vs <strong>${comp}</strong></div>
        <div class="gap-swot">
          <div class="swot-box sb-adv">
            <h4>💡 Your Advantages (USPs)</h4>
            <ul>
              <li>Faster onboarding time (2 days vs 7 days)</li>
              <li>Superior custom reporting module</li>
              <li>More transparent pricing tier</li>
            </ul>
          </div>
          <div class="swot-box sb-dis">
            <h4>⚠️ Your Gaps</h4>
            <ul>
              <li>Missing native mobile application</li>
              <li>Fewer enterprise SSO integrations</li>
              <li>Weaker presence in the European market</li>
            </ul>
          </div>
          <div class="swot-box sb-opp">
            <h4>🚀 Market Opportunities</h4>
            <ul>
              <li>${comp} recently raised prices by 15% — launch targeted switch campaign.</li>
              <li>High demand for AI automation in mid-market (currently underserved).</li>
            </ul>
          </div>
          <div class="swot-box sb-thr">
            <h4>🛡️ Strategic Threats</h4>
            <ul>
              <li>${comp} is aggressively acquiring smaller niche plugins.</li>
              <li>High risk of feature parity within the next 12 months.</li>
            </ul>
          </div>
        </div>
      `;
    }
  });

})();

/* ============================================================
   AUTH — SIGN IN / SIGN OUT
   ============================================================ */
(function initAuth() {
  const SESSION_KEY = 'biz_session';

  function getSession() {
    try { return JSON.parse(localStorage.getItem(SESSION_KEY)); } catch(e) { return null; }
  }
  function saveSession(u) { localStorage.setItem(SESSION_KEY, JSON.stringify(u)); }
  function clearSession() { localStorage.removeItem(SESSION_KEY); }

  function updateUI(user) {
    const signInBtn = document.getElementById('navSignIn');
    const userWrap  = document.getElementById('navUserWrap');
    const avatar    = document.getElementById('navUserAvatar');
    const nameEl    = document.getElementById('navUserName');
    const sbAvatar  = document.getElementById('sbAvatar');
    const sbName    = document.getElementById('sbUserName');
    const sbRole    = document.getElementById('sbUserRole');

    if (user) {
      if (signInBtn) signInBtn.style.display = 'none';
      if (userWrap)  userWrap.style.display  = 'flex';
      const initials = user.name.split(' ').map(function(w){return w[0];}).join('').substring(0,2).toUpperCase();
      if (avatar) avatar.textContent = initials;
      if (nameEl) nameEl.textContent = user.name.split(' ')[0];
      if (sbAvatar) sbAvatar.textContent = initials;
      if (sbName)   sbName.textContent   = user.name;
      if (sbRole)   sbRole.textContent   = user.role || 'BizInsight Member';
    } else {
      if (signInBtn) signInBtn.style.display = '';
      if (userWrap)  userWrap.style.display  = 'none';
      if (sbAvatar) sbAvatar.textContent = 'SV';
      if (sbName)   sbName.textContent   = 'Shijo Varghese';
      if (sbRole)   sbRole.textContent   = 'Lead Developer';
    }
  }

  // Restore session on load
  const existing = getSession();
  if (existing) updateUI(existing);

  const modal    = document.getElementById('signInModal');
  const openBtn  = document.getElementById('navSignIn');
  const closeBtn = document.getElementById('authClose');
  if (!modal) return;

  function openModal()  { modal.hidden = false; document.body.style.overflow = 'hidden'; clearError(); }
  function closeModal() { modal.hidden = true;  document.body.style.overflow = ''; clearError(); }

  if (openBtn)  openBtn.addEventListener('click', openModal);
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', function(e){ if(e.target===modal) closeModal(); });
  document.addEventListener('keydown', function(e){ if(e.key==='Escape' && !modal.hidden) closeModal(); });

  // Password toggle
  var pwToggle = document.getElementById('authPwToggle');
  var pwInput  = document.getElementById('authPassword');
  if (pwToggle && pwInput) {
    pwToggle.addEventListener('click', function(){
      pwInput.type = pwInput.type === 'password' ? 'text' : 'password';
      pwToggle.textContent = pwInput.type === 'password' ? '\u{1F441}' : '\u{1F648}';
    });
  }

  var errEl = document.getElementById('authError');
  function showError(msg){ if(errEl){ errEl.textContent=msg; errEl.style.display='block'; } }
  function clearError()  { if(errEl){ errEl.style.display='none'; } }

  var submitBtn = document.getElementById('authSubmit');
  if (submitBtn) submitBtn.addEventListener('click', doSignIn);
  if (pwInput)   pwInput.addEventListener('keydown', function(e){ if(e.key==='Enter') doSignIn(); });

  function doSignIn() {
    var emailEl = document.getElementById('authEmail');
    var email = (emailEl ? emailEl.value : '').trim();
    var pw    = pwInput ? pwInput.value : '';
    clearError();
    if (!email || !pw)         { showError('Please fill in all fields.'); return; }
    if (email.indexOf('@') < 0){ showError('Enter a valid email address.'); return; }
    if (pw.length < 4)         { showError('Password must be at least 4 characters.'); return; }
    submitBtn.textContent = 'Signing in\u2026';
    submitBtn.disabled = true;
    setTimeout(function(){
      var name = email.split('@')[0].replace(/[._]/g,' ').replace(/\b\w/g,function(c){return c.toUpperCase();});
      var user = { name:name, email:email, role:'Analytics Member' };
      saveSession(user); updateUI(user); closeModal();
      submitBtn.textContent = 'Sign In \u2192';
      submitBtn.disabled = false;
      showToast('Welcome back, ' + name.split(' ')[0] + '! \uD83C\uDF89');
    }, 900);
  }

  var googleBtn = document.getElementById('authGoogle');
  if (googleBtn) googleBtn.addEventListener('click', function(){
    var user = { name:'Google User', email:'user@gmail.com', role:'Analytics Member' };
    saveSession(user); updateUI(user); closeModal();
    showToast('Signed in with Google \uD83C\uDF89');
  });

  var signOutBtn = document.getElementById('navSignOut');
  if (signOutBtn) signOutBtn.addEventListener('click', function(){
    clearSession(); updateUI(null);
    showToast("You've been signed out.");
  });

  window.showToast = function(msg) {
    var t = document.createElement('div');
    t.className = 'biz-toast';
    t.textContent = msg;
    document.body.appendChild(t);
    requestAnimationFrame(function(){ t.classList.add('show'); });
    setTimeout(function(){ t.classList.remove('show'); setTimeout(function(){ t.remove(); }, 400); }, 3500);
  };
})();

/* ============================================================
   SEARCH / KEYWORDS
   ============================================================ */
(function initSearch() {
  var input    = document.getElementById('navSearch');
  var dropdown = document.getElementById('searchDropdown');
  if (!input || !dropdown) return;

  var ITEMS = [
    { label:'Dashboard / Home',          icon:'\uD83C\uDFE0', href:'#home' },
    { label:'About BizInsight',          icon:'\u2139\uFE0F', href:'#about' },
    { label:'AI & Machine Learning',     icon:'\uD83E\uDD16', href:'#feat-1' },
    { label:'Predictive Analytics',      icon:'\uD83D\uDCC8', href:'#feat-2' },
    { label:'Customer Sentiment Analysis',icon:'\uD83D\uDCAC', href:'#feat-3' },
    { label:'Competitor Analysis',       icon:'\uD83D\uDD0D', href:'#feat-4' },
    { label:'Data Visualization',        icon:'\uD83D\uDCCA', href:'#feat-5' },
    { label:'Smart Recommendations',     icon:'\uD83D\uDCA1', href:'#feat-6' },
    { label:'AI Creativity Engine',      icon:'\uD83C\uDFA8', href:'#creativity' },
    { label:'Nearby Stores Map',         icon:'\uD83D\uDDFA\uFE0F', action:'openCompDemoMap' },
    { label:'How It Works',              icon:'\u2699\uFE0F', href:'#how' },
    { label:'Tech Stack',                icon:'\uD83D\uDEE0\uFE0F', href:'#tech' },
    { label:'SDG Goals',                 icon:'\uD83C\uDF0D', href:'#sdg' },
    { label:'Contact Us',                icon:'\u2709\uFE0F', href:'#contact' },
    { label:'Anomaly Detection Demo',    icon:'\uD83E\uDDEA', action:'openAiDemo' },
    { label:'Sentiment Demo',            icon:'\uD83D\uDCAC', action:'openSentDemo' },
    { label:'Competitor Demo',           icon:'\uD83D\uDD0D', action:'openCompDemo' }
  ];

  var activeIdx = -1;
  var currentItems = [];

  function render(q) {
    var filtered = q.length < 1 ? [] : ITEMS.filter(function(i){
      return i.label.toLowerCase().indexOf(q.toLowerCase()) >= 0;
    });
    currentItems = filtered;
    if (!filtered.length) { dropdown.style.display='none'; return; }
    dropdown.innerHTML = filtered.map(function(item, i){
      var label = item.label.replace(new RegExp('('+q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+')','gi'), '<mark>$1</mark>');
      return '<div class="sd-item'+(i===activeIdx?' active':'')+'" data-idx="'+i+'"><span class="sd-icon">'+item.icon+'</span><span class="sd-label">'+label+'</span>'+(item.action?'<span class="sd-badge">Demo</span>':'')+'</div>';
    }).join('');
    dropdown.style.display = 'block';
    dropdown.querySelectorAll('.sd-item').forEach(function(el){
      el.addEventListener('mousedown', function(e){ e.preventDefault(); navigate(parseInt(el.dataset.idx)); });
    });
  }

  function navigate(idx) {
    var item = currentItems[idx];
    if (!item) return;
    dropdown.style.display='none'; input.value=''; activeIdx=-1;
    if (item.href) {
      var target = document.querySelector(item.href);
      if (target) {
        target.scrollIntoView({behavior:'smooth',block:'start'});
        target.classList.add('search-highlight');
        setTimeout(function(){ target.classList.remove('search-highlight'); }, 2000);
      }
    } else if (item.action) {
      var btn = document.getElementById(item.action);
      if (btn) btn.click();
    }
  }

  input.addEventListener('input', function(){ activeIdx=-1; render(input.value.trim()); });
  input.addEventListener('keydown', function(e){
    if (!currentItems.length) return;
    if (e.key==='ArrowDown'){ e.preventDefault(); activeIdx=Math.min(activeIdx+1,currentItems.length-1); render(input.value.trim()); }
    if (e.key==='ArrowUp')  { e.preventDefault(); activeIdx=Math.max(activeIdx-1,0); render(input.value.trim()); }
    if (e.key==='Enter')    { e.preventDefault(); if(activeIdx>=0) navigate(activeIdx); else if(currentItems.length) navigate(0); }
    if (e.key==='Escape')   { dropdown.style.display='none'; input.blur(); }
  });
  input.addEventListener('focus', function(){ if(input.value.trim()) render(input.value.trim()); });
  document.addEventListener('click', function(e){ if(!input.contains(e.target)&&!dropdown.contains(e.target)) dropdown.style.display='none'; });
  document.addEventListener('keydown', function(e){
    if ((e.metaKey||e.ctrlKey) && e.key==='k'){ e.preventDefault(); input.focus(); input.select(); }
  });
})();

/* ============================================================
   CREATIVITY SECTION
   ============================================================ */
(function initCreativity() {
  var output = document.getElementById('typewriterOutput');
  var SUMMARIES = {
    executive: "Q3 Executive Summary: BizInsight platform processed 9.6M data points this quarter. Revenue growth accelerated to +24.5% YoY, driven by expansion in e-commerce and SaaS verticals. AI models achieved 96.3% prediction accuracy. Churn risk declined by 31% following automated retention campaigns. Recommend: accelerate Q4 hiring in customer success.",
    retail: "Retail Analytics Report: Store foot traffic increased 18% post-campaign. Top-performing SKUs: Electronics (+42%), Apparel (+28%). Markdown optimization saved $23K in unsold inventory. Customer satisfaction index rose to 87/100. AI recommendation: expand weekend promotions and restock Category A items immediately.",
    saas: "SaaS Performance Brief: MRR grew from $128K to $156K (+21.9%). Trial-to-paid conversion improved to 34% (up from 26%). Churn rate stabilized at 3.2% after in-app engagement rollout. Feature adoption: Analytics module 82%, AI Insights 71%, Export 58%. Key action: improve mobile onboarding flow.",
    finance: "Financial Intelligence Brief: Transaction volume up 14.2% to $4.7M. Fraud detection model flagged 23 suspicious patterns, all confirmed true positives. Customer lifetime value increased by 19% after premium product upsell campaign. Reserve fund utilization at 67%. Regulatory compliance score: 98/100."
  };

  var currentTyper = null;
  var currentSummary = 'executive';

  function typewrite(text) {
    if (currentTyper) clearInterval(currentTyper);
    if (!output) return;
    output.innerHTML = '';
    var i = 0;
    currentTyper = setInterval(function(){
      if (i < text.length) {
        output.textContent = text.substring(0, i+1);
        var cursor = document.createElement('span');
        cursor.className = 'tw-cursor';
        cursor.textContent = '|';
        output.appendChild(cursor);
        i++;
      } else { clearInterval(currentTyper); }
    }, 20);
  }

  document.querySelectorAll('.cp-chip').forEach(function(chip){
    chip.addEventListener('click', function(){
      document.querySelectorAll('.cp-chip').forEach(function(c){ c.classList.remove('active'); });
      chip.classList.add('active');
      currentSummary = chip.dataset.prompt;
      typewrite(SUMMARIES[currentSummary] || SUMMARIES.executive);
    });
  });

  var creatSection = document.getElementById('creat-typewriter');
  if (creatSection) {
    var obs = new IntersectionObserver(function(entries){
      if (entries[0].isIntersecting){ typewrite(SUMMARIES[currentSummary]); obs.disconnect(); }
    }, { threshold:0.3 });
    obs.observe(creatSection);
  }

  // Data story bar animation
  var dsObs = new IntersectionObserver(function(entries){
    if (entries[0].isIntersecting) {
      document.querySelectorAll('.ds-fill').forEach(function(el, i){
        var targetW = el.style.cssText.match(/--w:\s*([^;]+)/);
        if (targetW) setTimeout(function(){ el.style.width = targetW[1].trim(); }, i * 250);
      });
      dsObs.disconnect();
    }
  }, { threshold:0.3 });
  var dsCard = document.getElementById('creat-datastory');
  if (dsCard) dsObs.observe(dsCard);

  // Idea burst refresh
  var IDEAS = [
    ['\uD83D\uDCE6 Inventory<br>Restock', '\uD83D\uDCAC Launch<br>SMS Campaign', '\uD83D\uDCC8 Upsell<br>Premium', '\uD83E\uDD1D Partner<br>Collab', '\u26A1 Automate<br>KYC'],
    ['\uD83D\uDE80 Expand<br>Market', '\uD83C\uDFAF Target<br>Loyalty', '\uD83D\uDCA1 New<br>Product Line', '\uD83D\uDCCA Optimize<br>Pricing', '\uD83C\uDF0D Go<br>International'],
    ['\uD83D\uDD25 Flash<br>Sale Event', '\uD83E\uDD16 AI Chat<br>Support', '\uD83D\uDCF1 Mobile<br>App', '\uD83D\uDCB0 Revenue<br>Share', '\uD83C\uDF81 Referral<br>Program'],
    ['\uD83D\uDCC9 Cut CAC<br>by 20%', '\uD83D\uDCB3 BNPL<br>Integration', '\uD83D\uDD12 Security<br>Upgrade', '\uD83D\uDCE1 Market<br>Expansion', '\u2B50 Review<br>Campaign']
  ];
  var ideaSet = 0;
  var refreshBtn = document.getElementById('refreshIdeasBtn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', function(){
      ideaSet = (ideaSet + 1) % IDEAS.length;
      var burst = document.getElementById('ideaBurst');
      if (!burst) return;
      var items = burst.querySelectorAll('.ib-item');
      items.forEach(function(el, i){
        el.style.opacity = '0';
        setTimeout(function(){ el.innerHTML = IDEAS[ideaSet][i]; el.style.opacity='1'; }, 300 + i*80);
      });
    });
  }
})();

/* ============================================================
   COMPETITOR NEARBY STORES MAP
   ============================================================ */
(function initStoreMap() {
  var canvas = document.getElementById('storeMapCanvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var W = canvas.width, H = canvas.height;

  var STORES = [];
  var THREAT_COLORS = { high:'#ef4444', medium:'#f59e0b', low:'#10b981' };
  var THREAT_ORDER  = { high:3, medium:2, low:1 };

  var currentType = 'all';
  var selectedId  = null;
  var sortMode    = 'distance';
  var searchQuery = '';
  var userLat = 40.7128, userLon = -74.0060; // Default to NYC

  // Calculate distance in km
  function getDist(lat1, lon1, lat2, lon2) {
    var R = 6371;
    var dLat = (lat2-lat1)*(Math.PI/180);
    var dLon = (lon2-lon1)*(Math.PI/180);
    var a = Math.sin(dLat/2)*Math.sin(dLat/2) + Math.cos(lat1*(Math.PI/180))*Math.cos(lat2*(Math.PI/180))*Math.sin(dLon/2)*Math.sin(dLon/2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  }

  async function loadRealStores() {
    var list = document.getElementById('storeList');
    if (list) list.innerHTML = '<div style="padding:20px;text-align:center;"><div class="typing-dots" style="display:inline-flex;margin:auto;"><span></span><span></span><span></span></div><div style="font-size:0.8rem;color:var(--text-muted);margin-top:8px;">Locating nearby competitors via OpenStreetMap...</div></div>';
    
    var s = userLat - 0.04, w = userLon - 0.04, n = userLat + 0.04, e = userLon + 0.04;
    var query = `[out:json][timeout:15];(nwr["shop"="supermarket"](${s},${w},${n},${e});nwr["shop"="convenience"](${s},${w},${n},${e});nwr["shop"="clothes"](${s},${w},${n},${e});nwr["shop"="electronics"](${s},${w},${n},${e});nwr["amenity"="restaurant"](${s},${w},${n},${e});nwr["amenity"="cafe"](${s},${w},${n},${e});nwr["amenity"="pharmacy"](${s},${w},${n},${e}););out center;`;
    
    try {
      var res = await fetch('https://overpass-api.de/api/interpreter', { method:'POST', body: query });
      if (!res.ok) throw new Error('API Error');
      var data = await res.json();
      
      var maxDist = 0;
      STORES = data.elements.filter(function(el){ return el.tags && el.tags.name; }).map(function(el, idx){
        var lat = el.center ? el.center.lat : el.lat;
        var lon = el.center ? el.center.lon : el.lon;
        var dist = getDist(userLat, userLon, lat, lon);
        if (dist > maxDist) maxDist = dist;
        
        var tags = el.tags;
        var type = 'retail';
        var icon = '🛍️';
        if (tags.amenity === 'restaurant' || tags.amenity === 'cafe') { type = 'restaurant'; icon = '🍽️'; }
        else if (tags.shop === 'supermarket' || tags.shop === 'convenience') { type = 'grocery'; icon = '🛒'; }
        else if (tags.amenity === 'pharmacy') { type = 'pharmacy'; icon = '💊'; }
        else if (tags.shop === 'electronics') { type = 'tech'; icon = '💻'; }
        
        // Randomly assign mock AI insights and threats for visual flair since Overpass doesn't have business metrics
        var threats = ['low','medium','high'];
        var threat = threats[Math.floor(Math.random()*3)];
        var rating = (3.5 + Math.random()*1.4).toFixed(1);
        
        return {
          id: el.id, name: tags.name, type: type, icon: icon,
          lat: lat, lon: lon, dist: dist, rating: rating, threat: threat,
          insight: 'AI analysis suggests this ' + type + ' sees peak foot traffic near you. ' + (threat === 'high' ? 'High competitive overlap detected.' : 'Monitor their digital presence.')
        };
      });

      // Normalize coordinates for canvas (W,H) assuming center is (0.5, 0.5)
      var scale = maxDist || 5;
      STORES.forEach(function(s) {
        // Delta from center mapped to canvas
        var dx = (s.lon - userLon) * 111 * Math.cos(userLat * Math.PI / 180); // roughly km
        var dy = (s.lat - userLat) * 111; // roughly km
        s.x = 0.5 + (dx / scale) * 0.4; // Map +/- scale km to +/- 40% of canvas
        s.y = 0.5 - (dy / scale) * 0.4; // Invert Y
      });
      
      STORES.sort(function(a,b){return a.dist - b.dist;});
      STORES = STORES.slice(0, 40); // Limit to top 40 nearest
      
      drawMap(); renderList();
    } catch(err) {
      if (list) list.innerHTML = '<div style="padding:20px;color:red;">Failed to load live map data. Overpass API may be rate limited.</div>';
    }
  }

  function filteredStores() {
    var list = STORES.filter(function(s){
      if (currentType !== 'all' && s.type !== currentType) return false;
      if (searchQuery && s.name.toLowerCase().indexOf(searchQuery) < 0) return false;
      return true;
    });
    if (sortMode==='distance') list.sort(function(a,b){return a.dist-b.dist;});
    else if (sortMode==='threat') list.sort(function(a,b){return THREAT_ORDER[b.threat]-THREAT_ORDER[a.threat];});
    else if (sortMode==='rating') list.sort(function(a,b){return b.rating-a.rating;});
    return list;
  }

  function drawMap() {
    ctx.clearRect(0,0,W,H);
    ctx.fillStyle='rgba(99,102,241,0.03)'; ctx.fillRect(0,0,W,H);
    ctx.strokeStyle='rgba(99,102,241,0.08)'; ctx.lineWidth=1;
    for (var i=0;i<=6;i++){
      ctx.beginPath(); ctx.moveTo((W/6)*i,0); ctx.lineTo((W/6)*i,H); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0,(H/6)*i); ctx.lineTo(W,(H/6)*i); ctx.stroke();
    }
    var cx=0.5*W, cy=0.5*H;
    [0.15,0.28,0.42].forEach(function(r,i){
      ctx.beginPath(); ctx.arc(cx,cy,r*Math.min(W,H),0,Math.PI*2);
      ctx.strokeStyle='rgba(99,102,241,0.12)'; ctx.setLineDash([4,4]); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle='rgba(100,116,139,0.5)'; ctx.font='10px Inter'; ctx.textAlign='center';
      ctx.fillText(['Radius 1','Radius 2','Radius 3'][i], cx, cy - r*Math.min(W,H)+12);
    });
    var visible=filteredStores();
    visible.forEach(function(s){
      var sx=s.x*W, sy=s.y*H;
      ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(sx,sy);
      ctx.strokeStyle=THREAT_COLORS[s.threat]+'22'; ctx.lineWidth=s.id===selectedId?2:1; ctx.stroke();
    });
    visible.forEach(function(s){
      var sx=s.x*W, sy=s.y*H;
      var r=s.id===selectedId?16:10;
      var isSel=s.id===selectedId;
      if (isSel){ ctx.beginPath(); ctx.arc(sx,sy,r+8,0,Math.PI*2); ctx.strokeStyle=THREAT_COLORS[s.threat]+'55'; ctx.lineWidth=2; ctx.stroke(); }
      ctx.beginPath(); ctx.arc(sx,sy,r,0,Math.PI*2);
      ctx.fillStyle=isSel?THREAT_COLORS[s.threat]:THREAT_COLORS[s.threat]+'cc'; ctx.fill();
      ctx.strokeStyle='rgba(255,255,255,0.4)'; ctx.lineWidth=1.5; ctx.stroke();
      if (isSel) { ctx.font=Math.round(r*1.0)+'px serif'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(s.icon,sx,sy); }
    });
    // You marker
    ctx.beginPath(); ctx.arc(cx,cy,22,0,Math.PI*2);
    var g=ctx.createRadialGradient(cx,cy,0,cx,cy,22);
    g.addColorStop(0,'#6366f1'); g.addColorStop(1,'#8b5cf6');
    ctx.fillStyle=g; ctx.fill();
    ctx.strokeStyle='rgba(255,255,255,0.8)'; ctx.lineWidth=2.5; ctx.stroke();
    ctx.font='18px serif'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText('🏢',cx,cy);
    ctx.font='bold 10px Inter'; ctx.fillStyle='white'; ctx.textBaseline='alphabetic';
    ctx.fillText('YOU',cx,cy+30);
  }

  function renderList() {
    var list=document.getElementById('storeList');
    if (!list) return;
    var stores=filteredStores();
    if (!stores.length){ list.innerHTML='<div style="padding:20px;text-align:center;color:var(--text-dim);font-size:0.85rem;">No stores found</div>'; return; }
    list.innerHTML=stores.map(function(s){
      return '<div class="store-item'+(s.id===selectedId?' selected':'')+' threat-'+s.threat+'" data-id="'+s.id+'">'
        +'<div class="si-icon">'+s.icon+'</div>'
        +'<div class="si-info"><div class="si-name" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:160px;">'+s.name+'</div>'
        +'<div class="si-meta"><span class="si-dist">'+(s.dist===0?'Your location':s.dist.toFixed(2)+' km')+'</span>'
        +'<span class="si-rating">⭐ '+s.rating+'</span>'
        +'<span class="si-threat threat-pill-'+s.threat+'">'+s.threat.charAt(0).toUpperCase()+s.threat.slice(1)+'</span></div></div></div>';
    }).join('');
    list.querySelectorAll('.store-item').forEach(function(el){
      el.addEventListener('click', function(){ selectStore(parseInt(el.dataset.id)); });
    });
  }

  function selectStore(id){
    selectedId = selectedId===id ? null : id;
    var store=STORES.find(function(s){return s.id===id;});
    var card=document.getElementById('storeDetailCard');
    if (selectedId && store && card){
      document.getElementById('sdcIcon').textContent = store.icon;
      document.getElementById('sdcName').textContent = store.name;
      document.getElementById('sdcType').textContent = store.type.charAt(0).toUpperCase()+store.type.slice(1);
      document.getElementById('sdcMetrics').innerHTML =
        '<div class="sdc-m"><span>📍 Distance</span><strong>'+(store.dist===0?'Your store':store.dist.toFixed(2)+' km')+'</strong></div>'
        +'<div class="sdc-m"><span>⭐ Rating</span><strong>'+store.rating+'/5.0</strong></div>'
        +'<div class="sdc-m"><span>⚠️ Threat</span><strong style="color:'+THREAT_COLORS[store.threat]+'">'+store.threat.charAt(0).toUpperCase()+store.threat.slice(1)+'</strong></div>'
        +'<div class="sdc-m"><span>🏪 Category</span><strong>'+store.type.charAt(0).toUpperCase()+store.type.slice(1)+'</strong></div>';
      document.getElementById('sdcInsight').innerHTML='<div class="sdc-insight-txt">🤖 AI Insight: '+store.insight+'</div>';
      card.style.display='block';
    } else if (card){ card.style.display='none'; }
    drawMap(); renderList();
  }

  canvas.addEventListener('click', function(e){
    var rect=canvas.getBoundingClientRect();
    var mx=(e.clientX-rect.left)*(W/rect.width);
    var my=(e.clientY-rect.top)*(H/rect.height);
    var hit=null;
    filteredStores().forEach(function(s){
      var dx=s.x*W-mx, dy=s.y*H-my;
      var r = s.id===selectedId ? 16 : 10;
      if (Math.sqrt(dx*dx+dy*dy)<r+4) hit=s.id;
    });
    if (hit) selectStore(hit);
  });

  var tooltip=document.getElementById('mapTooltip');
  canvas.addEventListener('mousemove', function(e){
    var rect=canvas.getBoundingClientRect();
    var mx=(e.clientX-rect.left)*(W/rect.width);
    var my=(e.clientY-rect.top)*(H/rect.height);
    var hovered=null;
    filteredStores().forEach(function(s){
      var dx=s.x*W-mx, dy=s.y*H-my;
      var r = s.id===selectedId ? 16 : 10;
      if (Math.sqrt(dx*dx+dy*dy)<r+4) hovered=s;
    });
    if (hovered && tooltip){
      tooltip.innerHTML='<strong>'+hovered.name+'</strong><br>'+hovered.dist.toFixed(2)+' km · ⭐ '+hovered.rating+' · <span style="color:'+THREAT_COLORS[hovered.threat]+'">'+hovered.threat+'</span>';
      tooltip.style.display='block';
      tooltip.style.left=(e.clientX-rect.left+12)+'px';
      tooltip.style.top=(e.clientY-rect.top-10)+'px';
      canvas.style.cursor='pointer';
    } else { if(tooltip) tooltip.style.display='none'; canvas.style.cursor=''; }
  });
  canvas.addEventListener('mouseleave', function(){ if(tooltip) tooltip.style.display='none'; });

  document.querySelectorAll('.mft-btn').forEach(function(btn){
    btn.addEventListener('click', function(){
      document.querySelectorAll('.mft-btn').forEach(function(b){ b.classList.remove('active'); });
      btn.classList.add('active');
      currentType=btn.dataset.type; selectedId=null;
      var dc=document.getElementById('storeDetailCard'); if(dc) dc.style.display='none';
      drawMap(); renderList();
    });
  });

  var sortEl=document.getElementById('mapSort');
  if(sortEl) sortEl.addEventListener('change',function(){ sortMode=sortEl.value; renderList(); });

  var mapSearch=document.getElementById('mapSearch');
  if(mapSearch) mapSearch.addEventListener('input',function(){ searchQuery=mapSearch.value.toLowerCase(); drawMap(); renderList(); });

  var sdcClose=document.getElementById('sdcClose');
  if(sdcClose) sdcClose.addEventListener('click',function(){
    selectedId=null;
    var dc=document.getElementById('storeDetailCard'); if(dc) dc.style.display='none';
    drawMap(); renderList();
  });

  var mapSection=document.getElementById('cpanel-map');
  if(mapSection){
    var loaded = false;
    var obs=new IntersectionObserver(function(entries){
      if(entries[0].isIntersecting && !loaded){
        loaded = true;
        if(navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(function(pos){
            userLat = pos.coords.latitude; userLon = pos.coords.longitude;
            loadRealStores();
          }, function(){ loadRealStores(); }); // fallback to NYC if denied
        } else {
          loadRealStores();
        }
      }
    },{ threshold:0.1 });
    obs.observe(mapSection);
  }
})();

/* ============================================================
   AI CHATBOT — Hugging Face Inference API with fallback
   ============================================================ */
(function initChatbot() {
  var bubble   = document.getElementById('chatbotBubble');
  var panel    = document.getElementById('chatbotPanel');
  var closeBtn = document.getElementById('chatMinimize');
  var messages = document.getElementById('chatMessages');
  var input    = document.getElementById('chatInput');
  var sendBtn  = document.getElementById('chatSend');
  if (!bubble || !panel) return;

  var isOpen = false;

  function togglePanel() {
    isOpen = !isOpen;
    panel.style.display = isOpen ? 'flex' : 'none';
    bubble.classList.toggle('active', isOpen);
    if (isOpen) setTimeout(function(){ if(input) input.focus(); }, 200);
  }

  bubble.addEventListener('click', togglePanel);
  if (closeBtn) closeBtn.addEventListener('click', togglePanel);

  document.querySelectorAll('.qc-chip').forEach(function(chip){
    chip.addEventListener('click', function(){ sendMessage(chip.dataset.msg); });
  });

  if (input) input.addEventListener('keydown', function(e){ if(e.key==='Enter'&&!e.shiftKey){ e.preventDefault(); sendMessage(input.value.trim()); } });
  if (sendBtn) sendBtn.addEventListener('click', function(){ sendMessage(input ? input.value.trim() : ''); });

  function appendMsg(content, role) {
    var div = document.createElement('div');
    div.className = 'chat-msg ' + role;
    var timeStr = new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
    div.innerHTML = '<div class="chat-bubble">'+content+'</div><div class="chat-time">'+timeStr+'</div>';
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }

  function showTyping() {
    var div = document.createElement('div');
    div.className = 'chat-msg bot'; div.id = 'chatTyping';
    div.innerHTML = '<div class="chat-bubble"><div class="typing-dots"><span></span><span></span><span></span></div></div>';
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }
  function hideTyping() { var el=document.getElementById('chatTyping'); if(el) el.remove(); }

  var SCRIPTED = [
    { match:/what is bizinsight|about bizinsight/i, reply:'BizInsight is an AI-powered business analytics platform that helps SMEs make smarter, data-driven decisions through intelligent insights, predictive analytics, customer sentiment analysis, and competitor intelligence. \uD83D\uDE80' },
    { match:/predictive|forecast|revenue/i, reply:'\uD83D\uDCC8 BizInsight\'s Predictive Analytics uses TensorFlow ML models to forecast sales and revenue with up to 95% accuracy. Try the live demo in the Features section!' },
    { match:/sentiment|review|customer feedback/i, reply:'\uD83D\uDCAC The Sentiment Analysis module uses NLP to analyze customer reviews, social media, and support tickets in real-time \u2014 classifying by emotion, intent, and urgency.' },
    { match:/competitor|market share|nearby store|map/i, reply:'\uD83D\uDD0D The Competitor Analysis module includes market benchmarking, SWOT analysis, and a live Nearby Stores Map where you can see competitors filtered by type, distance, and threat level!' },
    { match:/pricing|cost|plan|free/i, reply:'\uD83D\uDCB0 BizInsight is currently in preview. Contact Shijo Varghese at shijo@bizinsight.ai for pricing. Enterprise plans with dedicated AI model training are available!' },
    { match:/tech|stack|react|python|tensorflow/i, reply:'\uD83D\uDEE0\uFE0F BizInsight is built on React.js, Node.js, MongoDB, Python, and TensorFlow \u2014 a modern, scalable architecture designed for enterprise performance.' },
    { match:/sdg|sustainability|un goal/i, reply:'\uD83C\uDF0D BizInsight aligns with UN SDGs: SDG 8 (Economic Growth), SDG 9 (Innovation), and SDG 12 (Responsible Consumption).' },
    { match:/contact|email|reach/i, reply:'\u2709\uFE0F Reach the BizInsight team at shijo@bizinsight.ai. Typically responds within 24 hours.' },
    { match:/hello|hi|hey|good/i, reply:'\uD83D\uDC4B Hello! Welcome to BizInsight! I can help you explore our AI analytics features, demos, competitor intelligence, and more. What would you like to know?' },
    { match:/creativity|creative|typewriter/i, reply:'\uD83C\uDFA8 The AI Creativity Engine generates live business summaries, auto data stories, and AI opportunity bursts. Scroll down to the Creativity section to see it in action!' },
    { match:/chatbot|you|who are you/i, reply:'\uD83E\uDD16 I\'m the BizInsight AI Assistant! I\'m powered by AI to help you understand how BizInsight can transform your business analytics. Ask me anything!' }
  ];

  function getScriptedReply(text) {
    for (var i=0; i<SCRIPTED.length; i++) { if (SCRIPTED[i].match.test(text)) return SCRIPTED[i].reply; }
    return null;
  }

  var FALLBACKS = [
    'I can help with that! BizInsight offers comprehensive AI analytics including predictive forecasting, sentiment analysis, and competitor intelligence. What specific feature interests you most? \uD83E\uDD16',
    'Great question! BizInsight\'s AI platform helps your business grow through smarter data decisions. Try our live demos in the Features section! \uD83D\uDCCA',
    'BizInsight combines machine learning, NLP, and predictive analytics to give you a 360\u00B0 view of your business. What would you like to explore? \uD83D\uDCA1'
  ];

  function sendMessage(text) {
    if (!text) return;
    if (input) input.value = '';
    appendMsg(text, 'user');
    var chips = document.getElementById('chatQuickChips');
    if (chips) chips.style.display = 'none';
    showTyping();

    var scripted = getScriptedReply(text);
    if (scripted) {
      setTimeout(function(){ hideTyping(); appendMsg(scripted,'bot'); }, 800 + Math.random()*400);
      return;
    }

    // Try Hugging Face API
    var prompt = '<s>[INST] You are the BizInsight AI Assistant. BizInsight is an AI analytics platform with Predictive Analytics, Sentiment Analysis, Competitor Analysis, Nearby Stores Map, and an AI Creativity Engine. Creator: Shijo Varghese. Keep responses under 3 sentences. Be friendly.\n\nUser: '+text+' [/INST]';

    fetch('https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({ inputs:prompt, parameters:{ max_new_tokens:180, temperature:0.7, return_full_text:false } })
    }).then(function(res){
      if (!res.ok) throw new Error('API unavailable');
      return res.json();
    }).then(function(data){
      var reply = (Array.isArray(data) ? data[0].generated_text : data.generated_text) || '';
      reply = reply.replace(/<s>\[INST\].*?\[\/INST\]/gs,'').trim();
      if (!reply) throw new Error('empty');
      hideTyping();
      appendMsg(reply, 'bot');
    }).catch(function(){
      hideTyping();
      appendMsg(FALLBACKS[Math.floor(Math.random()*FALLBACKS.length)], 'bot');
    });
  }
})();



// =====================================================
//   DATA VISUALIZATION DEMO MODAL
// =====================================================
(function initVizModal() {
  var $ = function(id) { return document.getElementById(id); };

  // --- Open / Close ---
  var modal = $('vizDemoModal');
  if (!modal) return;

  function openViz() {
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    renderKPICards();
    setTimeout(function() { drawLineChart(); }, 120);
  }
  function closeViz() {
    modal.hidden = true;
    document.body.style.overflow = '';
  }

  $('openVizDemo') && $('openVizDemo').addEventListener('click', openViz);
  $('closeVizDemo') && $('closeVizDemo').addEventListener('click', closeViz);
  modal.addEventListener('click', function(e) { if (e.target === modal) closeViz(); });

  // --- Tab Switching ---
  var drawn = { line: false, bar: false, donut: false, kpi: true };
  document.querySelectorAll('[data-vtab]').forEach(function(btn) {
    btn.addEventListener('click', function() {
      document.querySelectorAll('[data-vtab]').forEach(function(b) {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      document.querySelectorAll('#vizDemoModal .ai-tab-panel').forEach(function(p) { p.classList.remove('active'); });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      var panel = $('vpanel-' + btn.dataset.vtab);
      if (panel) panel.classList.add('active');

      var t = btn.dataset.vtab;
      if (t === 'line'  && !drawn.line)  { setTimeout(drawLineChart, 80); }
      if (t === 'bar'   && !drawn.bar)   { setTimeout(drawBarChart, 80); }
      if (t === 'donut' && !drawn.donut) { setTimeout(drawDonutChart, 80); }
    });
  });

  // ---- Animate buttons ----
  $('animateLineBtn')  && $('animateLineBtn').addEventListener('click',  function() { drawn.line = false; drawLineChart(); });
  $('animateBarBtn')   && $('animateBarBtn').addEventListener('click',   function() { drawn.bar = false; drawBarChart(); });
  $('animateDonutBtn') && $('animateDonutBtn').addEventListener('click', function() { drawn.donut = false; drawDonutChart(); });

  // ======= LINE CHART =======
  function drawLineChart() {
    drawn.line = true;
    var canvas = $('lineChartCanvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var W = canvas.width, H = canvas.height;
    var mode = ($('vizLineRange') || {}).value || 'monthly';

    var datasets = {
      monthly:   { labels:['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'], data:[42,55,48,70,65,80,74,90,85,95,88,110] },
      quarterly: { labels:['Q1 2023','Q2 2023','Q3 2023','Q4 2023','Q1 2024','Q2 2024'], data:[128,156,174,192,210,238] },
      weekly:    { labels:['Wk1','Wk2','Wk3','Wk4','Wk5','Wk6','Wk7','Wk8'], data:[22,28,25,35,32,40,38,46] }
    };
    var d = datasets[mode] || datasets.monthly;
    var labels = d.labels, raw = d.data;
    var pad = { t:24, r:24, b:40, l:54 };
    var cW = W - pad.l - pad.r, cH = H - pad.t - pad.b;
    var maxV = Math.max.apply(null, raw) * 1.15;
    var minV = 0;

    var isDark = document.documentElement.dataset.theme !== 'light';
    var gridCol  = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
    var textCol  = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.4)';
    var bg1      = isDark ? '#1e1b4b' : '#f0fdf4';

    function xPos(i) { return pad.l + (i / (labels.length - 1)) * cW; }
    function yPos(v) { return pad.t + cH - ((v - minV) / (maxV - minV)) * cH; }

    var progress = 0, raf;
    function animate() {
      ctx.clearRect(0, 0, W, H);

      // Grid
      ctx.strokeStyle = gridCol;
      ctx.lineWidth = 1;
      for (var g = 0; g <= 5; g++) {
        var gy = pad.t + (g / 5) * cH;
        ctx.beginPath(); ctx.moveTo(pad.l, gy); ctx.lineTo(W - pad.r, gy); ctx.stroke();
        var val = Math.round(maxV - (g / 5) * maxV);
        ctx.fillStyle = textCol; ctx.font = '11px Inter, sans-serif'; ctx.textAlign = 'right';
        ctx.fillText('$' + val + 'k', pad.l - 6, gy + 4);
      }

      // X labels
      ctx.textAlign = 'center'; ctx.fillStyle = textCol; ctx.font = '11px Inter, sans-serif';
      labels.forEach(function(lbl, i) { ctx.fillText(lbl, xPos(i), H - 8); });

      // Gradient fill
      var pts = Math.max(2, Math.round(progress * (labels.length - 1)));
      if (pts >= 2) {
        var grad = ctx.createLinearGradient(0, pad.t, 0, pad.t + cH);
        grad.addColorStop(0, 'rgba(16,185,129,0.35)');
        grad.addColorStop(1, 'rgba(16,185,129,0.0)');
        ctx.beginPath();
        ctx.moveTo(xPos(0), yPos(raw[0]));
        for (var i = 1; i < pts && i < labels.length; i++) ctx.lineTo(xPos(i), yPos(raw[i]));
        ctx.lineTo(xPos(pts - 1), pad.t + cH);
        ctx.lineTo(pad.l, pad.t + cH);
        ctx.closePath();
        ctx.fillStyle = grad; ctx.fill();
      }

      // Line
      ctx.beginPath();
      ctx.strokeStyle = '#10b981'; ctx.lineWidth = 2.5;
      ctx.lineJoin = 'round'; ctx.lineCap = 'round';
      ctx.moveTo(xPos(0), yPos(raw[0]));
      for (var i = 1; i < pts && i < labels.length; i++) ctx.lineTo(xPos(i), yPos(raw[i]));
      ctx.stroke();

      // Dots
      for (var i = 0; i < pts && i < labels.length; i++) {
        ctx.beginPath();
        ctx.arc(xPos(i), yPos(raw[i]), 4, 0, Math.PI * 2);
        ctx.fillStyle = '#10b981'; ctx.fill();
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.stroke();
      }

      if (progress < 1) { progress = Math.min(1, progress + 0.045); raf = requestAnimationFrame(animate); }
    }
    cancelAnimationFrame(raf);
    progress = 0;
    animate();
  }

  // ======= BAR CHART =======
  function drawBarChart() {
    drawn.bar = true;
    var canvas = $('barChartCanvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var W = canvas.width, H = canvas.height;
    var mode = ($('vizBarMode') || {}).value || 'monthly';

    var categories = ['Electronics','Apparel','Home & Living','Food & Bev','Sports'];
    var colors = ['#6366f1','#06b6d4','#10b981','#f59e0b','#ec4899'];
    var monthly   = [85, 72, 54, 61, 48];
    var quarterly = [258, 221, 164, 183, 141];
    var raw = mode === 'quarterly' ? quarterly : monthly;
    var unit = mode === 'quarterly' ? 'k' : 'k';

    var pad = { t:24, r:24, b:50, l:54 };
    var cW = W - pad.l - pad.r, cH = H - pad.t - pad.b;
    var maxV = Math.max.apply(null, raw) * 1.2;
    var bW = (cW / categories.length) * 0.6;
    var gap = (cW / categories.length);

    var isDark = document.documentElement.dataset.theme !== 'light';
    var gridCol = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
    var textCol = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.4)';

    var progress = 0, raf;
    function animate() {
      ctx.clearRect(0, 0, W, H);
      // Grid
      for (var g = 0; g <= 4; g++) {
        var gy = pad.t + (g / 4) * cH;
        ctx.strokeStyle = gridCol; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(pad.l, gy); ctx.lineTo(W - pad.r, gy); ctx.stroke();
        var val = Math.round(maxV - (g / 4) * maxV);
        ctx.fillStyle = textCol; ctx.font = '11px Inter, sans-serif'; ctx.textAlign = 'right';
        ctx.fillText('$' + val + unit, pad.l - 6, gy + 4);
      }
      categories.forEach(function(cat, i) {
        var barH = ((raw[i] / maxV) * cH) * progress;
        var x = pad.l + i * gap + (gap - bW) / 2;
        var y = pad.t + cH - barH;
        // Bar gradient
        var g2 = ctx.createLinearGradient(0, y, 0, pad.t + cH);
        g2.addColorStop(0, colors[i]);
        g2.addColorStop(1, colors[i] + '66');
        ctx.fillStyle = g2;
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(x, y, bW, barH, [6, 6, 0, 0]) : ctx.rect(x, y, bW, barH);
        ctx.fill();
        // Label
        ctx.fillStyle = textCol; ctx.font = '11px Inter, sans-serif'; ctx.textAlign = 'center';
        var shortCat = cat.length > 9 ? cat.split(' ')[0] : cat;
        ctx.fillText(shortCat, x + bW / 2, H - 8);
        // Value on top
        if (progress > 0.7) {
          ctx.fillStyle = colors[i]; ctx.font = 'bold 11px Inter, sans-serif';
          ctx.fillText('$' + raw[i] + unit, x + bW / 2, y - 6);
        }
      });
      if (progress < 1) { progress = Math.min(1, progress + 0.04); raf = requestAnimationFrame(animate); }
    }
    cancelAnimationFrame(raf);
    progress = 0;
    animate();
  }

  // ======= DONUT CHART =======
  function drawDonutChart() {
    drawn.donut = true;
    var canvas = $('donutChartCanvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var W = canvas.width, H = canvas.height;
    var cx = W / 2, cy = H / 2, R = Math.min(W, H) / 2 - 16, rInner = R * 0.55;

    var sector = ($('vizDonutSector') || {}).value || 'retail';
    var sectors = {
      retail:  { labels:['Your Brand','Amazon','Walmart','Target','Others'], data:[23,34,18,12,13], colors:['#6366f1','#06b6d4','#10b981','#f59e0b','#ec4899'] },
      saas:    { labels:['Your Brand','Salesforce','HubSpot','Zoho','Others'], data:[18,29,22,15,16], colors:['#8b5cf6','#6366f1','#06b6d4','#10b981','#ec4899'] },
      finance: { labels:['Your Brand','Stripe','PayPal','Square','Others'], data:[21,31,20,14,14], colors:['#10b981','#6366f1','#f59e0b','#06b6d4','#8b5cf6'] }
    };
    var d = sectors[sector] || sectors.retail;
    var total = d.data.reduce(function(a, b) { return a + b; }, 0);
    var legend = $('donutLegend');
    if (legend) {
      legend.innerHTML = d.labels.map(function(lbl, i) {
        return '<div class="donut-legend-item"><div class="donut-legend-dot" style="background:' + d.colors[i] + '"></div>' +
          '<span class="donut-legend-label">' + lbl + '</span><span class="donut-legend-pct">' + d.data[i] + '%</span></div>';
      }).join('');
    }

    var progress = 0, raf;
    function animate() {
      ctx.clearRect(0, 0, W, H);
      var startAngle = -Math.PI / 2;
      d.data.forEach(function(val, i) {
        var slice = (val / total) * Math.PI * 2 * progress;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, R, startAngle, startAngle + slice);
        ctx.closePath();
        ctx.fillStyle = d.colors[i];
        ctx.fill();
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 2.5; ctx.stroke();
        startAngle += slice;
      });
      // Inner hole
      var isDark = document.documentElement.dataset.theme !== 'light';
      ctx.beginPath();
      ctx.arc(cx, cy, rInner, 0, Math.PI * 2);
      ctx.fillStyle = isDark ? '#1e1b4b' : '#f8faff';
      ctx.fill();
      // Center text
      if (progress > 0.7) {
        ctx.fillStyle = isDark ? '#fff' : '#1e1b4b';
        ctx.font = 'bold 22px Inter, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(d.data[0] + '%', cx, cy - 8);
        ctx.font = '11px Inter, sans-serif'; ctx.fillStyle = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)';
        ctx.fillText('Your Share', cx, cy + 12);
      }
      if (progress < 1) { progress = Math.min(1, progress + 0.04); raf = requestAnimationFrame(animate); }
    }
    cancelAnimationFrame(raf);
    progress = 0;
    animate();
  }

  // ======= KPI CARDS =======
  function renderKPICards() {
    document.querySelectorAll('.kpi-card').forEach(function(card) {
      var target  = parseFloat(card.dataset.target);
      var suffix  = card.dataset.suffix || '';
      var label   = card.dataset.label || '';
      var icon    = card.dataset.icon  || '';
      var color   = card.dataset.color || '#6366f1';
      var trend   = card.dataset.trend || '';

      card.style.setProperty('--kpi-color', color);
      card.innerHTML =
        '<span class="kpi-icon">' + icon + '</span>' +
        '<div class="kpi-value" id="kv-' + label.replace(/\s/g,'') + '">0</div>' +
        '<div class="kpi-label">' + label + '</div>' +
        '<div class="kpi-trend">' + trend + '</div>';

      var el = card.querySelector('.kpi-value');
      var start = 0, dur = 1200, startTime = null;
      function countUp(ts) {
        if (!startTime) startTime = ts;
        var p = Math.min((ts - startTime) / dur, 1);
        var ease = 1 - Math.pow(1 - p, 3);
        var val = start + (target - start) * ease;
        el.textContent = (target >= 100 ? Math.round(val) : val.toFixed(target < 5 ? 2 : 1)) + suffix;
        if (p < 1) requestAnimationFrame(countUp);
      }
      requestAnimationFrame(countUp);
    });
  }

  // Re-draw on select change
  $('vizLineRange')  && $('vizLineRange').addEventListener('change',  function() { drawn.line  = false; drawLineChart(); });
  $('vizBarMode')    && $('vizBarMode').addEventListener('change',    function() { drawn.bar   = false; drawBarChart(); });
  $('vizDonutSector')&& $('vizDonutSector').addEventListener('change',function() { drawn.donut = false; drawDonutChart(); });
})();


// =====================================================
//   SMART RECOMMENDATIONS DEMO MODAL
// =====================================================
(function initRecModal() {
  var $ = function(id) { return document.getElementById(id); };

  var modal = $('recDemoModal');
  if (!modal) return;

  function openRec() {
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    populateROITable();
    populateActionPlan('retail');
  }
  function closeRec() {
    modal.hidden = true;
    document.body.style.overflow = '';
  }

  $('openRecDemo') && $('openRecDemo').addEventListener('click', openRec);
  $('closeRecDemo')&& $('closeRecDemo').addEventListener('click', closeRec);
  modal.addEventListener('click', function(e) { if (e.target === modal) closeRec(); });

  // Tab Switching
  document.querySelectorAll('[data-rtab]').forEach(function(btn) {
    btn.addEventListener('click', function() {
      document.querySelectorAll('[data-rtab]').forEach(function(b) {
        b.classList.remove('active'); b.setAttribute('aria-selected','false');
      });
      document.querySelectorAll('#recDemoModal .ai-tab-panel').forEach(function(p) { p.classList.remove('active'); });
      btn.classList.add('active'); btn.setAttribute('aria-selected','true');
      var panel = $('rpanel-' + btn.dataset.rtab);
      if (panel) panel.classList.add('active');
    });
  });

  // ======= RECOMMENDATION GENERATOR =======
  var REC_DATA = {
    retail: {
      revenue: [
        { title:'Launch Loyalty Points Program', desc:'Implement a tiered rewards system to increase repeat purchases. Customers with loyalty memberships spend 37% more on average.', roi:'High (+28%)', effort:'Medium', time:'30 days', color:'#10b981' },
        { title:'Dynamic Pricing Engine', desc:'Use AI-driven dynamic pricing to maximize margins during peak demand hours and stay competitive during slow periods.', roi:'High (+22%)', effort:'High', time:'45 days', color:'#6366f1' },
        { title:'Abandoned Cart Recovery', desc:'Automated email + SMS sequences targeting users who left items in cart. Industry average recovery rate is 15-20%.', roi:'Medium (+15%)', effort:'Low', time:'7 days', color:'#06b6d4' },
        { title:'Cross-Sell Recommendation Engine', desc:'AI model that suggests complementary products based on purchase history and browsing patterns — proven to lift AOV by 18%.', roi:'High (+18%)', effort:'Medium', time:'21 days', color:'#f59e0b' }
      ],
      churn: [
        { title:'Churn Prediction Model', desc:'Deploy ML model to identify at-risk customers 30 days before they churn. Proactive outreach reduces churn by up to 25%.', roi:'High (+25%)', effort:'High', time:'21 days', color:'#10b981' },
        { title:'Re-engagement Email Campaign', desc:'Automated win-back sequences for customers inactive >60 days with personalized offers based on past purchase behavior.', roi:'Medium (+14%)', effort:'Low', time:'5 days', color:'#6366f1' },
        { title:'NPS Survey + Feedback Loop', desc:'Monthly NPS touchpoints with immediate escalation for detractors. Businesses acting on NPS see 2x retention improvement.', roi:'Medium (+12%)', effort:'Low', time:'3 days', color:'#f59e0b' }
      ],
      acquisition: [
        { title:'Referral Program Launch', desc:'Incentivize existing customers to refer new ones with dual-sided rewards. Referral customers have 16% higher LTV.', roi:'High (+31%)', effort:'Medium', time:'14 days', color:'#ec4899' },
        { title:'Google Shopping Ads Optimization', desc:'Restructure product feed and bidding strategy using AI. Proper optimization typically yields 3x ROAS improvement.', roi:'High (+40% ROAS)', effort:'Medium', time:'10 days', color:'#6366f1' },
        { title:'Influencer Micro-Campaign', desc:'Partner with 10-15 niche micro-influencers (10k-100k followers). Cost-effective acquisition with authentic reach.', roi:'Medium (+18%)', effort:'Medium', time:'21 days', color:'#f59e0b' }
      ],
      cost: [
        { title:'Inventory Demand Forecasting', desc:'AI-powered demand prediction reduces overstock by 34% and prevents stockouts. Direct impact on working capital efficiency.', roi:'High (-34% waste)', effort:'High', time:'30 days', color:'#10b981' },
        { title:'Automate Customer Support (AI Chat)', desc:'Deploy AI chatbot to handle 60-70% of tier-1 support queries. Reduces support team cost by up to 40%.', roi:'High (-40% cost)', effort:'Medium', time:'14 days', color:'#06b6d4' },
        { title:'Supplier Negotiation Intelligence', desc:'Use market price benchmarking data to renegotiate supplier contracts. BizInsight customers save avg 12% on COGS.', roi:'Medium (-12% COGS)', effort:'Low', time:'7 days', color:'#f59e0b' }
      ],
      nps: [
        { title:'Post-Purchase Experience Flow', desc:'Automated delivery updates, unboxing tips, and 7-day follow-up surveys. Improves NPS score by avg +18 points.', roi:'High (+18 NPS)', effort:'Low', time:'5 days', color:'#10b981' },
        { title:'Personalized Product Recommendations', desc:'AI-curated product suggestions in order confirmation emails based on purchase context.', roi:'Medium (+11 NPS)', effort:'Medium', time:'14 days', color:'#8b5cf6' },
        { title:'Proactive Issue Resolution', desc:'Monitor social + review platforms for negative signals and respond within 2 hours. Reduces negative NPS by 22%.', roi:'Medium (+9 NPS)', effort:'Low', time:'3 days', color:'#06b6d4' }
      ]
    },
    saas: {
      revenue: [
        { title:'Expansion Revenue via Upsells', desc:'Identify power users in free/basic tiers and trigger contextual upgrade prompts. Expansion MRR can exceed new MRR within 12 months.', roi:'High (+35% MRR)', effort:'Medium', time:'14 days', color:'#6366f1' },
        { title:'Annual Plan Incentive Campaign', desc:'Offer 2 months free for annual commitment. Improves cash flow and reduces churn probability by 60%.', roi:'High (+41% ARR)', effort:'Low', time:'7 days', color:'#10b981' },
        { title:'Usage-Based Pricing Model', desc:'Align pricing with customer value delivered. Usage-based models see 1.5x faster revenue growth vs fixed pricing.', roi:'High (+28%)', effort:'High', time:'60 days', color:'#f59e0b' }
      ],
      churn: [
        { title:'Product Adoption Playbook', desc:'Automated onboarding sequences tied to feature adoption milestones. Users who adopt 3+ features churn 4x less.', roi:'High (-30% churn)', effort:'Medium', time:'21 days', color:'#10b981' },
        { title:'Customer Success Triggers', desc:'Alert CS team when usage drops >40% for 7+ days. Proactive outreach before churn intent solidifies.', roi:'High (-25% churn)', effort:'Low', time:'5 days', color:'#6366f1' },
        { title:'Competitive Win-Back Sequences', desc:'When churned users cite competitor as reason, trigger targeted re-engagement with differentiation messaging.', roi:'Medium (-12% churn)', effort:'Medium', time:'14 days', color:'#ec4899' }
      ]
    },
    finance: {
      revenue: [
        { title:'Cross-Sell Insurance Products', desc:'AI identifies customers with high credit scores and low risk profiles as prime candidates for bundled insurance products.', roi:'High (+24%)', effort:'Medium', time:'30 days', color:'#10b981' },
        { title:'Premium Tier Launch', desc:'Create a premium account tier with priority support and advanced analytics. Conversion from basic averages 18%.', roi:'High (+32%)', effort:'High', time:'45 days', color:'#6366f1' }
      ]
    },
    health: {
      nps: [
        { title:'Patient Follow-Up Automation', desc:'Automated post-appointment check-ins via SMS/email. Improves adherence and patient satisfaction scores significantly.', roi:'High (+22 NPS)', effort:'Low', time:'7 days', color:'#10b981' }
      ]
    },
    restaurant: {
      revenue: [
        { title:'Table Turnover Optimization', desc:'AI suggests optimal seating sequences and kitchen workflow to reduce average table time by 18%, increasing covers per night.', roi:'High (+23%)', effort:'Medium', time:'14 days', color:'#f59e0b' },
        { title:'Digital Loyalty Program', desc:'QR-code based loyalty stamps drive repeat visits. Restaurant loyalty members visit 2.6x more frequently.', roi:'High (+31%)', effort:'Low', time:'7 days', color:'#ec4899' },
        { title:'Menu Engineering with AI', desc:'Analyze margin and popularity data per item. Restructure menu layout to promote high-margin items. Avg +14% profit.', roi:'Medium (+14%)', effort:'Low', time:'5 days', color:'#10b981' }
      ]
    }
  };

  $('generateRecBtn') && $('generateRecBtn').addEventListener('click', function() {
    var industry = ($('recIndustry') || {}).value || 'retail';
    var goal     = ($('recGoal') || {}).value || 'revenue';
    var out      = $('recOutput');
    if (!out) return;

    var indData = REC_DATA[industry] || REC_DATA.retail;
    var recs    = indData[goal] || indData.revenue || [];

    if (!recs.length) {
      out.innerHTML = '<div class="rec-placeholder"><span>&#128161;</span><p>Great news — no major issues detected for this combination. Your business is performing optimally in this area.</p></div>';
      return;
    }

    out.innerHTML = recs.map(function(rec, i) {
      var rankColors = ['#10b981','#6366f1','#f59e0b','#ec4899','#06b6d4'];
      return '<div class="rec-card" style="animation-delay:' + (i * 0.1) + 's">' +
        '<div class="rec-rank" style="background:' + rankColors[i % rankColors.length] + '22;color:' + rankColors[i % rankColors.length] + '">' + (i + 1) + '</div>' +
        '<div class="rec-body">' +
          '<div class="rec-title">' + rec.title + '</div>' +
          '<div class="rec-desc">' + rec.desc + '</div>' +
          '<div class="rec-meta">' +
            '<span class="rec-tag" style="background:rgba(16,185,129,0.1);color:#10b981;border-color:rgba(16,185,129,0.3);">&#128200; ROI: ' + rec.roi + '</span>' +
            '<span class="rec-tag" style="background:rgba(99,102,241,0.1);color:#6366f1;border-color:rgba(99,102,241,0.3);">&#8987; ' + rec.time + '</span>' +
            '<span class="rec-tag" style="background:rgba(245,158,11,0.1);color:#f59e0b;border-color:rgba(245,158,11,0.3);">Effort: ' + rec.effort + '</span>' +
          '</div>' +
        '</div>' +
      '</div>';
    }).join('');
  });

  // ======= ROI TABLE =======
  function populateROITable() {
    var tbody = $('roiTableBody');
    if (!tbody) return;
    var rows = [
      { rank:1, opp:'Launch Loyalty Program',          roi:'+28%',  effort:'Medium', time:'30 days', priority:'High'   },
      { rank:2, opp:'Referral Acquisition Program',    roi:'+31%',  effort:'Medium', time:'14 days', priority:'High'   },
      { rank:3, opp:'AI Demand Forecasting',           roi:'-34% waste', effort:'High', time:'30 days', priority:'High' },
      { rank:4, opp:'Abandoned Cart Recovery',         roi:'+15%',  effort:'Low',    time:'7 days',  priority:'High'   },
      { rank:5, opp:'Dynamic Pricing Engine',          roi:'+22%',  effort:'High',   time:'45 days', priority:'Medium' },
      { rank:6, opp:'Cross-sell Recommendations',      roi:'+18%',  effort:'Medium', time:'21 days', priority:'Medium' },
      { rank:7, opp:'NPS Survey + Feedback Loop',      roi:'+12 NPS', effort:'Low',  time:'3 days',  priority:'Medium' },
      { rank:8, opp:'Influencer Micro-Campaign',       roi:'+18%',  effort:'Medium', time:'21 days', priority:'Low'    },
    ];
    var cls = { High:'roi-high', Medium:'roi-med', Low:'roi-low' };
    tbody.innerHTML = rows.map(function(r) {
      return '<tr>' +
        '<td><strong>#' + r.rank + '</strong></td>' +
        '<td>' + r.opp + '</td>' +
        '<td><strong style="color:#10b981">' + r.roi + '</strong></td>' +
        '<td>' + r.effort + '</td>' +
        '<td>' + r.time + '</td>' +
        '<td><span class="roi-badge ' + (cls[r.priority] || 'roi-med') + '">' + r.priority + '</span></td>' +
      '</tr>';
    }).join('');
  }

  // ======= ACTION PLAN =======
  var PLANS = {
    retail: {
      d30: [
        { icon:'&#128202;', text:'Audit current analytics setup & identify data gaps' },
        { icon:'&#128181;', text:'Launch abandoned cart email sequence (5-touch)' },
        { icon:'&#9889;',   text:'Deploy AI chatbot for tier-1 customer support' },
        { icon:'&#127775;', text:'Set up loyalty program foundation & reward tiers' }
      ],
      d60: [
        { icon:'&#128200;', text:'Activate AI-powered cross-sell recommendations on PDP pages' },
        { icon:'&#128101;', text:'Launch referral program with dual-sided incentives' },
        { icon:'&#127919;', text:'Run A/B test on pricing page & checkout flow' },
        { icon:'&#128203;', text:'Review Q1 performance vs KPIs and adjust strategy' }
      ],
      d90: [
        { icon:'&#128293;', text:'Full dynamic pricing engine go-live across all SKUs' },
        { icon:'&#128241;', text:'Launch SMS marketing for loyalty program members' },
        { icon:'&#127760;', text:'Expand into 2 new acquisition channels based on data' },
        { icon:'&#129354;', text:'Present Q1 results — target +25% MoM revenue growth' }
      ]
    },
    saas: {
      d30: [
        { icon:'&#128202;', text:'Map full customer journey from signup to activation' },
        { icon:'&#128640;', text:'Identify top 3 activation milestones tied to retention' },
        { icon:'&#9889;',   text:'Build automated onboarding email sequence (8 emails)' },
        { icon:'&#128201;', text:'Instrument usage analytics for churn signal detection' }
      ],
      d60: [
        { icon:'&#128161;', text:'Deploy in-app contextual upsell prompts for power users' },
        { icon:'&#129504;', text:'Launch NPS collection & close the loop with detractors' },
        { icon:'&#128203;', text:'Create annual plan campaign with 2-month-free incentive' },
        { icon:'&#128101;', text:'Train CS team on expansion revenue playbooks' }
      ],
      d90: [
        { icon:'&#128293;', text:'Launch usage-based pricing model for new sign-ups' },
        { icon:'&#127775;', text:'Publish customer success story content (3 case studies)' },
        { icon:'&#128176;', text:'Target expansion MRR to match new MRR for first time' },
        { icon:'&#129354;', text:'Review full funnel — target <5% monthly churn rate' }
      ]
    },
    finance: {
      d30: [
        { icon:'&#128202;', text:'Segment customer base by risk profile and LTV' },
        { icon:'&#128181;', text:'Identify cross-sell opportunities in existing portfolio' },
        { icon:'&#9889;',   text:'Set up fraud detection alert thresholds with AI model' },
        { icon:'&#128101;', text:'Launch premium account waitlist for high-value users' }
      ],
      d60: [
        { icon:'&#127775;', text:'Go-live with premium tier — target 15% conversion' },
        { icon:'&#128200;', text:'Deploy AI-powered credit scoring for faster approvals' },
        { icon:'&#128293;', text:'Run targeted insurance bundle campaign to eligible users' },
        { icon:'&#128203;', text:'Review regulatory compliance for new product features' }
      ],
      d90: [
        { icon:'&#129354;', text:'Achieve 10% of user base on premium plan' },
        { icon:'&#127760;', text:'Expand to 2 new geographic markets with localization' },
        { icon:'&#128161;', text:'Launch AI financial advisor feature in beta' },
        { icon:'&#128176;', text:'Target +30% ARR growth vs prior quarter' }
      ]
    },
    restaurant: {
      d30: [
        { icon:'&#128202;', text:'Analyze menu item profitability matrix with AI' },
        { icon:'&#9989;',   text:'Redesign menu to highlight high-margin hero items' },
        { icon:'&#128241;', text:'Launch QR-code loyalty stamp card program' },
        { icon:'&#9889;',   text:'Set up table management & reservation optimization system' }
      ],
      d60: [
        { icon:'&#127775;', text:'Launch catering/events upsell to loyalty members' },
        { icon:'&#128101;', text:'Train staff on upselling scripts for add-ons & desserts' },
        { icon:'&#128200;', text:'Analyze peak hours and adjust staffing/pricing accordingly' },
        { icon:'&#128293;', text:'Partner with delivery apps — optimize listing SEO' }
      ],
      d90: [
        { icon:'&#129354;', text:'Target 500+ loyalty members with avg 2.6x visit frequency' },
        { icon:'&#127760;', text:'Launch ghost kitchen concept for delivery-only revenue' },
        { icon:'&#128181;', text:'Review supplier contracts using market benchmark data' },
        { icon:'&#128161;', text:'Expand seating or open 2nd location based on demand data' }
      ]
    }
  };

  function populateActionPlan(industry) {
    var plan = PLANS[industry] || PLANS.retail;
    function render(listId, items) {
      var el = $(listId);
      if (!el) return;
      el.innerHTML = items.map(function(item, i) {
        return '<li style="animation-delay:' + (i * 0.08) + 's"><span class="task-icon">' + item.icon + '</span><span>' + item.text + '</span></li>';
      }).join('');
    }
    render('tasks30', plan.d30);
    render('tasks60', plan.d60);
    render('tasks90', plan.d90);
  }

  $('generatePlanBtn') && $('generatePlanBtn').addEventListener('click', function() {
    var industry = ($('planIndustry') || {}).value || 'retail';
    populateActionPlan(industry);
  });
})();

