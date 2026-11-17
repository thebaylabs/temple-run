# 🎮 Annakut Family Path — V1.2 Project State & Technical Handoff

> **Status:** V1.2 complete and playable.
> **Repo:** `https://github.com/thebaylabs/temple-run`, branch `deeplearns1`
> **Stack:** HTML5 Canvas for the game, HTML/CSS for buttons and stage screens, vanilla JavaScript. No frameworks, no build step, runs from `file://`.
> **Game picture:** 960×540, fixed 30 fps loop, scaled to fill the window.

---

## 1. What changed from V1.1 to V1.2

| Area | V1.1 | V1.2 |
|---|---|---|
| Screen size | Snapped to whole multiples (1×, 2×) | Scales smoothly to fill any window |
| Buttons | Keyboard only, plus invisible thirds of the screen | Three on-screen buttons with live labels that glow on key press |
| Phones | Not laid out for them | Upright layout: game on top, large buttons below |
| Questions | 5 random from a bank of 12 | 4 fixed stages with their own flow (`js/stages.js`) |
| Question screens | Drawn on the canvas | HTML overlay: sharp text at any size, tappable answers |
| Life lost on a question | Small HUD heart | Large hearts on the stage screen with a break animation |
| Jump | 26 frames, 140 px | 34 frames, 150 px |
| Course length | 6,500 px | 7,800 px |
| Stage 1 gate | Toran arch | Ringing alarm clock |
| Quick taps | Could be missed | Always registered |

---

## 2. Game flow (state machine in `js/game.js`)

```
title ──START──▶ running ──reach a stage gate──▶ stage (run paused, Stages in control)
                    ▲                                │
                    └──────── stage cleared ─────────┤
                                                     └── lives reach 0 ──▶ game_over
running ──all stages cleared and x ≥ VICTORY_X──▶ temple_climb ──▶ victory
running ──lives reach 0──▶ game_over
any state except stage ──D, D, A──▶ title          any state ──40 s idle──▶ title
```

- `worldX` is the left edge of the player sprite in world pixels; the camera is `worldX - PLAYER_X`.
- `stagesCleared` drives the speed (`CONFIG.getSpeed`), the demon's distance and which gate is next.
- While in `stage`, `game.js` only calls `Stages.update()`. The stage talks back through `stageHooks`: `getLives`, `loseLife`, `onClear`, `onGameOver`.

## 3. The course (`js/config.js`)

| World X | What |
|---|---|
| 600 | Stage 1 gate (alarm clock) |
| 1400, 2100 | Cigarette, bottle |
| 2800 | Stage 2 gate |
| 3500, 4200 | Instagram, TikTok |
| 4900 | Stage 3 gate |
| 5600, 6300 | Two random obstacles, never the same kind twice |
| 6900 | Stage 4 gate |
| 7360 | Temple climb begins (`VICTORY_X`) |
| 7400 | First stair riser (`STAIRS_X`), 4 steps of 80×26 px |
| 7800 | Player stops (`TOTAL_DISTANCE`) |
| 7860 | Left edge of the temple (`TEMPLE_X`) |

Zones: Garden Gate 0–1500, Flower Gardens 1500–3000, Water Features 3000–4500, Pillar Pathway 4500–6000, Mandir 6000–7800. Speeds per stage cleared: 4.5, 5.2, 5.9, 6.5, 7.0 px/frame.

## 4. Stages (`js/stages.js`)

`STAGE_DATA` holds all the content; the `Stages` module below it turns that data into screens. A stage is an intro card, a list of steps asked in order, and an optional outro card.

Each step has a prompt and two options:

| Option shape | Behaviour |
|---|---|
| `{ text, good: true }` | Right answer; go to the next step |
| `{ text, good: true, then: {card} }` | Right answer; show the card first |
| `{ text, good: false, why }` | Costs a life, shows a red card with the reason, asks again |
| `{ text, good: false, wrong: {card} }` | Same, with a custom card (used for the dark consequence screens) |

- `yesno: true` keeps option 1 on the left (YES) and option 2 on the right (NO). Otherwise sides are shuffled every time the question is shown.
- Card fields: `tone` (`info`, `good`, `bad`, `dark`), `icon`, `title`, `lead`, `bullets`, `cons`, `grade`, `guj`, `delay` (frames before the button appears), `button`, `ask`.
- A stage with a `chain` array shows a flow chart above its questions that fills in as steps are cleared.
- When a wrong answer takes the last life, the wrong card is still shown; its button then leads to game over.

Current content:

