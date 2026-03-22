/* =====================================================
   DROP BY DROP — GAME ENGINE
   Complete vanilla JS implementation.
   No external dependencies.
===================================================== */

'use strict';

/* ─────────────────────────────────────────────
   SECTION A: GAME CONFIGURATION
   Tweak these values to tune difficulty.
───────────────────────────────────────────── */
const CONFIG = {
  BOARD_WIDTH:            360,     // px — must match CSS --game-board-width
  PLAYER_WIDTH:           70,      // px — must match CSS --player-width
  PLAYER_HEIGHT:          105,     // px — must match CSS --player-height
  DROP_WIDTH:             38,      // px — must match CSS --drop-size
  DROP_HEIGHT:            51,      // px — drop-size * 1.35

  STARTING_LIVES:         3,
  CLEAN_DROP_VALUE:       1,       // score points for catching a clean drop
  POLLUTANT_COST_SCORE:   3,       // score points deducted for a pollutant
  POLLUTANT_COST_LIVES:   1,       // lives deducted for catching a pollutant
  WIN_DROPS_TARGET:       50,      // number of clean drops needed to win

  SPAWN_INTERVAL_BASE:    1400,    // ms between drops at start
  SPAWN_INTERVAL_MIN:     500,     // ms — fastest spawn rate (maximum difficulty)
  SPAWN_SPEED_INCREASE:   0.97,    // multiplier per successful clean catch

  DROP_SPEED_BASE:        2.0,     // px per frame at game start
  DROP_SPEED_MAX:         5.5,     // px per frame at max difficulty
  DROP_SPEED_INCREASE:    0.03,    // added to speed per clean catch

  POLLUTANT_CHANCE:       0.28,    // 28% chance each spawned drop is a pollutant
  POLLUTANT_CHANCE_MAX:   0.45,    // max pollutant rate as difficulty scales

  PLAYER_SPEED_KEYS:      8,       // px per keydown tick (arrow/WASD)
  PLAYER_SPEED_TOUCH:     1.0,     // multiplier for touch drag delta

  COLLISION_TOLERANCE_X:  14,      // extra px of horizontal forgiveness
  COLLISION_TOLERANCE_Y:  12,      // extra px of vertical forgiveness

  FLASH_DURATION:         180,     // ms for screen flash
  SCORE_FLASH_DURATION:   300,     // ms for score color flash
  PLAYER_FLASH_DURATION:  250,     // ms for player can flash

  REWARD_CODE:            'CLEANWATER15',

  FRAME_RATE_TARGET:      60,      // target frames per second
};

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

/* ─────────────────────────────────────────────
   SECTION B: DOM REFERENCES
   Cache every DOM element used by the engine.
───────────────────────────────────────────── */
const DOM = {
  // Screens
  welcomeScreen:    document.getElementById('welcome-screen'),
  gameBoard:        document.getElementById('game-board'),
  modalOverlay:     document.getElementById('modal-overlay'),

  // Buttons
  startBtn:         document.getElementById('start-btn'),
  replayBtn:        document.getElementById('replay-btn'),
  copyCodeBtn:      document.getElementById('copy-code-btn'),

  // Stats
  scoreValue:       document.getElementById('score-value'),
  livesIcons:       document.getElementById('lives-icons'),
  progressBarFill:  document.getElementById('progress-bar-fill'),
  dropsCaught:      document.getElementById('drops-caught'),
  progressCount:    document.getElementById('progress-count').querySelector('#drops-caught'),

  // Player
  playerContainer:  document.getElementById('player-container'),
  playerCan:        document.getElementById('player-can'),

  // Feedback
  screenFlash:      document.getElementById('screen-flash'),
  floatTextPool:    document.getElementById('float-text-pool'),

  // Modal
  modalIcon:        document.getElementById('modal-icon'),
  modalTitle:       document.getElementById('modal-title'),
  modalBody:        document.getElementById('modal-body'),
  modalReward:      document.getElementById('modal-reward'),
  modalFinalScore:  document.getElementById('modal-final-score'),
  modalDropsCaught: document.getElementById('modal-drops-caught'),

  // Right sidebar
  rewardSvgProgress: document.getElementById('reward-svg-progress'),
  rewardLockIcon:    document.getElementById('reward-lock-icon'),
  rewardCodeDisplay: document.getElementById('reward-code-display'),
  rewardDropsCount:  document.getElementById('reward-drops-count'),
  rewardStatusText:  document.getElementById('reward-status-text'),
};

