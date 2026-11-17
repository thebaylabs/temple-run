# 🎮 Annakut Temple Run (V1.2) — Swaminarayan Hariprabodham Parivar

An 8-bit retro auto-runner about family harmony, right choices and devotion, built for the Annakut festival booth. The player runs through five Akshardham-inspired zones, jumps over distractions and vices, works through four lesson stages, and climbs the steps of the Mandir.

Plain HTML5 Canvas, HTML and vanilla JavaScript. No install, no build step, no server. Works with a keyboard, a 3-key button box, a touchscreen or a phone.

---

## 🚀 Run it

1. Open `index.html` in Chrome, Edge or Safari (double-click works; it runs from `file://`).
2. Press `F` for fullscreen.
3. Press START.

The game scales to fill whatever window it is in.

---

## 🕹️ Controls

Three buttons are always on screen. Their labels change to say what they do at that moment, a button glows while its key is held, and a button that does nothing right now is dimmed.

| Button | Keys | What it does |
|:---:|:---|:---|
| **Left** | `A`, `1`, `Numpad 1`, `←`, `Z`, `J` | Left answer / YES |
| **Centre** | `S`, `2`, `Numpad 2`, `Space`, `Enter`, `X`, `K` | START / JUMP / CONTINUE |
| **Right** | `D`, `3`, `Numpad 3`, `→`, `C`, `L` | Right answer / NO |

- **Touch:** tap the on-screen buttons. On stage screens the answers themselves can be tapped.
- **Wide screens:** the buttons sit along the bottom edge of the game.
- **Phone held upright:** the game is at the top and the buttons are large at the bottom.
- `F` fullscreen, `M` mute.
- `D`, `D`, `A` within 1.5 seconds resets to the title screen (not while a stage screen is up).
- The game returns to the title screen by itself after 40 seconds with no input.

---

## 🌟 How a run plays

The character runs by himself and gets a little faster after each stage. Three lives for the whole game.

| Where | What happens |
|---|---|
| Start | A short run to a ringing alarm clock |
| **Stage 1 — The Best Way to Start Your Day** | Morning checklist card, then three linked questions shown as a flow chart |
| Run | Jump the cigarette pack and the bottle |
| **Stage 2 — The Power of Choice** | One choice. The wrong one shows its consequences on a dark screen, then offers a rescue back to the question |
| Run | Jump Instagram and TikTok |
| **Stage 3 — Good Friends and Focus** | Listen to good friends → B+ → "upgrade?" → A+ (hard work + prayer) |
| Run | Jump two obstacles picked at random |
| **Stage 4 — Work While You Work, Play While You Play** | Four yes/no questions |
| Finish | Climb four marble steps to the Mandir, with a bell on each |

Rules that apply everywhere:

- **Wrong answer:** costs a life, shows why, and asks the same question again. Large hearts on the stage screen show the life being lost.
- **Obstacle hit:** costs a life and knocks the player back a little, with 3 seconds of blinking invincibility.
- **The demon "Vikshep"** (વિક્ષેપ, distraction) chases just behind, closing in after mistakes and falling back after good answers.
- **Zero lives:** game over.

A run with every answer right takes about 70 seconds if every screen is dismissed at once; with reading time expect 2 to 3 minutes.

---

## ✏️ Changing the stage text

All stage wording is at the top of `js/stages.js` in `STAGE_DATA`, with instructions in the comment above it. You can change any sentence, add or remove questions, and add a Gujarati line (`guj: '...'`) to any question or card. The new stage text is currently English only.

## 🔧 Other common tweaks (`js/config.js`)

| To change | Edit |
|---|---|
| Run speed | `SPEEDS` (px/frame, one value per stage cleared) |
| Number of lives | `MAX_LIVES` |
| Jump height and length | `JUMP_HEIGHT`, `JUMP_DURATION` |
| Where stages start | `STAGE_GATES` (world X positions) |
| Which obstacles and where | `WORLD_EVENTS` (`id: 'random'` picks one at random) |
| Idle time before auto-reset | `INACTIVITY_TIMEOUT_SECONDS` |
| How long before CONTINUE appears on a card | `delay` on that card in `js/stages.js` (30 = 1 second) |
| How forgiving obstacles are | `OBSTACLE_HIT_W`, `OBSTACLE_HIT_H` in `js/obstacles.js` |

---

## 🖼️ Art files

| File | Used for |
|---|---|
| `assets/character/character_sheet.png` | Player, 7 poses in one row |
| `assets/demon/demon_sheet.png` | Demon, 4 poses in one row |
| `assets/obstacles/obs_*.png` | The four obstacles |

Everything else, including all backgrounds, the temple and the alarm clock, is drawn in code. If a PNG is missing the game still runs with a simple stand-in.

---

## 📁 Project layout

```
annakut_game/
├── index.html                 Page: canvas, stage overlay, the three buttons
├── css/style.css              Layout, button and stage-screen styles
├── assets/                    Sprite sheets and obstacle art
└── js/
    ├── config.js              Constants, zones, course layout
    ├── audio.js               Chiptune sounds (Web Audio, no files)
    ├── particles.js           Sparkles and dust
    ├── assets.js              Image loader and pre-scaled sprite cache
    ├── input.js               Keys, touch, secret reset sequence
    ├── ui.js                  Window scaling and the on-screen buttons
    ├── obstacles.js           Jump obstacles and collision
    ├── demon.js               The chaser
    ├── background.js          Scenery, ground, stage gates, stairs, temple
    ├── player.js              Character animation and jump
    ├── stages.js              Stage content and stage screens
    └── game.js                State machine, HUD, main loop
```

`js/choices.js` is left over from the earlier random-question version. It is no longer loaded and can be deleted.

See `PROJECT_STATE_REPORT.md` for how each part works.
