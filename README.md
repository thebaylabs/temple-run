# 🎮 Annakut Family Path (V1.1) — Swaminarayan Hariprabodham Parivar

An 8-bit retro auto-runner about family harmony, right choices and devotion, built for the Annakut festival booth. The player runs through five Akshardham-inspired zones, jumps over distractions and vices, answers five family dilemmas, and climbs the steps of the Mandir.

Plain HTML5 Canvas and vanilla JavaScript. No install, no build step, no server.

---

## 🚀 Run it

1. Open `index.html` in Chrome, Edge or Safari (double-click works; it runs from `file://`).
2. Press `F` for fullscreen.
3. Press the centre button to start.

The canvas is 960×540 and scales to fill the screen with crisp pixels. On a 1080p display it is an exact 2× scale.

---

## 🕹️ Controls (3-button setup)

| Button | Keys | Touch | Action |
|:---:|:---|:---:|:---|
| **Left** | `A`, `1`, `Numpad 1`, `←`, `Z`, `J` | Left third of screen | Pick the left answer |
| **Centre** | `S`, `2`, `Numpad 2`, `Space`, `Enter`, `X`, `K` | Middle third | **Jump** / Start / Restart |
| **Right** | `D`, `3`, `Numpad 3`, `→`, `C`, `L` | Right third | Pick the right answer |

Booth shortcuts:

- `F` — toggle fullscreen
- `M` — mute / unmute
- `D`, `D`, `A` within 1.5 seconds — secret reset to the title screen
- The game returns to the title screen by itself after 40 seconds with no input

---

## 🌟 How a run plays

1. **Auto-run.** The character runs by himself. Speed starts at 4.5 px/frame and rises after every correct answer, up to 7.0.
2. **Jump the obstacles.** Four hazards stand on the path, each marked with a bouncing yellow arrow: Instagram, TikTok, a vice bottle and a cigarette pack. Running into one costs a life.
3. **Answer five questions.** At each toran gate the game stops and shows a dilemma in English and Gujarati. Five are picked at random from a bank of twelve, and the good answer is on a random side each time.
4. **Read the lesson.** A correct answer pauses the game and shows the lesson on a card in the middle of the screen for 5 seconds. A green bar counts down, then the run resumes.
5. **Wrong answers.** A wrong answer costs a life, knocks the player back, and the same question comes round again further along.
6. **The demon.** "Vikshep" (વિક્ષેપ, distraction) chases just behind the player. He closes in after every mistake and falls back after every good answer.
7. **Three lives.** Hearts are shown top-left. Losing a life gives 3 seconds of blinking invincibility. At zero lives the game-over screen appears.
8. **The finale.** After the fifth question the demon fades away and the player climbs four marble steps to the Mandir, with a bell on each step.

A clean run takes about 70 seconds: roughly 45 of running plus five 5-second lesson pauses.

### The five zones

| Zone | Scenery |
|---|---|
| Garden Gate | Sandstone boundary wall, cypress trees, the entrance gate |
| Flower Gardens | Terraced flower beds, topiary, rose trellises |
| Water Features | Arcade, stepped pool, animated lotus fountains |
| Pillar Pathway | Carved colonnade with hanging lamps and balcony windows |
| Swaminarayan Mandir | Sunset sky, elephant frieze, flags, diyas, the temple |

All scenery is drawn in code. There are no background image files.

---

## 🔧 Common tweaks

Everything below is in `js/config.js` unless noted.

| To change | Edit |
|---|---|
| Run speed | `SPEEDS` (px/frame, one value per question answered) |
| How long the lesson card stays up | `FEEDBACK_FRAMES` (30 = 1 second; currently 150) |
| Number of lives | `MAX_LIVES` |
| Jump height and length | `JUMP_HEIGHT`, `JUMP_DURATION` |
| Where obstacles and questions sit | `WORLD_EVENTS` (world X positions) |
| Idle time before auto-reset | `INACTIVITY_TIMEOUT_SECONDS` |
| The questions and lessons | the question bank at the top of `js/choices.js` |
| How forgiving obstacles are | `OBSTACLE_HIT_W`, `OBSTACLE_HIT_H` in `js/obstacles.js` |

---

## 🖼️ Art files

| File | Used for |
|---|---|
| `assets/character/character_sheet.png` | Player, 7 poses in one row |
| `assets/demon/demon_sheet.png` | Demon, 4 poses in one row |
| `assets/obstacles/obs_*.png` | The four obstacles |

If any of these files is missing the game still runs and draws a simple stand-in for that item. To swap in new art, keep the same file name; if the poses sit in different places on a new sheet, update the `FRAMES` table in `js/player.js` or `js/demon.js`.

The two `Gemini_Generated_Image_*.png` files are the original uploads of the character and demon sheets. The game does not load them.

---

## 📁 Project layout

```
annakut_game/
├── index.html                 Page, canvas and script order
├── README.md
├── PROJECT_STATE_REPORT.md    Technical handoff
├── assets/                    Sprite sheets and obstacle art
└── js/
    ├── config.js              Constants, zones, world layout
    ├── audio.js               Chiptune sounds (Web Audio, no files)
    ├── particles.js           Sparkles and dust
    ├── assets.js              Image loader and pre-scaled sprite cache
    ├── input.js               Keys, touch, secret reset sequence
    ├── obstacles.js           Jump obstacles and collision
    ├── demon.js               The chaser
    ├── background.js          All scenery, ground, stairs, temple
    ├── player.js              Character animation and jump
    ├── choices.js             Question bank, choice screen, lesson card
    └── game.js                State machine, HUD, main loop
```

See `PROJECT_STATE_REPORT.md` for how each part works.