/* ─────────────────────────────────────────────
   SECTION C: GAME STATE
   Single source of truth for all game data.
───────────────────────────────────────────── */
const STATE = {
  running:          false,
  score:            0,
  lives:            CONFIG.STARTING_LIVES,
  dropsCaught:      0,
  drops:            [],        // active drop objects
  playerX:          0,         // left edge of player can (px from board left)
  spawnInterval:    CONFIG.SPAWN_INTERVAL_BASE,
  dropSpeed:        CONFIG.DROP_SPEED_BASE,
  pollutantChance:  CONFIG.POLLUTANT_CHANCE,
  spawnTimer:       null,
  animFrameId:      null,
  keysHeld:         { left: false, right: false },
  touchStartX:       0,
  touchLastX:        0,
  lastTimestamp:     0,
  difficulty:        'normal',    // currently selected difficulty key
  milestonesShown:   [],          // drop counts where milestone was already displayed
  activeMilestones:  [],          // built at game start from current WIN_DROPS_TARGET
};

/* ─────────────────────────────────────────────
   SECTION D: INITIALIZATION
───────────────────────────────────────────── */

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

function init() {
  renderLives(CONFIG.STARTING_LIVES);
  updateProgressBar(0);
  updateRewardCircle(0);

  // Center player
  STATE.playerX = (CONFIG.BOARD_WIDTH / 2) - (CONFIG.PLAYER_WIDTH / 2);
  setPlayerPosition(STATE.playerX);

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

  // Keyboard input
  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('keyup', onKeyUp);

  // Touch input (on game board)
  DOM.gameBoard.addEventListener('touchstart', onTouchStart, { passive: true });
  DOM.gameBoard.addEventListener('touchmove',  onTouchMove,  { passive: true });
  DOM.gameBoard.addEventListener('touchend',   onTouchEnd,   { passive: true });

  // Prevent scrolling while playing
  document.addEventListener('touchmove', function(e) {
    if (STATE.running) e.preventDefault();
  }, { passive: false });
}

/* ─────────────────────────────────────────────
   SECTION E: GAME LIFECYCLE
───────────────────────────────────────────── */

/** Start a fresh game */
function startGame() {
  resetState();

  // Hide welcome, show board
  DOM.welcomeScreen.classList.add('hidden');
  DOM.gameBoard.classList.add('active');
  DOM.gameBoard.focus();

  STATE.running = true;
  scheduleNextSpawn();
  STATE.animFrameId = requestAnimationFrame(gameLoop);
}

/** Full state reset — used both for fresh start and replay */
function resetState() {
  // Stop any running loops
  if (STATE.spawnTimer)    clearTimeout(STATE.spawnTimer);
  if (STATE.animFrameId)   cancelAnimationFrame(STATE.animFrameId);

  // Clear all active drops from DOM
  STATE.drops.forEach(d => { if (d.el && d.el.parentNode) d.el.parentNode.removeChild(d.el); });
  STATE.drops = [];

  // Reset data
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

  // Reset player position
  STATE.playerX = (CONFIG.BOARD_WIDTH / 2) - (CONFIG.PLAYER_WIDTH / 2);
  setPlayerPosition(STATE.playerX);

  // Reset UI
  updateScoreDisplay();
  renderLives(CONFIG.STARTING_LIVES);
  updateProgressBar(0);
  updateRewardCircle(0);
  DOM.screenFlash.className = '';
  DOM.playerCan.className = '';
}

/** Called on replay button */
function replayGame() {
  DOM.modalOverlay.style.display = 'none';
  resetState();
  STATE.running = true;
  scheduleNextSpawn();
  STATE.animFrameId = requestAnimationFrame(gameLoop);
}

