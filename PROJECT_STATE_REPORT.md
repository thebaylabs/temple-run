# 🎮 Annakut Family Path — V1 Project State & Technical Handoff Report

> **Status:** V1 Complete & Fully Playable on 960×540 (1080p display ready).
> **Location:** `/Users/deepk/Desktop/annakut_game/`
> **Git Branch:** `deeplearns1` on `https://github.com/thebaylabs/temple-run`

---

## 1. Executive Summary & V1 Highlights

All 10 requested changes for V1 have been fully implemented and tested:

| # | Feature | Implementation Details |
|---|---------|------------------------|
| 1 | **Higher Resolution (960×540)** | 2× integer scale of 480×270. Crisp retro pixel art scaled for 1080p displays with `image-rendering: pixelated`. |
| 2 | **Secret Escape Sequence** | Pressing `[D, D, A]` (Right, Right, Left) within 45 frames (1.5s) immediately aborts to Title screen. |
| 3 | **Auto-Run Mode & 5 Questions** | Dino-style continuous running. Speed ramps: `[1.8, 2.2, 2.6, 3.0, 3.3, 3.5 px/frame]` based on questions answered. 5 questions selected randomly per run from a 12-question bank. |
| 4 | **Jump Obstacles** | Jump button mapped to `S` / `2` / `Space`. Parabolic 130px arc over Instagram, TikTok, Vice Bottle, and Cigarette Smoke obstacles. |
| 5 | **Terrain Ups & Downs** | Smooth ramps raising/lowering ground elevation by +50px over 200px spans. |
| 6 | **3-Lives System** | 3 pixel hearts HUD on top-left. Hitting obstacle or wrong choice deducts 1 life and triggers 90-frame (3s) blinking invincibility + safe 120px rollback. |
| 7 | **Distraction Demon ("Vikshep")** | Shadowy figure with glowing phone chasing the player. Pushed back 80px on good answers, leaps 150px closer on bad answers. Edge warning pulse. |
| 8 | **Compact 45-Second Duration** | World distance reduced from 3900 to 2700 units; full correct run takes ~45 seconds. |
| 9 | **5-Second Moral Banner** | Answering correctly displays moral reflection banner for 150 frames (5s) while character continues running. |
| 10 | **Temple Stair Climb Finale** | Character ascends 4 marble steps into the Mandir while demon retreats and temple bells chime. |

---

## 2. Controls & Hardware Mapping

| Key | Macro / Keypad | Touch | Action |
|:---:|:---:|:---:|:---|
| `A` | `1` / `Numpad1` / `Left Arrow` | Left 1/3 screen | Choose Left Option |
| `S` | `2` / `Numpad2` / `Space` / `Enter` | Center 1/3 screen | **JUMP** / Start / Restart |
| `D` | `3` / `Numpad3` / `Right Arrow` | Right 1/3 screen | Choose Right Option |
| `F` | — | — | Toggle Fullscreen |
| `M` | — | — | Toggle Audio Mute |
| `[D, D, A]` | `[3, 3, 1]` | — | **Secret Reset to Title** |

---

## 3. Architecture & File Tree

```
annakut_game/
├── index.html                   # 960×540 canvas wrapper with CSS pixelated integer scaling
├── README.md                    # Player guide & booth instructions
├── PROJECT_STATE_REPORT.md      # This complete technical handoff
├── assets/                      # PNG asset folders (ready for custom images)
│   ├── character/               # character_sheet.png (optional)
│   ├── demon/                   # demon_sheet.png (optional)
│   ├── obstacles/               # obs_instagram.png, obs_tiktok.png, obs_bottle.png, obs_cigarette.png
│   └── temple/
└── js/
    ├── config.js                # 960×540 constants, SPEEDS, WORLD_EVENTS, getGroundY()
    ├── audio.js                 # Web Audio API 8-bit chiptune sound synthesis & ambient BGM
    ├── particles.js             # Retro particles (flower petals, fountain spray, golden aura, fireworks)
    ├── assets.js                # Asynchronous image manifest loader with procedural fallback
    ├── input.js                 # 3-key handler (A/S/D, 1/2/3), touch, escape sequence [D,D,A]
    ├── obstacles.js             # AABB collision detection & 4 jump obstacle renders
    ├── demon.js                 # Vikshep AI, dynamic catch speed, warning level, retreat states
    ├── background.js            # Parallax sky, clouds, 5 zones, terrain ramps, temple stairs, HUD bar
    ├── player.js                # 96px pixel character with authentic Tilak-Chandlo, jump physics, blink
    ├── choices.js               # 12 questions bank, 5-pick shuffle, scaled UI, 5s moral banner
    └── game.js                  # Master state machine, auto-run loop, lives, temple climb, game over
```

---

## 4. How to Test Right Now

1. Open [index.html](file:///Users/deepk/Desktop/annakut_game/index.html) in your browser.
2. Press **`F`** to test fullscreen mode.
3. Press **`S`** (or `2`) to start auto-running.
4. Press **`S`** (or `2`) to jump over incoming social media obstacles!
5. Use **`A`** or **`D`** to select answers when approaching dilemma gates.
6. Notice the 5-second moral reflection banner at the bottom while you keep running!
7. Complete all 5 questions to climb the temple stairs into the Mandir.
