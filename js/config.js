// ============================================================
// CONFIG — Game constants, zone definitions & kiosk settings
// V1.1: 960×540 canvas, faster auto-run, flat 6500px world,
//       temple staircase finale (no slopes)
// ============================================================
const CONFIG = {
    // Canvas
    WIDTH: 960,
    HEIGHT: 540,
    GROUND_Y: 430,
    PLAYER_X: 220,          // left edge of the player sprite on screen
    PLAYER_W: 40,           // sprite centre = PLAYER_X + PLAYER_W / 2

    // Auto-run speed ramp in px/frame at 30 fps
    // (index = questions answered so far, capped at last)
    SPEEDS: [4.5, 5.0, 5.5, 6.0, 6.5, 7.0],

    ROLLBACK_DISTANCE: 200,     // knocked back this far when a life is lost
    WRONG_ANSWER_REGATE: 800,   // a missed question re-appears this far ahead
    MIN_QUESTION_GAP: 500,      // minimum run-up before the next question

    // World
    TOTAL_DISTANCE: 6500,   // player stops here, in front of the temple
    STAIRS_X: 6100,         // first stair riser
    VICTORY_X: 6060,        // temple climb begins here (just before the first riser)
    STAIR_STEPS: 4,
    STAIR_STEP_W: 80,
    STAIR_STEP_H: 26,
    TEMPLE_X: 6560,         // left edge of the temple on the top platform
    CLIMB_SPEED: 3,

    // Lives
    MAX_LIVES: 3,

    // Frame counts
    CELEBRATION_FRAMES: 40,
    WRONG_PAUSE_FRAMES: 20,
    FEEDBACK_FRAMES: 150,   // 5 s at 30 fps
    BLINK_FRAMES: 90,       // 3 s invincibility after losing a life

    // Jump
    JUMP_HEIGHT: 140,       // canvas pixels
    JUMP_DURATION: 26,      // frames

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
            start: 0, end: 1400,
            skyTop: '#3F8FD0', skyBottom: '#A9DCF5',
            ground: '#4A7C34', groundDark: '#3A6A28',
            path: '#C4A060', pathDark: '#A48040',
            treeColor: '#2D5A1E',
            flowerColors: ['#FF6B6B', '#FFD93D', '#FF8C42', '#C084FC']
        },
        {
            id: 1,
            name: 'Flower Gardens',
            nameGuj: 'પુષ્પ વાટિકા (Flower Gardens)',
            start: 1400, end: 2800,
            skyTop: '#4A9AD8', skyBottom: '#B5E4F7',
            ground: '#3D8B37', groundDark: '#2D7B27',
            path: '#D4B070', pathDark: '#B49050',
            treeColor: '#1E5A1E',
            flowerColors: ['#FF4D6D', '#FFBE0B', '#06D6A0', '#8338EC']
        },
        {
            id: 2,
            name: 'Water Features',
            nameGuj: 'જળ પ્રપાત (Water Fountains)',
            start: 2800, end: 4200,
            skyTop: '#3A86C4', skyBottom: '#9FD6EE',
            ground: '#5A8C5A', groundDark: '#4A7C4A',
            path: '#A0A0A0', pathDark: '#808080',
            waterColor: '#4AA8D8', waterLight: '#6BC8F0'
        },
        {
            id: 3,
            name: 'Pillar Pathway',
            nameGuj: 'સ્તંભ પથ (Pillar Pathway)',
            start: 4200, end: 5600,
            skyTop: '#6F9CCB', skyBottom: '#F3DDBE',
            ground: '#C4A882', groundDark: '#B49872',
            path: '#E8D8C0', pathDark: '#D0C0A0',
            pillarColor: '#D4B896', pillarDark: '#B49876'
        },
        {
            id: 4,
            name: 'Swaminarayan Mandir',
            nameGuj: 'શ્રી સ્વામિનારાયણ મંદિર',
            start: 5600, end: 6500,
            skyTop: '#D9783A', skyBottom: '#FFE2A8',
            ground: '#D4B896', groundDark: '#C4A886',
            path: '#F0E0D0', pathDark: '#E0D0C0',
            templeColor: '#E8C898', templeDark: '#C4A070'
        }
    ],

    // --------------------------------------------------------
    // World events (obstacles, questions, stairs) — flat ground
    // --------------------------------------------------------
    WORLD_EVENTS: [
        { type: 'obstacle', worldX: 700,  id: 'instagram' },
        { type: 'question', worldX: 1300 },
        { type: 'obstacle', worldX: 2000, id: 'tiktok' },
        { type: 'question', worldX: 2600 },
        { type: 'obstacle', worldX: 3300, id: 'bottle' },
        { type: 'question', worldX: 3900 },
        { type: 'obstacle', worldX: 4500, id: 'cigarette' },
        { type: 'question', worldX: 5000 },
        { type: 'question', worldX: 5700 },
        { type: 'stairs',   worldX: 6100 }
    ],

    // --------------------------------------------------------
    // Helper methods
    // --------------------------------------------------------

    getZone(worldX) {
        return CONFIG.ZONES[CONFIG.getZoneIndex(worldX)];
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
     * Canvas Y of the ground under a point in the world.
     * The world is flat; only the temple staircase rises, in hard steps.
     * worldX here is the X of whatever is standing there (its centre).
     */
    getGroundY(worldX) {
        const dx = worldX - CONFIG.STAIRS_X;
        if (dx < 0) return CONFIG.GROUND_Y;
        const step = Math.min(CONFIG.STAIR_STEPS, Math.floor(dx / CONFIG.STAIR_STEP_W) + 1);
        return CONFIG.GROUND_Y - step * CONFIG.STAIR_STEP_H;
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