/** End the game — either win or lose */
function endGame(isWin) {
  STATE.running = false;
  if (STATE.spawnTimer)  clearTimeout(STATE.spawnTimer);
  if (STATE.animFrameId) cancelAnimationFrame(STATE.animFrameId);

  // Final freeze — drop all active drops (remove from DOM)
  STATE.drops.forEach(d => { if (d.el && d.el.parentNode) d.el.parentNode.removeChild(d.el); });
  STATE.drops = [];

  playSound(isWin ? 'win' : 'lose');
  showModal(isWin);
}

/* ─────────────────────────────────────────────
   SECTION F: MAIN GAME LOOP (requestAnimationFrame)
───────────────────────────────────────────── */
function gameLoop(timestamp) {
  if (!STATE.running) return;

  // Time delta for frame-rate-independent movement
  const delta = timestamp - (STATE.lastTimestamp || timestamp);
  STATE.lastTimestamp = timestamp;
  const frameFactor = delta / (1000 / CONFIG.FRAME_RATE_TARGET);

  // 1. Move player from held keys
  movePlayerFromKeys(frameFactor);

  // 2. Move all drops down
  moveDrop(frameFactor);

  // 3. Collision detection
  checkCollisions();

  // 4. Continue loop
  STATE.animFrameId = requestAnimationFrame(gameLoop);
}

/* ─────────────────────────────────────────────
   SECTION G: PLAYER MOVEMENT
───────────────────────────────────────────── */

/** Set player can left position absolutely */
function setPlayerPosition(x) {
  const min = 0;
  const max = CONFIG.BOARD_WIDTH - CONFIG.PLAYER_WIDTH;
  STATE.playerX = Math.max(min, Math.min(max, x));
  DOM.playerContainer.style.left = STATE.playerX + 'px';
  DOM.playerContainer.style.transform = 'translateX(0)'; // override initial centering
}

/** Move player based on currently-held keyboard keys */
function movePlayerFromKeys(frameFactor) {
  const speed = CONFIG.PLAYER_SPEED_KEYS * frameFactor;
  if (STATE.keysHeld.left)  setPlayerPosition(STATE.playerX - speed);
  if (STATE.keysHeld.right) setPlayerPosition(STATE.playerX + speed);
}

/** KEYBOARD DOWN */
function onKeyDown(e) {
  if (!STATE.running) return;
  if (e.key === 'ArrowLeft'  || e.key === 'a' || e.key === 'A') {
    STATE.keysHeld.left = true;
    e.preventDefault();
  }
  if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
    STATE.keysHeld.right = true;
    e.preventDefault();
  }
}

/** KEYBOARD UP */
function onKeyUp(e) {
  if (e.key === 'ArrowLeft'  || e.key === 'a' || e.key === 'A') STATE.keysHeld.left  = false;
  if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') STATE.keysHeld.right = false;
}

/** TOUCH START — record initial X */
function onTouchStart(e) {
  if (!STATE.running) return;
  STATE.touchStartX = e.touches[0].clientX;
  STATE.touchLastX  = e.touches[0].clientX;
}

/** TOUCH MOVE — move player proportional to drag delta */
function onTouchMove(e) {
  if (!STATE.running) return;
  const currentX = e.touches[0].clientX;
  const delta    = currentX - STATE.touchLastX;
  STATE.touchLastX = currentX;
  setPlayerPosition(STATE.playerX + (delta * CONFIG.PLAYER_SPEED_TOUCH));
}

/** TOUCH END */
function onTouchEnd(e) {
  STATE.touchStartX = 0;
  STATE.touchLastX  = 0;
}

/* ─────────────────────────────────────────────
   SECTION H: DROP SPAWNING
───────────────────────────────────────────── */

/**
 * Schedule the next drop spawn.
 * Uses setTimeout so the interval can be dynamically updated.
 */
function scheduleNextSpawn() {
  STATE.spawnTimer = setTimeout(function() {
    if (STATE.running) {
      spawnDrop();
      scheduleNextSpawn();
    }
  }, STATE.spawnInterval);
}

