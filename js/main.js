/* ============================================================
   main.js — site-wide behaviour
     1) nav (burger, active state, section spy)
     2) scroll progress + back to top
     3) reveal on scroll (with stagger)
     4) counting numbers
     5) timeline lighting
     6) card cursor glow
     7) typed hero subtitle
     8) ice particle backdrop
     9) survey charts rendered from real data (SURVEY below)
   ============================================================ */

/* ------------------------------------------------------------
   REAL SURVEY DATA — taken directly from the research
   questionnaire results. Edit values here and the charts update.
   ------------------------------------------------------------ */
window.SURVEY = {
  knowledge: {
    q: "Question 2", n: 52,
    title: "How well do you know about ice sports?",
    rows: [
      { label: "Next to nothing",   pct: 9.62,  count: 5 },
      { label: "Very little",       pct: 51.92, count: 27, hi: true },
      { label: "Decent knowledge",  pct: 26.92, count: 14 },
      { label: "Very well-informed",pct: 11.54, count: 6 }
    ]
  },
  publicAwareness: {
    q: "Question 3", n: 52, note: "Mean score 2.13 / 4",
    title: "How well-informed is the general public about ice sports?",
    rows: [
      { label: "Extremely low",  pct: 13.46, count: 7 },
      { label: "Low",            pct: 65.38, count: 34, hi: true },
      { label: "High",           pct: 15.38, count: 8 },
      { label: "Extremely high", pct: 5.77,  count: 3 }
    ]
  },
  channels: {
    q: "Question 5", n: 42, note: "Multiple choice",
    title: "How did you learn about ice sports?",
    rows: [
      { label: "Social media",        pct: 92.86, count: 39, hi: true },
      { label: "Multimedia / film",   pct: 54.76, count: 23 },
      { label: "Recommended by others", pct: 52.38, count: 22 },
      { label: "News",                pct: 42.86, count: 18 },
      { label: "Books",               pct: 28.57, count: 12 },
      { label: "Other",               pct: 16.67, count: 7 }
    ]
  },
  frequency: {
    q: "Question 9", n: 50,
    title: "How often do you take part in ice sports?",
    rows: [
      { label: "More than 3× a week", pct: 8,  count: 4 },
      { label: "1–2× a week",         pct: 26, count: 13 },
      { label: "Once per 2 weeks",    pct: 6,  count: 3 },
      { label: "Once per month",      pct: 6,  count: 3 },
      { label: "Fewer than 2× a year",pct: 36, count: 18, hi: true },
      { label: "Tried it once only",  pct: 18, count: 9 }
    ]
  },
  barriers: {
    q: "Question 10", n: 15, note: "Non-participants · multiple choice",
    title: "Why have you never tried ice sports?",
    rows: [
      { label: "No facilities close to home", pct: 73.33, count: 11, hi: true },
      { label: "Too hard to learn / no training", pct: 53.33, count: 8 },
      { label: "Not interested",             pct: 53.33, count: 8 },
      { label: "Risk of injury",             pct: 33.33, count: 5 },
      { label: "Cost",                       pct: 26.67, count: 4 },
      { label: "Other",                      pct: 6.67,  count: 1 }
    ]
  },
  limits: {
    q: "Question 11", n: 50, note: "Multiple choice",
    title: "What limits your participation in ice sports?",
    rows: [
      { label: "School work / no free time", pct: 78, count: 39, hi: true },
      { label: "Lack of facilities",         pct: 68, count: 34 },
      { label: "Risk of injury",             pct: 26, count: 13 },
      { label: "Cost",                       pct: 22, count: 11 },
      { label: "Other",                      pct: 10, count: 5 }
    ]
  }
};

