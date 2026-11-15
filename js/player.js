// ============================================================
// PLAYER — Character sprite drawing, animations & audio hook
// ============================================================
const Player = (() => {
    let state = 'idle';   // idle | walking | celebrating | stumbling
    let animFrame = 0;
    let animTimer = 0;
    let stateTimer = 0;
    let blinkTimer = 0;

    const C = {
        skin: '#D4A574', hair: '#1A1A1A',
        kurta: '#FFFFFF', kurtaEdge: '#E2E8F0', kurtaLine: '#CBD5E1',
        pajama: '#1E3A8A', pajamaL: '#2563EB',
        shoe: '#8B4513',
        tilakO: '#FF6B00', tilakW: '#FFFFFF',
        eye: '#1A1A1A'
    };

    function setState(s) {
        if (state === s) return;
        state = s;
        animFrame = 0;
        animTimer = 0;
        stateTimer = 0;
    }

    function update() {
        animTimer++;
        blinkTimer++;

        if (state === 'walking') {
            if (animTimer % 6 === 0) {
                const prev = animFrame;
                animFrame = (animFrame + 1) % 4;
                // Play footstep sound on footfall
                if ((animFrame === 1 || animFrame === 3) && typeof Sound !== 'undefined') {
                    Sound.step();
                }
            }
        }

        if (state === 'celebrating' || state === 'stumbling') {
            stateTimer++;
        }
    }

    function render(ctx, screenX) {
        const x = Math.round(screenX);
        const baseY = CONFIG.GROUND_Y;
        ctx.save();

        // Idle gentle breathing bob
        let idleBob = 0;
        if (state === 'idle') {
            idleBob = Math.round(Math.sin(animTimer * 0.08) * 1);
        }

        // Celebration bounce
        if (state === 'celebrating') {
            const jump = Math.abs(Math.sin(stateTimer * 0.28) * 9);
            ctx.translate(0, -jump);
        }
        // Stumble shake
        if (state === 'stumbling') {
            ctx.translate(Math.sin(animTimer * 1.8) * 2.5, 0);
        }

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.18)';
        ctx.fillRect(x - 2, baseY - 1, 24, 3);

        // === LEGS ===
        const legTop = baseY - 14;
        if (state === 'walking') {
            const swing = Math.sin(animFrame * Math.PI / 2);
            const oL = Math.round(swing * 4);
            const oR = Math.round(-swing * 4);
            ctx.fillStyle = C.pajama;
            ctx.fillRect(x + 2, legTop + oL, 7, 14 - oL);
            ctx.fillStyle = C.pajamaL;
            ctx.fillRect(x + 11, legTop + oR, 7, 14 - oR);
            ctx.fillStyle = C.shoe;
            ctx.fillRect(x + 1, baseY - 2, 9, 3);
            ctx.fillRect(x + 10, baseY - 2, 9, 3);
        } else {
            ctx.fillStyle = C.pajama;
            ctx.fillRect(x + 2, legTop, 7, 14);
            ctx.fillStyle = C.pajamaL;
            ctx.fillRect(x + 11, legTop, 7, 14);
            ctx.fillStyle = C.shoe;
            ctx.fillRect(x + 1, baseY - 2, 9, 3);
            ctx.fillRect(x + 10, baseY - 2, 9, 3);
        }

        // === BODY (Kurta) ===
        const bodyTop = legTop - 18 + idleBob;
        ctx.fillStyle = C.kurta;
        ctx.fillRect(x, bodyTop, 20, 18);
        ctx.fillStyle = C.kurtaEdge;
        ctx.fillRect(x, bodyTop, 20, 2);
        ctx.fillRect(x, bodyTop, 2, 18);
        ctx.fillRect(x + 18, bodyTop, 2, 18);
        ctx.fillStyle = C.kurtaLine;
        ctx.fillRect(x + 9, bodyTop + 3, 2, 8);

        // === ARMS ===
        if (state === 'walking') {
            const aSwing = Math.round(Math.sin(animFrame * Math.PI / 2) * 3);
            ctx.fillStyle = C.kurta;
            ctx.fillRect(x - 4, bodyTop + 4 - aSwing, 5, 12);
            ctx.fillRect(x + 19, bodyTop + 4 + aSwing, 5, 12);
            ctx.fillStyle = C.skin;
            ctx.fillRect(x - 4, bodyTop + 14 - aSwing, 5, 4);
            ctx.fillRect(x + 19, bodyTop + 14 + aSwing, 5, 4);
        } else if (state === 'celebrating') {
            // Raised arms with victory cheer!
            ctx.fillStyle = C.kurta;
            ctx.fillRect(x - 5, bodyTop - 10, 6, 16);
            ctx.fillRect(x + 19, bodyTop - 10, 6, 16);
            ctx.fillStyle = C.skin;
            ctx.fillRect(x - 5, bodyTop - 14, 6, 5);
            ctx.fillRect(x + 19, bodyTop - 14, 6, 5);
        } else {
            ctx.fillStyle = C.kurta;
            ctx.fillRect(x - 4, bodyTop + 4, 5, 12);
            ctx.fillRect(x + 19, bodyTop + 4, 5, 12);
            ctx.fillStyle = C.skin;
            ctx.fillRect(x - 4, bodyTop + 14, 5, 4);
            ctx.fillRect(x + 19, bodyTop + 14, 5, 4);
        }

        // === HEAD ===
        const headX = x + 2, headY = bodyTop - 16;
        // Neck
        ctx.fillStyle = C.skin;
        ctx.fillRect(x + 7, bodyTop - 3, 6, 4);
        // Face
        ctx.fillRect(headX, headY, 16, 14);
        // Hair
        ctx.fillStyle = C.hair;
        ctx.fillRect(headX - 1, headY - 2, 18, 5);
        ctx.fillRect(headX + 14, headY + 3, 2, 3);

        // Eyes (with natural occasional blinking)
        const isBlinking = blinkTimer % 110 > 104;
        if (state === 'stumbling') {
            ctx.fillStyle = C.eye;
            // X eyes
            ctx.fillRect(headX + 3, headY + 6, 1, 1);
            ctx.fillRect(headX + 5, headY + 6, 1, 1);
            ctx.fillRect(headX + 4, headY + 7, 1, 1);
            ctx.fillRect(headX + 3, headY + 8, 1, 1);
            ctx.fillRect(headX + 5, headY + 8, 1, 1);
            ctx.fillRect(headX + 10, headY + 6, 1, 1);
            ctx.fillRect(headX + 12, headY + 6, 1, 1);
            ctx.fillRect(headX + 11, headY + 7, 1, 1);
            ctx.fillRect(headX + 10, headY + 8, 1, 1);
            ctx.fillRect(headX + 12, headY + 8, 1, 1);
        } else if (isBlinking && state !== 'celebrating') {
            // Closed eye line
            ctx.fillStyle = C.eye;
            ctx.fillRect(headX + 3, headY + 7, 3, 1);
            ctx.fillRect(headX + 10, headY + 7, 3, 1);
        } else {
            ctx.fillStyle = C.eye;
            ctx.fillRect(headX + 3, headY + 6, 3, 3);
            ctx.fillRect(headX + 10, headY + 6, 3, 3);
            ctx.fillStyle = '#FFF';
            ctx.fillRect(headX + 4, headY + 6, 1, 1);
            ctx.fillRect(headX + 11, headY + 6, 1, 1);
        }

        // Authentic Swaminarayan Tilak-Chandlo (U-shaped orange + red/white chandlo)
        ctx.fillStyle = C.tilakO;
        ctx.fillRect(headX + 6, headY + 1, 4, 4);
        ctx.fillStyle = C.skin;
        ctx.fillRect(headX + 7, headY + 1, 2, 2); // Center dip of U-tilak
        ctx.fillStyle = '#EF4444'; // Red Chandlo
        ctx.fillRect(headX + 7, headY + 3, 2, 2);

        // Mouth
        if (state === 'celebrating') {
            // Happy smile
            ctx.fillStyle = C.eye;
            ctx.fillRect(headX + 5, headY + 10, 1, 1);
            ctx.fillRect(headX + 6, headY + 11, 4, 1);
            ctx.fillRect(headX + 10, headY + 10, 1, 1);
        } else if (state === 'stumbling') {
            // Frown / shock
            ctx.fillStyle = C.eye;
            ctx.fillRect(headX + 6, headY + 11, 4, 1);
        } else {
            // Calm pleasant expression
            ctx.fillStyle = C.eye;
            ctx.fillRect(headX + 6, headY + 10, 4, 1);
        }

        ctx.restore();
    }

    return {
        get state() { return state; },
        setState,
        update,
        render
    };
})();
