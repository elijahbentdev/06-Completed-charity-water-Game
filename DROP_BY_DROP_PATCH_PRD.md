# 📄 PATCH PRD — Cosmetic Fixes
## Drop by Drop: The Jerry Can Challenge
### Two-Fix Polish Pass

---

**Builds On:** Phase 2 files (index.html, game.css, game.js)  
**Scope:** Two surgical fixes only. Touch nothing else.

---

## FIX 1 — Right Sidebar SVG Circle Shows Wrong Target

**Problem:** The sidebar circle shows `0/50` hardcoded in the HTML. On Easy (target 30) or Hard (target 75) it visually implies the wrong goal.

**Solution:** Update the `/50` display text dynamically inside `updateRewardCircle()` every time it's called, and also inside `applyDifficulty()`.

---

### FIX 1A — HTML change

**File:** `index.html`

**Find:**
```html
              <div id="reward-drops-label"><span id="reward-drops-count">0</span>/50</div>
```

**Replace with:**
```html
              <div id="reward-drops-label"><span id="reward-drops-count">0</span>/<span id="reward-drops-target">50</span></div>
```

---

### FIX 1B — JS change in `updateRewardCircle()`

**File:** `game.js`

**Find:**
```javascript
  const countEl = document.getElementById('reward-drops-count');
  if (countEl) countEl.textContent = caught;
```

**Replace with:**
```javascript
  const countEl = document.getElementById('reward-drops-count');
  if (countEl) countEl.textContent = caught;
  const targetEl2 = document.getElementById('reward-drops-target');
  if (targetEl2) targetEl2.textContent = CONFIG.WIN_DROPS_TARGET;
```

---

## FIX 2 — Left Sidebar Hardcodes "50 clean drops"

**Problem:** The How to Play list item always says "Catch **50 clean drops**" regardless of difficulty.

**Solution:** Give that `<strong>` tag an ID and update it inside `applyDifficulty()`.

---

### FIX 2A — HTML change

**File:** `index.html`

**Find:**
```html
            <span>Catch <strong>50 clean drops</strong> to unlock your <strong>Campus Reward!</strong></span>
```

**Replace with:**
```html
            <span>Catch <strong id="sidebar-drops-target">50</strong> clean drops to unlock your <strong>Campus Reward!</strong></span>
```

---

### FIX 2B — JS change in `applyDifficulty()`

**File:** `game.js`

**Find this existing line** (already inside `applyDifficulty()`):
```javascript
  // Update the /N target number in the progress count
  var targetEl = document.getElementById('drops-target');
  if (targetEl) targetEl.textContent = d.WIN_DROPS_TARGET;
```

**Replace with** (adds one new line underneath):
```javascript
  // Update the /N target number in the progress count
  var targetEl = document.getElementById('drops-target');
  if (targetEl) targetEl.textContent = d.WIN_DROPS_TARGET;
  var sidebarTarget = document.getElementById('sidebar-drops-target');
  if (sidebarTarget) sidebarTarget.textContent = d.WIN_DROPS_TARGET;
```

---

## VERIFICATION

After applying all four changes:

- [ ] Switch to Easy → sidebar circle shows `0/30`, How to Play shows "Catch **30** clean drops"
- [ ] Switch to Hard → sidebar circle shows `0/75`, How to Play shows "Catch **75** clean drops"
- [ ] Switch back to Normal → both show `50` again
- [ ] During gameplay on Easy, catching drops increments the circle toward 30 correctly
- [ ] Nothing else in the game is affected

---

## AGENT PROMPT

**"I have three existing game files: index.html, game.css, game.js. Apply the following four changes exactly as described. Do not modify anything else.**

**Change 1 (index.html):** Find `<div id="reward-drops-label"><span id="reward-drops-count">0</span>/50</div>` and add `id="reward-drops-target"` to the `/50` text as specified.**

**Change 2 (game.js):** Inside `updateRewardCircle()`, after the line that sets `reward-drops-count`, add two lines that update `reward-drops-target` with `CONFIG.WIN_DROPS_TARGET`.**

**Change 3 (index.html):** Find the sidebar How to Play list item with "50 clean drops" and add `id="sidebar-drops-target"` to the `<strong>` tag wrapping the number 50.**

**Change 4 (game.js):** Inside `applyDifficulty()`, after the two lines that update `drops-target`, add two lines that update `sidebar-drops-target` with `d.WIN_DROPS_TARGET`.**

**Do not rewrite any files from scratch. Output only the updated index.html and game.js. game.css does not need to change."**
