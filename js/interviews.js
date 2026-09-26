/* ============================================================
   interviews.js — THE SINGLE SOURCE OF TRUTH for all interviews
   ------------------------------------------------------------
   Edit this ONE file and every page updates: the Interviews
   gallery, and the video cards embedded inside the analysis and
   proposal pages.

   HOW TO EDIT
     role     — what this person is / does  (shown under the name)
     country  — school/team location(s), not nationality; shown as a tag
     profile  — verified school, age, team, level and position details
     summary  — one sentence on what the clip covers, when stated
     topics   — WHERE the clip appears in the site. Use any of:
                  "surface-powerhouse"  → Analysis · hockey inside school life abroad
                  "surface-china"       → Analysis · the "small circle" in China
                  "deep-powerhouse"     → Analysis · tiered leagues / NCAA pathway
                  "deep-china"          → Analysis · closed-door training
                  "practice2-abroad"    → Proposal · isolation & leaving to play abroad
                  "practice3-coaching"  → Proposal · coaching pedagogy
                A clip can carry several topics, or none (gallery only).

   Profiles are transcribed from the videos' covers and descriptions.
   Ages refer to the time of recording; unstated details are omitted.
   ============================================================ */

window.INTERVIEWS = [
  {
    name: "Jiayi (Ethan) Liu",
    ytid: "TSW_PfrhLPM",
    role: "Kuper Academy varsity hockey captain",
    country: "Canada",
    profile: [
      ["School", "Kuper Academy, Montreal"],
      ["Team", "Varsity hockey (captain)"],
      ["Position", "Defence"]
    ],
    summary: "On Canada's tiered minor hockey pathways and combining school with the sport.",
    topics: ["deep-powerhouse"]
  },
  {
    name: "Alexander",
    ytid: "TR3SNra9xjQ",
    role: "Beijing U18 hockey player",
    country: "China",
    profile: [
      ["Level", "U18"],
      ["Team", "Beijing team"]
    ],
    summary: "On the hockey community in China.",
    topics: []
  },
  {
    name: "Aryton Shi",
    ytid: "FjcXK1eg-EE",
    role: "The Hill School student-athlete",
    country: "US / China",
    profile: [
      ["School", "The Hill School"],
      ["Hockey team", "Beijing team"],
      ["Other sport", "Lacrosse national team"]
    ],
    summary: "",
    topics: []
  },
  {
    name: "Binzer",
    ytid: "0u4xgexbSWg",
    role: "China U18 youth hockey defenceman",
    country: "China",
    profile: [
      ["School", "School of 101"],
      ["Team", "China U18 youth national team"],
      ["Position", "Defence"]
    ],
    summary: "",
    topics: []
  },
  {
    name: "Florian Gao",
    ytid: "uMNyxyujloQ",
    role: "Kent School junior and hockey player",
    country: "US / China",
    profile: [
      ["School", "Kent School, Connecticut"],
      ["School year", "Junior"],
      ["Teams", "Hong Kong and Beijing hockey teams"]
    ],
    summary: "",
    topics: []
  },
  {
    name: "Haoge Shi",
    ytid: "fLZUQWR4fVk",
    role: "BNDS varsity hockey player",
    country: "China",
    profile: [
      ["School", "BNDS International Department"],
      ["Age at interview", "17"],
      ["Teams", "BNDS varsity; Beijing team; China U18 youth national team"]
    ],
    summary: "",
    topics: []
  },
  {
    name: "Jiahao Bai",
    ytid: "uRiB90M9SjA",
    role: "Beijing ice hockey defenceman",
    country: "China",
    profile: [
      ["Team", "Beijing ice hockey team"],
      ["Position", "Defence"]
    ],
    summary: "",
    topics: []
  },
  {
    name: "Kinno Zhou",
    ytid: "3HNLKyD8_MU",
    role: "Lovell Hockey Academy 16U right wing",
    country: "US",
    profile: [
      ["School", "Lovell Hockey Academy"],
      ["Age at interview", "15"],
      ["School year", "Sophomore"],
      ["Team level", "16U"],
      ["Position", "Right wing"],
      ["Goal", "NCAA hockey"]
    ],
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
    const role = v.role || "Interviewee";
    const tags = v.country ? '<span class="iv-flag">' + esc(v.country) + "</span>" : "";
    const facts = (v.profile || []).map(function (fact) {
      return '<div class="iv-fact"><dt>' + esc(fact[0]) + '</dt><dd>' + esc(fact[1]) + '</dd></div>';
    }).join("");
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
          (facts ? '<dl class="iv-facts">' + facts + '</dl>' : "") +
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

  // filename-safe slug, e.g. "Kinno Zhou" → "kinno-zhou"
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