document.addEventListener("DOMContentLoaded", function () {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 1. nav ---------- */
  const toggle = document.querySelector(".navbar-toggle");
  const links  = document.querySelector(".navbar-links");
  if (toggle && links) {
    toggle.addEventListener("click", function () { links.classList.toggle("open"); });
    links.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { links.classList.remove("open"); });
    });
  }
  let file = location.pathname.split("/").pop() || "index.html";
  const anchors = Array.prototype.slice.call(document.querySelectorAll(".navbar-links a"));
  const parsed = anchors.map(function (a) {
    const href = a.getAttribute("href") || "";
    const i = href.indexOf("#");
    return { a: a, file: (i === -1 ? href : href.slice(0, i)) || file, hash: i === -1 ? "" : href.slice(i + 1) };
  });
  const pageLink = parsed.find(function (p) { return p.file === file && !p.hash; });
  if (pageLink) pageLink.a.classList.add("active");

  const secLinks = parsed.filter(function (p) { return p.file === file && p.hash; });
  if (secLinks.length && "IntersectionObserver" in window) {
    const spy = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        anchors.forEach(function (a) { a.classList.remove("active"); });
        const m = secLinks.find(function (p) { return p.hash === e.target.id; });
        if (m) m.a.classList.add("active");
      });
    }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });
    secLinks.forEach(function (p) {
      const s = document.getElementById(p.hash); if (s) spy.observe(s);
    });
  }

  /* ---------- 2. progress + to top ---------- */
  const bar = document.getElementById("scroll-progress");
  const top = document.getElementById("to-top");
  function onScroll() {
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    if (bar) bar.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + "%";
    if (top) top.classList.toggle("show", h.scrollTop > 600);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  if (top) top.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });

  /* ---------- 3. reveal ---------- */
  const rev = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduce) {
    const io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add("visible");
        e.target.querySelectorAll("[data-stagger]").forEach(function (k, i) {
          k.style.transitionDelay = (i * 85) + "ms";
          k.classList.add("visible");
        });
        io.unobserve(e.target);
      });
    }, { threshold: .1 });
    rev.forEach(function (el) { io.observe(el); });
  } else {
    rev.forEach(function (el) { el.classList.add("visible"); });
    document.querySelectorAll("[data-stagger]").forEach(function (k) { k.classList.add("visible"); });
  }

  /* ---------- 4. counters ---------- */
  function count(el) {
    const to = parseFloat(el.dataset.to), dec = parseInt(el.dataset.dec || "0", 10);
    const t0 = performance.now(), dur = 1500;
    (function step(t) {
      const p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = (to * e).toFixed(dec);
      if (p < 1) requestAnimationFrame(step); else el.textContent = to.toFixed(dec);
    })(t0);
  }
  const cs = document.querySelectorAll(".count");
  if ("IntersectionObserver" in window && !reduce) {
    const cio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { count(e.target); cio.unobserve(e.target); } });
    }, { threshold: .5 });
    cs.forEach(function (c) { cio.observe(c); });
  } else { cs.forEach(function (c) { c.textContent = c.dataset.to; }); }

  /* ---------- 5. timeline ---------- */
  const tl = document.querySelector(".timeline");
  if (tl) {
    const items = Array.prototype.slice.call(tl.querySelectorAll(".timeline-item"));
    function light() {
      const mid = window.innerHeight * .72; let n = 0;
      items.forEach(function (it) {
        const on = it.getBoundingClientRect().top < mid;
        it.classList.toggle("lit", on); if (on) n++;
      });
      tl.style.setProperty("--tl", (items.length ? (n / items.length) * 100 : 0) + "%");
    }
    window.addEventListener("scroll", light, { passive: true });
    light();
  }

  /* ---------- 6. card glow ---------- */
  document.querySelectorAll(".card").forEach(function (c) {
    c.addEventListener("mousemove", function (e) {
      const r = c.getBoundingClientRect();
      c.style.setProperty("--mx", (e.clientX - r.left) + "px");
      c.style.setProperty("--my", (e.clientY - r.top) + "px");
    });
  });

  /* ---------- 7. typed subtitle ---------- */
  const ty = document.querySelector("[data-type]");
  if (ty && !reduce) {
    const full = ty.dataset.type; ty.textContent = ""; let i = 0;
    (function tick() {
      if (i <= full.length) { ty.textContent = full.slice(0, i++); setTimeout(tick, 28); }
    })();
  } else if (ty) { ty.textContent = ty.dataset.type; }

  /* ---------- 8. particles ---------- */
  const cv = document.getElementById("fx-canvas");
  if (cv && !reduce) {
    const ctx = cv.getContext("2d");
    const cs2 = getComputedStyle(document.body);
    const RGB = (cs2.getPropertyValue("--particle") || "150,225,255").trim();
    const AM  = parseFloat(cs2.getPropertyValue("--particle-a")) || 1;
    let w, h, dpr, ps;
    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = cv.width = innerWidth * dpr; h = cv.height = innerHeight * dpr;
      cv.style.width = innerWidth + "px"; cv.style.height = innerHeight + "px";
      const n = Math.min(Math.floor(innerWidth / 16), 95); ps = [];
      for (let i = 0; i < n; i++) ps.push({
        x: Math.random() * w, y: Math.random() * h, r: (Math.random() * 1.6 + .45) * dpr,
        vy: (Math.random() * .3 + .09) * dpr, vx: (Math.random() - .5) * .2 * dpr,
        a: Math.random() * .48 + .16, tw: Math.random() * 6.28
      });
    }
    function frame() {
      ctx.clearRect(0, 0, w, h);
      for (const p of ps) {
        p.y += p.vy; p.x += p.vx; p.tw += .02;
        if (p.y > h + 8) { p.y = -8; p.x = Math.random() * w; }
        if (p.x < -8) p.x = w + 8; if (p.x > w + 8) p.x = -8;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.2832);
        ctx.fillStyle = "rgba(" + RGB + "," + (p.a * (.62 + .38 * Math.sin(p.tw)) * AM) + ")";
        ctx.shadowBlur = 8 * dpr; ctx.shadowColor = "rgba(" + RGB + ",.7)";
        ctx.fill();
      }
      ctx.shadowBlur = 0; requestAnimationFrame(frame);
    }
    resize(); window.addEventListener("resize", resize); frame();
  }

  /* ---------- 9. survey charts ---------- */
  // Usage: <div class="chart" data-chart="limits"></div>
  const charts = document.querySelectorAll("[data-chart]");
  charts.forEach(function (host) {
    const d = window.SURVEY[host.dataset.chart];
    if (!d) return;
    host.innerHTML =
      '<div class="chart-head">' +
        '<div class="chart-q">' + d.q + (d.note ? " · " + d.note : "") + "</div>" +
        '<div class="chart-title">' + d.title + "</div>" +
        '<div class="chart-n">n = ' + d.n + " valid responses</div>" +
      "</div>" +
      d.rows.map(function (r) {
        return '<div class="bar-row' + (r.hi ? " hi" : "") + '">' +
                 '<div class="bar-label">' + r.label + "</div>" +
                 '<div class="bar-track"><div class="bar-fill" data-w="' + r.pct + '"></div></div>' +
                 '<div class="bar-val">' + r.pct + "%</div>" +
               "</div>";
      }).join("");

    function grow() {
      host.querySelectorAll(".bar-fill").forEach(function (f, i) {
        setTimeout(function () { f.style.width = f.dataset.w + "%"; }, i * 110);
      });
    }
    if ("IntersectionObserver" in window && !reduce) {
      const bio = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { grow(); bio.unobserve(e.target); } });
      }, { threshold: .25 });
      bio.observe(host);
    } else { grow(); }
  });
});
