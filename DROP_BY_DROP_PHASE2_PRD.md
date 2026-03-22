# 📄 PHASE 2 — UPGRADE PRD
## Drop by Drop: The Jerry Can Challenge
### Week 2 Feature Addition Specification

---

**Document Version:** 2.0  
**Builds On:** Existing `index.html`, `game.css`, `game.js` (Phase 1)  
**Assignment:** Project 6 — Completed charity: water Game  
**Status:** Ready for Implementation  

---

## IMPORTANT: HOW TO READ THIS DOCUMENT

This PRD is **additive and surgical**. The base game is already complete and working. Every instruction in this document says either:
- **ADD** — insert new code at a specific location
- **CHANGE** — replace a specific existing line or block
- **APPEND** — add to the end of a file

Do NOT rewrite files from scratch. Do NOT change anything not listed here. Every anchor point references exact existing code so the agent can find the right location without ambiguity.

---

## TABLE OF CONTENTS

1. [Rubric Coverage Map](#1-rubric-coverage-map)
2. [New File & Folder Structure](#2-new-file--folder-structure)
3. [Audio Files Required](#3-audio-files-required)
4. [Feature 1 — Difficulty Modes](#4-feature-1--difficulty-modes)
5. [Feature 2 — Milestone Messages](#5-feature-2--milestone-messages)
6. [Feature 3 — Sound Effects](#6-feature-3--sound-effects)
7. [Feature 4 — Footer Donation Link](#7-feature-4--footer-donation-link)
8. [All HTML Changes](#8-all-html-changes)
9. [All CSS Changes (Append to game.css)](#9-all-css-changes-append-to-gamecss)
10. [All JavaScript Changes (game.js)](#10-all-javascript-changes-gamejs)
11. [Complete Verification Checklist](#11-complete-verification-checklist)
12. [AI Coding Agent Prompt](#12-ai-coding-agent-prompt)

---

## 1. RUBRIC COVERAGE MAP

This table shows every rubric criterion and exactly which feature in this PRD satisfies it.

| Criterion | Points | Satisfied By | Status |
|---|---|---|---|
| Difficulty Modes | 20pts | Feature 1 — 3 modes with meaningfully different rules | 🆕 NEW |
| DOM Element change/add/remove | 15pts | Already working — drops visibly disappear on catch via `catchPop` animation + DOM removal | ✅ EXISTING |
| charity: water Footer / Links | 10pts | Already working — `#game-footer` has charitywater.org link. Feature 4 adds Donate link to fully satisfy "website AND donation page" | ✅ + 🆕 |
| Brand Font Usage | 5pts | Already working — Montserrat applied via CSS custom property `--font-display` throughout | ✅ EXISTING |
| LevelUp: Sound Effects | 10pts bonus | Feature 3 — 4 real `.mp3` files + HTML Audio API | 🆕 NEW |
| LevelUp: Milestone Messages | 10pts bonus | Feature 2 — array of messages + conditionals, toast UI | 🆕 NEW |
| Reflections (3×) | 30pts | Written by student — not in scope of this PRD | 📝 STUDENT |

**Maximum possible points from code: 70pts base + 20pts bonus = 90pts**

---

## 2. NEW FILE & FOLDER STRUCTURE

Add one new folder to the project. Everything else stays exactly the same.

```
/project-root/
│
├── index.html        ← MODIFIED (see Section 8)
├── game.css          ← MODIFIED (see Section 9, append only)
├── game.js           ← MODIFIED (see Section 10, surgical edits)
│
├── /images/          ← UNCHANGED
│   ├── jerry-can.png
│   ├── drop-clean.png
│   ├── drop-pollutant.png
│   ├── logo-charitywater.png
│   ├── campus-photo.jpg
│   ├── water-flowing.jpg
│   └── favicon.ico
│
└── /audio/           ← NEW FOLDER
    ├── catch-clean.mp3
    ├── catch-pollutant.mp3
    ├── win.mp3
    └── lose.mp3
```

---

## 3. AUDIO FILES REQUIRED

The student will download these from **freesound.org** or **pixabay.com/sound-effects** and place them in the `/audio/` folder with these exact names:

| Filename | What to search for | Notes |
|---|---|---|
| `catch-clean.mp3` | "water drop", "water collect", "chime ding" | Short (< 1 sec), pleasant, rewarding sound |
| `catch-pollutant.mp3` | "splat", "buzz", "error tone", "wrong" | Short (< 1 sec), clearly negative sound |
| `win.mp3` | "win jingle", "success fanfare", "level complete" | 2-3 seconds max |
| `lose.mp3` | "game over", "fail", "wah wah", "descend tone" | 1-2 seconds max |

> **NOTE TO CODING AGENT:** The JavaScript Audio implementation must use `try/catch` and `.catch(() => {})` on `.play()` calls to silently handle browser autoplay restrictions. Never let an audio error crash the game.

---

## 4. FEATURE 1 — DIFFICULTY MODES

### What it does
Three selectable difficulty modes appear on the welcome screen before the game starts. Selecting one changes the win target (drops needed), starting lives, drop speed, spawn rate, and pollutant frequency. The progress bar label and counter update to reflect the selected target. All game logic already uses `CONFIG` values, so the mode just overwrites the right CONFIG properties before the game starts.

### Difficulty Settings Table

| Property | Easy | Normal | Hard |
|---|---|---|---|
| `WIN_DROPS_TARGET` | 30 | 50 | 75 |
| `STARTING_LIVES` | 5 | 3 | 2 |
| `DROP_SPEED_BASE` | 1.5 | 2.0 | 3.0 |
| `DROP_SPEED_MAX` | 3.5 | 5.5 | 7.0 |
| `SPAWN_INTERVAL_BASE` | 1800 | 1400 | 900 |
| `SPAWN_INTERVAL_MIN` | 700 | 500 | 350 |
| `POLLUTANT_CHANCE` | 0.15 | 0.28 | 0.40 |
| `POLLUTANT_CHANCE_MAX` | 0.30 | 0.45 | 0.55 |
| Button color when active | Green `#43A047` | Yellow `#FFC907` | Red `#E53935` |
| Description text | "Catch 30 drops • 5 lives • Relaxed pace" | "Catch 50 drops • 3 lives • Standard pace" | "Catch 75 drops • 2 lives • Fast & furious" |

### Default mode on page load
**Normal** — the `.active` class on the Normal button is set in HTML by default.

---

## 5. FEATURE 2 — MILESTONE MESSAGES

### What it does
A toast notification slides down from the top of the game board when the player hits certain drop-count thresholds. Milestones are stored in a JavaScript array of objects. A conditional check runs after every clean drop catch. Each milestone only fires once per game session.

### Milestone Thresholds
Milestones are **percentage-based** against `WIN_DROPS_TARGET` so they work correctly across all three difficulty modes:

| Percentage of target | Easy (30) | Normal (50) | Hard (75) | Message |
|---|---|---|---|---|
| 20% | 6 | 10 | 15 | "💧 Great start! Water is on its way!" |
| 40% | 12 | 20 | 30 | "🌊 A whole community is celebrating!" |
| 60% | 18 | 30 | 45 | "💪 More than halfway — keep going!" |
| 80% | 24 | 40 | 60 | "🔥 Almost there — don't stop now!" |
| 90% | 27 | 45 | 67 | "⚡ So close! One final push!" |

### Toast UI Behavior
- Toast appears at the top-center of `#game-board`
- Fades + slides in over 0.3s
- Stays visible for 2500ms
- Fades + slides out over 0.3s
- Does NOT pause the game
- Only one toast at a time

---

## 6. FEATURE 3 — SOUND EFFECTS

### What it does
Four sounds play at game events using the HTML5 `Audio` object. Sound files live in `/audio/`. Audio is non-blocking — if files are missing or browser blocks autoplay, the game continues silently.

| Sound | Trigger function | File |
|---|---|---|
| Clean catch | `onCleanDropCaught()` | `audio/catch-clean.mp3` |
| Pollutant catch | `onPollutantCaught()` | `audio/catch-pollutant.mp3` |
| Win | `endGame(true)` | `audio/win.mp3` |
| Lose | `endGame(false)` | `audio/lose.mp3` |

---

## 7. FEATURE 4 — FOOTER DONATION LINK

### What it does
Adds a direct link to `https://www.charitywater.org/donate` in the existing `#game-footer`. The rubric requires links to both the website AND donation page. The website link already exists — this adds the missing donation link.

---

## 8. ALL HTML CHANGES

**File:** `index.html`  
There are **3 locations** to change and **1 location** to change.

---

### 8A. ADD — Difficulty Selector in Welcome Screen

**Find this exact block** in `index.html` (inside `#welcome-content`):
```html
            <p id="welcome-subtext">Avoid the brown pollutant drops — they cost you lives.</p>
            <button id="start-btn" class="btn-primary" aria-label="Start the game">
```

**INSERT the following BETWEEN those two lines** (after the `<p>` and before the `<button>`):
```html
            <div id="difficulty-selector">
              <p class="difficulty-label">SELECT DIFFICULTY</p>
              <div class="difficulty-btns">
                <button class="difficulty-btn" data-difficulty="easy" aria-label="Easy difficulty">💧 EASY</button>
                <button class="difficulty-btn active" data-difficulty="normal" aria-label="Normal difficulty">⚡ NORMAL</button>
                <button class="difficulty-btn" data-difficulty="hard" aria-label="Hard difficulty">🔥 HARD</button>
              </div>
              <p id="difficulty-description" class="difficulty-desc">Catch 50 drops • 3 lives • Standard pace</p>
            </div>
```

---

### 8B. CHANGE — Progress Count to Dynamic Target

**Find this exact line** in `index.html`:
```html
            <span id="progress-count"><span id="drops-caught">0</span>/50</span>
```

**REPLACE IT WITH:**
```html
            <span id="progress-count"><span id="drops-caught">0</span>/<span id="drops-target">50</span></span>
```

---

### 8C. ADD — Milestone Toast Inside Game Board

**Find this exact line** in `index.html` (the opening of `#game-board`):
```html
        <div id="game-board" aria-label="Active game area" tabindex="0">
          <div id="player-container">
```

**INSERT the following BETWEEN those two lines** (after the opening `#game-board` div, before `#player-container`):
```html
          <div id="milestone-toast" class="toast-hidden" aria-live="polite" aria-atomic="true"></div>
```

---

### 8D. CHANGE — Footer — Add Donation Link

**Find this exact block** in `index.html`:
```html
        <footer id="game-footer">
          <a href="https://www.charitywater.org" target="_blank" rel="noopener noreferrer" class="cw-link">charitywater.org</a>
          <span class="footer-sep">|</span>
          <span class="footer-tagline">100% of donations fund clean water projects.</span>
        </footer>
```

**REPLACE IT WITH:**
```html
        <footer id="game-footer">
          <a href="https://www.charitywater.org" target="_blank" rel="noopener noreferrer" class="cw-link">charitywater.org</a>
          <span class="footer-sep">|</span>
          <a href="https://www.charitywater.org/donate" target="_blank" rel="noopener noreferrer" class="cw-link footer-donate">Donate →</a>
          <span class="footer-sep">|</span>
          <span class="footer-tagline">100% of donations fund clean water projects.</span>
        </footer>
```

---

## 9. ALL CSS CHANGES (Append to game.css)

**File:** `game.css`  
**Instruction:** APPEND the entire block below to the very end of `game.css`. Do not modify any existing CSS rules.

```css
/* ===================================================
   PHASE 2 ADDITIONS — Week 2 Upgrades
   All new rules appended below existing styles.
=================================================== */

/* ───────────────────────────────────────────
   DIFFICULTY SELECTOR (Welcome Screen)
─────────────────────────────────────────── */
#difficulty-selector {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  width: 100%;
}

.difficulty-label {
  font-family: var(--font-display);
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.15em;
  color: var(--cw-text-muted);
  text-transform: uppercase;
}

.difficulty-btns {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
}

.difficulty-btn {
  font-family: var(--font-display);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  padding: 8px 16px;
  border-radius: 99px;
  border: 2px solid var(--cw-charcoal-alt);
  background: transparent;
  color: #C0C0C0;
  cursor: pointer;
  transition: border-color 0.2s, color 0.2s, background 0.2s, transform 0.15s;
  text-transform: uppercase;
}

.difficulty-btn:hover {
  border-color: var(--cw-yellow);
  color: var(--cw-yellow);
  transform: translateY(-1px);
}

/* Normal (default) active state — yellow */
.difficulty-btn.active {
  background: var(--cw-yellow);
  border-color: var(--cw-yellow);
  color: var(--cw-charcoal);
}

/* Easy active state — green */
.difficulty-btn[data-difficulty="easy"].active {
  background: #43A047;
  border-color: #43A047;
  color: #FFFFFF;
}

/* Hard active state — red */
.difficulty-btn[data-difficulty="hard"].active {
  background: var(--cw-red);
  border-color: var(--cw-red);
  color: #FFFFFF;
}

.difficulty-desc {
  font-family: var(--font-display);
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--cw-text-muted);
  text-align: center;
  min-height: 1.2em;
  transition: color 0.2s;
}

/* ───────────────────────────────────────────
   MILESTONE TOAST NOTIFICATION
─────────────────────────────────────────── */
#milestone-toast {
  position: absolute;
  top: 16px;
  left: 50%;
  transform: translateX(-50%) translateY(0);
  background: rgba(20, 20, 20, 0.94);
  border: 1px solid var(--cw-yellow);
  border-radius: 99px;
  padding: 8px 22px;
  font-family: var(--font-display);
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--cw-white);
  white-space: nowrap;
  z-index: 12;
  pointer-events: none;
  box-shadow: 0 4px 16px rgba(0,0,0,0.4), 0 0 8px rgba(255,201,7,0.2);
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.toast-hidden {
  opacity: 0;
  transform: translateX(-50%) translateY(-12px);
}

.toast-visible {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

/* ───────────────────────────────────────────
   FOOTER DONATE LINK
─────────────────────────────────────────── */
.footer-donate {
  color: var(--cw-yellow);
  font-weight: 700;
}

.footer-donate:hover {
  opacity: 1;
  text-decoration: underline;
}
```

---

## 10. ALL JAVASCRIPT CHANGES (game.js)

**File:** `game.js`  
There are **8 locations** to change. Each one has an exact anchor (existing code to find) and exact code to insert or replace.

---

### 10A. ADD — `DIFFICULTY_MODES` constant and `SOUNDS` object

**Find this exact line** near the top of `game.js` (end of SECTION A):
```javascript
  FRAME_RATE_TARGET:      60,      // target frames per second
};
```

**INSERT the following IMMEDIATELY AFTER that closing `};`** (add a blank line first for readability):

```javascript

/* ─────────────────────────────────────────────
   SECTION A2: DIFFICULTY MODE DEFINITIONS
───────────────────────────────────────────── */
const DIFFICULTY_MODES = {
  easy: {
    label:               'EASY',
    WIN_DROPS_TARGET:    30,
    STARTING_LIVES:      5,
    DROP_SPEED_BASE:     1.5,
    DROP_SPEED_MAX:      3.5,
    SPAWN_INTERVAL_BASE: 1800,
    SPAWN_INTERVAL_MIN:  700,
    POLLUTANT_CHANCE:    0.15,
    POLLUTANT_CHANCE_MAX: 0.30,
  },
  normal: {
    label:               'NORMAL',
    WIN_DROPS_TARGET:    50,
    STARTING_LIVES:      3,
    DROP_SPEED_BASE:     2.0,
    DROP_SPEED_MAX:      5.5,
    SPAWN_INTERVAL_BASE: 1400,
    SPAWN_INTERVAL_MIN:  500,
    POLLUTANT_CHANCE:    0.28,
    POLLUTANT_CHANCE_MAX: 0.45,
  },
  hard: {
    label:               'HARD',
    WIN_DROPS_TARGET:    75,
    STARTING_LIVES:      2,
    DROP_SPEED_BASE:     3.0,
    DROP_SPEED_MAX:      7.0,
    SPAWN_INTERVAL_BASE: 900,
    SPAWN_INTERVAL_MIN:  350,
    POLLUTANT_CHANCE:    0.40,
    POLLUTANT_CHANCE_MAX: 0.55,
  },
};

/* ─────────────────────────────────────────────
   SECTION A3: AUDIO
   HTML5 Audio objects — files in /audio/ folder.
   Errors are silenced so missing files never crash the game.
───────────────────────────────────────────── */
const SOUNDS = {
  clean:     new Audio('audio/catch-clean.mp3'),
  pollutant: new Audio('audio/catch-pollutant.mp3'),
  win:       new Audio('audio/win.mp3'),
  lose:      new Audio('audio/lose.mp3'),
};

// Set volume and preload
(function() {
  Object.values(SOUNDS).forEach(function(s) {
    s.preload = 'auto';
    s.volume  = 0.5;
  });
})();

/**
 * Play a named sound. Silently ignores errors (missing files, autoplay block).
 * @param {'clean'|'pollutant'|'win'|'lose'} name
 */
function playSound(name) {
  try {
    var s = SOUNDS[name];
    if (!s) return;
    s.currentTime = 0;
    s.play().catch(function() {});
  } catch(e) {}
}
```

---

### 10B. ADD — New STATE properties

**Find this exact block** in SECTION C of `game.js`:
```javascript
  touchStartX:      0,
  touchLastX:       0,
  lastTimestamp:    0,
};
```

**REPLACE IT WITH** (adds three new state properties at the end):
```javascript
  touchStartX:       0,
  touchLastX:        0,
  lastTimestamp:     0,
  difficulty:        'normal',    // currently selected difficulty key
  milestonesShown:   [],          // drop counts where milestone was already displayed
  activeMilestones:  [],          // built at game start from current WIN_DROPS_TARGET
};
```

---

### 10C. ADD — New helper functions (buildMilestones, applyDifficulty, checkMilestones, showMilestoneToast)

**Find this exact line** in SECTION D of `game.js`:
```javascript
function init() {
```

**INSERT the following IMMEDIATELY BEFORE `function init() {`** (add a blank line first):

```javascript

/* ─────────────────────────────────────────────
   SECTION D0: DIFFICULTY & MILESTONE HELPERS
───────────────────────────────────────────── */

/**
 * Build an array of milestone objects scaled to the given drop target.
 * Uses percentage thresholds so milestones fire at appropriate points
 * for all three difficulty levels.
 * @param {number} target - WIN_DROPS_TARGET for this difficulty
 * @returns {Array<{drops: number, message: string}>}
 */
function buildMilestones(target) {
  return [
    { drops: Math.floor(target * 0.20), message: '💧 Great start! Water is on its way!' },
    { drops: Math.floor(target * 0.40), message: '🌊 A whole community is celebrating!' },
    { drops: Math.floor(target * 0.60), message: '💪 More than halfway — keep going!' },
    { drops: Math.floor(target * 0.80), message: '🔥 Almost there — don\'t stop now!' },
    { drops: Math.floor(target * 0.90), message: '⚡ So close! One final push!' },
  ];
}

/**
 * Apply a difficulty mode: overwrite CONFIG values, update UI labels,
 * rebuild milestone array, store selected mode in STATE.
 * @param {'easy'|'normal'|'hard'} mode
 */
function applyDifficulty(mode) {
  var d = DIFFICULTY_MODES[mode] || DIFFICULTY_MODES.normal;
  STATE.difficulty = mode;

  // Overwrite CONFIG with difficulty values
  CONFIG.WIN_DROPS_TARGET    = d.WIN_DROPS_TARGET;
  CONFIG.STARTING_LIVES      = d.STARTING_LIVES;
  CONFIG.DROP_SPEED_BASE     = d.DROP_SPEED_BASE;
  CONFIG.DROP_SPEED_MAX      = d.DROP_SPEED_MAX;
  CONFIG.SPAWN_INTERVAL_BASE = d.SPAWN_INTERVAL_BASE;
  CONFIG.SPAWN_INTERVAL_MIN  = d.SPAWN_INTERVAL_MIN;
  CONFIG.POLLUTANT_CHANCE    = d.POLLUTANT_CHANCE;
  CONFIG.POLLUTANT_CHANCE_MAX = d.POLLUTANT_CHANCE_MAX;

  // Rebuild milestones for this target
  STATE.activeMilestones = buildMilestones(d.WIN_DROPS_TARGET);

  // Update progress label
  var labelEl = document.getElementById('progress-label');
  if (labelEl) {
    labelEl.textContent = 'REWARD PROGRESS: Unlock at ' + d.WIN_DROPS_TARGET + ' Clean Drops!';
  }

  // Update the /N target number in the progress count
  var targetEl = document.getElementById('drops-target');
  if (targetEl) targetEl.textContent = d.WIN_DROPS_TARGET;

  // Update difficulty description text
  var descDescs = {
    easy:   'Catch 30 drops \u2022 5 lives \u2022 Relaxed pace',
    normal: 'Catch 50 drops \u2022 3 lives \u2022 Standard pace',
    hard:   'Catch 75 drops \u2022 2 lives \u2022 Fast & furious',
  };
  var descEl = document.getElementById('difficulty-description');
  if (descEl) descEl.textContent = descDescs[mode] || '';
}

/**
 * Check if the current dropsCaught count hits any unshown milestone.
 * Called after every clean drop catch. Shows toast if milestone hit.
 */
function checkMilestones() {
  for (var i = 0; i < STATE.activeMilestones.length; i++) {
    var m = STATE.activeMilestones[i];
    if (STATE.dropsCaught === m.drops && STATE.milestonesShown.indexOf(m.drops) === -1) {
      STATE.milestonesShown.push(m.drops);
      showMilestoneToast(m.message);
      break; // one toast at a time
    }
  }
}

/**
 * Show a milestone toast notification inside the game board.
 * Slides in, holds for 2500ms, slides out.
 * @param {string} message - Text to display in the toast
 */
function showMilestoneToast(message) {
  var toast = document.getElementById('milestone-toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.remove('toast-visible');
  toast.classList.add('toast-hidden');
  // Force reflow so the transition re-triggers if called back-to-back
  void toast.offsetWidth;
  toast.classList.remove('toast-hidden');
  toast.classList.add('toast-visible');
  setTimeout(function() {
    toast.classList.remove('toast-visible');
    toast.classList.add('toast-hidden');
  }, 2500);
}
```

---

### 10D. CHANGE — `init()` — Add difficulty button listeners and default mode

**Find this exact block** in `function init()`:
```javascript
  // Event listeners
  DOM.startBtn.addEventListener('click', startGame);
  DOM.replayBtn.addEventListener('click', replayGame);
  DOM.copyCodeBtn.addEventListener('click', copyCode);
```

**REPLACE IT WITH:**
```javascript
  // Event listeners
  DOM.startBtn.addEventListener('click', startGame);
  DOM.replayBtn.addEventListener('click', replayGame);
  DOM.copyCodeBtn.addEventListener('click', copyCode);

  // Difficulty button listeners
  document.querySelectorAll('.difficulty-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.difficulty-btn').forEach(function(b) {
        b.classList.remove('active');
      });
      this.classList.add('active');
      applyDifficulty(this.getAttribute('data-difficulty'));
    });
  });

  // Apply default difficulty (Normal) on load
  applyDifficulty('normal');
```

---

### 10E. CHANGE — `resetState()` — Add milestone reset

**Find this exact block** in `function resetState()`:
```javascript
  STATE.score           = 0;
  STATE.lives           = CONFIG.STARTING_LIVES;
  STATE.dropsCaught     = 0;
  STATE.spawnInterval   = CONFIG.SPAWN_INTERVAL_BASE;
  STATE.dropSpeed       = CONFIG.DROP_SPEED_BASE;
  STATE.pollutantChance = CONFIG.POLLUTANT_CHANCE;
  STATE.running         = false;
  STATE.keysHeld        = { left: false, right: false };
```

**REPLACE IT WITH** (adds two new lines at the end of the reset block):
```javascript
  STATE.score           = 0;
  STATE.lives           = CONFIG.STARTING_LIVES;
  STATE.dropsCaught     = 0;
  STATE.spawnInterval   = CONFIG.SPAWN_INTERVAL_BASE;
  STATE.dropSpeed       = CONFIG.DROP_SPEED_BASE;
  STATE.pollutantChance = CONFIG.POLLUTANT_CHANCE;
  STATE.running         = false;
  STATE.keysHeld        = { left: false, right: false };
  STATE.milestonesShown = [];
  STATE.activeMilestones = buildMilestones(CONFIG.WIN_DROPS_TARGET);
```

---

### 10F. CHANGE — `onCleanDropCaught()` — Add milestone check and sound

**Find this exact block** in `function onCleanDropCaught(drop)`:
```javascript
  // Positive feedback
  spawnFloatText('+' + CONFIG.CLEAN_DROP_VALUE, drop.x, drop.y, true);
  triggerScreenFlash('blue');
  triggerPlayerFlash('positive');
  flashScoreColor('green');
```

**REPLACE IT WITH** (adds two calls at the end of the feedback block):
```javascript
  // Positive feedback
  spawnFloatText('+' + CONFIG.CLEAN_DROP_VALUE, drop.x, drop.y, true);
  triggerScreenFlash('blue');
  triggerPlayerFlash('positive');
  flashScoreColor('green');
  playSound('clean');
  checkMilestones();
```

---

### 10G. CHANGE — `onPollutantCaught()` — Add sound

**Find this exact block** in `function onPollutantCaught(drop)`:
```javascript
  // Negative feedback
  spawnFloatText('-' + CONFIG.POLLUTANT_COST_SCORE, drop.x, drop.y, false);
  triggerScreenFlash('red');
  triggerPlayerFlash('negative');
  flashScoreColor('red');
```

**REPLACE IT WITH** (adds one call at the end):
```javascript
  // Negative feedback
  spawnFloatText('-' + CONFIG.POLLUTANT_COST_SCORE, drop.x, drop.y, false);
  triggerScreenFlash('red');
  triggerPlayerFlash('negative');
  flashScoreColor('red');
  playSound('pollutant');
```

---

### 10H. CHANGE — `endGame()` — Add win/lose sounds and dynamic modal copy

**Find this exact block** in `function endGame(isWin)`:
```javascript
  // Final freeze — drop all active drops (remove from DOM)
  STATE.drops.forEach(d => { if (d.el && d.el.parentNode) d.el.parentNode.removeChild(d.el); });
  STATE.drops = [];

  showModal(isWin);
```

**REPLACE IT WITH** (adds sound call before showModal):
```javascript
  // Final freeze — drop all active drops (remove from DOM)
  STATE.drops.forEach(d => { if (d.el && d.el.parentNode) d.el.parentNode.removeChild(d.el); });
  STATE.drops = [];

  playSound(isWin ? 'win' : 'lose');
  showModal(isWin);
```

---

### 10I. CHANGE — `showModal()` — Dynamic copy uses difficulty target

**Find this exact block** in `function showModal(isWin)`:
```javascript
  if (isWin) {
    DOM.modalTitle.textContent = 'Impact Made! 🎉';
    DOM.modalBody.textContent  =
      'You collected 50 clean drops — helping fund a campus water project! ' +
      'Here is your exclusive Campus Cafeteria discount:';
    DOM.modalReward.style.display = 'flex';
  } else {
```

**REPLACE IT WITH** (makes the drop count dynamic based on active difficulty):
```javascript
  if (isWin) {
    DOM.modalTitle.textContent = 'Impact Made! 🎉';
    DOM.modalBody.textContent  =
      'You collected ' + CONFIG.WIN_DROPS_TARGET + ' clean drops — helping fund a campus water project! ' +
      'Here is your exclusive Campus Cafeteria discount:';
    DOM.modalReward.style.display = 'flex';
  } else {
```

---

## 11. COMPLETE VERIFICATION CHECKLIST

After all changes are applied, the agent must verify each item before delivering:

### Difficulty Modes
- [ ] Welcome screen shows 3 difficulty buttons: 💧 EASY, ⚡ NORMAL, 🔥 HARD
- [ ] NORMAL button has `.active` class by default (yellow background)
- [ ] Clicking EASY removes active from others, applies green active style, updates description text to "Catch 30 drops • 5 lives • Relaxed pace"
- [ ] Clicking HARD removes active from others, applies red active style, updates description text to "Catch 75 drops • 2 lives • Fast & furious"
- [ ] Progress label updates to "REWARD PROGRESS: Unlock at 30 Clean Drops!" on Easy
- [ ] `/N` counter in progress section updates (shows `/30` on Easy, `/75` on Hard)
- [ ] On Easy: game starts with 5 life icons, win at 30 drops, win modal says "30 clean drops"
- [ ] On Hard: game starts with 2 life icons, win at 75 drops, win modal says "75 clean drops"
- [ ] Changing difficulty after losing and replaying correctly applies the new mode

### Milestone Messages
- [ ] On Normal mode, catching 10 drops shows toast "💧 Great start! Water is on its way!"
- [ ] On Normal mode, catching 20 drops shows toast "🌊 A whole community is celebrating!"
- [ ] Toast slides in from top of game board
- [ ] Toast disappears after ~2.5 seconds
- [ ] Same milestone does NOT fire twice in the same game session
- [ ] Milestones reset when PLAY AGAIN is clicked

### Sound Effects
- [ ] A sound plays when a clean drop is caught
- [ ] A different sound plays when a pollutant is caught
- [ ] A win sound plays when the game is won
- [ ] A lose sound plays when the game is lost
- [ ] Missing audio files do not throw uncaught errors or freeze the game
- [ ] Audio directory is `/audio/` at project root with exact filenames: `catch-clean.mp3`, `catch-pollutant.mp3`, `win.mp3`, `lose.mp3`

### Footer
- [ ] Footer has TWO functional links: `charitywater.org` AND `charitywater.org/donate`
- [ ] Both links open in a new tab
- [ ] Links are clearly visible and styled

### Existing Features — Confirm Unchanged
- [ ] Drops still visibly disappear (catchPop animation) when caught
- [ ] Screen flash (blue/red) still works
- [ ] Float text (+1, -3) still works
- [ ] Progress bar still fills correctly
- [ ] Right sidebar SVG ring still updates
- [ ] Sidebar photos still display
- [ ] Montserrat font still applied throughout
- [ ] Mobile touch controls still work
- [ ] Desktop arrow/WASD controls still work
- [ ] Responsive layout (sidebars hide on mobile) still works
- [ ] PLAY AGAIN fully resets score, lives, progress bar, drops

---

## 12. AI CODING AGENT PROMPT

Copy and paste the following prompt exactly when handing this PRD to the coding agent:

---

**"I have a working 3-file web game: `index.html`, `game.css`, and `game.js`. I am attaching all three files along with a Phase 2 PRD document. Your job is to apply the changes described in the PRD to the existing files.**

**Critical rules:**
**1. DO NOT rewrite any file from scratch. Make only the changes explicitly listed in the PRD.**
**2. Each change section provides exact anchor text (existing code to locate) and exact replacement or insertion code. Find the anchor, make the change, move on.**
**3. Do not rename any existing variables, functions, IDs, or class names that are not explicitly changed in the PRD.**
**4. The PRD has 8 JavaScript change locations (10A through 10I), 4 HTML change locations (8A through 8D), and 1 CSS append (Section 9). Apply ALL of them.**
**5. After applying all changes, output the three complete updated files: `index.html`, `game.css`, and `game.js`.**
**6. Before delivering, mentally run through the Complete Verification Checklist in Section 11 of the PRD and confirm every item passes. Fix anything that fails before responding.**
**7. Do not add any features, comments, or code not described in this PRD.**
**8. The `/audio/` folder and `.mp3` files are provided separately by the student — your code just needs to reference them at `audio/catch-clean.mp3`, `audio/catch-pollutant.mp3`, `audio/win.mp3`, and `audio/lose.mp3`.**
**9. Do not explain the code. Deliver the three complete updated files."**

---

*End of Phase 2 PRD — Drop by Drop: The Jerry Can Challenge*
*Built for charity: water | Campus Engagement Concept*
*Subsurface Dev — subsurfacedev.xyz*
