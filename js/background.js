// ============================================================
// BACKGROUND — Sky, ground, zone decorations, parallax, temple
// V1: 960×540 canvas, terrain slopes, temple stairs, demon bar, warning pulse
// ============================================================
const Background = (() => {
    let animTick = 0;

    // ---- Small drawing helpers (all coords 2× V0) ----

    function drawBush(ctx, x, y, color) {
        ctx.fillStyle = color || '#2D6A1E';
        ctx.fillRect(x, y - 28, 36, 28);
        ctx.fillRect(x + 6, y - 36, 24, 8);
        ctx.fillRect(x + 10, y - 40, 16, 4);
        ctx.fillStyle = shadeColor(color || '#2D6A1E', -25);
        ctx.fillRect(x + 4, y - 16, 14, 16);
    }

    function drawTree(ctx, x, y, leafColor) {
        ctx.fillStyle = '#6B4226';
        ctx.fillRect(x + 16, y - 70, 12, 70);
        ctx.fillStyle = leafColor || '#2D6A1E';
        ctx.fillRect(x, y - 110, 44, 44);
        ctx.fillRect(x + 6, y - 120, 32, 10);
        ctx.fillRect(x - 4, y - 96, 52, 16);
        ctx.fillStyle = shadeColor(leafColor || '#2D6A1E', -15);
        ctx.fillRect(x + 4, y - 84, 20, 20);
    }

    function drawFlower(ctx, x, y, color) {
        ctx.fillStyle = '#2A6A1E';
        ctx.fillRect(x + 2, y - 14, 4, 14);
        ctx.fillStyle = color;
        ctx.fillRect(x - 2, y - 22, 12, 10);
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(x + 2, y - 20, 4, 4);
    }

    function drawPillar(ctx, x, y) {
        ctx.fillStyle = '#D4B896';
        ctx.fillRect(x, y - 144, 28, 144);
        ctx.fillStyle = '#E8D0B0';
        ctx.fillRect(x - 6, y - 156, 40, 16);
        ctx.fillRect(x - 2, y - 162, 32, 6);
        ctx.fillStyle = '#C4A080';
        ctx.fillRect(x - 4, y - 8, 36, 12);
        ctx.fillStyle = '#B49070';
        ctx.fillRect(x + 8, y - 128, 4, 104);
        ctx.fillRect(x + 16, y - 128, 4, 104);
    }

    function drawFountain(ctx, x, y) {
        ctx.fillStyle = '#4AA8D8';
        ctx.fillRect(x - 16, y - 16, 72, 16);
        ctx.fillStyle = '#A0A0A0';
        ctx.fillRect(x - 20, y - 20, 80, 6);
        ctx.fillRect(x - 20, y - 2, 80, 6);
        ctx.fillStyle = '#B0B0B0';
        ctx.fillRect(x + 14, y - 56, 12, 40);
        ctx.fillStyle = '#88D8F8';
        ctx.fillRect(x + 16, y - 66, 8, 10);
        ctx.fillRect(x + 10, y - 72, 4, 6);
        ctx.fillRect(x + 26, y - 72, 4, 6);
        ctx.fillRect(x + 6, y - 60, 4, 4);
        ctx.fillRect(x + 30, y - 60, 4, 4);
        const wave = Math.sin(animTick * 0.15 + x * 0.01) * 4;
        ctx.fillStyle = '#E0F7FA';
        ctx.fillRect(x - 8 + wave, y - 10, 16, 2);
    }

    function drawTemple(ctx, x, y) {
        const w = 280, h = 210;

        // Base steps
        ctx.fillStyle = '#E8D0B0';
        ctx.fillRect(x - 30, y - 30, w + 60, 30);
        ctx.fillRect(x - 20, y - 44, w + 40, 14);
        ctx.fillRect(x - 10, y - 56, w + 20, 12);
        ctx.fillRect(x, y - 64, w, 8);

        // Diyas on steps
        for (let i = 0; i < 8; i++) {
            const dx = x - 10 + i * 36;
            ctx.fillStyle = '#B45309';
            ctx.fillRect(dx, y - 36, 10, 6);
            ctx.fillStyle = '#F59E0B';
            ctx.fillRect(dx + 2, y - 42, 6, 6);
            ctx.fillStyle = '#FFF';
            ctx.fillRect(dx + 4, y - 40, 2, 2);
        }

        // Main body
        ctx.fillStyle = '#D4B896';
        ctx.fillRect(x + 20, y - 144, w - 40, 80);

        // Entrance arch
        ctx.fillStyle = '#3E2723';
        ctx.fillRect(x + 108, y - 124, 56, 60);
        ctx.fillStyle = '#8D6E63';
        ctx.fillRect(x + 108, y - 130, 56, 8);

        // Golden murti glow inside entrance
        const glowPulse = 0.5 + 0.5 * Math.sin(animTick * 0.1);
        ctx.fillStyle = `rgba(255, 215, 0, ${0.4 + 0.3 * glowPulse})`;
        ctx.fillRect(x + 128, y - 104, 16, 32);

        // Main dome (Shikhara)
        ctx.fillStyle = '#E8C898';
        ctx.fillRect(x + 70, y - 176, 132, 32);
        ctx.fillRect(x + 82, y - 192, 108, 16);
        ctx.fillRect(x + 94, y - 204, 84, 12);
        ctx.fillRect(x + 106, y - 214, 60, 10);
        ctx.fillRect(x + 118, y - 222, 36, 8);

        // Side towers
        ctx.fillStyle = '#D4B090';
        ctx.fillRect(x + 10, y - 168, 36, 104);
        ctx.fillRect(x + w - 46, y - 168, 36, 104);

        // Side domes
        ctx.fillStyle = '#E8C898';
        ctx.fillRect(x + 6, y - 184, 44, 16);
        ctx.fillRect(x + 12, y - 194, 32, 10);
        ctx.fillRect(x + w - 50, y - 184, 44, 16);
        ctx.fillRect(x + w - 44, y - 194, 32, 10);

        // Golden Kalash & Spires
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(x + 132, y - 238, 8, 20);
        ctx.fillRect(x + 134, y - 246, 4, 8);
        ctx.fillRect(x + 26, y - 206, 8, 16);
        ctx.fillRect(x + w - 34, y - 206, 8, 16);

        // Pillars in front of entrance
        ctx.fillStyle = '#C4A880';
        for (let i = 0; i < 4; i++) {
            ctx.fillRect(x + 44 + i * 56, y - 136, 10, 72);
        }

        // Gold trim
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(x + 20, y - 144, w - 40, 4);

        // Fluttering Saffron Dharmadhwaja (Flag)
        const flagWave = Math.round(Math.sin(animTick * 0.2) * 4);
        ctx.fillStyle = '#666';
        ctx.fillRect(x + 136, y - 264, 4, 24);
        ctx.fillStyle = '#FF6B00';
        ctx.fillRect(x + 140, y - 264 + flagWave, 24, 12);
        ctx.fillRect(x + 140, y - 258 + flagWave, 16, 8);
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
        const spacing = 280;
        const start = Math.floor(offset / spacing) - 1;
        for (let i = start; i < start + 7; i++) {
            const bx = i * spacing + ((i * 73) % 80) - 40;
            const sx = bx - offset;
            if (sx < -100 || sx > CONFIG.WIDTH + 20) continue;
            const cy = 24 + ((i * 37 + 11) % 90);
            const w = 44 + ((i * 53) % 36);
            ctx.fillRect(sx, cy, w, 12);
            ctx.fillRect(sx + 8, cy - 6, w - 16, 8);
            ctx.fillRect(sx + 4, cy + 10, w - 8, 6);
        }
    }

    function renderDistantBG(ctx, cameraX) {
        const parallax = 0.2;
        const offset = cameraX * parallax;
        ctx.fillStyle = 'rgba(160,140,110,0.22)';
        const spacing = 560;
        const start = Math.floor(offset / spacing) - 1;
        for (let i = start; i < start + 5; i++) {
            const bx = i * spacing + 160;
            const sx = bx - offset;
            if (sx < -140 || sx > CONFIG.WIDTH + 80) continue;
            const h = 56 + ((i * 47 + 7) % 44);
            const dy = CONFIG.GROUND_Y - 50;
            ctx.fillRect(sx, dy - h, 56, h);
            ctx.fillRect(sx + 8, dy - h - 14, 40, 14);
            ctx.fillRect(sx + 14, dy - h - 26, 28, 12);
            ctx.fillRect(sx + 20, dy - h - 34, 16, 8);
            if (i % 2 === 0) {
                ctx.fillRect(sx + 68, dy - h + 20, 28, h - 20);
                ctx.fillRect(sx + 72, dy - h + 8, 20, 12);
            }
        }
    }

    // Terrain-aware ground rendering with pixel-art slopes
    function renderGround(ctx, cameraX) {
        // Determine terrain offset at a given worldX using CONFIG.getGroundY
        // We draw the ground surface pixel-by-pixel at correct height
        const GY = CONFIG.GROUND_Y;
        const HT = CONFIG.HEIGHT;

        // Draw per-pixel terrain columns for smooth slope visual
        // For performance, we step by 2px
        const step = 2;
        const left = Math.floor(cameraX);
        const right = Math.ceil(cameraX + CONFIG.WIDTH) + step;

        for (let wx = left; wx < right; wx += step) {
            const sx = wx - cameraX;
            if (sx > CONFIG.WIDTH) break;
            const groundY = (typeof CONFIG.getGroundY === 'function') ? CONFIG.getGroundY(wx) : GY;
            const zi = CONFIG.getZoneIndex(wx);
            const zone = CONFIG.ZONES[zi];
            const drawW = step + 1; // slight overlap to avoid gaps

            // Ground fill below surface
            ctx.fillStyle = zone.ground;
            ctx.fillRect(sx, groundY, drawW, HT - groundY);

            // Ground dark top edge
            ctx.fillStyle = zone.groundDark;
            ctx.fillRect(sx, groundY, drawW, 6);

            // Path strip
            ctx.fillStyle = zone.path;
            ctx.fillRect(sx, groundY + 20, drawW, 36);
            ctx.fillStyle = zone.pathDark;
            ctx.fillRect(sx, groundY + 18, drawW, 4);
            ctx.fillRect(sx, groundY + 54, drawW, 4);
        }

        // Stepping stone tiles on path
        ctx.fillStyle = 'rgba(255,255,255,0.18)';
        const ds = Math.floor(cameraX / 40) * 40;
        for (let wx = ds; wx < cameraX + CONFIG.WIDTH; wx += 40) {
            const groundY = (typeof CONFIG.getGroundY === 'function') ? CONFIG.getGroundY(wx) : GY;
            ctx.fillRect(wx - cameraX, groundY + 36, 20, 4);
        }
    }

    function renderDecorations(ctx, cameraX) {
        const left = Math.floor(cameraX / 80) * 80 - 160;
        const right = cameraX + CONFIG.WIDTH + 160;

        for (let wx = left; wx < right; wx += 80) {
            if (wx < -80) continue;
            const zi = CONFIG.getZoneIndex(wx);
            const zone = CONFIG.ZONES[zi];
            const sx = wx - cameraX;
            const groundY = (typeof CONFIG.getGroundY === 'function') ? CONFIG.getGroundY(wx) : CONFIG.GROUND_Y;

            switch (zi) {
                case 0: // Garden Gate
                    if (wx >= 0 && wx % 240 === 0) drawBush(ctx, sx + 10, groundY, zone.treeColor);
                    if (wx >= 0 && wx % 160 === 0) {
                        const fc = zone.flowerColors[Math.abs(wx / 160) % zone.flowerColors.length];
                        drawFlower(ctx, sx + 32, groundY + 12, fc);
                        drawFlower(ctx, sx + 52, groundY + 14, zone.flowerColors[(Math.abs(wx / 160) + 2) % zone.flowerColors.length]);
                    }
                    if (wx >= 0 && wx % 480 === 0) drawTree(ctx, sx, groundY, zone.treeColor);
                    break;

                case 1: // Flower Gardens
                    if (wx % 120 === 0) {
                        const fc = zone.flowerColors[Math.abs(wx / 120) % zone.flowerColors.length];
                        for (let f = 0; f < 4; f++) drawFlower(ctx, sx + f * 16 + 4, groundY + 8 + (f % 2) * 2, fc);
                    }
                    if (wx % 400 === 0) {
                        ctx.fillStyle = zone.treeColor;
                        ctx.fillRect(sx + 4, groundY - 44, 32, 44);
                        ctx.fillRect(sx + 10, groundY - 56, 20, 12);
                        ctx.fillRect(sx + 14, groundY - 62, 12, 6);
                    }
                    if (wx % 560 === 0) drawTree(ctx, sx + 20, groundY, zone.treeColor);
                    break;

                case 2: // Water Features
                    if (wx % 400 === 0) drawFountain(ctx, sx + 24, groundY);
                    if (wx % 240 === 0 && wx % 400 !== 0) {
                        ctx.fillStyle = zone.waterColor || '#4AA8D8';
                        ctx.fillRect(sx, groundY + 64, 56, 16);
                        ctx.fillStyle = zone.waterLight || '#6BC8F0';
                        ctx.fillRect(sx + 6, groundY + 66, 12, 4);
                        ctx.fillRect(sx + 28, groundY + 70, 16, 4);
                        ctx.fillStyle = '#888';
                        ctx.fillRect(sx - 2, groundY + 60, 60, 4);
                        ctx.fillRect(sx - 2, groundY + 80, 60, 4);
                    }
                    break;

                case 3: // Pillar Pathway
                    if (wx % 240 === 0) drawPillar(ctx, sx + 24, groundY);
                    if (wx % 480 === 0) {
                        ctx.fillStyle = '#D4B896';
                        ctx.fillRect(sx + 24, groundY - 164, 240, 8);
                        ctx.fillStyle = '#C4A880';
                        ctx.fillRect(sx + 24, groundY - 156, 240, 4);
                    }
                    break;

                case 4: // Temple approach with lamps
                    if (wx % 240 === 0 && wx < 2620) {
                        ctx.fillStyle = '#B49070';
                        ctx.fillRect(sx + 32, groundY - 84, 8, 84);
                        ctx.fillStyle = '#FFD700';
                        ctx.fillRect(sx + 26, groundY - 98, 20, 18);
                        ctx.fillStyle = '#FFA500';
                        ctx.fillRect(sx + 30, groundY - 94, 12, 10);
                    }
                    break;
            }
        }
    }

    // Temple stairs at worldX=2620
    function renderStairs(ctx, cameraX) {
        const stairsWorldX = 2620;
        const sx = stairsWorldX - cameraX;
        if (sx > CONFIG.WIDTH + 50 || sx < -300) return;

        const GY = CONFIG.GROUND_Y;
        // 4 steps: each 60px wide narrower, 40px tall
        // Step widths: 240, 160, 100, 60
        const stepWidths = [240, 160, 100, 60];
        const stepH = 40;

        for (let i = 0; i < 4; i++) {
            const sw = stepWidths[i];
            const xOffset = (240 - sw) / 2; // center narrower steps
            const stepX = sx + xOffset;
            const stepY = GY - stepH * (i + 1);

            ctx.fillStyle = '#F0E8D8';
            ctx.fillRect(stepX, stepY, sw, stepH);

            // Gold top edge
            ctx.fillStyle = '#FFD700';
            ctx.fillRect(stepX, stepY, sw, 4);

            // Shadow on bottom of each step face
            ctx.fillStyle = 'rgba(0,0,0,0.12)';
            ctx.fillRect(stepX, stepY + stepH - 4, sw, 4);

            // Side edge highlight
            ctx.fillStyle = 'rgba(255,255,255,0.3)';
            ctx.fillRect(stepX, stepY + 4, 4, stepH - 4);
        }
    }

    function renderTempleEnd(ctx, cameraX) {
        // Temple drawn at worldX ~2550 (adjusted for V1 scale)
        const templeX = 2560;
        const sx = templeX - cameraX;
        if (sx < CONFIG.WIDTH + 60 && sx > -320) {
            drawTemple(ctx, sx, CONFIG.GROUND_Y);
        }
    }

    // Traditional Toran Archway at Choice Points (2× V0)
    function renderChoiceMarkers(ctx, cameraX, choices) {
        choices.forEach(cp => {
            if (cp.passed) return;
            const sx = cp.worldX - cameraX;
            if (sx < -80 || sx > CONFIG.WIDTH + 80) return;

            // Carved Sandstone Pillars (2× V0)
            ctx.fillStyle = '#C4A060';
            ctx.fillRect(sx - 8, CONFIG.GROUND_Y - 130, 14, 130);
            ctx.fillRect(sx + 48, CONFIG.GROUND_Y - 130, 14, 130);

            // Pillar bases and capitals
            ctx.fillStyle = '#E8D0B0';
            ctx.fillRect(sx - 12, CONFIG.GROUND_Y - 136, 22, 8);
            ctx.fillRect(sx + 44, CONFIG.GROUND_Y - 136, 22, 8);

            // Toran Arch (Top Bar)
            ctx.fillStyle = '#B45309';
            ctx.fillRect(sx - 12, CONFIG.GROUND_Y - 144, 78, 10);

            // Auspicious Marigold Garland & Mango Leaves
            for (let i = 0; i < 12; i++) {
                const lx = sx - 8 + i * 6;
                ctx.fillStyle = i % 2 === 0 ? '#15803D' : '#F59E0B';
                ctx.fillRect(lx, CONFIG.GROUND_Y - 134, 8, 6);
            }

            // Divine Aura Glow
            const auraPulse = 0.5 + 0.5 * Math.sin(animTick * 0.12);
            ctx.fillStyle = `rgba(255, 215, 0, ${0.1 + 0.1 * auraPulse})`;
            ctx.fillRect(sx - 20, CONFIG.GROUND_Y - 150, 94, 150);

            // Sparkling question mark
            ctx.fillStyle = '#FFD700';
            ctx.font = 'bold 30px monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            ctx.fillText('?', sx + 27, CONFIG.GROUND_Y - 146);
        });
    }

    function renderProgressBar(ctx, worldX, demonWorldX) {
        const bx = 90, by = 8, bw = CONFIG.WIDTH - 180, bh = 14;

        // Outer container
        ctx.fillStyle = 'rgba(7, 9, 22, 0.75)';
        ctx.fillRect(bx - 3, by - 3, bw + 6, bh + 6);
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
        ctx.fillRect(bx + bw - 10, by - 5, 10, bh + 10);

        // Demon marker (dark purple triangle/arrow pointing right)
        if (typeof demonWorldX === 'number') {
            const dpx = bx + Math.min(1, demonWorldX / CONFIG.TOTAL_DISTANCE) * bw;
            ctx.fillStyle = '#7C3AED';
            // Triangle arrow pointing right
            ctx.beginPath();
            ctx.moveTo(dpx, by - 4);
            ctx.lineTo(dpx + 10, by + bh / 2);
            ctx.lineTo(dpx, by + bh + 4);
            ctx.closePath();
            ctx.fill();
        }

        // Player marker
        const px = bx + Math.min(1, worldX / CONFIG.TOTAL_DISTANCE) * bw;
        ctx.fillStyle = '#EF4444';
        ctx.fillRect(px - 5, by - 5, 10, bh + 10);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(px - 2, by - 2, 4, bh + 4);

        // Zone labels in Gujarati below bar
        ctx.font = 'bold 10px "Segoe UI", Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';

        // Current zone Gujarati label
        const cz = CONFIG.getZone(worldX);
        ctx.fillStyle = '#000';
        ctx.fillText(cz.nameGuj, CONFIG.WIDTH / 2 + 1, by + bh + 6);
        ctx.fillStyle = '#FFD700';
        ctx.fillText(cz.nameGuj, CONFIG.WIDTH / 2, by + bh + 5);
    }

    // Demon warning pulse: red glow on left edge
    function renderDemonWarning(ctx, warningLevel, frameCount) {
        if (!warningLevel || warningLevel < 1) return;
        const fc = frameCount || 0;
        let alpha;
        if (warningLevel === 1) {
            alpha = 0.08;
        } else {
            alpha = 0.08 + 0.12 * Math.abs(Math.sin(fc * 0.3));
        }
        const grad = ctx.createLinearGradient(0, 0, 160, 0);
        grad.addColorStop(0, `rgba(255,0,0,${alpha})`);
        grad.addColorStop(1, 'rgba(255,0,0,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 160, CONFIG.HEIGHT);
    }

    // ---- Public render ----

    function render(ctx, worldX, choices, demonWorldX, warningLevel, frameCount) {
        animTick++;
        const cameraX = Math.max(0, worldX - CONFIG.PLAYER_X);
        renderSky(ctx, cameraX);
        renderClouds(ctx, cameraX);
        renderDistantBG(ctx, cameraX);
        renderGround(ctx, cameraX);
        renderDecorations(ctx, cameraX);
        renderStairs(ctx, cameraX);
        renderTempleEnd(ctx, cameraX);
        renderChoiceMarkers(ctx, cameraX, choices || []);
        renderProgressBar(ctx, worldX, demonWorldX);
        renderDemonWarning(ctx, warningLevel, frameCount);
    }

    return { render };
})();