/** Create and inject a single falling drop element */
function spawnDrop() {
  const isPollutant = Math.random() < STATE.pollutantChance;

  // Random X position — keep drop fully within board
  const margin = 10;
  const maxX   = CONFIG.BOARD_WIDTH - CONFIG.DROP_WIDTH - margin;
  const x      = Math.floor(Math.random() * (maxX - margin) + margin);

  // Build DOM element
  const el = document.createElement('div');
  el.className = 'drop ' + (isPollutant ? 'drop--pollutant' : 'drop--clean');
  el.style.left = x + 'px';
  el.style.top  = '-60px';

  // Try to use image, fallback to CSS div
  const img = document.createElement('img');
  img.src = isPollutant ? 'images/drop-pollutant.png' : 'images/drop-clean.png';
  img.alt = isPollutant ? 'Pollutant drop' : 'Clean water drop';
  img.draggable = false;
  img.onerror = function() {
    this.outerHTML = '<div class="drop-fallback"></div>';
  };
  el.appendChild(img);

  DOM.gameBoard.appendChild(el);

  // Track drop in state
  STATE.drops.push({
    el:           el,
    x:            x,
    y:            -60,
    isPollutant:  isPollutant,
    speed:        STATE.dropSpeed + (Math.random() * 0.8 - 0.4), // slight variation per drop
    caught:       false,
  });
}

/* ─────────────────────────────────────────────
   SECTION I: DROP MOVEMENT & CLEANUP
───────────────────────────────────────────── */

/** Move all drops downward by their speed, remove out-of-bounds drops */
function moveDrop(frameFactor) {
  const boardHeight = DOM.gameBoard.offsetHeight;
  const toRemove = [];

  for (let i = 0; i < STATE.drops.length; i++) {
    const drop = STATE.drops[i];
    if (drop.caught) continue;

    drop.y += drop.speed * frameFactor;
    drop.el.style.top = drop.y + 'px';

    // If drop passed the bottom boundary without being caught — despawn
    if (drop.y > boardHeight) {
      toRemove.push(i);
      if (drop.el.parentNode) drop.el.parentNode.removeChild(drop.el);
    }
  }

  // Remove despawned drops from state array (iterate backwards)
  for (let i = toRemove.length - 1; i >= 0; i--) {
    STATE.drops.splice(toRemove[i], 1);
  }
}

/* ─────────────────────────────────────────────
   SECTION J: COLLISION DETECTION
   Checks every active drop against the player can rect.
───────────────────────────────────────────── */
function checkCollisions() {
  const boardRect   = DOM.gameBoard.getBoundingClientRect();
  const playerTop   = boardRect.height - 12 - CONFIG.PLAYER_HEIGHT; // player bottom padding = 12px
  const playerLeft  = STATE.playerX;
  const playerRight = STATE.playerX + CONFIG.PLAYER_WIDTH;

  const toRemove = [];

  for (let i = 0; i < STATE.drops.length; i++) {
    const drop = STATE.drops[i];
    if (drop.caught) continue;

    // Drop bounding box
    const dropLeft   = drop.x;
    const dropRight  = drop.x + CONFIG.DROP_WIDTH;
    const dropBottom = drop.y + CONFIG.DROP_HEIGHT;
    const dropTop    = drop.y;

    // Tolerances make the hitbox feel generous and fair
    const tX = CONFIG.COLLISION_TOLERANCE_X;
    const tY = CONFIG.COLLISION_TOLERANCE_Y;

    // AABB intersection check with tolerance
    const xOverlap = dropRight  > (playerLeft - tX) && dropLeft < (playerRight + tX);
    const yOverlap = dropBottom > (playerTop  - tY) && dropTop  < (playerTop + CONFIG.PLAYER_HEIGHT + tY);

    if (xOverlap && yOverlap) {
      drop.caught = true;
      toRemove.push(i);

      // Trigger catch animation
      drop.el.classList.add('caught');
      setTimeout(() => {
        if (drop.el.parentNode) drop.el.parentNode.removeChild(drop.el);
      }, 250);

      if (drop.isPollutant) {
        onPollutantCaught(drop);
      } else {
        onCleanDropCaught(drop);
      }
    }
  }

  // Clean up caught drops from state
  for (let i = toRemove.length - 1; i >= 0; i--) {
    STATE.drops.splice(toRemove[i], 1);
  }
}

/* ─────────────────────────────────────────────
   SECTION K: CATCH OUTCOMES
───────────────────────────────────────────── */

