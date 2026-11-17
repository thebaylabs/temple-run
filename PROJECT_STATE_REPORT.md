# 🎮 Annakut Family Path — V1.1 Project State & Technical Handoff

> **Status:** V1.1 complete and playable.
> **Repo:** `https://github.com/thebaylabs/temple-run`, branch `deeplearns1`
> **Stack:** HTML5 Canvas + vanilla JavaScript. No frameworks, no build step, runs from `file://`.
> **Canvas:** 960×540, fixed 30 fps game loop.

---

## 1. What changed from V1 to V1.1

| Area | V1 | V1.1 |
|---|---|---|
| Speed | 1.8–3.5 px/frame | 4.5–7.0 px/frame, still ramping per question |
| World length | 2,700 px | 6,500 px, so run time is unchanged |
| Obstacles | Never appeared (see section 6) | Appear, drawn from the PNG art, with a warning arrow |
| Character | Drawn from rectangles | 7-pose sprite sheet, rectangles kept as fallback |
| Demon | Drawn from rectangles, usually off-screen | 4-pose sprite sheet, always visible behind the player |
| Terrain | Ramps up and down | Flat everywhere; only the temple staircase rises |
| Stair climb | Drawn but not climbable | Real 4-step staircase the player walks up |
| Backgrounds | Sparse procedural shapes | Detailed code-drawn layers per zone, new temple |
| Lesson after a right answer | Small banner at the bottom, game kept running | Centred card, game paused for 5 seconds |
| Jump collision | Tested the player's head | Tests the player's feet, with a forgiving hitbox |

---

## 2. Game flow (state machine in `js/game.js`)

```
title ──centre──▶ running ──reach gate──▶ choice
                     ▲                       │
                     │            right ─────┼──▶ moral_banner (paused 5 s) ──▶ running
                     │            wrong ─────┘──▶ running (life lost, question re-queued)
                     │
running ──all 5 answered and x ≥ VICTORY_X──▶ temple_climb ──x ≥ TOTAL_DISTANCE──▶ victory
running / choice ──lives reach 0──▶ game_over
any state ──D, D, A or 40 s idle──▶ title
```

- `worldX` is the left edge of the player sprite in world pixels. The camera is `worldX - PLAYER_X`.
- `moral_banner` is a full pause: nothing moves except the celebrate animation and the countdown.
- `placeGate()` positions a question gate so it is never within reach of an obstacle and never on the stairs. It is used when a missed question is re-queued and to guarantee a 500 px run-up before the next question.

## 3. World layout (`js/config.js`)

| World X | Event |
|---|---|
| 700 | Obstacle: Instagram |
| 1300 | Question 1 |
| 2000 | Obstacle: TikTok |
| 2600 | Question 2 |
| 3300 | Obstacle: bottle |
| 3900 | Question 3 |
| 4500 | Obstacle: cigarette |
| 5000 | Question 4 |
| 5700 | Question 5 |
| 6060 | Temple climb begins (`VICTORY_X`) |
| 6100 | First stair riser (`STAIRS_X`), 4 steps of 80×26 px |
| 6500 | Player stops (`TOTAL_DISTANCE`) |
| 6560 | Left edge of the temple (`TEMPLE_X`) |

Zones: Garden Gate 0–1400, Flower Gardens 1400–2800, Water Features 2800–4200, Pillar Pathway 4200–5600, Mandir 5600–6500.

`CONFIG.getGroundY(x)` returns `GROUND_Y` (430) everywhere except on the staircase, where it steps up by 26 px per stair.

## 4. Module by module

| File | Role |
|---|---|
| `config.js` | All constants, zones, `WORLD_EVENTS`, `getSpeed`, `getGroundY`, run counter in `localStorage` |
| `assets.js` | Loads the PNG manifest. `Assets.sprite(key, [x,y,w,h], drawH)` cuts one region out of a source image, scales it once to its on-screen size, and caches it |
| `input.js` | Key, touch and pointer mapping to `left` / `jump` / `right`; the D-D-A reset sequence |
| `obstacles.js` | Builds obstacles from `WORLD_EVENTS`, draws them (PNG or fallback), feet-based collision |
| `player.js` | Picks the pose for the current state, jump arc, blink after a hit, rectangle fallback |
| `demon.js` | Gap-based chaser, pose selection, fade-out at the temple |
| `background.js` | Sky, clouds, hills, skyline, per-zone mid and near layers, ground, stairs, temple, question gates, progress bar |
| `choices.js` | 12-question bank, picks 5 per run, choice screen, centred lesson card |
| `particles.js` | Sparkles and dust |
| `audio.js` | Web Audio tones and background melody; no audio files |
| `game.js` | State machine, lives, HUD, title / game-over / victory screens, main loop |

Script order in `index.html` matters: `config`, `audio`, `particles`, `assets`, `input`, `obstacles`, `demon`, `background`, `player`, `choices`, `game`.

## 5. Sprites

