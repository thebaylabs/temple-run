// ============================================================
// PARTICLES — 8-bit retro particle system (960×540 scale)
// Confetti, falling flower petals, fountain spray, temple aura
// ============================================================
const Particles = (() => {
    let particles = [];
    const MAX_PARTICLES = 180;

    function reset() {
        particles = [];
    }

    function emitChoiceConfetti(x, y, isGood) {
        const count = isGood ? 45 : 22;
        const colors = isGood
            ? ['#FFD700', '#00FF88', '#FF69B4', '#00E5FF', '#FFFFFF', '#FF8C00']
            : ['#FF4444', '#888888', '#555555', '#AA3333'];

        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = (isGood ? 2.0 : 1.0) + Math.random() * 3.5;
            particles.push({
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - (isGood ? 2.0 : 0.4),
                size: Math.random() < 0.6 ? 3 : 5,
                color: colors[Math.floor(Math.random() * colors.length)],
                life: 35 + Math.random() * 25,
                maxLife: 60,
                gravity: 0.12,
                flicker: Math.random() < 0.5
            });
        }
    }

    function emitVictoryCelebration() {
        // Firework bursts across screen
        const colors = ['#FFD700', '#FF8C00', '#00FF88', '#FF1493', '#00F5FF', '#FFFFFF'];
        const burstX = 140 + Math.random() * (CONFIG.WIDTH - 280);
        const burstY = 60 + Math.random() * 160;

        for (let i = 0; i < 35; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1.5 + Math.random() * 4.5;
            particles.push({
                x: burstX,
                y: burstY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: Math.random() < 0.5 ? 3 : 5,
                color: colors[Math.floor(Math.random() * colors.length)],
                life: 40 + Math.random() * 25,
                maxLife: 65,
                gravity: 0.08,
                flicker: true
            });
        }
    }

    function update(cameraX, worldX, currentZoneIndex) {
        if (particles.length < MAX_PARTICLES) {
            // Zone 0 & 1: Falling flower petals (pinks, marigolds, white)
            if (currentZoneIndex === 0 || currentZoneIndex === 1) {
                if (Math.random() < 0.28) {
                    particles.push({
                        x: Math.random() * CONFIG.WIDTH,
                        y: -10,
                        vx: -0.8 + Math.random() * 0.6,
                        vy: 0.8 + Math.random() * 0.8,
                        size: 3,
                        color: ['#FFB7B2', '#FFDAC1', '#FF6B6B', '#FFD166'][Math.floor(Math.random() * 4)],
                        life: 240,
                        maxLife: 240,
                        sway: Math.random() * 10,
                        gravity: 0.015
                    });
                }
            }
            // Zone 2: Fountain water spray
            else if (currentZoneIndex === 2) {
                if (Math.random() < 0.35) {
                    particles.push({
                        x: Math.random() * CONFIG.WIDTH,
                        y: CONFIG.GROUND_Y - 35 - Math.random() * 15,
                        vx: (Math.random() - 0.5) * 0.8,
                        vy: -0.8 - Math.random() * 0.8,
                        size: 2,
                        color: ['#88D8F8', '#C4F0FF', '#4AA8D8'][Math.floor(Math.random() * 3)],
                        life: 30,
                        maxLife: 30,
                        gravity: 0.06
                    });
                }
            }
            // Zone 3: Sandstone ambient light dust / rays
            else if (currentZoneIndex === 3) {
                if (Math.random() < 0.22) {
                    particles.push({
                        x: Math.random() * CONFIG.WIDTH,
                        y: 120 + Math.random() * 160,
                        vx: -0.2 + Math.random() * 0.4,
                        vy: -0.15 - Math.random() * 0.3,
                        size: 2,
                        color: '#FFE8A3',
                        life: 100,
                        maxLife: 100,
                        gravity: 0
                    });
                }
            }
            // Zone 4: Temple golden sparkles & diya embers
            else if (currentZoneIndex === 4) {
                if (Math.random() < 0.4) {
                    particles.push({
                        x: Math.random() * CONFIG.WIDTH,
                        y: CONFIG.GROUND_Y - 45 - Math.random() * 130,
                        vx: -0.4 + Math.random() * 0.8,
                        vy: -0.5 - Math.random() * 0.7,
                        size: Math.random() < 0.7 ? 2 : 3,
                        color: ['#FFD700', '#FFA500', '#FF4500', '#FFF8DC'][Math.floor(Math.random() * 4)],
                        life: 60,
                        maxLife: 60,
                        gravity: -0.015
                    });
                }
            }
        }

        // Update active particles
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            if (p.sway) {
                p.x += Math.sin(p.life * 0.1) * 0.5;
            }
            p.vy += p.gravity || 0;
            p.life--;

            if (p.life <= 0 || p.y > CONFIG.HEIGHT + 10 || p.x < -20 || p.x > CONFIG.WIDTH + 20) {
                particles.splice(i, 1);
            }
        }
    }

    function render(ctx) {
        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            const alpha = Math.min(1, p.life / 15);
            ctx.save();
            ctx.globalAlpha = p.flicker ? (Math.random() < 0.2 ? alpha * 0.3 : alpha) : alpha;
            ctx.fillStyle = p.color;
            ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size);
            ctx.restore();
        }
    }

    return {
        reset,
        emitChoiceConfetti,
        emitVictoryCelebration,
        update,
        render
    };
})();