/** A clean water drop was caught */
function onCleanDropCaught(drop) {
  STATE.score       += CONFIG.CLEAN_DROP_VALUE;
  STATE.dropsCaught += 1;

  // Update UI
  updateScoreDisplay();
  updateProgressBar(STATE.dropsCaught);
  updateRewardCircle(STATE.dropsCaught);

  // Positive feedback
  spawnFloatText('+' + CONFIG.CLEAN_DROP_VALUE, drop.x, drop.y, true);
  triggerScreenFlash('blue');
  triggerPlayerFlash('positive');
  flashScoreColor('green');
  playSound('clean');
  checkMilestones();

  // Increase difficulty slightly
  STATE.dropSpeed = Math.min(
    CONFIG.DROP_SPEED_MAX,
    STATE.dropSpeed + CONFIG.DROP_SPEED_INCREASE
  );
  STATE.spawnInterval = Math.max(
    CONFIG.SPAWN_INTERVAL_MIN,
    Math.floor(STATE.spawnInterval * CONFIG.SPAWN_SPEED_INCREASE)
  );
  STATE.pollutantChance = Math.min(
    CONFIG.POLLUTANT_CHANCE_MAX,
    STATE.pollutantChance + 0.002
  );

  // Check win condition
  if (STATE.dropsCaught >= CONFIG.WIN_DROPS_TARGET) {
    endGame(true);
  }
}

/** A pollutant drop was caught */
function onPollutantCaught(drop) {
  STATE.score -= CONFIG.POLLUTANT_COST_SCORE;
  STATE.lives -= CONFIG.POLLUTANT_COST_LIVES;

  // Clamp score at 0 minimum
  if (STATE.score < 0) STATE.score = 0;

  // Update UI
  updateScoreDisplay();
  renderLives(STATE.lives);

  // Negative feedback
  spawnFloatText('-' + CONFIG.POLLUTANT_COST_SCORE, drop.x, drop.y, false);
  triggerScreenFlash('red');
  triggerPlayerFlash('negative');
  flashScoreColor('red');
  playSound('pollutant');

  // Check lose condition
  if (STATE.lives <= 0) {
    endGame(false);
  }
}

/* ─────────────────────────────────────────────
   SECTION L: UI UPDATE FUNCTIONS
───────────────────────────────────────────── */

/** Update score number display */
function updateScoreDisplay() {
  DOM.scoreValue.textContent = STATE.score;

  // Re-query DOM reference for #drops-caught to avoid stale ref
  const el = document.getElementById('drops-caught');
  if (el) el.textContent = STATE.dropsCaught;
}

/** Render life icons (full vs. lost) */
function renderLives(count) {
  DOM.livesIcons.innerHTML = '';
  for (let i = 0; i < CONFIG.STARTING_LIVES; i++) {
    const icon = document.createElement('span');
    icon.className = 'life-icon' + (i >= count ? ' lost' : '');
    icon.textContent = '💧';
    icon.setAttribute('aria-hidden', 'true');
    DOM.livesIcons.appendChild(icon);
  }
}

/** Update the reward progress bar fill */
function updateProgressBar(caught) {
  const pct = Math.min(100, (caught / CONFIG.WIN_DROPS_TARGET) * 100);
  DOM.progressBarFill.style.width = pct + '%';
  const el = document.getElementById('drops-caught');
  if (el) el.textContent = caught;
}

/** Update the right sidebar SVG ring and text */
function updateRewardCircle(caught) {
  const circumference = 314; // 2 * PI * 50
  const pct = Math.min(1, caught / CONFIG.WIN_DROPS_TARGET);
  const offset = circumference - (circumference * pct);
  DOM.rewardSvgProgress.setAttribute('stroke-dashoffset', offset);

  const countEl = document.getElementById('reward-drops-count');
  if (countEl) countEl.textContent = caught;

  // Reveal code when won
  if (caught >= CONFIG.WIN_DROPS_TARGET) {
    DOM.rewardLockIcon.style.display    = 'none';
    DOM.rewardCodeDisplay.style.display = 'flex';
    const statusEl = document.getElementById('reward-status-text');
    if (statusEl) statusEl.textContent = CONFIG.REWARD_CODE;
  }
}

