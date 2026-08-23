/* ============================================================
   interviews.js — THE SINGLE SOURCE OF TRUTH for all interviews
   ------------------------------------------------------------
   Edit this ONE file and every page updates: the Interviews
   gallery, and the video cards embedded inside the analysis and
   proposal pages.

   HOW TO EDIT
     role     — what this person is / does  (shown under the name)
     country  — shown as a small flag-style tag
     summary  — one sentence on what the clip covers
     topics   — WHERE the clip appears in the site. Use any of:
                  "surface-powerhouse"  → U16 Cliff · hockey inside school life abroad
                  "surface-china"       → U16 Cliff · the "small circle" in China
                  "deep-powerhouse"     → U16 Cliff · tiered leagues / NCAA pathway
                  "deep-china"          → U16 Cliff · closed-door training
                  "practice2-abroad"    → Proposal · isolation & leaving to play abroad
                  "practice3-coaching"  → Proposal · coaching pedagogy
                A clip can carry several topics, or none (gallery only).

   ⚠️ role / country / summary are intentionally left blank where the
   research paper does not state them. Fill them in so the site does
   not attribute claims to people who did not make them.
   ============================================================ */

window.INTERVIEWS = [
  {
    name: "Jiayi Liu",
    ytid: "TSW_PfrhLPM",
    role: "Student-athlete, Kuper Academy",
    country: "Canada",
    summary: "On Canada's tiered Minor Hockey Associations — house league through to AAA — and why nobody has to quit playing in order to keep studying.",
    topics: ["deep-powerhouse"]
  },
  {
    name: "Alexander",
    ytid: "TR3SNra9xjQ",
    role: "",
    country: "",
    summary: "",
    topics: []
  },
  {
    name: "Aryton Shi",
    ytid: "FjcXK1eg-EE",
    role: "",
    country: "",
    summary: "",
    topics: []
  },
  {
    name: "Binzer",
    ytid: "0u4xgexbSWg",
    role: "",
    country: "",
    summary: "",
    topics: []
  },
  {
    name: "Florian Gao",
    ytid: "uMNyxyujloQ",
    role: "",
    country: "",
    summary: "",
    topics: []
  },
  {
    name: "Haoge Shi",
    ytid: "fLZUQWR4fVk",
    role: "",
    country: "",
    summary: "",
    topics: []
  },
  {
    name: "Jiahao Bai",
    ytid: "uRiB90M9SjA",
    role: "",
    country: "",
    summary: "",
    topics: []
  },
  {
    name: "Kinno",
    ytid: "3HNLKyD8_MU",
    role: "",
    country: "",
    summary: "",
    topics: []
  }
];

/* ------------------------------------------------------------
   Renderer. Cards show a YouTube thumbnail and only load the
   player when clicked — so a page with eight clips stays fast.
   ------------------------------------------------------------ */
