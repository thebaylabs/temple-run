# 🎮 Annakut Family Path — Project State & Technical Documentation

> **Status:** Production-Ready & Feature-Complete Prototype.
> **Location:** `/Users/deepk/Desktop/annakut_game/`

---

## 1. Project Overview & Identity

* **Event / Organization:** Annakut function of the **Swaminarayan Hariprabodham Parivar**.
* **Core Theme:** **Family & Spiritual Values** ("સંપ, સુહ્રદભાવ અને એકતા એ જ સુખી પરિવારનો પાયો").
* **Game Concept:** An 8-bit retro side-scroller where the player manually advances a young devotee through 5 scenic zones inspired by Akshardham to reach the Mandir. Along the path, they encounter 8 moral dilemmas centered around family, digital habits, devotion, and character.
* **Hardware Requirement:** Fully playable with a **3-key physical keyboard / macro pad**.

---

## 2. Controls & Keyboard Compatibility

The game includes broad key mappings to support any commercial 3-key mechanical macro keypad or standard keyboard out of the box:

| Button | Primary Binding | Macro / Numpad Binding | Arrow Key Fallback | Game Function |
|:---:|:---:|:---:|:---:|:---|
| **Left** | `KeyA` | `1` / `Numpad1` / `Z` / `J` | `ArrowLeft` | Select Left Choice |
| **Center** | `KeyS` | `2` / `Numpad2` / `X` / `K` | `ArrowDown` / `Space` / `Enter` | **Hold to Walk** / Start / Restart |
| **Right** | `KeyD` | `3` / `Numpad3` / `C` / `L` | `ArrowRight` | Select Right Choice |

### Booth Kiosk Shortcuts:
* **`F`**: Toggle Fullscreen mode (great for presentation monitors/TVs).
* **`M`**: Mute / Unmute audio.
* **Touchscreen**: Left 1/3, Middle 1/3, and Right 1/3 screen taps act as Left, Walk, and Right buttons for tablets.

---

## 3. Architecture & Modular Structure

The project has zero external npm, python, or framework dependencies. All modules run in standard browsers:

```
annakut_game/
├── index.html                   # HTML5 Canvas wrapper, font definitions & styling
├── README.md                    # Quick start instructions & control guide
├── PROJECT_STATE_REPORT.md      # Full architecture & status documentation
└── js/
    ├── config.js                # Physics, world boundaries, zone definitions, booth stats
    ├── audio.js                 # Pure Web Audio API 8-bit chiptune sound synthesis & ambient BGM
    ├── particles.js             # Retro particle system (confetti, petals, fountain spray, fireworks)
    ├── input.js                 # 3-key engine with multi-key aliases, touch & idle timer
    ├── background.js            # Parallax sky, clouds, 5 Akshardham zones, Toran gates & Mandir
    ├── player.js                # 8-bit character with authentic Tilak-Chandlo & animation states
    ├── choices.js               # 8 bilingual dilemmas, procedural icons, dynamic shuffling
    └── game.js                  # State machine, rollback logic, moral feedback, kiosk auto-reset
```

---

## 4. Key Systems Implemented

### 🔊 1. Web Audio API Chiptune Engine (`js/audio.js`)
* Synthesizes 8-bit sounds directly in JavaScript with zero MP3/WAV files:
  * Footstep clicks as the character walks.
  * Mystery chime when approaching a choice Toran gate.
  * Ascending celebratory major chord on good choices.
  * Low buzz & wobble on poor choices.
  * Retro tape-rewind effect during rollback.
  * Resonant Indian temple bell chime upon zone transitions and victory.
  * Peaceful 16-step pentatonic chiptune ambient melody loop.

### 🌸 2. Retro Particle Engine (`js/particles.js`)
* Zone 0 & 1: Drifting flower petals in the gardens.
* Zone 2: Shimmering water droplets from fountains.
* Zone 3: Warm golden dust motes along the carved pillar pathway.
* Zone 4: Golden temple sparkles and diya embers.
* Celebration & Victory: Multi-color confetti bursts and fireworks.

### 🕉️ 3. Bilingual Content & Character Fidelity (`js/choices.js`, `js/player.js`)
* Prompts, zone titles, and dilemmas are rendered in both English and Gujarati.
* Character features an authentic **orange U-shaped Tilak with red Chandlo** on his forehead, a white kurta, navy blue pajama, and expressive facial states (blinking, smiling, stumbling with "X" eyes).

### 🏛️ 4. The 8 Family & Spiritual Dilemmas
1. **Phone vs. Reading:** 📖 Read a Good Book *(વાંચન)* vs. 📱 Endless Social Media *(સોશિયલ મીડિયા)*
2. **Dinner Time:** 🍽️ Eat Dinner with Family *(સાથે જમવું)* vs. 🎮 Eat Alone in Room *(રૂમમાં એકલા)*
3. **Helping Parents:** 🧹 Happily Help with Chores *(સેવા/મદદ)* vs. 😴 Ignore & Be Lazy *(આળસ)*
4. **Grandparents:** 🗣️ Sit & Listen Lovingly *(પ્રેમથી સાંભળવું)* vs. 🎧 Keep Headphones On *(હેડફોન)*
5. **Morning Routine:** 🏃 Exercise Outside *(કસરત/ચાલવું)* vs. 📺 Binge-watch Screen *(આખો દિવસ ટીવી)*
6. **Evening Puja:** 🪔 Daily Puja & Niyam *(નિયમિત પૂજા)* vs. ⏰ Skip / Do It Later *(ટાળવું)*
7. **Forgiveness:** ❤️ Forgive with a Big Heart *(મોટા મનથી માફી)* vs. 😤 Hold Anger & Grudge *(વેર/ગુસ્સો)*
8. **Weekend Goals:** 👨‍👩‍👧‍👦 Quality Family Time *(પરિવાર સાથે સમય)* vs. 💼 Selfish & Lonely Habits *(સ્વાર્થ)*

### 🎪 5. Exhibition Booth & Kiosk Features
* **Inactivity Auto-Reset:** If a child walks away mid-game, the game waits 40 seconds and safely returns to the attract title screen.
* **Pilgrim Counter:** Automatically records every completed Mandir arrival in `localStorage` so booth organizers can see how many attendees played.
* **Anti-Memorization Shuffling:** The good and bad choices swap randomly on each checkpoint so each run requires real reflection.

---

## 5. How to Run & Display at the Event

1. Double-click [index.html](file:///Users/deepk/Desktop/annakut_game/index.html) in Chrome or Safari.
2. Press **`F`** for fullscreen mode.
3. Plug in your 3-key keyboard (configured to send `A`, `S`, `D` or `1`, `2`, `3`).
4. Press **`S`** (or `2`) to start!
