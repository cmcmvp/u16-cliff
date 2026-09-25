/* ============================================================
   game.js — "On the Thin ice" Career & Trajectory Simulator
   Built strictly from the Ice Hockey Game Design document.
   ------------------------------------------------------------
   FLOW
     launch  → intro (typed)  → talent allocation (10 pts / 7 traits)
             → ROUND 0 … ROUND 8 (narration screen → choice screen
               → outcome screen) → ENDING
   HIDDEN RULES implemented (from the design doc)
     · family background = 0        → instant game over at birth
     · family background <= 2       → forced out after Round 1
     · mental resilience < 2        → quits after Round 1 (falls too often)
     · mental resilience > 2        → survives Round 2 option B
     · physical toughness = 0       → skip Round 3-4, injury ending
     · physical toughness > 3       → survives Round 3-4 option C
     · mental resilience >= 3       → survives Round 5 option B
     · mental resilience > 3        → survives Round 6 Path A (→ Round 8B)
     · Round 5/6 option A always fails
   Traits 2,5,6,7 (adaptability, interpersonal, leadership, luck) are
   selectable but have no plot effect — exactly as the design specifies.
   ============================================================ */

(function () {
  "use strict";

  const sim       = document.getElementById("sim");
  const stage     = document.getElementById("sim-stage");
  const railEl    = document.getElementById("sim-rail");
  const ageEl     = document.getElementById("sim-age");
  const roundEl   = document.getElementById("sim-round");
  const launchBtn = document.getElementById("sim-launch");
  const exitBtn   = document.getElementById("sim-exit");
  const fsBtn     = document.getElementById("sim-fs");
  if (!sim || !stage || !launchBtn) return;

  /* ---------------- Traits ---------------- */
  const TRAITS = [
    { id: "physical",  name: "Physical toughness", key: true,
      desc: "Withstanding legal body contact once you hit the junior leagues." },
    { id: "adapt",     name: "Adaptability", key: false,
      desc: "Settling into new teams, cities and systems." },
    { id: "family",    name: "Family background", key: true,
      desc: "Where you are born and what your family can afford. Decides whether you ever reach the ice." },
    { id: "mental",    name: "Mental resilience", key: true,
      desc: "Getting back up after being benched, yelled at, or written off." },
    { id: "social",    name: "Interpersonal skills", key: false,
      desc: "Locker-room chemistry and friendships." },
    { id: "leader",    name: "Leadership", key: false,
      desc: "Wearing the captain's C." },
    { id: "luck",      name: "Lucky points", key: false,
      desc: "Pure fortune. Sometimes that is all it takes." }
  ];
  const TOTAL_POINTS = 10;

  /* ---------------- State ---------------- */
  let pts = {};
  let statuses = [];      // status chips carried forward
  let trail = [];         // decisions, for the ending recap
  let roundIndex = 0;     // for the progress rail
  let typeTimer = null;
  const TOTAL_ROUNDS = 9; // Round 0 … Round 8

  const unlocked = loadUnlocked();
  function loadUnlocked() {
    try {
      const r = localStorage.getItem("u16_endings");
      return r ? new Set(JSON.parse(r)) : new Set();
    } catch (e) { return new Set(); }
  }
  function saveUnlocked() {
    try { localStorage.setItem("u16_endings", JSON.stringify(Array.from(unlocked))); } catch (e) {}
  }

  /* ============================================================
     SCENE ARTWORK
     Art lives in assets/images/scenes/. An SVG illustration ships
     with the project; drop a .jpg of the SAME NAME beside it and the
     photo is used instead — no code changes needed.
     ------------------------------------------------------------
     Keyed by the HUD "round" label (plus tone where one round has
     two different looks), so no scene definition has to be touched.
     ============================================================ */
  const ART_DIR = "assets/images/scenes/";
  const ART_BY_ROUND = {
    "Introduction":              "glass",
    "Briefing":                  "glass",
    "Talent allocation":         "birth",
    "Round 0 — The Birth":       "birth",
    "Round 0 — Outcome":         "glass",
    "Round 1 — Extra-curriculars": "money",
    "Round 1 — Outcome":         "glass",
    "Round 2 — The Gear Shock":  "money",
    "Round 2 — Outcome":         "drill",
    "Round 3 — School vs Sports":"classroom",
    "Round 3 — Outcome":         "classroom",
    "Round 3.5 — Contact":       "contact",
    "Round 3.5 — Outcome":       "contact",
    "Round 4 — The Small Circle":"lonely",
    "Round 4 — Outcome":         "lonely",
    "Round 5 — The Crackdown":   "classroom",
    "Round 5 — Outcome":         "graduation",
    "Round 6 — THE TURNING POINT": "cliff",
    "Round 6 — Outcome":         "closeddoor",
    "Round 6 — The Money":       "airport",
    "Round 7 — Culture Shock":   "lockerroom",
    "Round 7 — Outcome":         "lockerroom",
    "Round 8 — The Draft":       "draft",
    "Round 8 — Shanghai":        "draft"
  };
  // round|tone overrides, where one round shows two different scenes
  const ART_BY_ROUND_TONE = {
    "Round 6 — Outcome|teal":    "airport",   // going international
    "Round 6 — Outcome|crimson": "airport",   // KHL camp
    "Round 5 — Outcome|crimson": "classroom", // held the line at the trials
    "Round 2 — Outcome|teal":    "drill"
  };
  const ART_BY_ENDING = {
    e_south: "faded",     e_shanghai: "faded",   e_piano: "faded",
    e_figure: "faded",    e_gear: "money",       e_falls: "drill",
    e_bench: "lonely",    e_abacus: "classroom", e_injury: "contact",
    e_peer: "lonely",     e_zhongkao: "faded",   e_ghetto: "closeddoor",
    e_burnout: "closeddoor", e_gaokao: "faded",  e_robot: "lockerroom",
    e_nhl: "draft",       e_edu: "graduation",   e_domestic: "lonely"
  };

  const artImg = document.getElementById("sim-img");
  let currentArt = null;
  function setArt(name) {
    if (!artImg || !name || name === currentArt) return;
    currentArt = name;
    artImg.classList.remove("in");
    // try photo first, fall back to the bundled illustration
    artImg.onerror = function () { this.onerror = null; this.src = ART_DIR + name + ".svg"; };
    artImg.onload = function () { artImg.classList.add("in"); };
    artImg.src = ART_DIR + name + ".jpg";
  }
  function artFor(round, toneName, endingId) {
    if (endingId && ART_BY_ENDING[endingId]) return ART_BY_ENDING[endingId];
    const combo = ART_BY_ROUND_TONE[round + "|" + toneName];
    if (combo) return combo;
    return ART_BY_ROUND[round] || null;
  }

  /* ---------------- Small helpers ---------------- */
  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  function tone(t) { sim.setAttribute("data-tone", t || "cold"); }
  function hud(age, round, idx) {
    ageEl.textContent = age || "";
    roundEl.textContent = round || "";
    if (typeof idx === "number") roundIndex = idx;
    railEl.innerHTML = "";
    for (let i = 0; i < TOTAL_ROUNDS; i++) {
      const t = document.createElement("i");
      if (i <= roundIndex) t.className = "on";
      railEl.appendChild(t);
    }
  }
  function scrollTop() {
    const sc = document.querySelector(".sim-scroll");
    if (sc) sc.scrollTop = 0;
  }

  // Swap screens with a transition
  function paint(html, after) {
    const old = stage.querySelector(".sim-screen");
    if (old) old.classList.add("out");
    clearTimeout(typeTimer);
    setTimeout(function () {
      stage.innerHTML = '<div class="sim-screen">' + html + "</div>";
      const scr = stage.querySelector(".sim-screen");
      scrollTop();
      requestAnimationFrame(function () { scr.classList.add("in"); });
      if (after) after(scr);
    }, old ? 380 : 0);
  }

  // Typewriter for the main narration, then surface detail lines
  function typeOut(el, str, done) {
    clearTimeout(typeTimer);
    el.textContent = "";
    el.classList.add("typing");
    let i = 0;
    (function tick() {
      if (i <= str.length) {
        el.textContent = str.slice(0, i++);
        const ch = str[i - 2] || "";
        const pause = ".!?".indexOf(ch) >= 0 ? 190 : (",;:".indexOf(ch) >= 0 ? 90 : 20);
        typeTimer = setTimeout(tick, pause);
      } else {
        el.classList.remove("typing");
        if (done) done();
      }
    })();
  }

  function statusHTML() {
    if (!statuses.length) return "";
    return '<div class="sim-status">' + statuses.map(function (s) {
      return '<span class="sim-chip ' + (s.kind || "") + '">' + esc(s.text) + "</span>";
    }).join("") + "</div>";
  }

  function detailsHTML(list) {
    if (!list || !list.length) return "";
    return '<div class="sim-details">' + list.map(function (d, i) {
      return '<p class="sim-detail" style="animation-delay:' + (i * 1.15) + 's">' + esc(d) + "</p>";
    }).join("") + "</div>";
  }

  /* ============================================================
     NARRATION SCREEN — text types out, details surface, then Continue
     ============================================================ */
  function narrate(o) {
    // o: {tone, age, round, idx, kicker, title, text, details, statuses, next, nextLabel}
    if (o.tone) tone(o.tone);
    if (o.statuses) statuses = o.statuses;
    hud(o.age, o.round, o.idx);
    setArt(o.art || artFor(o.round, o.tone));

    const html =
      (o.kicker ? '<div class="sim-kicker">' + esc(o.kicker) + "</div>" : "") +
      '<h2 class="sim-title">' + (o.title || "") + "</h2>" +
      '<p class="sim-text" id="t-main"></p>' +
      '<div id="t-rest"></div>';

    paint(html, function (scr) {
      const main = scr.querySelector("#t-main");
      const rest = scr.querySelector("#t-rest");
      typeOut(main, o.text || "", function () {
        rest.innerHTML = detailsHTML(o.details) + statusHTML();
        const wait = (o.details ? o.details.length * 1150 : 0) + 500;
        setTimeout(function () {
          const cont = document.createElement("div");
          cont.className = "sim-continue";
          cont.innerHTML =
            '<button class="sim-next" id="btn-next">' + esc(o.nextLabel || "Continue") + " →</button>" +
            '<span class="sim-hintkey">or press <b>Enter</b></span>';
          rest.appendChild(cont);
          const go = function () { cleanupKeys(); o.next(); };
          cont.querySelector("#btn-next").addEventListener("click", go);
          bindKeys({ enter: go });
        }, wait);
      });
    });
  }

  /* ============================================================
     CHOICE SCREEN — big lettered options
     ============================================================ */
  function ask(o) {
    // o: {tone, age, round, idx, kicker, title, text, prompt, options:[{key,lead,go}]}
    if (o.tone) tone(o.tone);
    hud(o.age, o.round, o.idx);
    setArt(o.art || artFor(o.round, o.tone));

    const html =
      (o.kicker ? '<div class="sim-kicker">' + esc(o.kicker) + "</div>" : "") +
      '<h2 class="sim-title">' + (o.title || "") + "</h2>" +
      (o.text ? '<p class="sim-text" style="min-height:0">' + esc(o.text) + "</p>" : "") +
      statusHTML() +
      '<p class="sim-prompt">' + esc(o.prompt || "Make your choice") + "</p>" +
      '<div class="sim-choices">' +
        o.options.map(function (op, i) {
          return '<button class="sim-choice" data-i="' + i + '">' +
                   '<span class="key">' + esc(op.key || String.fromCharCode(65 + i)) + "</span>" +
                   '<span class="body"><span class="lead">' + esc(op.lead) + "</span></span>" +
                 "</button>";
        }).join("") +
      "</div>";

    paint(html, function (scr) {
      const map = {};
      scr.querySelectorAll(".sim-choice").forEach(function (b) {
        const op = o.options[+b.dataset.i];
        const fire = function () {
          cleanupKeys();
          scr.querySelectorAll(".sim-choice").forEach(function (x) { x.disabled = true; });
          trail.push({ q: stripTags(o.title), a: op.lead });
          setTimeout(op.go, 180);
        };
        b.addEventListener("click", fire);
        map[(op.key || String.fromCharCode(65 + (+b.dataset.i))).toLowerCase()] = fire;
      });
      bindKeys({ letters: map });
    });
  }
  function stripTags(s) { return String(s).replace(/<[^>]*>/g, ""); }

  /* ---------------- keyboard ---------------- */
  let keyHandler = null;
  function bindKeys(cfg) {
    cleanupKeys();
    keyHandler = function (e) {
      if (cfg.enter && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); cfg.enter(); return; }
      if (cfg.letters) {
        const f = cfg.letters[e.key.toLowerCase()];
        if (f) { e.preventDefault(); f(); }
      }
    };
    document.addEventListener("keydown", keyHandler);
  }
  function cleanupKeys() {
    if (keyHandler) document.removeEventListener("keydown", keyHandler);
    keyHandler = null;
  }

  /* ============================================================
     ENDING SCREEN
     ============================================================ */
  function ending(o) {
    // o: {id, tone, verdict:'win'|'over'|'neutral', badge, title, text, details, research}
    tone(o.tone || "grey");
    hud(o.age || "", o.round || "The End", TOTAL_ROUNDS - 1);
    setArt(o.art || artFor(o.round, o.tone, o.id));
    unlocked.add(o.id); saveUnlocked();

    const html =
      '<div class="sim-verdict ' + o.verdict + '">' + esc(o.badge) + "</div>" +
      '<h2 class="sim-title">' + (o.title || "") + "</h2>" +
      '<p class="sim-text" id="t-main"></p>' +
      '<div id="t-rest"></div>';

    paint(html, function (scr) {
      const main = scr.querySelector("#t-main");
      const rest = scr.querySelector("#t-rest");
      typeOut(main, o.text || "", function () {
        rest.innerHTML = detailsHTML(o.details);
        const wait = (o.details ? o.details.length * 1150 : 0) + 400;
        setTimeout(function () {
          let h = "";
          if (o.research) {
            h += '<div class="sim-research"><span class="rt">What this means in the research</span>' + esc(o.research) + "</div>";
          }
          if (trail.length) {
            h += '<div class="sim-recap"><h4>Your path</h4><ol>' +
                 trail.map(function (t) { return "<li><b>" + esc(t.q) + "</b> — " + esc(t.a) + "</li>"; }).join("") +
                 "</ol></div>";
          }
          h += '<div class="sim-collect">' + ENDINGS.map(function (e) {
                 return '<span class="sim-tag' + (unlocked.has(e.id) ? " got" : "") + '">' +
                        (unlocked.has(e.id) ? esc(e.badge) : "🔒 Locked") + "</span>";
               }).join("") + "</div>" +
               '<p style="color:rgba(255,255,255,.45);font-size:13.5px;margin-top:14px;">' +
                 unlocked.size + " of " + ENDINGS.length + " endings unlocked" +
               "</p>" +
               '<div class="sim-endgame">' +
                 '<button class="sim-next" id="btn-again">↺ Play again</button>' +
                 '<button class="sim-btn-ghost" id="btn-close">Leave the rink</button>' +
               "</div>";
          rest.insertAdjacentHTML("beforeend", h);
          rest.querySelector("#btn-again").addEventListener("click", start);
          rest.querySelector("#btn-close").addEventListener("click", closeSim);
        }, wait);
      });
    });
  }

  const ENDINGS = [
    { id: "e_nhl",      badge: "🏒 The NHL Dream" },
    { id: "e_edu",      badge: "🎓 The Educational Player" },
    { id: "e_burnout",  badge: "💔 The Burnt-Out Pro" },
    { id: "e_domestic", badge: "🇨🇳 The Rare Loyalist" },
    { id: "e_south",    badge: "🌊 No Rink, No Chance" },
    { id: "e_shanghai", badge: "🛁 The Bathtub Ending" },
    { id: "e_piano",    badge: "🎹 The Pianist" },
    { id: "e_figure",   badge: "⛸️ The Figure Skater" },
    { id: "e_gear",     badge: "💸 Broken Sticks" },
    { id: "e_falls",    badge: "🧊 A Thousand Falls" },
    { id: "e_bench",    badge: "🪑 Benched Forever" },
    { id: "e_abacus",   badge: "🧮 The Accountant" },
    { id: "e_injury",   badge: "🚑 Fractured" },
    { id: "e_peer",     badge: "📱 Fancy Curling" },
    { id: "e_zhongkao", badge: "📚 Grades First" },
    { id: "e_ghetto",   badge: "🏚️ The Training Ghetto" },
    { id: "e_gaokao",   badge: "🎒 The Successful Student" },
    { id: "e_robot",    badge: "🤖 Cut For Being A Robot" }
  ];

  /* ============================================================
     GAME START — intro
     ============================================================ */
  function start() {
    pts = {}; TRAITS.forEach(function (t) { pts[t.id] = 0; });
    statuses = []; trail = []; roundIndex = 0;
    introA();
  }

  function introA() {
    tone("cold");
    hud("", "Introduction", -1);
    paint(
      '<div class="sim-kicker">Ice Hockey Career &amp; Trajectory Simulation</div>' +
      '<h2 class="sim-title">Can you stay<br /><span class="hl">on the ice</span>?</h2>' +
      '<p class="sim-text" id="t-main"></p><div id="t-rest"></div>',
      function (scr) {
        typeOut(scr.querySelector("#t-main"),
          "All of these career pathways are deliberately designed to reflect real scenarios collected through global interviews with hockey players around the world. There are no right or wrong choices — just go with your gut.",
          function () {
            const rest = scr.querySelector("#t-rest");
            setTimeout(function () {
              const c = document.createElement("div");
              c.className = "sim-continue";
              c.innerHTML = '<button class="sim-next" id="btn-next">Begin →</button>' +
                            '<span class="sim-hintkey">or press <b>Enter</b></span>';
              rest.appendChild(c);
              const go = function () { cleanupKeys(); introB(); };
              c.querySelector("#btn-next").addEventListener("click", go);
              bindKeys({ enter: go });
            }, 400);
          });
      });
  }

  function introB() {
    narrate({
      tone: "cold", age: "", round: "Briefing", idx: -1,
      kicker: "Before you begin",
      title: 'You were born in <span class="hl">China</span>.',
      text: "This game is built on 150+ global interviews, questionnaires and chat sessions. Every choice you make changes the result.",
      details: [
        "Remember: you are born in a country where ice hockey is nowhere near as popular as it is in Northern Europe or North America.",
        "Your goal is to keep hockey in your life — as a profession or as a passion — when school and sport begin to pull you in different directions.",
        "Once you quit hockey, you are out. There is no coming back.",
        "It is genuinely, deliberately hard to survive. Do your best."
      ],
      nextLabel: "Choose your talents",
      next: talents
    });
  }

  /* ============================================================
     TALENT ALLOCATION
     ============================================================ */
  function talents() {
    tone("dawn");
    hud("Age 0", "Talent allocation", 0);

    const html =
      '<div class="sim-kicker">Step 1 — Talent points</div>' +
      '<h2 class="sim-title">You have <span class="hl">10 points</span><br />and 7 traits.</h2>' +
      '<p class="talent-warn">Before you start: some of these traits matter enormously — for a sport lover and for a professional athlete alike. Choose wisely, or you can never win this game.</p>' +
      '<div class="talent-head"><div class="talent-pool">Points remaining: <b id="pool">' + TOTAL_POINTS + "</b></div></div>" +
      '<div class="talents">' +
        TRAITS.map(function (t) {
          return '<div class="talent' + (t.key ? " key-trait" : "") + '" data-id="' + t.id + '">' +
            '<div><div class="t-name">' + esc(t.name) +
              (t.key ? '<span class="star">Decisive</span>' : "") +
            '</div><div class="t-desc">' + esc(t.desc) + "</div></div>" +
            '<div class="t-pips">' + Array.from({ length: 5 }).map(function () { return "<i></i>"; }).join("") + "</div>" +
            '<div class="t-ctrl">' +
              '<button class="t-btn minus" aria-label="minus">−</button>' +
              '<span class="t-val">0</span>' +
              '<button class="t-btn plus" aria-label="plus">+</button>' +
            "</div></div>";
        }).join("") +
      "</div>" +
      '<div class="sim-continue" style="animation:none;opacity:1">' +
        '<button class="sim-next" id="btn-born">Be born →</button>' +
        '<span class="sim-hintkey" id="pool-note">Spend all 10 points to continue</span>' +
      "</div>";

    paint(html, function (scr) {
      const poolEl = scr.querySelector("#pool");
      const bornBtn = scr.querySelector("#btn-born");
      const note = scr.querySelector("#pool-note");

      function spent() { return TRAITS.reduce(function (s, t) { return s + pts[t.id]; }, 0); }
      function sync() {
        const left = TOTAL_POINTS - spent();
        poolEl.textContent = left;
        scr.querySelectorAll(".talent").forEach(function (row) {
          const id = row.dataset.id;
          row.querySelector(".t-val").textContent = pts[id];
          row.querySelectorAll(".t-pips i").forEach(function (p, i) {
            p.classList.toggle("on", i < pts[id]);
          });
          row.querySelector(".plus").disabled = (left <= 0 || pts[id] >= 5);
          row.querySelector(".minus").disabled = pts[id] <= 0;
        });
        bornBtn.disabled = left !== 0;
        bornBtn.style.opacity = left === 0 ? "1" : ".45";
        note.innerHTML = left === 0
          ? "Ready — or press <b>Enter</b>"
          : "Spend all " + TOTAL_POINTS + " points to continue (" + left + " left)";
      }

      scr.querySelectorAll(".talent").forEach(function (row) {
        const id = row.dataset.id;
        row.querySelector(".plus").addEventListener("click", function () {
          if (spent() < TOTAL_POINTS && pts[id] < 5) { pts[id]++; sync(); }
        });
        row.querySelector(".minus").addEventListener("click", function () {
          if (pts[id] > 0) { pts[id]--; sync(); }
        });
      });

      const go = function () { if (TOTAL_POINTS - spent() === 0) { cleanupKeys(); round0(); } };
      bornBtn.addEventListener("click", go);
      bindKeys({ enter: go });
      sync();
    });
  }

  /* ============================================================
     ROUND 0 — THE BIRTH
     ============================================================ */
  function round0() {
    // Hidden rule: 0 points on family background → over before you start
    if (pts.family === 0) {
      return ending({
        id: "e_south", tone: "fail", verdict: "over", badge: "Game Over",
        title: "There is no rink.",
        text: "You are born in a southern city where there is not a single hockey-specific ice rink in the entire province, and your family is underprivileged.",
        details: [
          "You will grow up never having stepped on the ice.",
          "Game over. You are done — before you ever began."
        ],
        research: "Geography and family income are the first filter. 73.33% of survey respondents cited a lack of facilities near home as a major deterrent, which is why China's national team is drawn almost entirely from Harbin and Beijing.",
        age: "Age 0"
      });
    }

    narrate({
      tone: "cold", age: "Age 0", round: "Round 0 — The Birth", idx: 0,
      kicker: "Round 0",
      title: "The nurse stamps your foot.",
      text: "You are born in a Chinese hospital. Your fate is tied to your household registration — your hukou.",
      details: ["Where you land decides what is possible. You do not get to pick your parents, but tonight, you do."],
      nextLabel: "See where you were born",
      next: round0Choice
    });
  }

  function round0Choice() {
    ask({
      tone: "cold", age: "Age 0", round: "Round 0 — The Birth", idx: 0,
      kicker: "Round 0",
      title: "Where were you born?",
      prompt: "Choose your city",
      options: [
        { key: "A", lead: "Born in Beijing. Your parents work in finance. The city has rinks, but competition is fierce and housing costs are insane.",
          go: function () {
            narrate({
              tone: "cold", age: "Age 0", round: "Round 0 — Outcome", idx: 0,
              kicker: "Beijing",
              title: "Rinks, and rivals.",
              text: "You start with high funds and high pressure.",
              details: [
                "There is ice within driving distance — and a hundred other children already on it.",
                "Your parents can pay. They will also expect results."
              ],
              statuses: [{ text: "High funds", kind: "good" }, { text: "High pressure", kind: "bad" }],
              nextLabel: "Age 6 →", next: round1
            });
          } },
        { key: "B", lead: "Born in Harbin. Your parents are working-class hockey enthusiasts. Ice is in your blood, but money is tight.",
          go: function () {
            narrate({
              tone: "dawn", age: "Age 0", round: "Round 0 — Outcome", idx: 0,
              kicker: "Harbin",
              title: "Ice is in your blood.",
              text: "You start with low funds but high talent and passion.",
              details: [
                "Your father learned to skate on a frozen river. He will teach you the same way.",
                "Nobody in this family has money. Everybody in this family has hockey."
              ],
              statuses: [{ text: "Low funds", kind: "bad" }, { text: "High talent / passion", kind: "good" }],
              nextLabel: "Age 6 →", next: round1
            });
          } },
        { key: "C", lead: "Born in Shanghai. Your parents work at a tech company and the family is well-off. But you have few local rinks — and a huge bathtub.",
          go: function () {
            ending({
              id: "e_shanghai", tone: "fail", verdict: "over", badge: "Game Over",
              title: "A very nice bathtub.",
              text: "Your family is comfortable, but there is almost nowhere to skate.",
              details: [
                "You will swim well. You will never learn to take a hit.",
                "Your hockey career is over before it starts."
              ],
              research: "Wealth alone does not create players. Without local infrastructure, capital cannot convert into participation — the reason ice hockey remains concentrated in the northern provinces.",
              age: "Age 0"
            });
          } }
      ]
    });
  }

  /* ============================================================
     ROUND 1 — AGE 6, THE EXTRA-CURRICULAR BATTLE
     ============================================================ */
  function round1() {
    narrate({
      tone: "cold", age: "Age 6", round: "Round 1 — Extra-curriculars", idx: 1,
      kicker: "Round 1",
      title: "Your mother is holding a brochure.",
      text: "She is signing you up for after-school activities. You want to try skating.",
      details: ["Piano. Figure skating. Hockey. Three columns, three futures.", "She is waiting for you to point at one."],
      nextLabel: "Point at something", next: round1Choice
    });
  }

  function round1Choice() {
    ask({
      tone: "cold", age: "Age 6", round: "Round 1 — Extra-curriculars", idx: 1,
      kicker: "Round 1",
      title: "What do you choose?",
      prompt: "Choose an activity",
      options: [
        { key: "A", lead: "“Ice hockey? The gear costs as much as a down payment on a car! Let's do piano instead.”",
          go: function () {
            ending({
              id: "e_piano", tone: "violet", verdict: "over", badge: "Game Over",
              title: "You become a pianist.",
              text: "Your mother closes the brochure with visible relief.",
              details: ["You will be good at this. You will also never wear skates.", "No puck for you."],
              research: "Equipment cost is a decisive gatekeeper: 26.67% of non-participants named cost outright, and it compounds every year as children outgrow their gear.",
              age: "Age 6"
            });
          } },
        { key: "B", lead: "“The Olympics are coming! Let's try figure skating — it looks elegant. No hitting.”",
          go: function () {
            ending({
              id: "e_figure", tone: "violet", verdict: "over", badge: "Game Over",
              title: "You become a figure skater.",
              text: "You are on the ice. Just not that kind of ice.",
              details: ["You score 10.0 for artistry and 0.0 for physicality.", "The Olympic wave lifted skating, but not hockey."],
              research: "The “300 Million People on Ice and Snow” campaign lifted skiing and free skating far more than hockey — the initiative was never hockey-specific.",
              age: "Age 6"
            });
          } },
        { key: "C", lead: "Point at the hockey stick. “Mom, I want to hit things.”",
          go: round1Outcome }
      ]
    });
  }

  function round1Outcome() {
    narrate({
      tone: "dawn", age: "Age 6", round: "Round 1 — Outcome", idx: 1,
      kicker: "She sighs",
      title: "She pulls out her wallet.",
      text: "You point at the hockey stick, and something in your life quietly changes direction.",
      details: ["The first pair of skates is rented and two sizes too big.", "You fall over in the parking lot before you even reach the ice."],
      nextLabel: "Continue", next: round1Gate
    });
  }

  // Hidden rules after Round 1: family background <=2 → forced out; mental <2 → quits
  function round1Gate() {
    if (pts.family <= 2) {
      return ending({
        id: "e_gear", tone: "fail", verdict: "over", badge: "Game Over",
        title: "You broke another stick.",
        text: "The enormous cost of equipment, the low popularity of the sport, and the long travel times wore your parents down.",
        details: [
          "They did not stop loving you. They simply stopped being able to afford this.",
          "Your mother enrols you in an extended mathematics class instead.",
          "Game over. You are done."
        ],
        research: "This is the economic filter in action. Sustained participation depends less on talent than on a family's capacity to absorb recurring costs — gear, ice time, and travel.",
        age: "Age 7"
      });
    }
    if (pts.mental < 2) {
      return ending({
        id: "e_falls", tone: "grey", verdict: "over", badge: "Game Over",
        title: "A thousand falls.",
        text: "You fell down a thousand times on the ice. It felt like you could never match the pace of training.",
        details: ["Every practice ended with you on your back, staring at the lights.", "You were discouraged, and you chose to quit."],
        research: "Early attrition is rarely about ability. Without psychological resilience — and a culture that builds it — the first plateau becomes the exit.",
        age: "Age 7"
      });
    }
    round2();
  }

  /* ============================================================
     ROUND 2 — AGE 8, THE FIRST GEAR SHOCK
     ============================================================ */
  function round2() {
    narrate({
      tone: "cold", age: "Age 8", round: "Round 2 — The Gear Shock", idx: 2,
      kicker: "Round 2",
      title: "The coach shakes his head.",
      text: "You go to the rink. He looks at your rented skates. “To join the team, you need proper hockey skates and a stick to perform.”",
      details: ["The price tag equals your dad's monthly bonus.", "Your father does the arithmetic out loud, twice."],
      nextLabel: "Decide", next: round2Choice
    });
  }

  function round2Choice() {
    ask({
      tone: "cold", age: "Age 8", round: "Round 2 — The Gear Shock", idx: 2,
      kicker: "Round 2",
      title: "How do you gear up?",
      prompt: "Choose",
      options: [
        { key: "A", lead: "“Buy the gear.” Your dad takes an extra freelance job.",
          go: function () {
            narcher();
          } },
        { key: "B", lead: "“Use the second-hand gear.” It is a third of the price, and it has been someone else's already.",
          go: round2B }
      ]
    });
  }

  function narcher() {
    narrate({
      tone: "dawn", age: "Age 8", round: "Round 2 — Outcome", idx: 2,
      kicker: "Top-tier equipment",
      title: "He looks tired.",
      text: "Your dad takes an extra freelance job. You have top-tier equipment.",
      details: ["He comes home after you are asleep and leaves before you wake.", "Your skates fit perfectly. You never mention how much they cost."],
      statuses: [{ text: "Financially strained", kind: "bad" }, { text: "Competitive", kind: "good" }],
      nextLabel: "Age 10 →", next: round3
    });
  }

  function round2B() {
    // Hidden rule: mental > 2 survives
    if (pts.mental > 2) {
      return narrate({
        tone: "teal", age: "Age 8", round: "Round 2 — Outcome", idx: 2,
        kicker: "You refused to quit",
        title: "You shocked the coach.",
        text: "The blade broke during a game. You tripped, flew into the boards, and the coach labelled you “unlucky”. You were benched.",
        details: [
          "Although you were benched, your significant mental resilience and tough mentality kept you from quitting.",
          "You paid enormous effort — extra hours, borrowed ice, no complaints.",
          "Your hard work and improvement shocked the coach. He bought you a new composite stick and quality skates, and gave you real minutes on the ice.",
          "You rock."
        ],
        statuses: [{ text: "Coach's respect", kind: "good" }, { text: "Second-hand start", kind: "" }],
        nextLabel: "Age 10 →", next: round3
      });
    }
    ending({
      id: "e_bench", tone: "fail", verdict: "over", badge: "Game Over",
      title: "Benched forever.",
      text: "The blade broke during a game. You tripped, flew into the boards, and the coach labelled you “unlucky”.",
      details: ["You are benched permanently.", "You lose every scrap of confidence you had to play at all."],
      research: "Equipment quality, injury and a coach's early judgement compound. In a small talent pool, one label from one adult can end a trajectory.",
      age: "Age 8"
    });
  }

  /* ============================================================
     ROUND 3 — AGE 10, SCHOOL VS SPORTS
     ============================================================ */
  function round3() {
    narrate({
      tone: "violet", age: "Age 10", round: "Round 3 — School vs Sports", idx: 3,
      kicker: "Round 3",
      title: "Your homeroom teacher calls home.",
      text: "“Your son missed classes three times this week because of team practice. The Gaokao does not care about slap shots.”",
      details: ["Your parents listen without interrupting. That is worse than shouting.", "The phone call lasts eleven minutes. You count them."],
      nextLabel: "Answer", next: round3Choice
    });
  }

  function round3Choice() {
    ask({
      tone: "violet", age: "Age 10", round: "Round 3 — School vs Sports", idx: 3,
      kicker: "Round 3",
      title: "What happens now?",
      prompt: "Choose",
      options: [
        { key: "A", lead: "“The teacher is right.” Quit hockey to focus on the maths olympiad.",
          go: function () {
            ending({
              id: "e_abacus", tone: "grey", verdict: "over", badge: "Game Over",
              title: "You become a boring accountant.",
              text: "You are very good with numbers. You are also finished with hockey at ten years old.",
              details: ["You leave the ice early — six years before the turning point at sixteen."],
              research: "78% of survey respondents named school work and lack of free time as the primary factor limiting participation. For many, the cliff begins long before sixteen.",
              age: "Age 10"
            });
          } },
        { key: "B", lead: "“I'll do my homework on the bus to the rink.”",
          go: function () {
            narrate({
              tone: "violet", age: "Age 10", round: "Round 3 — Outcome", idx: 3,
              kicker: "High stress",
              title: "You do both, badly.",
              text: "You struggle, you get B grades, your parents are disappointed — but you keep skating.",
              details: ["You learn to write essays with a pen braced against your knee.", "Nobody praises you for it. You keep doing it anyway."],
              statuses: [{ text: "B grades", kind: "" }, { text: "High stress", kind: "bad" }],
              nextLabel: "Age 12 →", next: round34
            });
          } },
        { key: "C", lead: "“Hire a private tutor to come to the rink.” It costs double.",
          go: function () {
            narrate({
              tone: "violet", age: "Age 10", round: "Round 3 — Outcome", idx: 3,
              kicker: "Very broke",
              title: "Homework between shifts.",
              text: "It costs double, but somehow you do your homework between shifts.",
              details: ["Your tutor sits in the stands with a folding table.", "Academically you are safe. Financially the family is not."],
              statuses: [{ text: "Very broke", kind: "bad" }, { text: "Academically safe", kind: "good" }],
              nextLabel: "Age 12 →", next: round34
            });
          } }
      ]
    });
  }

  /* ============================================================
     ROUND 3-4 — BODY CONTACT BECOMES LEGAL
     ============================================================ */
  function round34() {
    // Hidden rule: 0 physical toughness → skip this round entirely, injury ending
    if (pts.physical === 0) {
      return ending({
        id: "e_injury", tone: "fail", verdict: "over", badge: "Game Over",
        title: "Your legs are fractured.",
        text: "You are injured because of fierce body contact on the ice.",
        details: [
          "The sound is worse than the pain, at first.",
          "Your parents decide ice hockey is too dangerous, and you are forced to quit."
        ],
        research: "33.33% of non-participants cited risk of injury. Parental risk perception is a powerful brake — one that better coaching and safety education could release.",
        age: "Age 11"
      });
    }

    narrate({
      tone: "crimson", age: "Age 11", round: "Round 3.5 — Contact", idx: 3,
      kicker: "The rules changed",
      title: "Body contact is now legal.",
      text: "You are at a crossroads. Fierce body contact became legal in the league, and you have literally been crushed on the ice.",
      details: ["The first real hit knocked your helmet sideways and your confidence further.", "Somebody has to decide what you do about it. That somebody is you."],
      nextLabel: "Decide", next: round34Choice
    });
  }

  function round34Choice() {
    ask({
      tone: "crimson", age: "Age 11", round: "Round 3.5 — Contact", idx: 3,
      kicker: "Round 3.5",
      title: "How do you answer the hit?",
      prompt: "Choose",
      options: [
        { key: "A", lead: "Lift weights and become extremely self-disciplined. Full “Mamba” mentality.",
          go: function () {
            narrate({
              tone: "crimson", age: "Age 11", round: "Round 3.5 — Outcome", idx: 3,
              kicker: "The boss on ice",
              title: "You became the boss.",
              text: "You demonstrated the so-called “Mamba” mentality — and it showed.",
              details: ["Everyone respected you. Nobody skated at you the same way again.", "You gained significant confidence."],
              statuses: [{ text: "Respected", kind: "good" }, { text: "Confident", kind: "good" }],
              nextLabel: "Age 12 →", next: round4
            });
          } },
        { key: "B", lead: "Train your drills and your sense of teamwork instead.",
          go: function () {
            narrate({
              tone: "teal", age: "Age 11", round: "Round 3.5 — Outcome", idx: 3,
              kicker: "They like playing with you",
              title: "Your team got better.",
              text: "You still feel a little scared out there, but your team improved because of your spirit of teamwork.",
              details: ["They all want you on their line.", "You are excited about the games ahead for the first time in months."],
              statuses: [{ text: "Team player", kind: "good" }, { text: "Still wary of contact", kind: "" }],
              nextLabel: "Age 12 →", next: round4
            });
          } },
        { key: "C", lead: "Ignore the contact and just do your own thing.",
          go: function () {
            // Hidden rule: physical > 3 survives option C
            if (pts.physical > 3) {
              return narrate({
                tone: "crimson", age: "Age 11", round: "Round 3.5 — Outcome", idx: 3,
                kicker: "Built differently",
                title: "You simply absorbed it.",
                text: "You ignored the contact entirely — and your body held up anyway.",
                details: ["Players bounced off you and you barely noticed.", "Sheer physical toughness carried you through a round that ends most players."],
                statuses: [{ text: "Physically dominant", kind: "good" }],
                nextLabel: "Age 12 →", next: round4
              });
            }
            ending({
              id: "e_injury", tone: "fail", verdict: "over", badge: "Game Over",
              title: "You're injured.",
              text: "You ignored the contact, and the contact did not ignore you.",
              details: ["The season ends in a hospital corridor.", "Game over."],
              research: "Physical preparation is not optional once contact is legal. Where strength-and-conditioning support is thin, injury becomes an exit route.",
              age: "Age 11"
            });
          } }
      ]
    });
  }

  /* ============================================================
     ROUND 4 — AGE 12, THE SMALL CIRCLE
     ============================================================ */
  function round4() {
    narrate({
      tone: "grey", age: "Age 12", round: "Round 4 — The Small Circle", idx: 4,
      kicker: "Round 4",
      title: "Fifteen kids in the whole province.",
      text: "You realise there are only fifteen children your age playing competitive hockey in your entire province. You feel lonely.",
      details: ["Your friends at school do not know the rules.", "One of them calls it “fancy curling”. The name sticks."],
      nextLabel: "What do you do?", next: round4Choice
    });
  }

  function round4Choice() {
    ask({
      tone: "grey", age: "Age 12", round: "Round 4 — The Small Circle", idx: 4,
      kicker: "Round 4",
      title: "How do you handle the isolation?",
      prompt: "Choose",
      options: [
        { key: "A", lead: "Invite your school friends to watch a game.",
          go: function () {
            ending({
              id: "e_peer", tone: "fail", verdict: "over", badge: "Game Over",
              title: "They were bored in five minutes.",
              text: "They came, they lasted five minutes, and they played on their phones for the rest of the game.",
              details: ["You feel immense social pressure to quit.", "So you do. You succumb to peer pressure."],
              research: "Interviewees repeatedly used the words “small circle”. Where a sport is not socially legible, isolation itself becomes a reason to leave.",
              age: "Age 12"
            });
          } },
        { key: "B", lead: "Ignore them. Hockey is life. Double down on training.",
          go: function () {
            narrate({
              tone: "grey", age: "Age 12", round: "Round 4 — Outcome", idx: 4,
              kicker: "Fragile",
              title: "You double down.",
              text: "You train harder than anyone. Without a social life, your mental health dips.",
              details: ["You are the best twelve-year-old in the province and you eat lunch alone.", "You tell yourself it is worth it."],
              statuses: [{ text: "Mental state: fragile", kind: "bad" }],
              nextLabel: "Age 14 →", next: round5
            });
          } },
        { key: "C", lead: "Join an international online chat room for hockey kids.",
          go: function () {
            narrate({
              tone: "teal", age: "Age 12", round: "Round 4 — Outcome", idx: 4,
              kicker: "International route unlocked",
              title: "A friend in Canada.",
              text: "You make a friend in Canada who mentions, casually, that his school has a team.",
              details: [
                "His school. Not his city, not his province. His school.",
                "You realise how broken the system around you is — and it gives you motivation rather than despair.",
                "You have unlocked the “International Route” hint."
              ],
              statuses: [{ text: "International route hint", kind: "good" }],
              nextLabel: "Age 14 →", next: round5
            });
          } }
      ]
    });
  }

  /* ============================================================
     ROUND 5 — AGE 14, THE MIDDLE SCHOOL CRACKDOWN
     ============================================================ */
  function round5() {
    narrate({
      tone: "violet", age: "Age 14", round: "Round 5 — The Crackdown", idx: 5,
      kicker: "Round 5",
      title: "The Zhongkao is coming.",
      text: "Your coach says provincial trials are next month. Your principal threatens to take away your sports waiver if your grades drop.",
      details: ["Two adults, two deadlines, one of you.", "Both of them believe they are helping."],
      nextLabel: "Choose a side", next: round5Choice
    });
  }

  function round5Choice() {
    ask({
      tone: "violet", age: "Age 14", round: "Round 5 — The Crackdown", idx: 5,
      kicker: "Round 5",
      title: "Grades, trials, or a third way?",
      prompt: "Choose",
      options: [
        { key: "A", lead: "“Grades first.” Skip the provincial trials and study for the exam.",
          go: function () {
            // Design doc: option A always fails
            ending({
              id: "e_zhongkao", tone: "grey", verdict: "over", badge: "Game Over",
              title: "You never touch the ice again.",
              text: "You get into a good high school. That is the whole of it.",
              details: ["Your skates stay in the cupboard until your mother finally gives them away.", "Game over."],
              research: "The binary choice at fourteen shows how early the problem can begin: the system offers no way to be a student and an athlete at once.",
              age: "Age 14"
            });
          } },
        { key: "B", lead: "“Screw the grades.” Go to the provincial trials.",
          go: function () {
            // Hidden rule: mental >= 3 proceeds to Round 6
            if (pts.mental >= 3) {
              return narrate({
                tone: "crimson", age: "Age 14", round: "Round 5 — Outcome", idx: 5,
                kicker: "You held the line",
                title: "You played amazingly.",
                text: "Your maths score fell below 60 and the school moved you out of the key class — but you did not break.",
                details: [
                  "Your resilience absorbed a blow that removes most players from the board.",
                  "You keep your place in the trials and your grip on the sport."
                ],
                statuses: [{ text: "Out of the key class", kind: "bad" }, { text: "Resilient", kind: "good" }],
                nextLabel: "Age 16 →", next: round6
              });
            }
            ending({
              id: "e_ghetto", tone: "fail", verdict: "over", badge: "Game Over",
              title: "The training ghetto.",
              text: "You played amazingly, but your maths score dropped below 60 and the school expelled you from the key class.",
              details: [
                "You are funnelled into a sport-only, closed-door training institute.",
                "The training is intense and stressful, and your passion does not survive it.",
                "You burn out early. Game over."
              ],
              research: "Closed-door provincial training removes adolescents from mainstream schooling entirely, converting a dual identity into a single, fragile one.",
              age: "Age 14"
            });
          } },
        { key: "C", lead: "“The Dual-Career Gambit.” Find an international (AP/IB) high school and become a student-athlete.",
          go: function () {
            narrate({
              tone: "teal", age: "Age 14", round: "Round 5 — Outcome", idx: 5,
              kicker: "Expensive, and possible",
              title: "The dual-career gambit.",
              text: "It is incredibly expensive and it requires a language test. Your parents go quiet when they see the fees.",
              details: ["You start studying English at night, after practice, after homework.", "For the first time, both identities are allowed to exist at once."],
              statuses: [{ text: "Student-athlete", kind: "good" }, { text: "Very expensive", kind: "bad" }],
              nextLabel: "Age 16 →", next: round6
            });
          } }
      ]
    });
  }

  /* ============================================================
     ROUND 6 — AGE 16, THE TURNING POINT
     ============================================================ */
  function round6() {
    narrate({
      tone: "fail", age: "Age 16", round: "Round 6 — THE TURNING POINT", idx: 6,
      kicker: "Round 6",
      title: 'This is it. <span class="hl">The Turning Point.</span>',
      text: "You are sixteen. 88% of your peers have already quit.",
      details: [
        "The academic pressure is a tsunami.",
        "The provincial team offers you a contract — but it requires closed-door training that overlaps completely with school hours.",
        "You hear whispers about coaches in these programmes who run “mechanical discipline” drills: two straight hours of skating laps."
      ],
      nextLabel: "Face it", next: round6Choice
    });
  }

  function round6Choice() {
    ask({
      tone: "fail", age: "Age 16", round: "Round 6 — THE TURNING POINT", idx: 6,
      kicker: "Round 6",
      title: "Which path do you take?",
      prompt: "Three paths",
      options: [
        { key: "A", lead: "Accept the provincial contract and enter closed-door training.",
          go: function () {
            // Hidden rule: mental > 3 survives → Round 8 Scenario B
            if (pts.mental > 3) {
              return narrate({
                tone: "gold", age: "Age 17", round: "Round 6 — Outcome", idx: 7,
                kicker: "Undaunted",
                title: "You became the top player.",
                text: "Your tough mentality and undaunting spirit kept you from failing.",
                details: [
                  "You practised wholeheartedly. The coaches stopped yelling at you.",
                  "You realised that although it is difficult to succeed in such a system, with the most resolute will there is always a way.",
                  "The Shanghai Dragons youth programme comes calling."
                ],
                statuses: [{ text: "Provincial star", kind: "good" }],
                nextLabel: "Age 18 →", next: round8B
              });
            }
            ending({
              id: "e_burnout", tone: "fail", verdict: "over", badge: "Game Over",
              title: "Broken body, broken passion.",
              text: "You enter closed-door training. The coach yells at you constantly because you keep missing the puck.",
              details: [
                "You start following every instruction exactly, terrified of making mistakes. You lose your creative spark.",
                "The schedule runs 9am to 10pm. You fall asleep in class. Your classmates call you “the athlete”.",
                "You burn out at seventeen. No body, no passion, no education."
              ],
              research: "This is the core institutional finding: authoritarian, closed-door regimes suppress autonomy and improvisation — the very capacities a high-uncertainty team sport requires.",
              age: "Age 17"
            });
          } },
        { key: "B", lead: "Quit hockey to prepare for the Gaokao.",
          go: function () {
            ending({
              id: "e_gaokao", tone: "grey", verdict: "over", badge: "Game Over",
              title: "The successful student.",
              text: "You sell your gear on Xianyu. You cry. You study fourteen hours a day, or more.",
              details: [
                "You get into a decent university.",
                "You watch the NHL on your phone during lectures and die a little inside.",
                "You became the successful student, and a failed hockey player."
              ],
              research: "The most common ending in reality. Academic meritocracy remains the single certified pathway for social mobility, and hockey cannot compete with it.",
              age: "Age 18"
            });
          } },
        { key: "C", lead: "Go international. Chase the NCAA dream.",
          go: function () {
            narrate({
              tone: "teal", age: "Age 16", round: "Round 6 — Outcome", idx: 6,
              kicker: "High cost, high uncertainty",
              title: "You passed the English test.",
              text: "You persuaded your parents to back your dream, even though the cost and the uncertainty are enormous.",
              details: ["You start emailing prep schools in North America at two in the morning.", "Then comes the question nobody can avoid."],
              nextLabel: "How do you pay?", next: round6Pay
            });
          } }
      ]
    });
  }

  function round6Pay() {
    ask({
      tone: "teal", age: "Age 16", round: "Round 6 — The Money", idx: 6,
      kicker: "The real question",
      title: "How do you pay for this?",
      prompt: "Choose",
      options: [
        { key: "A", lead: "“Full Scholarship Hunt.” Send 200 emails to US high school coaches with your highlight reel.",
          go: function () {
            narrate({
              tone: "teal", age: "Age 16", round: "Round 6 — Outcome", idx: 6,
              kicker: "One reply",
              title: "“You're raw, but I love your hustle.”",
              text: "You send two hundred emails. One coach replies.",
              details: ["One is all you needed.", "You read it eleven times before telling your parents."],
              statuses: [{ text: "Scholarship", kind: "good" }],
              nextLabel: "Age 17 →", next: round7
            });
          } },
        { key: "B", lead: "“The Family Bailout.” Your parents sell the family car to pay the tuition.",
          go: function () {
            narrate({
              tone: "warm", age: "Age 16", round: "Round 6 — Outcome", idx: 6,
              kicker: "They sold the car",
              title: "The family bailout.",
              text: "Your parents sell the family car to pay your tuition.",
              details: ["Your father starts taking the bus and says he prefers it.", "You promise yourself you will make this worth it."],
              statuses: [{ text: "Family sacrifice", kind: "bad" }, { text: "Tuition paid", kind: "good" }],
              nextLabel: "Age 17 →", next: round7
            });
          } },
        { key: "C", lead: "“Kunlun Red Star Connection.” A KHL-related youth camp sponsors you — if you commit to China's national team later.",
          go: function () {
            narrate({
              tone: "crimson", age: "Age 16", round: "Round 6 — Outcome", idx: 7,
              kicker: "Sponsored, with strings",
              title: "You sign the camp agreement.",
              text: "They will pay — provided you promise to play for China later.",
              details: ["It is a real opportunity and a real obligation, in the same sentence.", "You sign it anyway."],
              statuses: [{ text: "KHL-linked sponsorship", kind: "good" }, { text: "Committed to China", kind: "" }],
              nextLabel: "Age 18 →", next: round8B
            });
          } }
      ]
    });
  }

  /* ============================================================
     ROUND 7 — AGE 17, CULTURE SHOCK
     ============================================================ */
  function round7() {
    narrate({
      tone: "teal", age: "Age 17", round: "Round 7 — Culture Shock", idx: 7,
      kicker: "Round 7",
      title: "A word you had never heard.",
      text: "You are now in a system that actually values sport. The coaches no longer use mechanical training. You learn a new term for it — “facilitative coaching”.",
      details: [
        "Then, in the second intermission, the coach turns to the room.",
        "“What plays do you guys want to run in the third period?”",
        "You have never experienced this. You have never even imagined it."
      ],
      nextLabel: "Respond", next: round7Choice
    });
  }

  function round7Choice() {
    ask({
      tone: "teal", age: "Age 17", round: "Round 7 — Culture Shock", idx: 7,
      kicker: "Round 7",
      title: "The coach is waiting for you to speak.",
      prompt: "Choose",
      options: [
        { key: "A", lead: "Stay silent. Wait for instructions, like you always did.",
          go: function () {
            ending({
              id: "e_robot", tone: "fail", verdict: "over", badge: "Game Over",
              title: "Cut for being a robot.",
              text: "You wait for instructions that never come. The coach benches you.",
              details: [
                "You cannot fit into the team because of your “lack of engagement”.",
                "Eleven years of being told what to do, and the one time nobody told you, you had nothing to say."
              ],
              research: "Mechanical discipline produces passive athletes. Transplanting a player into a facilitative system does not automatically restore the autonomy that regime removed.",
              age: "Age 17"
            });
          } },
        { key: "B", lead: "Speak up. “I think we should overload the left side!”",
          go: function () {
            narrate({
              tone: "gold", age: "Age 17", round: "Round 7 — Outcome", idx: 7,
              kicker: "The coach grins",
              title: "You said it out loud.",
              text: "“I think we should overload the left side!”",
              details: [
                "The coach grins. The room actually runs it.",
                "Your team wins the game, and you start to fit into the vibrant culture around you.",
                "You have changed entirely — physically and mentally."
              ],
              statuses: [{ text: "Autonomous player", kind: "good" }],
              nextLabel: "Age 18 →", next: round8A
            });
          } }
      ]
    });
  }

  /* ============================================================
     ROUND 8 — AGE 18, THE FINAL ROUND
     ============================================================ */
  function round8A() {
    narrate({
      tone: "gold", age: "Age 18", round: "Round 8 — The Draft", idx: 8,
      kicker: "Round 8 — Scenario A",
      title: "You made it to eighteen,<br />still playing.",
      text: "You are in North America, and NCAA Division 1 scouts are in the building.",
      details: ["Now the real world arrives. You need a future, not just a season.", "There are two versions of tonight."],
      nextLabel: "Play the game", next: function () {
        ask({
          tone: "gold", age: "Age 18", round: "Round 8 — The Draft", idx: 8,
          kicker: "Scenario A — North America",
          title: "How does the game go?",
          prompt: "Choose",
          options: [
            { key: "A", lead: "You absolutely crush the game.",
              go: function () {
                ending({
                  id: "e_nhl", tone: "gold", verdict: "win", badge: "Congratulations — You Win",
                  title: "Drafted 33rd overall.",
                  text: "You walk onto the ice in an NHL jersey. Your family is crying in the stands.",
                  details: [
                    "The Chinese media calls you a hero.",
                    "You stayed in hockey through the turning point at sixteen — with money, connections, and immense psychological resilience.",
                    "You are the 0.01%."
                  ],
                  research: "Mirrors reality: in 2025 an 18-year-old Beijing native was drafted 33rd overall by the San Jose Sharks — the highest selection for a Chinese player in NHL history. One success does not resolve a structural problem.",
                  age: "Age 18"
                });
              } },
            { key: "B", lead: "You pick up a minor injury. You finish the game, but your stats are average.",
              go: function () {
                ending({
                  id: "e_edu", tone: "teal", verdict: "win", badge: "Congratulations — You Win",
                  title: "The educational player.",
                  text: "You do not go pro. You get a full scholarship to an Ivy League university, playing Division 1 hockey.",
                  details: [
                    "You graduate with a degree and a career in sports management.",
                    "You successfully integrated sport and academics — the thing the system back home could not offer you."
                  ],
                  research: "The dual-career outcome this research argues for. In the NCAA model athletic excellence becomes an asset for admission rather than a liability — one way to keep players in education and hockey.",
                  age: "Age 22"
                });
              } }
          ]
        });
      }
    });
  }

  function round8B() {
    narrate({
      tone: "crimson", age: "Age 18", round: "Round 8 — Shanghai", idx: 8,
      kicker: "Round 8 — Scenario B",
      title: "You stayed in China.",
      text: "You joined the Shanghai Dragons (KHL) youth programme. You are eighteen and still playing.",
      details: ["The league is thin, but the jersey is real.", "A decision is coming that will define the rest of it."],
      nextLabel: "Continue", next: function () {
        ask({
          tone: "crimson", age: "Age 18", round: "Round 8 — Shanghai", idx: 8,
          kicker: "Scenario B — China",
          title: "A European team is watching.",
          prompt: "Choose",
          options: [
            { key: "A", lead: "You play well, but the league is weak — a big fish in a small pond. Take the European trial.",
              go: function () {
                ending({
                  id: "e_burnout", tone: "fail", verdict: "over", badge: "Game Over",
                  title: "You can't improvise.",
                  text: "You go to Europe, but the closed-door habits haunt you.",
                  details: [
                    "Every time the play breaks down, you wait for someone to tell you what to do.",
                    "You get cut. You go back to China and become a gym teacher.",
                    "The kids don't know who you are."
                  ],
                  research: "Habits formed under mechanical discipline persist. This is why the research argues pedagogy must change at the youth level, not at the point of export.",
                  age: "Age 20"
                });
              } },
            { key: "B", lead: "Stay in China to support the national team.",
              go: function () {
                ending({
                  id: "e_domestic", tone: "teal", verdict: "neutral", badge: "A Rare Ending",
                  title: "You stayed.",
                  text: "You refuse the international route and play in the domestic league.",
                  details: [
                    "The population pool is too small and you feel it every season.",
                    "You are discouraged, and you keep playing anyway.",
                    "You did not win and you did not lose. You are genuinely lucky to have reached this ending — it is designed to be rare."
                  ],
                  research: "Retention without elite outcome is exactly what a healthy ecosystem should be able to hold. That it feels rare is itself the finding.",
                  age: "Age 24"
                });
              } }
          ]
        });
      }
    });
  }

  /* ============================================================
     Launch / exit plumbing
     ============================================================ */
  function openSim() {
    sim.classList.add("on");
    document.body.classList.add("sim-open");
    startParticles();
    start();
  }
  function closeSim() {
    cleanupKeys();
    clearTimeout(typeTimer);
    sim.classList.remove("on");
    document.body.classList.remove("sim-open");
    stopParticles();
    if (document.fullscreenElement) { document.exitFullscreen().catch(function () {}); }
  }
  launchBtn.addEventListener("click", function () {
    openSim();
    // try real fullscreen; harmless if the browser refuses
    const el = document.documentElement;
    if (el.requestFullscreen) el.requestFullscreen().catch(function () {});
  });
  if (exitBtn) exitBtn.addEventListener("click", closeSim);
  if (fsBtn) fsBtn.addEventListener("click", function () {
    if (document.fullscreenElement) document.exitFullscreen().catch(function () {});
    else document.documentElement.requestFullscreen().catch(function () {});
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && sim.classList.contains("on")) closeSim();
  });

  /* ---------------- Ice particles inside the sim ---------------- */
  let rafId = null;
  function startParticles() {
    const cv = document.getElementById("sim-particles");
    if (!cv) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = cv.getContext("2d");
    let w, h, dpr, ps;
    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = cv.width = innerWidth * dpr; h = cv.height = innerHeight * dpr;
      cv.style.width = innerWidth + "px"; cv.style.height = innerHeight + "px";
      const n = Math.min(Math.floor(innerWidth / 18), 80);
      ps = [];
      for (let i = 0; i < n; i++) ps.push({
        x: Math.random() * w, y: Math.random() * h,
        r: (Math.random() * 1.6 + .4) * dpr,
        vy: (Math.random() * .3 + .08) * dpr,
        vx: (Math.random() - .5) * .2 * dpr,
        a: Math.random() * .45 + .15, tw: Math.random() * 6.28
      });
    }
    function frame() {
      const accent = getComputedStyle(sim).getPropertyValue("--a").trim() || "#38d0ff";
      ctx.clearRect(0, 0, w, h);
      for (const p of ps) {
        p.y += p.vy; p.x += p.vx; p.tw += .02;
        if (p.y > h + 6) { p.y = -6; p.x = Math.random() * w; }
        if (p.x < -6) p.x = w + 6; if (p.x > w + 6) p.x = -6;
        ctx.globalAlpha = p.a * (.6 + .4 * Math.sin(p.tw));
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.2832);
        ctx.fillStyle = accent; ctx.shadowBlur = 8 * dpr; ctx.shadowColor = accent;
        ctx.fill();
      }
      ctx.globalAlpha = 1; ctx.shadowBlur = 0;
      rafId = requestAnimationFrame(frame);
    }
    resize();
    window.addEventListener("resize", resize);
    frame();
  }
  function stopParticles() { if (rafId) cancelAnimationFrame(rafId); rafId = null; }
})();
