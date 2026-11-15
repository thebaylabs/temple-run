// ============================================================
// INPUT — Keyboard / touch / pointer handler
// V1: 'center' renamed to 'jump'; escape sequence detection
// Keys: A/Z/J/Left/1/Numpad1 → left
//       S/X/K/Space/Enter/2/Numpad2 → jump
//       D/C/L/Right/3/Numpad3 → right
//       F → fullscreen  |  M → mute
// Touch: left 33% = left, center 33% = jump, right 33% = right
// Escape sequence: [right, right, left] all within 45 frames → escapeTriggered
// ============================================================
const Input = (() => {
    const keys        = { left: false, jump: false, right: false };
    const justPressed = { left: false, jump: false, right: false };
    const _prev       = { left: false, jump: false, right: false };

    let lastActivityTime = Date.now();

    // Tracks last 3 justPressed events: [{ action, frame }, ...]
    const _recentJP = [];
    let _frame = 0;

    // Set to true when [right, right, left] within 45 frames; reset once read.
    let escapeTriggered = false;

    const KEY_MAP = {
        // Standard A / S / D
        'KeyA': 'left',
        'KeyS': 'jump',
        'KeyD': 'right',

        // Arrow keys
        'ArrowLeft':  'left',
        'ArrowRight': 'right',

        // Space / Enter → jump
        'Space': 'jump',
        'Enter': 'jump',

        // Digit row 1 / 2 / 3
        'Digit1': 'left',
        'Digit2': 'jump',
        'Digit3': 'right',

        // Numpad 1 / 2 / 3
        'Numpad1': 'left',
        'Numpad2': 'jump',
        'Numpad3': 'right',

        // Alternative ergonomic: Z / X / C
        'KeyZ': 'left',
        'KeyX': 'jump',
        'KeyC': 'right',

        // Alternative ergonomic: J / K / L
        'KeyJ': 'left',
        'KeyK': 'jump',
        'KeyL': 'right'
    };

    function markActivity() {
        lastActivityTime = Date.now();
        if (typeof Sound !== 'undefined') {
            Sound.ensureContext();
        }
    }

    function init() {
        window.addEventListener('keydown', e => {
            markActivity();

            // Mute toggle
            if (e.code === 'KeyM') {
                if (typeof Sound !== 'undefined') Sound.toggleMute();
                return;
            }

            // Fullscreen toggle
            if (e.code === 'KeyF') {
                toggleFullscreen();
                return;
            }

            const action = KEY_MAP[e.code];
            if (action) {
                keys[action] = true;
                e.preventDefault();
            }
        });

        window.addEventListener('keyup', e => {
            markActivity();
            const action = KEY_MAP[e.code];
            if (action) {
                keys[action] = false;
                e.preventDefault();
            }
        });

        window.addEventListener('blur', () => {
            keys.left = keys.jump = keys.right = false;
        });

        // Touch / pointer support for tablets & kiosks
        window.addEventListener('pointerdown', e => {
            markActivity();
            const w = window.innerWidth;
            if (e.clientX < w * 0.33) {
                keys.left = true;
            } else if (e.clientX > w * 0.66) {
                keys.right = true;
            } else {
                keys.jump = true;
            }
        });

        window.addEventListener('pointerup', () => {
            keys.left = keys.jump = keys.right = false;
        });
    }

    function toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
        } else {
            if (document.exitFullscreen) document.exitFullscreen();
        }
    }

    /**
     * Must be called once per game frame (before game logic reads justPressed).
     * Advances the internal frame counter, computes justPressed, and checks the
     * escape sequence [right, right, left] all within 45 frames of each other.
     */
    function update() {
        _frame++;

        for (const k of ['left', 'jump', 'right']) {
            justPressed[k] = keys[k] && !_prev[k];
            _prev[k] = keys[k];
        }

        // Track recently just-pressed actions for escape sequence detection
        for (const action of ['left', 'jump', 'right']) {
            if (justPressed[action]) {
                _recentJP.push({ action, frame: _frame });
                if (_recentJP.length > 3) _recentJP.shift();
            }
        }

        // Check escape sequence: [right, right, left], all within 45 frames
        if (_recentJP.length === 3) {
            const [a, b, c] = _recentJP;
            if (
                a.action === 'right' &&
                b.action === 'right' &&
                c.action === 'left' &&
                (c.frame - a.frame) <= 45
            ) {
                escapeTriggered = true;
                _recentJP.length = 0; // consume sequence
            }
        }
    }

    function getIdleSeconds() {
        return (Date.now() - lastActivityTime) / 1000;
    }

    /**
     * Returns true (and resets the flag) if the escape sequence was triggered
     * since the last call. game.js should poll this once per frame.
     */
    function consumeEscape() {
        if (escapeTriggered) {
            escapeTriggered = false;
            return true;
        }
        return false;
    }

    return {
        keys,
        justPressed,
        init,
        update,
        markActivity,
        getIdleSeconds,
        toggleFullscreen,
        consumeEscape
    };
})();
