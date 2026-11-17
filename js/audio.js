// ============================================================
// AUDIO — Pure 8-bit synthesized retro sound via Web Audio API
// No external MP3/WAV files required. Works 100% offline.
// ============================================================
const Sound = (() => {
    let ctx = null;
    let isMuted = false;
    let bgmNode = null;
    let bgmGain = null;
    let bgmStep = 0;
    let bgmInterval = null;

    // Harmonious pentatonic / devotional scale (C Major / Bilawal Thaath notes in Hz)
    const NOTES = {
        C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.00, A3: 220.00, B3: 246.94,
        C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
        C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99, A5: 880.00, C6: 1046.50
    };

    function ensureContext() {
        if (!ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) {
                ctx = new AudioCtx();
            }
        }
        if (ctx && ctx.state === 'suspended') {
            ctx.resume();
        }
    }

    // Play a single tone
    function playTone(freq, type, duration, startVol = 0.2, endVol = 0.001) {
        if (isMuted) return;
        ensureContext();
        if (!ctx) return;

        try {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = type;
            osc.frequency.setValueAtTime(freq, ctx.currentTime);

            gain.gain.setValueAtTime(startVol, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, endVol), ctx.currentTime + duration);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start();
            osc.stop(ctx.currentTime + duration);
        } catch (e) {
            // Audio context not ready or blocked
        }
    }

    // --- Sound Effects ---

    function step() {
        if (isMuted) return;
        ensureContext();
        if (!ctx) return;
        // Soft wooden tap
        playTone(180 + Math.random() * 40, 'triangle', 0.04, 0.06, 0.005);
    }

    function choiceAppear() {
        if (isMuted) return;
        ensureContext();
        if (!ctx) return;
        // Mystery alert chime
        playTone(NOTES.E4, 'square', 0.12, 0.12, 0.01);
        setTimeout(() => playTone(NOTES.B4, 'square', 0.2, 0.15, 0.01), 70);
    }

    function goodChoice() {
        if (isMuted) return;
        ensureContext();
        if (!ctx) return;
        // Happy ascending celebratory chord
        const notes = [NOTES.C4, NOTES.E4, NOTES.G4, NOTES.C5];
        notes.forEach((freq, idx) => {
            setTimeout(() => {
                playTone(freq, 'triangle', 0.22, 0.2, 0.001);
                playTone(freq * 2, 'sine', 0.18, 0.08, 0.001);
            }, idx * 60);
        });
    }

    function badChoice() {
        if (isMuted) return;
        ensureContext();
        if (!ctx) return;
        // Descending low stumble buzzer
        playTone(160, 'sawtooth', 0.12, 0.2, 0.05);
        setTimeout(() => playTone(120, 'sawtooth', 0.18, 0.25, 0.01), 90);
    }

    /** Alarm-clock ring for the start of Stage 1. */
    function alarm() {
        if (isMuted) return;
        ensureContext();
        if (!ctx) return;
        for (let i = 0; i < 10; i++) {
            setTimeout(() => playTone(i % 2 ? 1568 : 1319, 'square', 0.07, 0.12, 0.001), i * 80);
        }
    }

    function rollback() {
        if (isMuted) return;
        ensureContext();
        if (!ctx) return;
        // Retro rewind chirp
        playTone(400, 'sine', 0.06, 0.08, 0.01);
    }

    function templeBell() {
        if (isMuted) return;
        ensureContext();
        if (!ctx) return;
        // Rich Indian temple bell with resonant harmonics
        const base = NOTES.E4;
        [1, 2.76, 5.4, 8.9].forEach((harmonic, idx) => {
            const vol = 0.25 / (idx + 1);
            playTone(base * harmonic, 'sine', 1.8, vol, 0.0001);
        });
    }

    function victoryFanfare() {
        if (isMuted) return;
        ensureContext();
        if (!ctx) return;

        templeBell();

        const melody = [
            { f: NOTES.C4, d: 150 },
            { f: NOTES.E4, d: 150 },
            { f: NOTES.G4, d: 150 },
            { f: NOTES.C5, d: 300 },
            { f: NOTES.G4, d: 150 },
            { f: NOTES.C5, d: 500 }
        ];

        let time = 300;
        melody.forEach(item => {
            setTimeout(() => {
                playTone(item.f, 'triangle', item.d / 1000, 0.25, 0.001);
                playTone(item.f * 2, 'sine', item.d / 1000, 0.12, 0.001);
            }, time);
            time += item.d;
        });

        setTimeout(() => {
            templeBell();
        }, 1600);
    }

    // --- Background Ambient Chiptune (Gentle, Peaceful Bhajan Loop) ---
    // Simple 16-step peaceful melody
    const BGM_MELODY = [
        NOTES.C4, null, NOTES.E4, null,
        NOTES.G4, NOTES.A4, NOTES.G4, null,
        NOTES.E4, null, NOTES.D4, null,
        NOTES.C4, NOTES.D4, NOTES.E4, null,
        NOTES.G4, null, NOTES.C5, null,
        NOTES.B4, NOTES.A4, NOTES.G4, null,
        NOTES.E4, NOTES.G4, NOTES.D4, null,
        NOTES.C4, null, null, null
    ];

    function startBGM() {
        if (bgmInterval || isMuted) return;
        ensureContext();
        bgmStep = 0;
        bgmInterval = setInterval(() => {
            if (isMuted || !ctx) return;
            const note = BGM_MELODY[bgmStep];
            if (note) {
                // Soft chime-like melody note
                playTone(note, 'sine', 0.25, 0.04, 0.001);
            }
            // Gentle bass note on measure starts
            if (bgmStep % 8 === 0) {
                playTone(NOTES.C3, 'triangle', 0.4, 0.05, 0.005);
            } else if (bgmStep % 8 === 4) {
                playTone(NOTES.G3, 'triangle', 0.35, 0.04, 0.005);
            }
            bgmStep = (bgmStep + 1) % BGM_MELODY.length;
        }, 220);
    }

    function stopBGM() {
        if (bgmInterval) {
            clearInterval(bgmInterval);
            bgmInterval = null;
        }
    }

    function toggleMute() {
        isMuted = !isMuted;
        if (isMuted) stopBGM();
        return isMuted;
    }

    return {
        ensureContext,
        step,
        choiceAppear,
        goodChoice,
        badChoice,
        rollback,
        alarm,
        templeBell,
        victoryFanfare,
        startBGM,
        stopBGM,
        toggleMute,
        get isMuted() { return isMuted; }
    };
})();
