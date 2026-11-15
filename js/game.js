// ============================================================
// GAME — Master game state machine, auto-run, lives & kiosk loop
// V1: 960×540 canvas, auto-run, jump obstacles, demon, temple climb
// ============================================================
const Game = (() => {
    let canvas, ctx;

    // --- State ---
    // 'title' | 'running' | 'choice' | 'moral_banner' | 'temple_climb' | 'victory' | 'game_over'
    let state = 'title';
    let worldX = 0;
    let lives = 3;
    let questionsAnswered = 0;
    let moralCp = null;
    let moralTimer = 0;
    let celebrationTimer = 0;
    let stateTimer = 0;
    let frameCount = 0;
    let lastTime = 0;
    let zoneTransName = '';
    let zoneTransTimer = 0;
    let lastZoneIdx = 0;
    let helpTextTimer = 160;
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
        resize();
        window.addEventListener('resize', resize);

        lastTime = performance.now();
        requestAnimationFrame(loop);
    }

    function resize() {
        const sx = window.innerWidth / CONFIG.WIDTH;
        const sy = window.innerHeight / CONFIG.HEIGHT;
        const s = Math.max(1, Math.floor(Math.min(sx, sy)));
        canvas.style.width = (CONFIG.WIDTH * s) + 'px';
        canvas.style.height = (CONFIG.HEIGHT * s) + 'px';
    }

    function resetGame() {
        worldX = 0;
        lives = CONFIG.MAX_LIVES;
        questionsAnswered = 0;
        moralCp = null;
        moralTimer = 0;
        celebrationTimer = 0;
        stateTimer = 0;
        lastZoneIdx = 0;
        helpTextTimer = 160;
        victoryRecorded = false;

        Choices.randomizeSides();
        Obstacles.init();
        Demon.init();
        Particles.reset();
        Player.setState('running');
        Sound.ensureContext();
        Sound.startBGM();
    }

    function loseLife() {
        lives--;
        Player.startBlink();
        Demon.onPlayerHit(worldX);
        worldX = Math.max(0, worldX - CONFIG.ROLLBACK_DISTANCE);
        Sound.badChoice();

        const gy = CONFIG.getGroundY(worldX);
        Particles.emitChoiceConfetti(CONFIG.PLAYER_X + 20, gy - 30, false);

        if (lives <= 0) {
            state = 'game_over';
            stateTimer = 0;
            Sound.stopBGM();
        }
    }

    // ---- Update ----

    function update() {
        Input.update();
        frameCount++;

        // Secret escape sequence: [D, D, A] resets to Title screen
        if (Input.consumeEscape()) {
            state = 'title';
            Sound.stopBGM();
            return;
        }

        // Kiosk Auto-Reset: 40 seconds of inactivity resets to Title screen
        if (state !== 'title' && Input.getIdleSeconds() > CONFIG.INACTIVITY_TIMEOUT_SECONDS) {
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
            case 'moral_banner':
                updateRunning();
                break;

            case 'choice':
                stateTimer++;
                // Choices locked until player answers Left (A) or Right (D)
                if (Input.justPressed.left) handleChoice('left');
                else if (Input.justPressed.right) handleChoice('right');
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
    }

    function updateRunning() {
        const speed = CONFIG.getSpeed(questionsAnswered);
        worldX += speed;

        // Jump control
        if (Input.justPressed.jump && !Player.isJumping()) {
            Player.startJump();
        }

        // Celebration timer decay back to running
        if (celebrationTimer > 0) {
            celebrationTimer--;
            if (celebrationTimer === 0 && !Player.isJumping()) {
                Player.setState('running');
            }
        }

        const groundY = CONFIG.getGroundY(worldX);

        // Check obstacle collision
        const hitObstacle = Obstacles.checkPlayerCollision(worldX, Player.getYOffset(), groundY);
        if (hitObstacle && !Player.isInvincible()) {
            loseLife();
            if (state === 'game_over') return;
        }

        // Update demon
        const demonResult = Demon.update(worldX, speed, questionsAnswered);
        if (demonResult === 'caught' && !Player.isInvincible()) {
            loseLife();
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

        // Check for next question gate
        const activeQuestions = Choices.getSelected();
        if (questionsAnswered < activeQuestions.length) {
            const nextQ = activeQuestions[questionsAnswered];
            if (worldX >= nextQ.worldX) {
                worldX = nextQ.worldX;
                state = 'choice';
                stateTimer = 0;
                Player.setState('running');
                Sound.choiceAppear();
                return;
            }
        }

        // Check for temple stairs climb trigger
        if (questionsAnswered >= 5 && worldX >= CONFIG.VICTORY_X) {
            worldX = CONFIG.VICTORY_X;
            state = 'temple_climb';
            stateTimer = 0;
            Player.setState('climbing');
            Demon.onPlayerGoodChoice(); // Demon retreats off-screen
            Sound.templeBell();
            return;
        }

        // Moral banner countdown (runs concurrently with running state)
        if (state === 'moral_banner') {
            moralTimer++;
            if (moralTimer >= CONFIG.FEEDBACK_FRAMES) {
                state = 'running';
                moralCp = null;
            }
        }
    }

    function updateTempleClimb() {
        stateTimer++;
        worldX += 1.4; // Majestic ascent pace

        if (stateTimer % 45 === 0) {
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

    function handleChoice(side) {
        const activeQuestions = Choices.getSelected();
        const cp = activeQuestions[questionsAnswered];
        if (!cp) return;

        const gy = CONFIG.getGroundY(worldX);

        if (side === cp.goodSide) {
            questionsAnswered++;
            cp.passed = true;
            moralCp = cp;
            moralTimer = 0;
            state = 'moral_banner';

            Player.setState('celebrating');
            celebrationTimer = 40;

            Sound.goodChoice();
            Demon.onPlayerGoodChoice();
            Particles.emitChoiceConfetti(CONFIG.PLAYER_X + 24, gy - 40, true);
        } else {
            loseLife();
            Sound.badChoice();
            Demon.onPlayerBadChoice();

            // Reposition the question gate further ahead so player must try it again
            cp.worldX = worldX + 320;
            Choices.randomizeOneSide(questionsAnswered);

            if (state !== 'game_over') {
                state = 'running';
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
        const groundY = CONFIG.getGroundY(worldX);

        // 1. Parallax background, terrain & temple
        Background.render(
            ctx,
            worldX,
            Choices.getSelected(),
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

        // 7. Dilemma / Choice UI
        if (state === 'choice') {
            const activeQuestions = Choices.getSelected();
            Choices.renderChoiceUI(ctx, activeQuestions[questionsAnswered], stateTimer);
        }

        // 8. 5-Second Moral Reflection Banner
        if (state === 'moral_banner' && moralCp) {
            Choices.renderMoralBanner(ctx, moralCp, moralTimer);
        }

        // 9. Jump tutorial prompt (first few seconds of game)
        if (helpTextTimer > 0 && (state === 'running' || state === 'moral_banner')) {
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
            ctx.fillText('Press [S / 2] or Center to JUMP!  ⬆️', CONFIG.WIDTH / 2, 104);
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
        ctx.fillText(`QUESTIONS: ${questionsAnswered} / 5`, scoreX + scoreW / 2, scoreY + scoreH / 2);

        // --- Controls / Booth Legend (Bottom-Left) ---
        ctx.font = '10px monospace';
        ctx.textAlign = 'left';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.fillText(Sound.isMuted ? '[M] Sound: OFF' : '[M] Sound: ON', 20, CONFIG.HEIGHT - 28);
        ctx.fillText('[F] Fullscreen  |  [D-D-A] Reset', 20, CONFIG.HEIGHT - 12);

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
        ctx.fillText('Left [A / 1]    Jump [S / 2 / Center]    Right [D / 3]', CONFIG.WIDTH / 2, by + 18);

        // Start Prompt
        if (Math.sin(frameCount * 0.1) > -0.2) {
            ctx.font = 'bold 20px monospace';
            ctx.fillStyle = '#FFD700';
            ctx.fillText('>> Press [S / 2] or Center Button to Start <<', CONFIG.WIDTH / 2, 330);
        }

        // Features badge
        ctx.font = '12px "Segoe UI", Arial, sans-serif';
        ctx.fillStyle = '#CBD5E1';
        ctx.fillText('⚡ Auto-Run  •  3 Lives  •  Jump Obstacles  •  Distraction Demon Chaser', CONFIG.WIDTH / 2, 390);

        // Booth pilgrim count
        const runs = CONFIG.getBoothRuns();
        ctx.font = '13px "Segoe UI", Arial, sans-serif';
        ctx.fillStyle = '#F59E0B';
        ctx.fillText(`Booth Pilgrims Completed Today: ${runs}`, CONFIG.WIDTH / 2, CONFIG.HEIGHT - 40);
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
            ctx.fillText(`🌟 PERFECT PILGRIMAGE: 5 / 5 (3 LIVES REMAINING)! 🌟`, CONFIG.WIDTH / 2, 130);
        } else {
            ctx.fillStyle = '#FFD700';
            ctx.fillText(`PILGRIMAGE COMPLETED: 5 / 5 (${lives} LIVES REMAINING)`, CONFIG.WIDTH / 2, 130);
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
            ctx.fillText('>> Press [S / 2] to Play Again for Next Pilgrim <<', CONFIG.WIDTH / 2, CONFIG.HEIGHT - 60);
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
        ctx.fillText(`Questions Answered: ${questionsAnswered} / 5`, CONFIG.WIDTH / 2, 120);

        ctx.font = 'bold 18px "Segoe UI", Arial, sans-serif';
        ctx.fillStyle = '#FDE68A';
        ctx.fillText('દરેક ચૂક આપણને શીખવે છે. ફરી પ્રયત્ન કરો!', CONFIG.WIDTH / 2, 175);
        ctx.font = '15px "Segoe UI", Arial, sans-serif';
        ctx.fillStyle = '#CBD5E1';
        ctx.fillText('Overcome distractions and stay focused on family and values.', CONFIG.WIDTH / 2, 205);

        if (stateTimer > 45 && Math.sin(frameCount * 0.09) > -0.2) {
            ctx.font = 'bold 18px monospace';
            ctx.fillStyle = '#FFD700';
            ctx.fillText('>> Press [S / 2] to Try Again <<', CONFIG.WIDTH / 2, CONFIG.HEIGHT - 80);
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
