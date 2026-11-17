// ============================================================
// UI — page layout and the three on-screen buttons
//
// layout()  sizes the canvas to fill the browser window and places the
//           button bar and the stage overlay. Two modes:
//             wide   — game fills the window, buttons sit along its bottom edge
//             tall   — (phone held upright) game at the top, big buttons below
// setLabels() lets the game say what each button does right now.
// update()  lights a button while its key is held.
// ============================================================
const UI = (() => {
    let canvas, bar, overlay;
    const btn = {};
    const labels = { left: null, jump: null, right: null };
    let scale = 1;

    function init(canvasEl) {
        canvas = canvasEl;
        bar = document.getElementById('buttons');
        overlay = document.getElementById('overlay');

        bar.querySelectorAll('.btn').forEach(el => {
            const action = el.dataset.action;
            btn[action] = el;
            el.addEventListener('pointerdown', e => {
                e.preventDefault();
                e.stopPropagation();
                Input.press(action);
            });
            ['pointerup', 'pointercancel', 'pointerleave'].forEach(type => {
                el.addEventListener(type, () => Input.release(action));
            });
            el.addEventListener('contextmenu', e => e.preventDefault());
        });

        layout();
        window.addEventListener('resize', layout);
        window.addEventListener('orientationchange', () => setTimeout(layout, 150));
        if (window.visualViewport) window.visualViewport.addEventListener('resize', layout);
    }

    function px(el, left, top, width, height) {
        el.style.left = Math.round(left) + 'px';
        el.style.top = Math.round(top) + 'px';
        el.style.width = Math.round(width) + 'px';
        el.style.height = Math.round(height) + 'px';
    }

    function layout() {
        const W = window.innerWidth, H = window.innerHeight;
        const GW = CONFIG.WIDTH, GH = CONFIG.HEIGHT;
        const tall = W / H < 1.2;

        if (tall) {
            // Buttons anchored to the bottom; game centred in the space above.
            const barH = Math.max(110, Math.min(220, Math.round(H * 0.22)));
            const spaceH = H - barH;
            scale = Math.min(W / GW, spaceH / GH);
            const cw = GW * scale, ch = GH * scale;
            px(canvas, (W - cw) / 2, Math.max(0, (spaceH - ch) / 2), cw, ch);
            px(bar, 0, spaceH, W, barH);
            px(overlay, 0, 0, W, spaceH);
            bar.classList.add('stacked');
        } else {
            // Game fills the window; buttons overlap its bottom strip.
            scale = Math.min(W / GW, H / GH);
            const cw = GW * scale, ch = GH * scale;
            const left = (W - cw) / 2, top = (H - ch) / 2;
            const barH = Math.max(46, Math.round(ch * CONFIG.BUTTON_BAR_FRACTION));
            px(canvas, left, top, cw, ch);
            px(bar, left, top + ch - barH, cw, barH);
            px(overlay, left, top, cw, ch - barH);
            bar.classList.remove('stacked');
        }
        document.documentElement.style.setProperty('--u', scale.toFixed(4));
        // Smallest text scale on stage screens: larger on an upright phone,
        // where there is plenty of height to spare.
        document.documentElement.style.setProperty('--fmin', tall ? '0.82' : '0.62');
        document.documentElement.style.setProperty('--bz', Math.max(0.6, Math.min(1.6, scale)).toFixed(2));
    }

    /**
     * Sets what each button says. Pass null/'' for a button that does
     * nothing right now (it is shown dimmed).
     */
    function setLabels(left, jump, right) {
        const next = { left: left || null, jump: jump || null, right: right || null };
        ['left', 'jump', 'right'].forEach(a => {
            if (labels[a] === next[a]) return;
            labels[a] = next[a];
            btn[a].querySelector('.btn-label').textContent = next[a] || '';
            btn[a].classList.toggle('off', !next[a]);
        });
    }

    /** Call once per frame: a button glows while its key or finger is down. */
    function update() {
        ['left', 'jump', 'right'].forEach(a => {
            btn[a].classList.toggle('pressed', !!Input.keys[a] && !!labels[a]);
        });
    }

    return { init, layout, setLabels, update, get scale() { return scale; } };
})();
