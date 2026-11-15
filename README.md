# 🎮 Annakut Family Path (V1) — Swaminarayan Hariprabodham Parivar

An 8-bit retro arcade auto-runner celebrating family harmony, right choices, and devotion for the Annakut festival booth exhibition.

---

## 🕹️ Controls (3-Key Dedicated Setup)

The game is strictly playable with a **3-key hardware button box / macro pad**:

| Button | Primary Key | Keypad / Macro Keys | In-Game Action |
|:---:|:---:|:---:|:---|
| **Left** | `A` | `1` or `Num1` or `Left Arrow` | Select Left choice dilemma |
| **Center** | `S` | `2` or `Num2` or `Space` / `Enter` | **JUMP** over obstacles / Start / Restart |
| **Right** | `D` | `3` or `Num3` or `Right Arrow` | Select Right choice dilemma |

### Booth Shortcuts:
* **`F`**: Toggle Fullscreen mode
* **`M`**: Mute / Unmute 8-bit audio & chiptune melody
* **`[D, D, A]` within 1.5s**: **Secret Escape Sequence** — immediately aborts to Title Screen
* **Touchscreen Kiosks**: Left 1/3, Center 1/3, and Right 1/3 screen taps act as the 3 buttons!

---

## 🌟 V1 Gameplay & Features

1. **Auto-Run Mode with Gradual Speed Ramp:**
   * Character runs forward automatically (Chrome Dino style).
   * Pace starts gentle (`1.8 px/frame`) and ramps after each question up to a capped, comfortable `3.5 px/frame`.
   * Total correct run time is tuned to **~45 seconds**.

2. **3-Lives System & Invincibility Blinking:**
   * 3 retro hearts displayed on the top-left HUD.
   * Colliding with an obstacle, making a wrong choice, or being caught by the demon deducts 1 life.
   * Getting hit triggers a **3-second invincibility blink** and a safe 120px rollback without speed penalty.

3. **Jump Obstacles (Digital Distractions & Vices):**
   * Jump over stylized 8-bit obstacles:
     * 📱 **Instagram Portal** (pedestal with neon pink glow)
     * 🎵 **TikTok Vortex** (dark pedestal with cyan/magenta accents)
     * 🍾 **Vice Bottle** (dark bottle with skull label on cracked stone)
     * 🚬 **Smoke Cloud** (cigarette pack with billowing smoke)
   * High-precision AABB collision — clearing the obstacle while in the jump arc passes safely!

4. **Social Media Demon Chaser ("Vikshep"):**
   * A shadowy dark-purple figure holding a glowing phone with floating notifications chases behind the player.
   * Tuned to create thrilling tension without being punishing: starts 480px behind.
   * **Good choices push the demon back by 80px.**
   * **Poor choices allow the demon to leap 150px closer.**
   * Left-screen red aura warning pulses when the demon gets close.

5. **Dynamic Terrain (Ups & Downs):**
   * The pathway naturally rises and dips across steps and slopes (+50px elevation) across the 5 scenic Akshardham zones.

6. **12-Question Bank & 5-Pick Randomizer:**
   * 12 bilingual dilemmas covering family, elders, studies, sharing, and anger management.
   * 5 distinct questions are randomly selected each run.
   * Choices randomly shuffle between Left (`A`) and Right (`D`) to prevent rote memorization.

7. **5-Second Moral Reflection Banner:**
   * Answering correctly displays an elegant 5-second golden banner with the moral takeaway in both English and Gujarati, without freezing the game run!

8. **Temple Stair Climb Finale:**
   * After answering all 5 questions, the demon retreats completely and the player ascends 4 marble steps into the grand Swaminarayan Akshardham Mandir to the sound of temple bells and victory fanfare.

---

## 🚀 Quick Launch Instructions

1. Open `/Users/deepk/Desktop/annakut_game/index.html` in Google Chrome, Safari, or Edge.
2. Press **`F`** to enter fullscreen mode on the booth display.
3. Press **`S`** (or `2` / Center button) to start the pilgrimage!