/* ─────────────────────────────────────────────
   SECTION M: VISUAL FEEDBACK
───────────────────────────────────────────── */

/** Flash the full game board screen */
function triggerScreenFlash(type) {
  DOM.screenFlash.className = '';
  void DOM.screenFlash.offsetWidth; // force reflow for re-trigger
  DOM.screenFlash.classList.add('flash-' + type);
  setTimeout(() => { DOM.screenFlash.className = ''; }, CONFIG.FLASH_DURATION);
}

/** Flash the player can image */
function triggerPlayerFlash(type) {
  DOM.playerCan.classList.remove('flash-negative', 'flash-positive');
  void DOM.playerCan.offsetWidth;
  DOM.playerCan.classList.add('flash-' + type);
  setTimeout(() => { DOM.playerCan.classList.remove('flash-negative', 'flash-positive'); }, CONFIG.PLAYER_FLASH_DURATION);
}

/** Flash the score number color */
function flashScoreColor(type) {
  DOM.scoreValue.classList.remove('flash-red', 'flash-green');
  void DOM.scoreValue.offsetWidth;
  DOM.scoreValue.classList.add('flash-' + type);
  setTimeout(() => { DOM.scoreValue.classList.remove('flash-red', 'flash-green'); }, CONFIG.SCORE_FLASH_DURATION);
}

/** Spawn a floating "+1" or "-3" text at drop position */
function spawnFloatText(text, dropX, dropY, isPositive) {
  const boardRect = DOM.gameBoard.getBoundingClientRect();
  const el = document.createElement('span');
  el.className = 'float-text ' + (isPositive ? 'float-text--plus' : 'float-text--minus');
  el.textContent = text;
  el.style.left = (boardRect.left + dropX + CONFIG.DROP_WIDTH / 2) + 'px';
  el.style.top  = (boardRect.top  + dropY) + 'px';
  DOM.floatTextPool.appendChild(el);
  setTimeout(() => {
    if (el.parentNode) el.parentNode.removeChild(el);
  }, 950);
}

/* ─────────────────────────────────────────────
   SECTION N: MODAL (WIN / LOSE)
───────────────────────────────────────────── */

/**
 * Show the end-game modal.
 * @param {boolean} isWin - true = win, false = lose
 */
function showModal(isWin) {
  DOM.modalIcon.textContent  = isWin ? '💧' : '😔';
  DOM.modalIcon.className    = 'modal-icon modal-icon--' + (isWin ? 'win' : 'lose');

  DOM.modalFinalScore.textContent  = STATE.score;
  DOM.modalDropsCaught.textContent = STATE.dropsCaught;

  if (isWin) {
    DOM.modalTitle.textContent = 'Impact Made! 🎉';
    DOM.modalBody.textContent  =
      'You collected ' + CONFIG.WIN_DROPS_TARGET + ' clean drops — helping fund a campus water project! ' +
      'Here is your exclusive Campus Cafeteria discount:';
    DOM.modalReward.style.display = 'flex';
  } else {
    DOM.modalTitle.textContent    = "Try Again! We're almost there!";
    DOM.modalBody.textContent     =
      'You ran out of lives. Replay to provide clean water — ' +
      'every drop counts toward funding a real water project!';
    DOM.modalReward.style.display = 'none';
  }

  DOM.modalOverlay.style.display = 'flex';
}

/** Copy the reward code to clipboard */
function copyCode() {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(CONFIG.REWARD_CODE).then(() => {
      DOM.copyCodeBtn.textContent = 'Copied!';
      setTimeout(() => { DOM.copyCodeBtn.textContent = 'Copy'; }, 2000);
    });
  } else {
    // Fallback: select the text
    const range = document.createRange();
    range.selectNode(document.getElementById('modal-code'));
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
    DOM.copyCodeBtn.textContent = 'Copied!';
    setTimeout(() => { DOM.copyCodeBtn.textContent = 'Copy'; }, 2000);
  }
}

/* ─────────────────────────────────────────────
   SECTION O: BOOT
───────────────────────────────────────────── */

// Run once DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}