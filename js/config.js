// ============================================================
// CONFIG — Game constants, zone definitions & kiosk settings
// V1: 960×540 canvas, auto-run with speed ramp, 5-zone 2700px world
// ============================================================
const CONFIG = {
    // Canvas
    WIDTH: 960,
    HEIGHT: 540,
    GROUND_Y: 430,
    PLAYER_X: 220,

    // Auto-run speed ramp (index = questions answered so far, capped at last)
    SPEEDS: [1.8, 2.2, 2.6, 3.0, 3.3, 3.5],

    ROLLBACK_SPEED: 5.2,
    ROLLBACK_DISTANCE: 120,

    // World
    TOTAL_DISTANCE: 2700,
    VICTORY_X: 2600,

    // Lives
    MAX_LIVES: 3,

    // Frame counts
    CELEBRATION_FRAMES: 40,
    WRONG_PAUSE_FRAMES: 20,
    FEEDBACK_FRAMES: 150,   // 5 s at 30 fps
    BLINK_FRAMES: 90,       // 3 s invincibility after losing a life

    // Obstacles
    DEMON_START_GAP: 480,

    // Jump
    JUMP_HEIGHT: 130,       // canvas pixels
    JUMP_DURATION: 22,      // frames

    // Kiosk auto-reset
    INACTIVITY_TIMEOUT_SECONDS: 40,
    get INACTIVITY_TIMEOUT_FRAMES() { return this.INACTIVITY_TIMEOUT_SECONDS * 30; },

    // --------------------------------------------------------
    // Zones (5 zones, coordinates in world units)
    // --------------------------------------------------------
    ZONES: [
        {
            id: 0,
            name: 'Garden Gate',
            nameGuj: 'બાગ પ્રવેશ (Garden Gate)',
            start: 0, end: 600,
            skyTop: '#4A90C8', skyBottom: '#87CEEB',
            ground: '#4A7C34', groundDark: '#3A6A28',
            path: '#C4A060', pathDark: '#A48040',
            treeColor: '#2D5A1E',
            flowerColors: ['#FF6B6B', '#FFD93D', '#FF8C42', '#C084FC']
        },
        {
            id: 1,
            name: 'Flower Gardens',
            nameGuj: 'પુષ્પ વાટિકા (Flower Gardens)',
            start: 600, end: 1200,
            skyTop: '#4A90C8', skyBottom: '#98D8F0',
            ground: '#3D8B37', groundDark: '#2D7B27',
            path: '#D4B070', pathDark: '#B49050',
            treeColor: '#1E5A1E',
            flowerColors: ['#FF4D6D', '#FFBE0B', '#06D6A0', '#8338EC']
        },
        {
            id: 2,
            name: 'Water Features',
            nameGuj: 'જળ પ્રપાત (Water Fountains)',
            start: 1200, end: 1800,
            skyTop: '#3A80B8', skyBottom: '#7EC8E3',
            ground: '#5A8C5A', groundDark: '#4A7C4A',
            path: '#A0A0A0', pathDark: '#808080',
            waterColor: '#4AA8D8', waterLight: '#6BC8F0'
        },
        {
            id: 3,
            name: 'Pillar Pathway',
            nameGuj: 'સ્તંભ પથ (Pillar Pathway)',
            start: 1800, end: 2400,
            skyTop: '#6A98C0', skyBottom: '#C8DDE8',
            ground: '#C4A882', groundDark: '#B49872',
            path: '#E8D8C0', pathDark: '#D0C0A0',
            pillarColor: '#D4B896', pillarDark: '#B49876'
        },
        {
            id: 4,
            name: 'Swaminarayan Mandir',
            nameGuj: 'શ્રી સ્વામિનારાયણ મંદિર',
            start: 2400, end: 2700,
            skyTop: '#C08040', skyBottom: '#FFE4B5',
            ground: '#D4B896', groundDark: '#C4A886',
            path: '#F0E0D0', pathDark: '#E0D0C0',
            templeColor: '#E8C898', templeDark: '#C4A070'
        }
    ],

    // --------------------------------------------------------
    // World events (obstacles, terrain, questions, stairs)
    // --------------------------------------------------------
    WORLD_EVENTS: [
        { type: 'terrain_up',   worldX: 180,  height: 50, width: 200 },
        { type: 'obstacle',     worldX: 420,  id: 'instagram' },
        { type: 'terrain_down', worldX: 620,  height: 50, width: 200 },
        { type: 'question',     worldX: 800  },
        { type: 'obstacle',     worldX: 1000, id: 'tiktok' },
        { type: 'terrain_up',   worldX: 1150, height: 50, width: 200 },
        { type: 'question',     worldX: 1350 },
        { type: 'terrain_down', worldX: 1500, height: 50, width: 200 },
        { type: 'obstacle',     worldX: 1680, id: 'bottle' },
        { type: 'question',     worldX: 1900 },
        { type: 'terrain_up',   worldX: 2050, height: 50, width: 200 },
        { type: 'question',     worldX: 2200 },
        { type: 'terrain_down', worldX: 2350, height: 50, width: 200 },
        { type: 'obstacle',     worldX: 2420, id: 'cigarette' },
        { type: 'question',     worldX: 2550 },
        { type: 'stairs',       worldX: 2620 }
    ],

    // --------------------------------------------------------
    // Helper methods
    // --------------------------------------------------------

    getZone(worldX) {
        for (let i = CONFIG.ZONES.length - 1; i >= 0; i--) {
            if (worldX >= CONFIG.ZONES[i].start) return CONFIG.ZONES[i];
        }
        return CONFIG.ZONES[0];
    },

    getZoneIndex(worldX) {
        for (let i = CONFIG.ZONES.length - 1; i >= 0; i--) {
            if (worldX >= CONFIG.ZONES[i].start) return i;
        }
        return 0;
    },

    /** Returns the run speed for the given number of questions answered. */
    getSpeed(questionsAnswered) {
        const idx = Math.min(questionsAnswered, CONFIG.SPEEDS.length - 1);
        return CONFIG.SPEEDS[idx];
    },

    /**
     * Returns the canvas Y position of the ground at a given world X.
     * terrain_up events raise the ground (lower canvas Y), terrain_down events
     * return it. Offset is accumulated in event order and clamped to [GROUND_Y-200, GROUND_Y].
     */
    getGroundY(worldX) {
        const BASE = CONFIG.GROUND_Y;
        let offset = 0; // negative = ground raised

        for (const ev of CONFIG.WORLD_EVENTS) {
            if (ev.worldX > worldX) break;

            if (ev.type === 'terrain_up') {
                const W = ev.worldX;
                const H = ev.height;
                const L = ev.width;
                if (worldX < W + L) {
                    // Inside the ramp: lerp from 0 to -H
                    const t = (worldX - W) / L;
                    offset += -H * t;
                } else {
                    // Past the ramp: fully raised
                    offset += -H;
                }
            } else if (ev.type === 'terrain_down') {
                const W = ev.worldX;
                const H = ev.height;
                const L = ev.width;
                if (worldX < W + L) {
                    // Inside the ramp down: lerp from 0 to +H (cancelling a prior up)
                    const t = (worldX - W) / L;
                    offset += H * t;
                } else {
                    offset += H;
                }
            }
        }

        const result = BASE + offset;
        return Math.max(BASE - 200, Math.min(BASE, result));
    },

    getBoothRuns() {
        try {
            return parseInt(localStorage.getItem('annakut_runs') || '0', 10);
        } catch (e) {
            return 0;
        }
    },

    recordCompletedRun() {
        try {
            const count = CONFIG.getBoothRuns() + 1;
            localStorage.setItem('annakut_runs', count.toString());
            return count;
        } catch (e) {
            return 1;
        }
    }
};
