# Tetris Revival — Upgrade Plan

Bringing the 2019 CRA/React 16 build back to life on modern tooling, and fixing the
correctness bugs found in the code review.

**Status legend:** `[ ]` not started · `[~]` in progress · `[x]` done · `[-]` skipped

---

## Phase 0 — Baseline ✅

- [x] Clone repo, read all 20 source files (591 LOC)
- [x] Confirm `npm install` succeeds (1,590 packages, 234 advisories: 23 critical / 69 high)
- [x] Confirm `npm run build` **fails** on Node 22 — `ERR_OSSL_EVP_UNSUPPORTED`
- [x] Confirm build succeeds with `NODE_OPTIONS=--openssl-legacy-provider` (escape hatch only)

**Baseline bundle (CRA, gzipped):** 54.63 KB vendor + 2.92 KB app + 0.77 KB runtime + 0.16 KB CSS

**After Phase 1:** 29 packages (was 1,590) · 0 advisories (was 234) · build 622 ms · 81.47 KB gzip

---

## Phase 1 — Toolchain: CRA → Vite ✅

Kills the OpenSSL failure, the 234 advisories, and the 1,590-package tree in one move.

- [x] Remove `react-scripts`, add `vite` + `@vitejs/plugin-react`
- [x] Move `public/index.html` → root `index.html`, strip `%PUBLIC_URL%`, add module script tag
- [x] Add `vite.config.js`
- [x] Rename JSX-containing `.js` files → `.jsx`, update imports
- [x] Rewrite npm scripts (`dev` / `build` / `preview`)
- [x] Verify `npm run build` passes on Node 22 with **no** legacy-provider flag
- [x] Verify `npm audit` is clean
- [x] Port styled-components v4 → v6 (transient `$props`, or they leak to the DOM)

## Phase 2 — React 19 + state purity ✅

Must land **before** StrictMode is enabled — React 19 double-invokes updaters in dev,
which turns each of these latent bugs into visible breakage.

- [x] `usePlayer.js:47` — stop mutating prev state (`prev.pos.x += x`)
- [x] `useStage.js:14` — move `setRowsCleared` side effect out of the `setStage` updater
- [x] `useGameStatus.js:8,21` — hoist `linePoints`, drop `score` from the effect deps
- [x] `useStage.js:53` — add the missing `resetPlayer` dependency
- [x] Upgrade to React 19, swap `ReactDOM.render` → `createRoot`
- [x] Enable `<StrictMode>` and confirm no double-move / double-score

## Phase 3 — Gameplay correctness ✅

- [x] `Tetris.js:50` — level-up speed uses stale `level`; `>` should be `>=`
- [x] `Tetris.js:84` — hard drop never checks for game over
- [x] `Tetris.js:60` — top-out detection too narrow (`pos.y < 1`); stack blocks get erased
- [x] `Tetris.js:69` — input active before the game starts (no "not started" state)
- [x] `tetrominos.js` — pieces spawn vertically; standard spawn is flat / I horizontal
- [x] `tetrominos.js:61` — replace `Math.random()` with a 7-bag randomizer
- [x] `gameHelpers.js:7` — `.fill()` shares one array across all 200 cells

Top-out is now detected as **block-out** — the piece that just spawned overlaps
the stack — instead of at lock time. Lock-time detection could only ever catch
the subset of top-outs that happened to lock on row 0, and it made hard drop a
special case; block-out covers every way the board can fill, hard drop included.

One drop-speed formula (`dropInterval`) now serves the start, the level-up and
the soft-drop release. They were three separate expressions before, and they
disagreed: releasing Down at level 0 handed back 1200 ms when the game had
started at 1000 ms, so the game got permanently slower the first time you soft
dropped. Level 0 is now 1200 ms throughout.

## Phase 3b — Stale-closure state bugs (found while play-testing) ✅

Every player action read `player` from its render closure, decided what to do,
then applied the result through a functional `setPlayer` updater. Those are two
different versions of state, and the gap between them is reachable whenever two
updates land in one tick:

- [x] Five left-presses in one tick each checked collision against the *same*
      `x`, all agreed the move was legal, and walked the piece to `x = -2` —
      through the wall and off the board
- [x] A gravity tick computed before a lock could land after `resetPlayer` had
      spawned the successor, applying `collided: true` to *that* piece and
      merging it at the top row — which the block-out check then, correctly,
      called game over on an almost empty board
- [x] A horizontal move landing in the same window set `collided` back to
      `false`, un-locking a piece mid-merge

Fixed in `usePlayer` by moving each action's decision *inside* its updater, so
it is made against `prev`, and by stamping every spawned piece with an `id`.
An action carries the id of the piece it was decided for and is dropped if that
piece is no longer the live one. `updatePlayerPos` is gone; `movePlayer`,
`stepDown`, `hardDropPlayer` and `playerRotate` are each atomic.

## Phase 4 — Input & hygiene ✅

- [x] Replace deprecated `keyCode` with `event.code`
- [x] `preventDefault()` on arrows so they stop scrolling the page
- [x] Autofocus the game wrapper so keys work without clicking first
- [x] Strip the 5 production `console.log`s (`Tetris.js:29,61,72,79,91`)
- [x] Remove dead code (`usePlayer.js:35` discards its return value)
- [x] `checkCollision` returns `undefined` instead of `false`; uses `var`
- [x] `Stage.js:11` — `key={x}` collides across rows

Also: auto-repeat is ignored for rotate and hard drop (holding the key fired
them every frame), Space is accepted alongside C, and the wrapper's focus ring
is suppressed now that it takes focus on load.

## Phase 5 — Verify & ship

- [x] Production build clean, no warnings
- [x] Play-test in the browser: move, rotate, soft drop, hard drop, line clear, level up, top out
- [x] Update README (dead Heroku link from 2019)
- [x] Add LICENSE
- [x] Commit

**Play-test, driven in Chrome against the dev server.** Real key events:
spawn, move, move blocked at the wall, rotate with wall kick, soft drop, hard
drop with both C and Space, restart. Scripted input, to force the batched-tick
races above and to make pieces deterministic: five O pieces fill rows 18–19 →
double clear, `Rows: 2`, `Score: 100`; five such cycles → `Rows: 10`, level 1
on the next gravity tick (the `>=` fix — `>` would have needed 11); a double at
level 1 scores 200, so the level multiplier reaches the score. A 30-piece
random game ended in a genuine top-out with the stack intact. Console is clean
on load under StrictMode — no React or styled-components warnings.

---

## Not in scope (future)

Gameplay *features*, as opposed to fixes — deliberately deferred:
next-piece preview · ghost piece · hold · pause · SRS wall kicks ·
`localStorage` high score · touch controls / responsive layout · sound · tests · CI
