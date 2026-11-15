// ============================================================
// PLAYER — Procedural pixel-art character, V1 (960×540 scale)
// Canvas: 960×540  PLAYER_X=220  GROUND_Y=430
// Character: ~96px tall (feet→head), ~44px wide
//   Legs:   28px tall, two legs each 14px wide
//   Body:   38px tall (kurta), 40px wide
//   Head:   32px tall, 32px wide
// States: running | jumping | celebrating | stumbling | climbing
// Jump: parabolic arc, 130px max height, 22 frames
// Blink modifier: 90-frame invincibility with 6-frame flicker
// ============================================================
const Player = (() => {
    // ---- state ----
    let state       = 'running'; // running|jumping|celebrating|stumbling|climbing
    let animFrame   = 0;
    let animTimer   = 0;
    let stateTimer  = 0;

    // ---- jump ----
    let jumping     = false;
    let jumpTimer   = 0;         // 0..22

    // ---- invincibility blink ----
    let blinkTimer  = 0;         // counts DOWN from 90
    let blinking    = false;

    // ---- natural eye blink ----
    let eyeTimer    = 0;

    // ---- palette ----
    const C = {
        skin:        '#D4A574',
        hair:        '#1A1A1A',
        kurta:       '#FFFFFF',
        kurtaEdge:   '#E2E8F0',
        kurtaLine:   '#CBD5E1',
        pajama:      '#1E3A8A',
        pajamaLight: '#2563EB',
        shoe:        '#8B4513',
        tilakOrange: '#FF6B00',
        tilakRed:    '#EF4444',
        eye:         '#1A1A1A',
    };

    // ------------------------------------------------------------------
    // Public API
    // ------------------------------------------------------------------

    /** Change state; resets timers (no-op if already in that state). */
    function setState(s) {
        if (state === s) return;
        state = s;
        animFrame  = 0;
        animTimer  = 0;
        stateTimer = 0;
        // Leaving jump state
        if (s !== 'jumping') {
            jumping   = false;
            jumpTimer = 0;
        }
    }

    /** Initiate a jump (only if not already airborne). */
    function startJump() {
        if (jumping) return;
        jumping   = true;
        jumpTimer = 0;
        setState('jumping');
    }

    /**
     * Y offset due to jump arc.
     * @returns {number}  negative = upward on canvas
     */
    function getYOffset() {
        if (!jumping) return 0;
        return -Math.sin((jumpTimer / 22) * Math.PI) * 130;
    }

    /** Whether the player is currently in the air. */
    function isJumping() { return jumping; }

    /** Start 90-frame invincibility with flicker. */
    function startBlink() {
        blinkTimer = 90;
        blinking   = true;
    }

    /** Whether invincibility is active. */
    function isInvincible() { return blinkTimer > 0; }

    // ------------------------------------------------------------------
    // Update — called once per frame by game loop
    // ------------------------------------------------------------------
    function update() {
        animTimer++;
        stateTimer++;
        eyeTimer++;

        // ---- invincibility countdown ----
        if (blinkTimer > 0) {
            blinkTimer--;
            if (blinkTimer === 0) blinking = false;
        }

        // ---- jump arc ----
        if (jumping) {
            jumpTimer++;
            if (jumpTimer >= 22) {
                jumping   = false;
                jumpTimer = 22; // clamp so getYOffset() = 0
                if (state === 'jumping') setState('running');
            }
        }

        // ---- animation frame cycling ----
        if (state === 'running') {
            if (animTimer % 5 === 0) animFrame = (animFrame + 1) % 4;
        } else if (state === 'climbing') {
            if (animTimer % 8 === 0) animFrame = (animFrame + 1) % 4;
        } else {
            // other states don't need leg cycling; keep animFrame for reuse
        }
    }

    // ------------------------------------------------------------------
    // Render — called once per frame
    // @param ctx      CanvasRenderingContext2D
    // @param screenX  horizontal screen position (player x on canvas)
    // @param groundY  canvas Y where feet should stand
    // ------------------------------------------------------------------
    function render(ctx, screenX, groundY) {
        // ---- invincibility flicker: skip render on invisible frames ----
        if (blinking && blinkTimer > 0) {
            // every 6 frames toggle: frames 0-5 visible, 6-11 invisible, ...
            const phase = Math.floor((90 - blinkTimer) / 6) % 2;
            if (phase === 1) return; // invisible frame — skip entirely
        }

        const x  = Math.round(screenX);
        const yOffset = getYOffset();
        const fy = Math.round(groundY + yOffset); // feet Y

        ctx.save();

        // ---- state-driven context transforms ----
        if (state === 'celebrating') {
            const bounce = Math.abs(Math.sin(stateTimer * 0.28) * 9);
            ctx.translate(0, -bounce);
        }
        if (state === 'stumbling') {
            ctx.translate(Math.sin(animTimer * 1.8) * 2.5, 0);
        }
        if (state === 'climbing') {
            // slight forward lean
            ctx.transform(1, 0, -0.08, 1, 0, 0);
        }

        // ---- shadow ----
        ctx.fillStyle = 'rgba(0,0,0,0.18)';
        ctx.fillRect(x - 4, groundY - 2, 52, 5);

        // ----------------------------------------------------------
        // LEGS  (28px tall total; feet at fy)
        // Two legs, each 14px wide.  Origin bottom = fy.
        // ----------------------------------------------------------
        const legTop   = fy - 28;
        const legBaseY = fy - 3; // shoe top

        if (state === 'running' || state === 'climbing') {
            const swing = Math.sin(animFrame * Math.PI / 2);
            const oL    = Math.round(swing  * 7);
            const oR    = Math.round(-swing * 7);
            // Left leg
            ctx.fillStyle = C.pajama;
            ctx.fillRect(x + 2, legTop + Math.max(0, oL), 14, 28 - Math.abs(oL));
            // Right leg
            ctx.fillStyle = C.pajamaLight;
            ctx.fillRect(x + 18, legTop + Math.max(0, oR), 14, 28 - Math.abs(oR));
        } else if (state === 'jumping') {
            // Legs tucked up slightly
            ctx.fillStyle = C.pajama;
            ctx.fillRect(x + 2,  legTop + 6, 14, 22);
            ctx.fillStyle = C.pajamaLight;
            ctx.fillRect(x + 18, legTop + 6, 14, 22);
        } else {
            // standing / celebrating / stumbling
            ctx.fillStyle = C.pajama;
            ctx.fillRect(x + 2,  legTop, 14, 28);
            ctx.fillStyle = C.pajamaLight;
            ctx.fillRect(x + 18, legTop, 14, 28);
        }

        // ---- shoes ----
        ctx.fillStyle = C.shoe;
        ctx.fillRect(x,      legBaseY, 17, 5);
        ctx.fillRect(x + 18, legBaseY, 17, 5);

        // ----------------------------------------------------------
        // BODY (kurta)  38px tall, 40px wide; sits above legs
        // ----------------------------------------------------------
        const bodyTop = legTop - 38;

        ctx.fillStyle = C.kurta;
        ctx.fillRect(x, bodyTop, 40, 38);
        // decorative border
        ctx.fillStyle = C.kurtaEdge;
        ctx.fillRect(x, bodyTop, 40, 3);       // top hem
        ctx.fillRect(x, bodyTop, 2, 38);        // left seam
        ctx.fillRect(x + 38, bodyTop, 2, 38);   // right seam
        // center button line
        ctx.fillStyle = C.kurtaLine;
        ctx.fillRect(x + 19, bodyTop + 5, 2, 18);

        // ----------------------------------------------------------
        // ARMS  (swing during running/climbing; raised when celebrating/jumping)
        // ----------------------------------------------------------
        const armTopY = bodyTop + 4;

        if (state === 'running' || state === 'climbing') {
            const aSwing = Math.round(Math.sin(animFrame * Math.PI / 2) * 5);
            // left arm
            ctx.fillStyle = C.kurta;
            ctx.fillRect(x - 9, armTopY - aSwing, 10, 24);
            ctx.fillStyle = C.skin;
            ctx.fillRect(x - 9, armTopY - aSwing + 22, 10, 7);
            // right arm
            ctx.fillStyle = C.kurta;
            ctx.fillRect(x + 39, armTopY + aSwing, 10, 24);
            ctx.fillStyle = C.skin;
            ctx.fillRect(x + 39, armTopY + aSwing + 22, 10, 7);
        } else if (state === 'jumping' || state === 'celebrating') {
            // Arms raised above shoulders
            ctx.fillStyle = C.kurta;
            ctx.fillRect(x - 9, bodyTop - 18, 10, 24);
            ctx.fillRect(x + 39, bodyTop - 18, 10, 24);
            ctx.fillStyle = C.skin;
            ctx.fillRect(x - 9, bodyTop - 20, 10, 7);
            ctx.fillRect(x + 39, bodyTop - 20, 10, 7);
        } else {
            // resting / stumbling
            ctx.fillStyle = C.kurta;
            ctx.fillRect(x - 9, armTopY, 10, 24);
            ctx.fillRect(x + 39, armTopY, 10, 24);
            ctx.fillStyle = C.skin;
            ctx.fillRect(x - 9, armTopY + 22, 10, 7);
            ctx.fillRect(x + 39, armTopY + 22, 10, 7);
        }

        // ----------------------------------------------------------
        // HEAD  32px tall, 32px wide; sits above body
        // ----------------------------------------------------------
        const headX = x + 4;             // head left edge (centered on 40px body)
        const headY = bodyTop - 36;      // top of head (neck gap 4px)

        // Neck
        ctx.fillStyle = C.skin;
        ctx.fillRect(x + 14, bodyTop - 6, 12, 8);

        // Face
        ctx.fillStyle = C.skin;
        ctx.fillRect(headX, headY, 32, 32);

        // Hair  (wraps top + sides)
        ctx.fillStyle = C.hair;
        ctx.fillRect(headX - 1, headY - 3, 34, 9); // top band
        ctx.fillRect(headX - 1, headY + 6, 3, 10);  // left side
        ctx.fillRect(headX + 30, headY + 6, 3, 10); // right side

        // ----------------------------------------------------------
        // TILAK  (Swaminarayan U-shaped + chandlo)
        // 8×8 total, centered horizontally on face
        // Orange U: 8px wide, 8px tall
        // Skin center dip: 4px wide, 4px tall (top half of U)
        // Red chandlo dot: 4×4px (bottom center of U)
        // ----------------------------------------------------------
        const tilakX = headX + 12;  // centered: (32-8)/2 = 12
        const tilakY = headY + 2;

        ctx.fillStyle = C.tilakOrange;
        ctx.fillRect(tilakX, tilakY, 8, 8);
        ctx.fillStyle = C.skin;
        ctx.fillRect(tilakX + 2, tilakY, 4, 4);       // dip (top half)
        ctx.fillStyle = C.tilakRed;
        ctx.fillRect(tilakX + 2, tilakY + 4, 4, 4);   // chandlo (bottom center)

        // ----------------------------------------------------------
        // EYES  (natural blink every 120 frames for 3 frames)
        // ----------------------------------------------------------
        const naturalBlink = (eyeTimer % 120) >= 117; // last 3 frames of 120 cycle

        if (state === 'stumbling') {
            // X-eyes
            ctx.fillStyle = C.eye;
            const xe1 = headX + 6, xe2 = headX + 20, ey = headY + 14;
            [[xe1,ey],[xe1+2,ey],[xe1+1,ey+1],[xe1,ey+2],[xe1+2,ey+2]].forEach(([px,py]) => ctx.fillRect(px,py,2,2));
            [[xe2,ey],[xe2+2,ey],[xe2+1,ey+1],[xe2,ey+2],[xe2+2,ey+2]].forEach(([px,py]) => ctx.fillRect(px,py,2,2));
        } else if (naturalBlink && state !== 'celebrating') {
            // closed eye lines
            ctx.fillStyle = C.eye;
            ctx.fillRect(headX + 6,  headY + 15, 7, 2);
            ctx.fillRect(headX + 20, headY + 15, 7, 2);
        } else {
            // normal eyes with highlight
            ctx.fillStyle = C.eye;
            ctx.fillRect(headX + 6,  headY + 13, 6, 6);
            ctx.fillRect(headX + 20, headY + 13, 6, 6);
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(headX + 7,  headY + 13, 2, 2); // highlight L
            ctx.fillRect(headX + 21, headY + 13, 2, 2); // highlight R
        }

        // ----------------------------------------------------------
        // MOUTH
        // ----------------------------------------------------------
        const mouthY = headY + 23;
        ctx.fillStyle = C.eye;
        if (state === 'celebrating') {
            // big smile: curve via 3 segments
            ctx.fillRect(headX + 8,  mouthY,     1, 2);
            ctx.fillRect(headX + 9,  mouthY + 2, 6, 2);
            ctx.fillRect(headX + 15, mouthY,     1, 2);
            ctx.fillRect(headX + 10, mouthY + 1, 4, 1); // inner joy
        } else if (state === 'stumbling') {
            // frown
            ctx.fillRect(headX + 8,  mouthY + 2, 1, 2);
            ctx.fillRect(headX + 9,  mouthY,     6, 2);
            ctx.fillRect(headX + 15, mouthY + 2, 1, 2);
        } else {
            // calm pleasant line
            ctx.fillRect(headX + 9, mouthY + 1, 8, 2);
        }

        ctx.restore();
    }

    // ------------------------------------------------------------------
    // Expose public interface
    // ------------------------------------------------------------------
    return {
        get state()       { return state; },
        setState,
        startJump,
        getYOffset,
        isJumping,
        startBlink,
        isInvincible,
        update,
        render,
    };
})();
