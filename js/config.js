// ============================================================
// CONFIG — Game constants, zone definitions & kiosk settings
// ============================================================
const CONFIG = {
    WIDTH: 480,
    HEIGHT: 270,
    GROUND_Y: 215,
    WALK_SPEED: 2.3,
    ROLLBACK_SPEED: 5.2,
    TOTAL_DISTANCE: 3900,
    VICTORY_X: 3750,
    PLAYER_X: 110,
    CELEBRATION_FRAMES: 65,
    WRONG_PAUSE_FRAMES: 28,
    FEEDBACK_FRAMES: 60,

    // Kiosk auto-reset: if idle for 40 seconds (at 30fps), return to Title/Attract screen
    INACTIVITY_TIMEOUT_FRAMES: 1200,

    ZONES: [
        {
            id: 0,
            name: 'Garden Gate',
            nameGuj: 'બાગ પ્રવેશ (Garden Gate)',
            start: 0, end: 800,
            ground: '#4A7C34', groundDark: '#3A6A28',
            path: '#C4A060', pathDark: '#A48040',
            skyTop: '#4A90C8', skyBottom: '#87CEEB',
            treeColor: '#2D5A1E',
            flowerColors: ['#FF6B6B', '#FFD93D', '#FF8C42', '#C084FC']
        },
        {
            id: 1,
            name: 'Flower Gardens',
            nameGuj: 'પુષ્પ વાટિકા (Flower Gardens)',
            start: 800, end: 1600,
            ground: '#3D8B37', groundDark: '#2D7B27',
            path: '#D4B070', pathDark: '#B49050',
            skyTop: '#4A90C8', skyBottom: '#98D8F0',
            treeColor: '#1E5A1E',
            flowerColors: ['#FF4D6D', '#FFBE0B', '#06D6A0', '#8338EC']
        },
        {
            id: 2,
            name: 'Water Features',
            nameGuj: 'જળ પ્રપાત (Water Fountains)',
            start: 1600, end: 2400,
            ground: '#5A8C5A', groundDark: '#4A7C4A',
            path: '#A0A0A0', pathDark: '#808080',
            skyTop: '#3A80B8', skyBottom: '#7EC8E3',
            waterColor: '#4AA8D8', waterLight: '#6BC8F0'
        },
        {
            id: 3,
            name: 'Pillar Pathway',
            nameGuj: 'સ્તંભ પથ (Pillar Pathway)',
            start: 2400, end: 3200,
            ground: '#C4A882', groundDark: '#B49872',
            path: '#E8D8C0', pathDark: '#D0C0A0',
            skyTop: '#6A98C0', skyBottom: '#C8DDE8',
            pillarColor: '#D4B896', pillarDark: '#B49876'
        },
        {
            id: 4,
            name: 'Swaminarayan Mandir',
            nameGuj: 'શ્રી સ્વામિનારાયણ મંદિર',
            start: 3200, end: 4200,
            ground: '#D4B896', groundDark: '#C4A886',
            path: '#F0E0D0', pathDark: '#E0D0C0',
            skyTop: '#C08040', skyBottom: '#FFE4B5',
            templeColor: '#E8C898', templeDark: '#C4A070'
        }
    ],

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