Both sheets are 3168×1344 with a transparent background, poses in one row, facing right. Pose rectangles are hard-coded in a `FRAMES` table.

**Player (`js/player.js`)**, drawn 96 px tall:

| Pose | x | y | w | h | Used when |
|---|---|---|---|---|---|
| idle | 119 | 408 | 252 | 608 | At a question |
| runA | 488 | 408 | 357 | 608 | Running, climbing |
| runB | 937 | 421 | 397 | 595 | Running, climbing |
| jumpUp | 1399 | 316 | 344 | 634 | Start and end of a jump |
| jumpPeak | 1782 | 263 | 436 | 568 | Middle of a jump |
| cheer | 2270 | 381 | 409 | 635 | Right answer, victory |
| hurt | 2705 | 434 | 423 | 582 | Just after losing a life |

**Demon (`js/demon.js`)**, drawn 112 px tall:

| Pose | x | y | w | h | Used when |
|---|---|---|---|---|---|
| runA | 112 | 368 | 670 | 638 | Chasing |
| runB | 849 | 368 | 682 | 632 | Chasing |
| lunge | 1594 | 381 | 795 | 625 | Within 105 px of the player |
| retreat | 2459 | 377 | 599 | 630 | After a right answer, and at the temple |

**Obstacles (`js/obstacles.js`)**: each PNG is 1856×2304; `OBSTACLE_DEFS` holds the crop rectangle and on-screen height (about 104 px). All four share one hitbox, 28 px wide and 54 px tall.

Sprites are bottom-centre anchored on the ground line. A missing PNG falls back to hand-drawn shapes.

## 6. Mechanics in detail

**Jump.** A sine arc, 140 px high over 26 frames. An obstacle is cleared when the player's feet are above 54 px while the two boxes overlap. At the slowest speed the timing window is about a quarter of a second, and it widens as speed rises.

**Lives.** Lost on an obstacle hit, a wrong answer, or being caught by the demon. Each loss knocks the player back 200 px and gives 90 frames of invincibility.

**Demon.** He holds a target distance behind the player: 210 px at the start, tightening to 120 px after five questions. Each mistake brings him 40 px closer; each right answer pushes him back. He catches the player at 45 px, but with three lives that distance is not normally reached, so in practice he is pressure rather than a second way to lose.

**The V1 obstacle bug.** `obstacles.js` began with `if (!window.CONFIG) return;`. `CONFIG` is declared with `const`, and a top-level `const` is not a property of `window`, so the check always failed and no obstacle was ever created. The check is now `typeof CONFIG === 'undefined'`. Avoid `window.X` tests for any of the game's `const` modules.

## 7. Backgrounds (`js/background.js`)

Every layer is painted once into an off-screen canvas with a seeded random generator, then tiled each frame at its own scroll speed. Each strip is drawn three times (shifted by minus one width, zero, plus one width) when built, which makes it wrap seamlessly.

| Layer | Scroll factor | Notes |
|---|---|---|
| Sky and sun | 0 | Colours blend between zones; the sun sinks and turns orange at the Mandir |
| Clouds | 0.06 | Also drift slowly by themselves |
| Hills | 0.10 | Two hazy ranges |
| Skyline | 0.20 | Distant temple spires |
| Mid, one per zone | 0.50 | The zone's main scenery; fountain jets are animated live |
| Near, one per zone | 0.80 | Hedges, railings, lamp posts, diyas |
| Ground, one per zone | 1.00 | 320 px tile: paved path plus a front verge |
| Stairs and temple | 1.00 | Temple is painted once; flags, door glow and diya flames are live |

Zone changes cross-fade over 400 px of travel centred on the boundary. To restyle a zone, edit its `mid…` and `near…` functions and its entry in `GROUNDS`.

## 8. Testing done

Run in headless Chrome from `file://` with no console errors. Automated playthroughs, driven frame by frame:

| Scenario | Result |
|---|---|
| Every obstacle jumped, every answer right | Victory with 3 lives, about 70 s |
| No jumping at all | Game over after the third obstacle |
| One wrong answer | Life lost, question re-queued clear of the next obstacle, victory with 2 lives |
| Position during the lesson card | Unchanged for the full pause |

Not tested: the physical 3-button keyboard, touch input, and browsers other than Chrome.

## 9. Known gaps and ideas

- `assets/character/` and `assets/demon/` each hold an unused original `Gemini_Generated_Image_*.png` (about 1 MB each) that can be deleted.
- `assets/temple/` is empty; the temple is drawn in code.
- The lesson card cannot be skipped. A "press centre to continue" after a minimum read time would be a small change in the `moral_banner` case of `update()` in `game.js`.
- The loop is locked to 30 fps, so motion at 7 px/frame is slightly steppy. Moving to 60 fps would mean rescaling every frame count in `config.js`.
- The sprite PNGs are far larger than they are drawn. Shipping pre-shrunk copies would cut load size.