(function () {
  "use strict";

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function card(v) {
    const role = v.role || "Role to be added";
    const tags = v.country ? '<span class="iv-flag">' + esc(v.country) + "</span>" : "";
    return (
      '<div class="card video-card iv-card reveal" data-stagger>' +
        '<button class="iv-play" data-yt="' + esc(v.ytid) + '" ' +
                'aria-label="Play interview with ' + esc(v.name) + '">' +
          '<img class="iv-thumb" loading="lazy" alt="" ' +
               'src="https://i.ytimg.com/vi/' + esc(v.ytid) + '/hqdefault.jpg" ' +
               'onerror="this.style.display=\'none\'" />' +
          '<span class="iv-scrim"></span>' +
          '<span class="iv-btn">▶</span>' +
          '<span class="iv-hint">Watch on YouTube player</span>' +
        "</button>" +
        '<div class="video-meta">' +
          '<div class="name">' + esc(v.name) + " " + tags + "</div>" +
          '<div class="role">' + esc(role) + "</div>" +
          (v.summary ? '<div class="desc">' + esc(v.summary) + "</div>" : "") +
          '<a class="iv-link" href="https://www.youtube.com/watch?v=' + esc(v.ytid) + '" ' +
             'target="_blank" rel="noopener">Open on YouTube ↗</a>' +
        "</div>" +
      "</div>"
    );
  }

  function swapToPlayer(btn) {
    const id = btn.dataset.yt;
    const frame = document.createElement("iframe");
    frame.className = "video-embed";
    frame.src = "https://www.youtube-nocookie.com/embed/" + id +
                "?autoplay=1&rel=0&modestbranding=1";
    frame.title = "Interview";
    frame.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture";
    frame.allowFullscreen = true;
    frame.setAttribute("frameborder", "0");
    btn.replaceWith(frame);
  }

  function wire(scope) {
    scope.querySelectorAll(".iv-play").forEach(function (b) {
      b.addEventListener("click", function () { swapToPlayer(b); });
    });
  }

  // filename-safe slug, e.g. "Jiayi Liu" → "jiayi-liu"
  function slug(s) {
    return String(s).toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  /* Roster of everyone interviewed (used on the Outlook page).
     Portrait is optional — assets/images/portraits/<slug>.jpg */
  function rosterCard(v) {
    const sl = slug(v.name);
    return (
      '<div class="card reveal iv-person" data-stagger>' +
        '<div class="iv-portrait">' +
          '<img src="assets/images/portraits/' + sl + '.jpg" alt="" loading="lazy" ' +
               'onerror="this.closest(\'.iv-portrait\').classList.add(\'no-photo\');this.remove()" />' +
          '<span class="iv-initials">' + esc((v.name || "?").trim().charAt(0).toUpperCase()) + "</span>" +
        "</div>" +
        '<div class="iv-person-meta">' +
          '<div class="name">' + esc(v.name) + "</div>" +
          '<div class="role">' + esc(v.role || (v.country || "Interviewee")) + "</div>" +
          '<a class="iv-link" href="interviews.html">Watch interview →</a>' +
        "</div>" +
      "</div>"
    );
  }

  document.addEventListener("DOMContentLoaded", function () {
    const list = window.INTERVIEWS || [];

    // Roster grid (Outlook page)
    const roster = document.getElementById("roster");
    if (roster) {
      roster.innerHTML = list.map(rosterCard).join("");
      if ("IntersectionObserver" in window) {
        const rio = new IntersectionObserver(function (es) {
          es.forEach(function (e) {
            if (!e.isIntersecting) return;
            e.target.classList.add("visible");
            rio.unobserve(e.target);
          });
        }, { threshold: 0.1 });
        roster.querySelectorAll(".reveal").forEach(function (el) { rio.observe(el); });
      } else {
        roster.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("visible"); });
      }
    }

    // 1) full gallery:  <div data-interviews="all"></div>
    // 2) topic slots :  <div data-interviews="deep-powerhouse"></div>
    document.querySelectorAll("[data-interviews]").forEach(function (host) {
      const key = host.dataset.interviews;
      const picked = key === "all"
        ? list
        : list.filter(function (v) { return (v.topics || []).indexOf(key) !== -1; });

      if (!picked.length) {
        // Graceful fallback: point readers at the full library rather than
        // showing an empty hole in the page.
        host.innerHTML =
          '<div class="iv-empty">' +
            '<span class="iv-empty-icon">▶</span>' +
            '<div>' +
              '<div class="iv-empty-t">' + list.length + " recorded interviews support this section</div>" +
              '<div class="iv-empty-s">Watch the full set of conversations from China, North America and Japan.</div>' +
            "</div>" +
            '<a class="btn ghost" href="interviews.html">All interviews →</a>' +
          "</div>" +
          '<!-- To pin a specific clip here, add topics: ["' + esc(key) + '"] ' +
          'to that person in js/interviews.js -->';
        return;
      }
      host.classList.add("grid", "c2");
      host.innerHTML = picked.map(card).join("");
      wire(host);

      // reveal-on-scroll for the freshly injected cards
      if ("IntersectionObserver" in window) {
        const io = new IntersectionObserver(function (es) {
          es.forEach(function (e) {
            if (!e.isIntersecting) return;
            e.target.classList.add("visible");
            io.unobserve(e.target);
          });
        }, { threshold: 0.1 });
        host.querySelectorAll(".reveal").forEach(function (el) { io.observe(el); });
      } else {
        host.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("visible"); });
      }
    });
  });
})();
