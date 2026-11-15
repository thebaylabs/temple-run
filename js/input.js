// ============================================================
// INPUT — 3-key keyboard handler (A / S / D + 1/2/3 + arrows)
// Includes kiosk touch support, fullscreen (F), and mute (M)
// ============================================================
const Input = (() => {
    const keys = { left: false, center: false, right: false };
    const justPressed = { left: false, center: false, right: false };
    const _prev = { left: false, center: false, right: false };
    let lastActivityTime = Date.now();

    const KEY_MAP = {
        // Standard A / S / D
        'KeyA': 'left',
        'KeyS': 'center',
        'KeyD': 'right',

        // Arrow keys
        'ArrowLeft': 'left',
        'ArrowDown': 'center',
        'Space': 'center',
        'Enter': 'center',
        'ArrowRight': 'right',

        // 1 / 2 / 3 (often default output on 3-key mechanical macro pads)
        'Digit1': 'left',
        'Numpad1': 'left',
        'Digit2': 'center',
        'Numpad2': 'center',
        'Digit3': 'right',
        'Numpad3': 'right',

        // Alternative ergonomic (Z / X / C or J / K / L)
        'KeyZ': 'left',
        'KeyX': 'center',
        'KeyC': 'right',
        'KeyJ': 'left',
        'KeyK': 'center',
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
            keys.left = keys.center = keys.right = false;
        });

        // Touch & mouse click support for tablets / kiosks
        window.addEventListener('pointerdown', e => {
            markActivity();
            const w = window.innerWidth;
            if (e.clientX < w * 0.33) {
                keys.left = true;
            } else if (e.clientX > w * 0.66) {
                keys.right = true;
            } else {
                keys.center = true;
            }
        });

        window.addEventListener('pointerup', () => {
            keys.left = keys.center = keys.right = false;
        });
    }

    function toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
        } else {
            if (document.exitFullscreen) document.exitFullscreen();
        }
    }

    function update() {
        for (const k of ['left', 'center', 'right']) {
            justPressed[k] = keys[k] && !_prev[k];
            _prev[k] = keys[k];
        }
    }

    function getIdleSeconds() {
        return (Date.now() - lastActivityTime) / 1000;
    }

    return {
        keys,
        justPressed,
        init,
        update,
        markActivity,
        getIdleSeconds,
        toggleFullscreen
    };
})();