| Stage | Steps | Notes |
|---|---|---|
| 1 The Best Way to Start Your Day | 3 linked questions | Intro button after 3 s; flow chart |
| 2 The Power of Choice | 1 question | Wrong: dark consequences, RESCUE ME after 2 s |
| 3 Good Friends and Focus | Scenario, then "upgrade?" | B+ → A+; saying NO keeps B+ and still clears the stage |
| 4 Work While You Work, Play While You Play | 4 yes/no | From the supplied flow chart; for "check your phone while working" the right answer is NO |

## 5. Screen layout and buttons (`js/ui.js`, `css/style.css`)

`UI.layout()` runs on load and on every resize:

- **Wide** (width ÷ height ≥ 1.2): the canvas is scaled to fit the window and centred. The button bar overlaps the bottom 14% of the canvas (`BUTTON_BAR_FRACTION`), so nothing important is drawn there. The stage overlay covers the canvas above the bar.
- **Tall** (phone upright): the button bar is fixed to the bottom of the screen (22% of the height, 110–220 px), the canvas is centred in the space above, and the stage overlay fills all of that space.

It sets the CSS variable `--u` (screen pixels per game pixel). Stage-screen text scales with it but has a floor (`--fmin`) so it stays readable on small screens.

`UI.setLabels(left, centre, right)` is called by `game.js` or `Stages` every frame; a `null` label dims that button. `UI.update()` adds the `pressed` class while `Input.keys[action]` is true.

## 6. Input (`js/input.js`)

- Keyboard, on-screen buttons and taps on the canvas thirds all end up in `Input.keys` and `Input.justPressed`.
- `Input.press(action)` / `release(action)` are used by held buttons; `Input.tap(action)` is a one-shot used by tappable answers.
- Any press also queues a one-frame "tapped" flag, so a press that starts and ends between two game frames is still seen.
- The D-D-A reset is ignored in the `stage` state because three quick answers (right, right, left) are indistinguishable from it.

## 7. Other modules

| File | Role |
|---|---|
| `assets.js` | Loads the PNG manifest; `Assets.sprite()` cuts a region, scales it once and caches it |
| `obstacles.js` | Builds obstacles from `WORLD_EVENTS`, draws PNG or fallback, feet-based collision (hitbox 28×54) |
| `player.js` | 7-pose sprite sheet drawn 96 px tall, sine jump arc, blink after a hit |
| `demon.js` | Holds a target gap behind the player (210 → 135 px by stage), closes 40 px per mistake |
| `background.js` | Code-drawn parallax layers per zone, ground tiles, stage gates, staircase, temple, progress bar |
| `particles.js`, `audio.js` | Effects and Web Audio sounds, including the alarm ring |

Sprite-sheet coordinates are in the `FRAMES` tables in `player.js` and `demon.js`; obstacle crop rectangles are in `OBSTACLE_DEFS`.

Script order in `index.html`: `config`, `audio`, `particles`, `assets`, `input`, `ui`, `obstacles`, `demon`, `background`, `player`, `stages`, `game`.

## 8. Testing done

Headless Chrome from `file://`, no console errors, at 1440×810, 1366×768, a wide short window, 390×844 (upright phone, touch) and 844×390 (phone sideways, touch).

| Scenario | Result |
|---|---|
| Every answer right, every obstacle jumped | Victory with 3 lives |
| Every question answered wrong once, then right (lives raised for the test) | Every wrong card shown, run continues to victory |
| NO to the Stage 3 upgrade | B+ card, stage cleared |
| Three wrong answers in Stage 1 | Game over |
| No jumping | Game over at the third obstacle |
| Real-time keyboard run through Stage 1 | CONTINUE unavailable before 3 s; A/D answer; run resumes |
| Tapping START and JUMP on a touch device | Starts and jumps |

Not tested: a real phone or tablet, the physical 3-key keyboard, Safari and Firefox, and how the game feels to play by hand.

## 9. Known gaps and ideas

- **Gujarati:** the stage text is English only. Add `guj` lines in `STAGE_DATA` once a native speaker has written them.
- **Difficulty:** three lives cover the whole game, so three wrong answers in Stage 1 end it within seconds. Raising `MAX_LIVES`, or restoring a life when a stage is cleared, would soften this.
- **Upright phones:** the game picture is small because it stays 16:9. Turning the phone sideways gives a much larger picture.
- `js/choices.js` is unused and can be deleted, as can the two `Gemini_Generated_Image_*.png` originals.
- The loop is locked to 30 fps; moving to 60 fps would mean rescaling every frame count.
