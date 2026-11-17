// ============================================================
// GAME — Master game state machine, auto-run, lives & kiosk loop
// V1.2: auto-run between four lesson stages (js/stages.js), jump obstacles,
//       demon, temple stair climb
// ============================================================
const Game = (() => {
    let canvas, ctx;

    // --- State ---
    // 'title' | 'running' | 'stage' | 'temple_climb' | 'victory' | 'game_over'
    let state = 'title';
    let worldX = 0;
    let lives = 3;
    let stagesCleared = 0;
    let stateTimer = 0;
    let frameCount = 0;
    let lastTime = 0;
    let zoneTransName = '';
    let zoneTransTimer = 0;
    let lastZoneIdx = 0;
    let helpTextTimer = 0;
    let victoryRecorded = false;

    // ---- Init ----

    function init() {
        canvas = document.getElementById('gameCanvas');
        ctx = canvas.getContext('2d');
        canvas.width = CONFIG.WIDTH;
        canvas.height = CONFIG.HEIGHT;
        ctx.imageSmoothingEnabled = false;

        Input.init();
        Assets.init();
        UI.init(canvas);    // sizes the canvas to the window and wires the buttons

        lastTime = performance.now();
        requestAnimationFrame(loop);
    }

    function resetGame() {
        worldX = 0;
        lives = CONFIG.MAX_LIVES;
        stagesCleared = 0;
        stateTimer = 0;
        lastZoneIdx = 0;
        helpTextTimer = 0;
        victoryRecorded = false;

        Stages.close();
        Obstacles.init();
        Demon.init();
        Particles.reset();
        Player.setState('running');
        Sound.ensureContext();
        Sound.startBGM();
    }

    /** Ground height under the player's feet (sprite centre). */
    function playerGroundY() {
        return CONFIG.getGroundY(worldX + CONFIG.PLAYER_W / 2);
    }

    function loseLife(reason) {
        lives--;
        if (reason !== 'caught') Demon.onPlayerMistake();
        Sound.badChoice();

        // A wrong answer inside a stage: the stage screen shows the lost
        // heart and decides what happens next (see stageHooks).
        if (reason === 'stage') return;

        Player.startBlink();
        worldX = Math.max(0, worldX - CONFIG.ROLLBACK_DISTANCE);
        const gy = playerGroundY();
        Particles.emitChoiceConfetti(CONFIG.PLAYER_X + 20, gy - 30, false);

        if (lives <= 0) gameOver();
    }

    function gameOver() {
        Stages.close();
        state = 'game_over';
        stateTimer = 0;
        Sound.stopBGM();
    }

    /** Every stage gate with whether the player is already past it. */
    function gateList() {
        return CONFIG.STAGE_GATES.map((x, i) => ({
            worldX: x,
            passed: i < stagesCleared,
            kind: i === 0 ? 'alarm' : 'toran',
            label: 'STAGE ' + (i + 1)
        }));
    }

    // What the stage screens (js/stages.js) are allowed to ask of the game.
    const stageHooks = {
        getLives: () => lives,
        loseLife: () => { loseLife('stage'); return lives; },
        onGameOver: () => gameOver(),
        onClear: (index) => {
            stagesCleared = index + 1;
            state = 'running';
            stateTimer = 0;
            Player.setState('running');
            Demon.onPlayerGoodChoice();
            Particles.emitChoiceConfetti(CONFIG.PLAYER_X + 24, playerGroundY() - 40, true);
            if (index === 0) helpTextTimer = 160;   // jump tip before the first obstacle
        }
    };

    // ---- Update ----

    function update() {
        Input.update();
        frameCount++;

        // Secret escape sequence: [D, D, A] resets to Title screen
        // (ignored while a stage question is up: answering right, right, left
        // quickly would otherwise look exactly like the reset sequence)
        if (Input.consumeEscape() && state !== 'stage') {
            Stages.close();
            state = 'title';
            Sound.stopBGM();
            return;
        }

        // Kiosk Auto-Reset: 40 seconds of inactivity resets to Title screen
        if (state !== 'title' && Input.getIdleSeconds() > CONFIG.INACTIVITY_TIMEOUT_SECONDS) {
            Stages.close();
            state = 'title';
            Sound.stopBGM();
            return;
        }

        const currentZoneIndex = CONFIG.getZoneIndex(worldX);
        const cameraX = Math.max(0, worldX - CONFIG.PLAYER_X);
        Particles.update(cameraX, worldX, currentZoneIndex);
        Player.update();

        switch (state) {
            case 'title':
                if (Input.justPressed.jump || Input.justPressed.left || Input.justPressed.right) {
                    resetGame();
                    state = 'running';
                }
                break;

            case 'running':
                updateRunning();
                break;

            case 'stage':
                // Run is paused; the stage screens handle the buttons.
                Stages.update();
                break;

            case 'temple_climb':
                updateTempleClimb();
                break;

            case 'victory':
                stateTimer++;
                if (frameCount % 22 === 0) {
                    Particles.emitVictoryCelebration();
                }
                if (Input.justPressed.jump && stateTimer > 60) {
                    state = 'title';
                }
                break;

            case 'game_over':
                stateTimer++;
                if (Input.justPressed.jump && stateTimer > 50) {
                    state = 'title';
                }
                break;
        }

        if (zoneTransTimer > 0) zoneTransTimer--;
        updateButtons();
    }

    /** Tells the on-screen buttons what they do in the current state. */
    function updateButtons() {
        switch (state) {
            case 'title':      UI.setLabels(null, 'START', null); break;
            case 'running':    UI.setLabels(null, 'JUMP', null); break;
            case 'stage':      break;   // set by Stages.update()
            case 'victory':    UI.setLabels(null, stateTimer > 60 ? 'PLAY AGAIN' : null, null); break;
            case 'game_over':  UI.setLabels(null, stateTimer > 50 ? 'TRY AGAIN' : null, null); break;
            default:           UI.setLabels(null, null, null); break;
        }
        UI.update();
    }

    function updateRunning() {
        const speed = CONFIG.getSpeed(stagesCleared);
        worldX += speed;

        // Jump control
        if (Input.justPressed.jump && !Player.isJumping()) {
            Player.startJump();
        }

        const groundY = playerGroundY();

        // Check obstacle collision
        const hitObstacle = Obstacles.checkPlayerCollision(worldX, Player.getYOffset(), groundY);
        if (hitObstacle && !Player.isInvincible()) {
            loseLife('obstacle');
            if (state === 'game_over') return;
        }

        // Update demon
        const demonResult = Demon.update(worldX, stagesCleared, Player.isInvincible());
        if (demonResult === 'caught') {
            loseLife('caught');
            if (state === 'game_over') return;
        }

        if (helpTextTimer > 0) helpTextTimer--;

        // Zone transition announcements
        const currentZoneIndex = CONFIG.getZoneIndex(worldX);
        if (currentZoneIndex !== lastZoneIdx) {
            lastZoneIdx = currentZoneIndex;
            zoneTransName = CONFIG.ZONES[currentZoneIndex].nameGuj;
            zoneTransTimer = 85;
            Sound.templeBell();
        }

        // Reached the next stage gate: pause the run and open the stage
        if (stagesCleared < CONFIG.STAGE_GATES.length) {
            const gateX = CONFIG.STAGE_GATES[stagesCleared];
            if (worldX >= gateX) {
                worldX = gateX;
                state = 'stage';
                stateTimer = 0;
                Player.setState('idle');
                if (stagesCleared === 0) Sound.alarm();
                Stages.start(stagesCleared, stageHooks);
                return;
            }
        }

        // All stages cleared: the temple stair climb
        if (stagesCleared >= CONFIG.STAGE_GATES.length && worldX >= CONFIG.VICTORY_X) {
            worldX = CONFIG.VICTORY_X;
            state = 'temple_climb';
            stateTimer = 0;
            Player.setState('climbing');
            Demon.banish(); // Demon falls away and fades out
            Sound.templeBell();
            return;
        }
    }

    function updateTempleClimb() {
        stateTimer++;
        const before = playerGroundY();
        worldX += CONFIG.CLIMB_SPEED; // Majestic ascent pace
        Demon.update(worldX, stagesCleared, true);

        // One bell chime per stair climbed
        if (playerGroundY() !== before) {
            Sound.templeBell();
        }

        if (worldX >= CONFIG.TOTAL_DISTANCE) {
            worldX = CONFIG.TOTAL_DISTANCE;
            state = 'victory';
            stateTimer = 0;
            Player.setState('celebrating');
            Sound.stopBGM();
            Sound.victoryFanfare();
            if (!victoryRecorded) {
                CONFIG.recordCompletedRun();
                victoryRecorded = true;
            }
        }
    }

    // ---- Rendering ----

    function render() {
        ctx.clearRect(0, 0, CONFIG.WIDTH, CONFIG.HEIGHT);

        switch (state) {
            case 'title':
                renderTitle();
                break;
            case 'victory':
                renderGameWorld();
                renderVictory();
                break;
            case 'game_over':
                renderGameWorld();
                renderGameOver();
                break;
            default:
                renderGameWorld();
                break;
        }
    }

    function renderGameWorld() {
        const cameraX = Math.max(0, worldX - CONFIG.PLAYER_X);
        const playerScreenX = CONFIG.PLAYER_X;
        const groundY = playerGroundY();

        // 1. Parallax background, terrain & temple
        Background.render(
            ctx,
            worldX,
            gateList(),
            Demon.getDemonWorldX(),
            Demon.warningLevel,
            frameCount
        );

        // 2. Obstacles
        Obstacles.render(ctx, cameraX, CONFIG.getGroundY, frameCount);

        // 3. Demon chaser
        Demon.render(ctx, cameraX, CONFIG.getGroundY);

        // 4. Player character
        Player.render(ctx, playerScreenX, groundY);

        // 5. Particle system
        Particles.render(ctx);

        // 6. HUD (Lives, Score, Zone Banner)
        renderHUD();

        // 7. Jump tip (shown after Stage 1, before the first obstacle)
        if (helpTextTimer > 0 && state === 'running') {
            const alpha = helpTextTimer > 120 ? Math.min(1, (160 - helpTextTimer) / 40) : helpTextTimer / 120;
            ctx.save();
            ctx.globalAlpha = alpha * 0.92;
            ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
            ctx.fillRect(CONFIG.WIDTH / 2 - 190, 88, 380, 32);
            ctx.fillStyle = '#38BDF8';
            ctx.fillRect(CONFIG.WIDTH / 2 - 190, 88, 380, 2);
            ctx.fillRect(CONFIG.WIDTH / 2 - 190, 118, 380, 2);

            ctx.font = 'bold 14px monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#FFD700';
            ctx.fillText('Press the JUMP button to jump!  ⬆️', CONFIG.WIDTH / 2, 104);
            ctx.restore();
        }
    }

    // ---- HUD ----

    function renderHUD() {
        // --- Lives (Top-Left: 3 Hearts) ---
        const heartStartX = 24, heartY = 22, heartSize = 22, heartGap = 30;
        for (let i = 0; i < CONFIG.MAX_LIVES; i++) {
            const hx = heartStartX + i * heartGap;
            const isFilled = i < lives;
            drawPixelHeart(ctx, hx, heartY, heartSize, isFilled);
        }

        // --- Score Box (Top-Right) ---
        const scoreW = 160, scoreH = 34;
        const scoreX = CONFIG.WIDTH - scoreW - 24, scoreY = 16;
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.fillRect(scoreX, scoreY, scoreW, scoreH);
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(scoreX, scoreY, scoreW, 2);
        ctx.fillRect(scoreX, scoreY + scoreH - 2, scoreW, 2);

        ctx.font = 'bold 13px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(`STAGE ${Math.min(stagesCleared + 1, Stages.count)} / ${Stages.count}`, scoreX + scoreW / 2, scoreY + scoreH / 2);

        // --- Mute indicator (under the hearts) ---
        if (Sound.isMuted) {
            ctx.font = '10px monospace';
            ctx.textAlign = 'left';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.fillText('[M] Sound: OFF', 24, 58);
        }

        // --- Zone Announcement Banner ---
        if (zoneTransTimer > 0) {
            const alpha = zoneTransTimer > 60 ? Math.min(1, (85 - zoneTransTimer) / 25) : zoneTransTimer / 60;
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
            ctx.fillRect(CONFIG.WIDTH / 2 - 220, CONFIG.HEIGHT / 2 - 60, 440, 44);
            ctx.fillStyle = '#FFD700';
            ctx.fillRect(CONFIG.WIDTH / 2 - 220, CONFIG.HEIGHT / 2 - 60, 440, 3);
            ctx.fillRect(CONFIG.WIDTH / 2 - 220, CONFIG.HEIGHT / 2 - 19, 440, 3);

            ctx.font = 'bold 18px "Segoe UI", Arial, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#FFD700';
            ctx.fillText(zoneTransName, CONFIG.WIDTH / 2, CONFIG.HEIGHT / 2 - 38);
            ctx.restore();
        }
    }

    function drawPixelHeart(ctx, x, y, size, filled) {
        ctx.save();
        ctx.fillStyle = filled ? '#EF4444' : '#374151';
        const s = size / 10;
        // 8-bit chunky heart
        ctx.fillRect(x + 2 * s, y, 2 * s, s);
        ctx.fillRect(x + 6 * s, y, 2 * s, s);
        ctx.fillRect(x + s, y + s, 4 * s, s);
        ctx.fillRect(x + 5 * s, y + s, 4 * s, s);
        ctx.fillRect(x, y + 2 * s, 10 * s, 3 * s);
        ctx.fillRect(x + s, y + 5 * s, 8 * s, s);
        ctx.fillRect(x + 2 * s, y + 6 * s, 6 * s, s);
        ctx.fillRect(x + 3 * s, y + 7 * s, 4 * s, s);
        ctx.fillRect(x + 4 * s, y + 8 * s, 2 * s, s);

        if (filled) {
            // Heart shine dot
            ctx.fillStyle = '#FECACA';
            ctx.fillRect(x + 2 * s, y + 2 * s, s, s);
        }
        ctx.restore();
    }

    // ---- Title Screen ----

    function renderTitle() {
        const grad = ctx.createLinearGradient(0, 0, 0, CONFIG.HEIGHT);
        grad.addColorStop(0, '#090A1A');
        grad.addColorStop(0.5, '#1E1535');
        grad.addColorStop(1, '#2E192D');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, CONFIG.WIDTH, CONFIG.HEIGHT);

        // Twinkling stars
        ctx.fillStyle = '#FFF';
        for (let i = 0; i < 55; i++) {
            const sx = (i * 97 + 23) % CONFIG.WIDTH;
            const sy = (i * 61 + 11) % (CONFIG.HEIGHT - 80);
            ctx.globalAlpha = 0.2 + 0.6 * Math.abs(Math.sin(frameCount * 0.04 + i * 1.3));
            ctx.fillRect(sx, sy, 2 + (i % 3 === 0 ? 1 : 0), 2 + (i % 5 === 0 ? 1 : 0));
        }
        ctx.globalAlpha = 1;

        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';

        // Organization
        ctx.font = 'bold 15px "Segoe UI", Arial, sans-serif';
        ctx.fillStyle = '#F59E0B';
        ctx.fillText('॥ સ્વામિનારાયણ હરિપ્રબોધમ્ પરિવાર ॥', CONFIG.WIDTH / 2, 38);

        // Main Title
        ctx.font = 'bold 44px monospace';
        ctx.fillStyle = '#000';
        ctx.fillText('ANNAKUT', CONFIG.WIDTH / 2 + 3, 72);
        ctx.fillStyle = '#FFD700';
        ctx.fillText('ANNAKUT', CONFIG.WIDTH / 2, 70);

        // Subtitle
        ctx.font = 'bold 24px monospace';
        ctx.fillStyle = '#000';
        ctx.fillText('FAMILY PATH — પરિવાર પથ', CONFIG.WIDTH / 2 + 2, 126);
        ctx.fillStyle = '#FB923C';
        ctx.fillText('FAMILY PATH — પરિવાર પથ', CONFIG.WIDTH / 2, 124);

        // Golden divider
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(CONFIG.WIDTH / 2 - 180, 162, 360, 3);

        // Theme Motto
        ctx.font = 'italic 16px "Segoe UI", Arial, sans-serif';
        ctx.fillStyle = '#E2E8F0';
        ctx.fillText('"સંપ, સુહ્રદભાવ અને એકતા એ જ સુખી પરિવારનો પાયો"', CONFIG.WIDTH / 2, 178);
        ctx.font = '14px "Segoe UI", Arial, sans-serif';
        ctx.fillStyle = '#94A3B8';
        ctx.fillText('"Harmony & Right Choices Lead to Family Happiness"', CONFIG.WIDTH / 2, 204);

        // Controls box
        const bw = 540, bh = 54;
        const bx = CONFIG.WIDTH / 2 - bw / 2, by = 240;
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.fillRect(bx, by, bw, bh);
        ctx.fillStyle = '#38BDF8';
        ctx.fillRect(bx, by, bw, 2);
        ctx.fillRect(bx, by + bh - 2, bw, 2);

        ctx.font = 'bold 15px monospace';
        ctx.fillStyle = '#38BDF8';
        ctx.fillText('Left [A / 1]    Jump [S / 2 / Center]    Right [D / 3]', CONFIG.WIDTH / 2, by + 10);
        ctx.font = '12px monospace';
        ctx.fillStyle = '#94A3B8';
        ctx.fillText('[F] Fullscreen     [M] Sound on/off', CONFIG.WIDTH / 2, by + 33);

        // Start Prompt
        if (Math.sin(frameCount * 0.1) > -0.2) {
            ctx.font = 'bold 20px monospace';
            ctx.fillStyle = '#FFD700';
            ctx.fillText('>> Press START to begin <<', CONFIG.WIDTH / 2, 330);
        }

        // Features badge
        ctx.font = '12px "Segoe UI", Arial, sans-serif';
        ctx.fillStyle = '#CBD5E1';
        ctx.fillText('⚡ 4 Stages  •  3 Lives  •  Jump the Obstacles  •  Outrun the Distraction Demon', CONFIG.WIDTH / 2, 390);

        // Booth pilgrim count
        const runs = CONFIG.getBoothRuns();
        ctx.font = '13px "Segoe UI", Arial, sans-serif';
        ctx.fillStyle = '#F59E0B';
        ctx.fillText(`Booth Pilgrims Completed Today: ${runs}`, CONFIG.WIDTH / 2, 424);
    }

    // ---- Victory Screen ----

    function renderVictory() {
        const alpha = Math.min(0.88, stateTimer / 60);
        ctx.fillStyle = `rgba(10, 8, 25, ${alpha})`;
        ctx.fillRect(0, 0, CONFIG.WIDTH, CONFIG.HEIGHT);

        if (stateTimer < 18) return;

        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';

        // Victory Title
        ctx.font = 'bold 36px "Segoe UI", Arial, sans-serif';
        ctx.fillStyle = '#000';
        ctx.fillText('જય સ્વામિનારાયણ!', CONFIG.WIDTH / 2 + 2, 42);
        ctx.fillStyle = '#FFD700';
        ctx.fillText('જય સ્વામિનારાયણ!', CONFIG.WIDTH / 2, 40);

        ctx.font = 'bold 20px monospace';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText('YOU CLIMBED THE STEPS & REACHED THE SACRED MANDIR!', CONFIG.WIDTH / 2, 90);

        // Score Badge
        ctx.font = 'bold 22px monospace';
        if (lives === 3) {
            ctx.fillStyle = '#00FF88';
            ctx.fillText(`🌟 PERFECT PILGRIMAGE: ALL ${Stages.count} STAGES, 3 LIVES LEFT! 🌟`, CONFIG.WIDTH / 2, 130);
        } else {
            ctx.fillStyle = '#FFD700';
            ctx.fillText(`PILGRIMAGE COMPLETED: ALL ${Stages.count} STAGES (${lives} ${lives === 1 ? 'LIFE' : 'LIVES'} LEFT)`, CONFIG.WIDTH / 2, 130);
        }

        // Family Blessing Message
        ctx.font = 'bold 18px "Segoe UI", Arial, sans-serif';
        ctx.fillStyle = '#FDE68A';
        ctx.fillText('પરિવાર સાથે સત્સંગ, પ્રેમ અને સુહ્રદભાવથી', CONFIG.WIDTH / 2, 180);
        ctx.fillText('જીવનમાં સદા આનંદ, સુખ અને શાંતિ રહે છે.', CONFIG.WIDTH / 2, 210);

        ctx.font = 'italic 15px "Segoe UI", Arial, sans-serif';
        ctx.fillStyle = '#CBD5E1';
        ctx.fillText('"When family stays united in faith, every distraction is conquered."', CONFIG.WIDTH / 2, 250);

        // Play Again Prompt
        if (stateTimer > 60 && Math.sin(frameCount * 0.09) > -0.2) {
            ctx.font = 'bold 18px monospace';
            ctx.fillStyle = '#FFFFFF';
            ctx.fillText('>> Press PLAY AGAIN for the next pilgrim <<', CONFIG.WIDTH / 2, 410);
        }
    }

    // ---- Game Over Screen ----

    function renderGameOver() {
        const alpha = Math.min(0.9, stateTimer / 50);
        ctx.fillStyle = `rgba(25, 10, 15, ${alpha})`;
        ctx.fillRect(0, 0, CONFIG.WIDTH, CONFIG.HEIGHT);

        if (stateTimer < 15) return;

        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';

        ctx.font = 'bold 36px monospace';
        ctx.fillStyle = '#EF4444';
        ctx.fillText('GAME OVER', CONFIG.WIDTH / 2, 60);

        ctx.font = 'bold 18px "Segoe UI", Arial, sans-serif';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(`Stages Cleared: ${stagesCleared} / ${Stages.count}`, CONFIG.WIDTH / 2, 120);

        ctx.font = 'bold 18px "Segoe UI", Arial, sans-serif';
        ctx.fillStyle = '#FDE68A';
        ctx.fillText('દરેક ચૂક આપણને શીખવે છે. ફરી પ્રયત્ન કરો!', CONFIG.WIDTH / 2, 175);
        ctx.font = '15px "Segoe UI", Arial, sans-serif';
        ctx.fillStyle = '#CBD5E1';
        ctx.fillText('Overcome distractions and stay focused on family and values.', CONFIG.WIDTH / 2, 205);

        if (stateTimer > 45 && Math.sin(frameCount * 0.09) > -0.2) {
            ctx.font = 'bold 18px monospace';
            ctx.fillStyle = '#FFD700';
            ctx.fillText('>> Press TRY AGAIN <<', CONFIG.WIDTH / 2, 400);
        }
    }

    // ---- Game Loop ----

    function loop(timestamp) {
        requestAnimationFrame(loop);
        const elapsed = timestamp - lastTime;
        if (elapsed < 1000 / 30) return;
        lastTime = timestamp - (elapsed % (1000 / 30));
        update();
        render();
    }

    window.addEventListener('load', init);

    return {};
})();
