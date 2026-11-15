// ============================================================
// BACKGROUND — Sky, ground, zone decorations, parallax, temple
// ============================================================
const Background = (() => {
    let animTick = 0;

    // ---- Small drawing helpers ----

    function drawBush(ctx, x, y, color) {
        ctx.fillStyle = color || '#2D6A1E';
        ctx.fillRect(x, y - 14, 18, 14);
        ctx.fillRect(x + 3, y - 18, 12, 4);
        ctx.fillRect(x + 5, y - 20, 8, 2);
        ctx.fillStyle = shadeColor(color || '#2D6A1E', -25);
        ctx.fillRect(x + 2, y - 8, 7, 8);
    }

    function drawTree(ctx, x, y, leafColor) {
        ctx.fillStyle = '#6B4226';
        ctx.fillRect(x + 8, y - 35, 6, 35);
        ctx.fillStyle = leafColor || '#2D6A1E';
        ctx.fillRect(x, y - 55, 22, 22);
        ctx.fillRect(x + 3, y - 60, 16, 5);
        ctx.fillRect(x - 2, y - 48, 26, 8);
        ctx.fillStyle = shadeColor(leafColor || '#2D6A1E', -15);
        ctx.fillRect(x + 2, y - 42, 10, 10);
    }

    function drawFlower(ctx, x, y, color) {
        ctx.fillStyle = '#2A6A1E';
        ctx.fillRect(x + 1, y - 7, 2, 7);
        ctx.fillStyle = color;
        ctx.fillRect(x - 1, y - 11, 6, 5);
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(x + 1, y - 10, 2, 2);
    }

    function drawPillar(ctx, x, y) {
        ctx.fillStyle = '#D4B896';
        ctx.fillRect(x, y - 72, 14, 72);
        ctx.fillStyle = '#E8D0B0';
        ctx.fillRect(x - 3, y - 78, 20, 8);
        ctx.fillRect(x - 1, y - 81, 16, 3);
        ctx.fillStyle = '#C4A080';
        ctx.fillRect(x - 2, y - 4, 18, 6);
        ctx.fillStyle = '#B49070';
        ctx.fillRect(x + 4, y - 64, 2, 52);
        ctx.fillRect(x + 8, y - 64, 2, 52);
    }

    function drawFountain(ctx, x, y) {
        ctx.fillStyle = '#4AA8D8';
        ctx.fillRect(x - 8, y - 8, 36, 8);
        ctx.fillStyle = '#A0A0A0';
        ctx.fillRect(x - 10, y - 10, 40, 3);
        ctx.fillRect(x - 10, y - 1, 40, 3);
        ctx.fillStyle = '#B0B0B0';
        ctx.fillRect(x + 7, y - 28, 6, 20);
        ctx.fillStyle = '#88D8F8';
        ctx.fillRect(x + 8, y - 33, 4, 5);
        ctx.fillRect(x + 5, y - 36, 2, 3);
        ctx.fillRect(x + 13, y - 36, 2, 3);
        ctx.fillRect(x + 3, y - 30, 2, 2);
        ctx.fillRect(x + 15, y - 30, 2, 2);

        // Water ripple animation
        const wave = Math.sin(animTick * 0.15 + x) * 2;
        ctx.fillStyle = '#E0F7FA';
        ctx.fillRect(x - 4 + wave, y - 5, 8, 1);
    }

    function drawTemple(ctx, x, y) {
        const w = 140, h = 105;
        // Steps
        ctx.fillStyle = '#E8D0B0';
        ctx.fillRect(x - 15, y - 15, w + 30, 15);
        ctx.fillRect(x - 10, y - 22, w + 20, 7);
        ctx.fillRect(x - 5, y - 28, w + 10, 6);
        ctx.fillRect(x, y - 32, w, 4);

        // Diyas on steps
        for (let i = 0; i < 4; i++) {
            const dx = x - 5 + i * 36;
            ctx.fillStyle = '#B45309';
            ctx.fillRect(dx, y - 18, 5, 3);
            ctx.fillStyle = '#F59E0B';
            ctx.fillRect(dx + 1, y - 21, 3, 3);
            ctx.fillStyle = '#FFF';
            ctx.fillRect(dx + 2, y - 20, 1, 1);
        }

        // Main body
        ctx.fillStyle = '#D4B896';
        ctx.fillRect(x + 10, y - 72, w - 20, 40);

        // Entrance arch
        ctx.fillStyle = '#3E2723';
        ctx.fillRect(x + 54, y - 62, 28, 30);
        ctx.fillStyle = '#8D6E63';
        ctx.fillRect(x + 54, y - 65, 28, 4);

        // Golden murti glow inside entrance
        const glowPulse = 0.5 + 0.5 * Math.sin(animTick * 0.1);
        ctx.fillStyle = `rgba(255, 215, 0, ${0.4 + 0.3 * glowPulse})`;
        ctx.fillRect(x + 64, y - 52, 8, 16);

        // Main dome (Shikhara)
        ctx.fillStyle = '#E8C898';
        ctx.fillRect(x + 35, y - 88, 66, 16);
        ctx.fillRect(x + 41, y - 96, 54, 8);
        ctx.fillRect(x + 47, y - 102, 42, 6);
        ctx.fillRect(x + 53, y - 107, 30, 5);
        ctx.fillRect(x + 59, y - 111, 18, 4);

        // Side towers
        ctx.fillStyle = '#D4B090';
        ctx.fillRect(x + 5, y - 84, 18, 52);
        ctx.fillRect(x + w - 23, y - 84, 18, 52);

        // Side domes
        ctx.fillStyle = '#E8C898';
        ctx.fillRect(x + 3, y - 92, 22, 8);
        ctx.fillRect(x + 6, y - 97, 16, 5);
        ctx.fillRect(x + w - 25, y - 92, 22, 8);
        ctx.fillRect(x + w - 22, y - 97, 16, 5);

        // Golden Kalash & Spires
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(x + 66, y - 119, 4, 10);
        ctx.fillRect(x + 67, y - 123, 2, 4);
        ctx.fillRect(x + 13, y - 103, 4, 8);
        ctx.fillRect(x + w - 17, y - 103, 4, 8);

        // Pillars in front of entrance
        ctx.fillStyle = '#C4A880';
        for (let i = 0; i < 4; i++) {
            ctx.fillRect(x + 22 + i * 28, y - 68, 5, 36);
        }

        // Gold trim
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(x + 10, y - 72, w - 20, 2);

        // Fluttering Saffron Dharmadhwaja (Flag)
        const flagWave = Math.round(Math.sin(animTick * 0.2) * 2);
        ctx.fillStyle = '#666';
        ctx.fillRect(x + 68, y - 132, 2, 12);
        ctx.fillStyle = '#FF6B00';
        ctx.fillRect(x + 70, y - 132 + flagWave, 12, 6);
        ctx.fillRect(x + 70, y - 129 + flagWave, 8, 4);
    }

    function shadeColor(hex, amt) {
        let r = parseInt(hex.slice(1, 3), 16) + amt;
        let g = parseInt(hex.slice(3, 5), 16) + amt;
        let b = parseInt(hex.slice(5, 7), 16) + amt;
        r = Math.max(0, Math.min(255, r));
        g = Math.max(0, Math.min(255, g));
        b = Math.max(0, Math.min(255, b));
        return '#' + [r, g, b].map(c => c.toString(16).padStart(2, '0')).join('');
    }

    // ---- Render layers ----

    function renderSky(ctx, cameraX) {
        const zone = CONFIG.getZone(cameraX + CONFIG.WIDTH / 2);
        const grad = ctx.createLinearGradient(0, 0, 0, CONFIG.GROUND_Y);
        grad.addColorStop(0, zone.skyTop);
        grad.addColorStop(1, zone.skyBottom);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, CONFIG.WIDTH, CONFIG.GROUND_Y);
    }

    function renderClouds(ctx, cameraX) {
        ctx.fillStyle = 'rgba(255,255,255,0.48)';
        const offset = cameraX * 0.12 + animTick * 0.08;
        const spacing = 140;
        const start = Math.floor(offset / spacing) - 1;
        for (let i = start; i < start + 7; i++) {
            const bx = i * spacing + ((i * 73) % 40) - 20;
            const sx = bx - offset;
            if (sx < -50 || sx > CONFIG.WIDTH + 10) continue;
            const cy = 12 + ((i * 37 + 11) % 45);
            const w = 22 + ((i * 53) % 18);
            ctx.fillRect(sx, cy, w, 6);
            ctx.fillRect(sx + 4, cy - 3, w - 8, 4);
            ctx.fillRect(sx + 2, cy + 5, w - 4, 3);
        }
    }

    function renderDistantBG(ctx, cameraX) {
        const parallax = 0.2;
        const offset = cameraX * parallax;
        ctx.fillStyle = 'rgba(160,140,110,0.22)';
        const spacing = 280;
        const start = Math.floor(offset / spacing) - 1;
        for (let i = start; i < start + 5; i++) {
            const bx = i * spacing + 80;
            const sx = bx - offset;
            if (sx < -70 || sx > CONFIG.WIDTH + 40) continue;
            const h = 28 + ((i * 47 + 7) % 22);
            const dy = CONFIG.GROUND_Y - 25;
            ctx.fillRect(sx, dy - h, 28, h);
            ctx.fillRect(sx + 4, dy - h - 7, 20, 7);
            ctx.fillRect(sx + 7, dy - h - 13, 14, 6);
            ctx.fillRect(sx + 10, dy - h - 17, 8, 4);
            if (i % 2 === 0) {
                ctx.fillRect(sx + 34, dy - h + 10, 14, h - 10);
                ctx.fillRect(sx + 36, dy - h + 4, 10, 6);
            }
        }
    }

    function renderGround(ctx, cameraX) {
        for (let z = 0; z < CONFIG.ZONES.length; z++) {
            const zone = CONFIG.ZONES[z];
            const sl = Math.max(0, zone.start - cameraX);
            const sr = Math.min(CONFIG.WIDTH, zone.end - cameraX);
            if (sr <= 0 || sl >= CONFIG.WIDTH) continue;
            const dx = Math.floor(sl), dw = Math.ceil(sr) - dx;
            if (dw <= 0) continue;

            ctx.fillStyle = zone.ground;
            ctx.fillRect(dx, CONFIG.GROUND_Y, dw, CONFIG.HEIGHT - CONFIG.GROUND_Y);
            ctx.fillStyle = zone.groundDark;
            ctx.fillRect(dx, CONFIG.GROUND_Y, dw, 3);
            ctx.fillStyle = zone.path;
            ctx.fillRect(dx, CONFIG.GROUND_Y + 10, dw, 18);
            ctx.fillStyle = zone.pathDark;
            ctx.fillRect(dx, CONFIG.GROUND_Y + 9, dw, 2);
            ctx.fillRect(dx, CONFIG.GROUND_Y + 27, dw, 2);
        }

        if (cameraX < 0) {
            const zone = CONFIG.ZONES[0];
            ctx.fillStyle = zone.ground;
            ctx.fillRect(0, CONFIG.GROUND_Y, Math.ceil(-cameraX), CONFIG.HEIGHT - CONFIG.GROUND_Y);
            ctx.fillStyle = zone.groundDark;
            ctx.fillRect(0, CONFIG.GROUND_Y, Math.ceil(-cameraX), 3);
            ctx.fillStyle = zone.path;
            ctx.fillRect(0, CONFIG.GROUND_Y + 10, Math.ceil(-cameraX), 18);
            ctx.fillStyle = zone.pathDark;
            ctx.fillRect(0, CONFIG.GROUND_Y + 9, Math.ceil(-cameraX), 2);
            ctx.fillRect(0, CONFIG.GROUND_Y + 27, Math.ceil(-cameraX), 2);
        }

        // Stepping stone tiles
        ctx.fillStyle = 'rgba(255,255,255,0.18)';
        const ds = Math.floor(cameraX / 20) * 20;
        for (let wx = ds; wx < cameraX + CONFIG.WIDTH; wx += 20) {
            ctx.fillRect(wx - cameraX, CONFIG.GROUND_Y + 18, 10, 2);
        }
    }

    function renderDecorations(ctx, cameraX) {
        const left = Math.floor(cameraX / 40) * 40 - 80;
        const right = cameraX + CONFIG.WIDTH + 80;

        for (let wx = left; wx < right; wx += 40) {
            if (wx < -40) continue;
            const zi = CONFIG.getZoneIndex(wx);
            const zone = CONFIG.ZONES[zi];
            const sx = wx - cameraX;

            switch (zi) {
                case 0: // Garden Gate
                    if (wx >= 0 && wx % 120 === 0) drawBush(ctx, sx + 5, CONFIG.GROUND_Y, zone.treeColor);
                    if (wx >= 0 && wx % 80 === 0) {
                        const fc = zone.flowerColors[Math.abs(wx / 80) % zone.flowerColors.length];
                        drawFlower(ctx, sx + 16, CONFIG.GROUND_Y + 6, fc);
                        drawFlower(ctx, sx + 26, CONFIG.GROUND_Y + 7, zone.flowerColors[(Math.abs(wx / 80) + 2) % zone.flowerColors.length]);
                    }
                    if (wx >= 0 && wx % 240 === 0) drawTree(ctx, sx, CONFIG.GROUND_Y, zone.treeColor);
                    break;

                case 1: // Flower Gardens
                    if (wx % 60 === 0) {
                        const fc = zone.flowerColors[Math.abs(wx / 60) % zone.flowerColors.length];
                        for (let f = 0; f < 4; f++) drawFlower(ctx, sx + f * 8 + 2, CONFIG.GROUND_Y + 4 + (f % 2), fc);
                    }
                    if (wx % 200 === 0) {
                        ctx.fillStyle = zone.treeColor;
                        ctx.fillRect(sx + 2, CONFIG.GROUND_Y - 22, 16, 22);
                        ctx.fillRect(sx + 5, CONFIG.GROUND_Y - 28, 10, 6);
                        ctx.fillRect(sx + 7, CONFIG.GROUND_Y - 31, 6, 3);
                    }
                    if (wx % 280 === 0) drawTree(ctx, sx + 10, CONFIG.GROUND_Y, zone.treeColor);
                    break;

                case 2: // Water Features
                    if (wx % 200 === 0) drawFountain(ctx, sx + 12, CONFIG.GROUND_Y);
                    if (wx % 120 === 0 && wx % 200 !== 0) {
                        ctx.fillStyle = zone.waterColor || '#4AA8D8';
                        ctx.fillRect(sx, CONFIG.GROUND_Y + 32, 28, 8);
                        ctx.fillStyle = zone.waterLight || '#6BC8F0';
                        ctx.fillRect(sx + 3, CONFIG.GROUND_Y + 33, 6, 2);
                        ctx.fillRect(sx + 14, CONFIG.GROUND_Y + 35, 8, 2);
                        ctx.fillStyle = '#888';
                        ctx.fillRect(sx - 1, CONFIG.GROUND_Y + 30, 30, 2);
                        ctx.fillRect(sx - 1, CONFIG.GROUND_Y + 40, 30, 2);
                    }
                    break;

                case 3: // Pillar Pathway
                    if (wx % 120 === 0) drawPillar(ctx, sx + 12, CONFIG.GROUND_Y);
                    if (wx % 240 === 0) {
                        ctx.fillStyle = '#D4B896';
                        ctx.fillRect(sx + 12, CONFIG.GROUND_Y - 82, 120, 4);
                        ctx.fillStyle = '#C4A880';
                        ctx.fillRect(sx + 12, CONFIG.GROUND_Y - 78, 120, 2);
                    }
                    break;

                case 4: // Temple approach with lamps
                    if (wx % 120 === 0 && wx < 3550) {
                        ctx.fillStyle = '#B49070';
                        ctx.fillRect(sx + 16, CONFIG.GROUND_Y - 42, 4, 42);
                        ctx.fillStyle = '#FFD700';
                        ctx.fillRect(sx + 13, CONFIG.GROUND_Y - 49, 10, 9);
                        ctx.fillStyle = '#FFA500';
                        ctx.fillRect(sx + 15, CONFIG.GROUND_Y - 47, 6, 5);
                    }
                    break;
            }
        }
    }

    function renderTempleEnd(ctx, cameraX) {
        const templeX = 3580;
        const sx = templeX - cameraX;
        if (sx < CONFIG.WIDTH + 30 && sx > -160) {
            drawTemple(ctx, sx, CONFIG.GROUND_Y);
        }
    }

    // Traditional Toran Archway at Choice Points
    function renderChoiceMarkers(ctx, cameraX, choices) {
        choices.forEach(cp => {
            if (cp.passed) return;
            const sx = cp.worldX - cameraX;
            if (sx < -40 || sx > CONFIG.WIDTH + 40) return;

            // Carved Sandstone Pillars
            ctx.fillStyle = '#C4A060';
            ctx.fillRect(sx - 4, CONFIG.GROUND_Y - 65, 7, 65);
            ctx.fillRect(sx + 24, CONFIG.GROUND_Y - 65, 7, 65);

            // Pillar bases and capitals
            ctx.fillStyle = '#E8D0B0';
            ctx.fillRect(sx - 6, CONFIG.GROUND_Y - 68, 11, 4);
            ctx.fillRect(sx + 22, CONFIG.GROUND_Y - 68, 11, 4);

            // Toran Arch (Top Bar)
            ctx.fillStyle = '#B45309';
            ctx.fillRect(sx - 6, CONFIG.GROUND_Y - 72, 39, 5);

            // Auspicious Marigold Garland & Mango Leaves
            for (let i = 0; i < 6; i++) {
                const lx = sx - 4 + i * 6;
                ctx.fillStyle = i % 2 === 0 ? '#15803D' : '#F59E0B';
                ctx.fillRect(lx, CONFIG.GROUND_Y - 67, 4, 3);
            }

            // Divine Aura Glow
            const auraPulse = 0.5 + 0.5 * Math.sin(animTick * 0.12);
            ctx.fillStyle = `rgba(255, 215, 0, ${0.1 + 0.1 * auraPulse})`;
            ctx.fillRect(sx - 10, CONFIG.GROUND_Y - 75, 47, 75);

            // Sparkling question mark
            ctx.fillStyle = '#FFD700';
            ctx.font = 'bold 15px monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            ctx.fillText('?', sx + 13, CONFIG.GROUND_Y - 73);
        });
    }

    function renderProgressBar(ctx, worldX) {
        const bx = 45, by = 5, bw = CONFIG.WIDTH - 90, bh = 8;

        // Outer container
        ctx.fillStyle = 'rgba(7, 9, 22, 0.75)';
        ctx.fillRect(bx - 2, by - 2, bw + 4, bh + 4);
        ctx.fillStyle = '#4B5563';
        ctx.fillRect(bx - 1, by - 1, bw + 2, bh + 2);

        // Zone track segments
        CONFIG.ZONES.forEach(z => {
            const sx = bx + (z.start / CONFIG.TOTAL_DISTANCE) * bw;
            const sw = ((z.end - z.start) / CONFIG.TOTAL_DISTANCE) * bw;
            ctx.fillStyle = z.path;
            ctx.fillRect(sx, by, Math.max(0, sw - 1), bh);
        });

        // Temple icon at the end
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(bx + bw - 6, by - 3, 6, bh + 6);

        // Player marker
        const px = bx + Math.min(1, worldX / CONFIG.TOTAL_DISTANCE) * bw;
        ctx.fillStyle = '#EF4444';
        ctx.fillRect(px - 3, by - 3, 6, bh + 6);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(px - 1, by - 1, 2, bh + 2);

        // Current Zone indicator banner
        const cz = CONFIG.getZone(worldX);
        ctx.font = 'bold 7px "Segoe UI", Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillStyle = '#000';
        ctx.fillText(cz.nameGuj, CONFIG.WIDTH / 2 + 1, by + bh + 4);
        ctx.fillStyle = '#FFD700';
        ctx.fillText(cz.nameGuj, CONFIG.WIDTH / 2, by + bh + 3);
    }

    // ---- Public render ----

    function render(ctx, worldX, choices) {
        animTick++;
        const cameraX = Math.max(0, worldX - CONFIG.PLAYER_X);
        renderSky(ctx, cameraX);
        renderClouds(ctx, cameraX);
        renderDistantBG(ctx, cameraX);
        renderGround(ctx, cameraX);
        renderDecorations(ctx, cameraX);
        renderTempleEnd(ctx, cameraX);
        renderChoiceMarkers(ctx, cameraX, choices);
        renderProgressBar(ctx, worldX);
    }

    return { render };
})();
