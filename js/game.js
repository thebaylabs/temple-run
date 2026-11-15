// ============================================================
// GAME — Main loop, state machine, audio, particles & kiosk HUD
// ============================================================
const Game = (() => {
    let canvas, ctx;

    // --- State ---
    let state = 'title';  // title | walking | choice | celebration | wrong | rollback | victory
    let worldX = 0;
    let score = 0;
    let currentChoiceIndex = 0;
    let checkpoints = [0];
    let rollbackTarget = 0;
    let stateTimer = 0;
    let feedbackText = '';
    let feedbackSubText = '';
    let feedbackColor = '#FFF';
    let feedbackTimer = 0;
    let frameCount = 0;
    let lastTime = 0;
    let zoneTransName = '';
    let zoneTransTimer = 0;
    let lastZoneIdx = 0;
    let helpTextTimer = 140;
    let victoryRecorded = false;

    // ---- Init ----

    function init() {
        canvas = document.getElementById('gameCanvas');
        ctx = canvas.getContext('2d');
        canvas.width = CONFIG.WIDTH;
        canvas.height = CONFIG.HEIGHT;
        ctx.imageSmoothingEnabled = false;

        Input.init();
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
        score = 0;
        currentChoiceIndex = 0;
        checkpoints = [0];
        stateTimer = 0;
        feedbackTimer = 0;
        feedbackText = '';
        feedbackSubText = '';
        lastZoneIdx = 0;
        helpTextTimer = 140;
        victoryRecorded = false;
        Choices.randomizeSides();
        Player.setState('idle');
        Particles.reset();
        Sound.startBGM();
    }

    // ---- State machine ----

    function update() {
        Input.update();
        frameCount++;

        // Kiosk Auto-Reset: If no input for ~40 seconds during gameplay, reset to Title
        if (state !== 'title' && Input.getIdleSeconds() > 40) {
            state = 'title';
            Sound.stopBGM();
            return;
        }

        const currentZoneIndex = CONFIG.getZoneIndex(worldX);
        const cameraX = Math.max(0, worldX - CONFIG.PLAYER_X);
        Particles.update(cameraX, worldX, currentZoneIndex);

        switch (state) {
            case 'title':
                if (Input.justPressed.center || Input.justPressed.left || Input.justPressed.right) {
                    Sound.ensureContext();
                    state = 'walking';
                    resetGame();
                }
                break;

            case 'walking':
                if (Input.keys.center) {
                    worldX += CONFIG.WALK_SPEED;
                    if (Player.state !== 'walking') Player.setState('walking');
                } else {
                    if (Player.state !== 'idle') Player.setState('idle');
                }

                if (helpTextTimer > 0) helpTextTimer--;

                // Zone transition announcement
                if (currentZoneIndex !== lastZoneIdx) {
                    lastZoneIdx = currentZoneIndex;
                    zoneTransName = CONFIG.ZONES[currentZoneIndex].nameGuj;
                    zoneTransTimer = 80;
                    Sound.templeBell();
                }

                // Approaching a choice point
                if (currentChoiceIndex < Choices.data.length) {
                    const cp = Choices.data[currentChoiceIndex];
                    if (worldX >= cp.worldX) {
                        worldX = cp.worldX;
                        state = 'choice';
                        stateTimer = 0;
                        Player.setState('idle');
                        Choices.randomizeOneSide(currentChoiceIndex);
                        Sound.choiceAppear();
                    }
                }

                // Victory condition: Reached the Mandir!
                if (worldX >= CONFIG.VICTORY_X) {
                    worldX = CONFIG.VICTORY_X;
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
                break;

            case 'choice':
                stateTimer++;
                if (Input.justPressed.left) handleChoice('left');
                else if (Input.justPressed.right) handleChoice('right');
                break;

            case 'celebration':
                stateTimer--;
                if (stateTimer <= 0) {
                    state = 'walking';
                    Player.setState('idle');
                }
                break;

            case 'wrong':
                stateTimer--;
                if (stateTimer <= 0) {
                    state = 'rollback';
                    rollbackTarget = checkpoints[checkpoints.length - 1];
                    Sound.rollback();
                }
                break;

            case 'rollback':
                worldX -= CONFIG.ROLLBACK_SPEED;
                if (frameCount % 6 === 0) {
                    Sound.rollback();
                }
                if (worldX <= rollbackTarget) {
                    worldX = rollbackTarget;
                    state = 'walking';
                    Player.setState('idle');
                    lastZoneIdx = CONFIG.getZoneIndex(worldX);
                }
                break;

            case 'victory':
                stateTimer++;
                // Continuous fireworks on victory screen
                if (frameCount % 24 === 0) {
                    Particles.emitVictoryCelebration();
                }
                if (Input.justPressed.center && stateTimer > 80) {
                    state = 'title';
                }
                break;
        }

        if (feedbackTimer > 0) feedbackTimer--;
        if (zoneTransTimer > 0) zoneTransTimer--;

        Player.update();
    }

    function handleChoice(side) {
        const cp = Choices.data[currentChoiceIndex];
        const playerScreenX = CONFIG.PLAYER_X;

        if (side === cp.goodSide) {
            score++;
            cp.passed = true;
            checkpoints.push(worldX);
            currentChoiceIndex++;
            state = 'celebration';
            stateTimer = CONFIG.CELEBRATION_FRAMES;
            Player.setState('celebrating');

            feedbackText = 'Great Choice! સાચો નિર્ણય!';
            feedbackSubText = cp.moral;
            feedbackColor = '#00FF88';
            feedbackTimer = CONFIG.FEEDBACK_FRAMES;

            Sound.goodChoice();
            Particles.emitChoiceConfetti(playerScreenX + 10, CONFIG.GROUND_Y - 24, true);
        } else {
            state = 'wrong';
            stateTimer = CONFIG.WRONG_PAUSE_FRAMES;
            Player.setState('stumbling');

            feedbackText = 'Wrong Choice! ફરી પ્રયત્ન કરો!';
            feedbackSubText = 'Think about family harmony & values.';
            feedbackColor = '#FF4444';
            feedbackTimer = CONFIG.FEEDBACK_FRAMES + CONFIG.WRONG_PAUSE_FRAMES;

            Sound.badChoice();
            Particles.emitChoiceConfetti(playerScreenX + 10, CONFIG.GROUND_Y - 14, false);
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
            default:
                renderGameWorld();
                break;
        }
    }

    function renderGameWorld() {
        const cameraX = Math.max(0, worldX - CONFIG.PLAYER_X);
        const playerScreenX = worldX - cameraX;

        Background.render(ctx, worldX, Choices.data);
        Player.render(ctx, playerScreenX);
        Particles.render(ctx);

        // Score HUD (Gold pill)
        ctx.fillStyle = 'rgba(7, 9, 22, 0.7)';
        ctx.fillRect(CONFIG.WIDTH - 84, 5, 80, 16);
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(CONFIG.WIDTH - 84, 5, 2, 16);
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#FFF';
        ctx.fillText('SCORE: ' + score + '/' + Choices.data.length, CONFIG.WIDTH - 44, 13);

        // Sound / Fullscreen hint
        ctx.font = '7px monospace';
        ctx.textAlign = 'left';
        ctx.fillStyle = 'rgba(255,255,255,0.45)';
        ctx.fillText(Sound.isMuted ? '[M] Sound: OFF' : '[M] Sound: ON', 6, 12);
        ctx.fillText('[F] Fullscreen', 6, 22);

        // Zone transition announcement banner
        if (zoneTransTimer > 0) {
            const alpha = zoneTransTimer > 50 ? Math.min(1, (80 - zoneTransTimer) / 30) : zoneTransTimer / 50;
            ctx.globalAlpha = alpha;
            ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
            ctx.fillRect(CONFIG.WIDTH / 2 - 130, CONFIG.HEIGHT / 2 - 40, 260, 28);
            ctx.fillStyle = '#FFD700';
            ctx.fillRect(CONFIG.WIDTH / 2 - 130, CONFIG.HEIGHT / 2 - 40, 260, 2);
            ctx.fillRect(CONFIG.WIDTH / 2 - 130, CONFIG.HEIGHT / 2 - 14, 260, 2);

            ctx.font = 'bold 12px "Segoe UI", Arial, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#FFD700';
            ctx.fillText(zoneTransName, CONFIG.WIDTH / 2, CONFIG.HEIGHT / 2 - 26);
            ctx.globalAlpha = 1;
        }

        // Help text at walk start
        if (helpTextTimer > 0 && state === 'walking') {
            const alpha = helpTextTimer > 90 ? Math.min(1, (140 - helpTextTimer) / 50) : helpTextTimer / 90;
            ctx.globalAlpha = alpha * 0.9;
            ctx.fillStyle = 'rgba(0,0,0,0.6)';
            ctx.fillRect(CONFIG.WIDTH / 2 - 100, CONFIG.HEIGHT / 2 + 15, 200, 20);
            ctx.font = 'bold 9px monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#FFD700';
            ctx.fillText('Hold [S] or [2] to Walk  \u2192', CONFIG.WIDTH / 2, CONFIG.HEIGHT / 2 + 25);
            ctx.globalAlpha = 1;
        }

        // Choice Dilemma UI
        if (state === 'choice') {
            Choices.renderChoiceUI(ctx, Choices.data[currentChoiceIndex], stateTimer);
        }

        // Feedback Banner with Moral/Lesson
        if (feedbackTimer > 0) {
            const alpha = feedbackTimer > 15 ? 1 : feedbackTimer / 15;
            ctx.save();
            ctx.globalAlpha = alpha;

            const pw = 300, ph = 38;
            const px = CONFIG.WIDTH / 2 - pw / 2;
            const py = CONFIG.HEIGHT / 2 - ph / 2;

            ctx.fillStyle = 'rgba(10, 15, 30, 0.9)';
            ctx.fillRect(px, py, pw, ph);

            ctx.fillStyle = feedbackColor;
            ctx.fillRect(px, py, pw, 2);
            ctx.fillRect(px, py + ph - 2, pw, 2);

            ctx.font = 'bold 12px "Segoe UI", Arial, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            ctx.fillStyle = feedbackColor;
            ctx.fillText(feedbackText, CONFIG.WIDTH / 2, py + 5);

            ctx.font = '9px "Segoe UI", Arial, sans-serif';
            ctx.fillStyle = '#E2E8F0';
            ctx.fillText(feedbackSubText, CONFIG.WIDTH / 2, py + 21);

            ctx.restore();
        }

        // Rollback rewind effect
        if (state === 'rollback') {
            const blink = Math.sin(frameCount * 0.35) > 0;
            if (blink) {
                ctx.fillStyle = 'rgba(239, 68, 68, 0.2)';
                ctx.fillRect(0, 0, CONFIG.WIDTH, CONFIG.HEIGHT);
                ctx.font = 'bold 10px monospace';
                ctx.textAlign = 'center';
                ctx.fillStyle = '#FF6B6B';
                ctx.fillText('\u2190 Rolling Back to Checkpoint...', CONFIG.WIDTH / 2, CONFIG.HEIGHT / 2 + 35);
            }
        }
    }

    // ---- Title / Attract Screen ----

    function renderTitle() {
        // Deep auspicious night gradient
        const grad = ctx.createLinearGradient(0, 0, 0, CONFIG.HEIGHT);
        grad.addColorStop(0, '#090A1A');
        grad.addColorStop(0.5, '#1E1535');
        grad.addColorStop(1, '#2E192D');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, CONFIG.WIDTH, CONFIG.HEIGHT);

        // Twinkling stars
        ctx.fillStyle = '#FFF';
        for (let i = 0; i < 45; i++) {
            const sx = (i * 97 + 23) % CONFIG.WIDTH;
            const sy = (i * 61 + 11) % (CONFIG.HEIGHT - 65);
            ctx.globalAlpha = 0.2 + 0.6 * Math.abs(Math.sin(frameCount * 0.04 + i * 1.3));
            ctx.fillRect(sx, sy, 1 + (i % 4 === 0 ? 1 : 0), 1 + (i % 5 === 0 ? 1 : 0));
        }
        ctx.globalAlpha = 1;

        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';

        // Organization
        ctx.font = 'bold 8px "Segoe UI", Arial, sans-serif';
        ctx.fillStyle = '#F59E0B';
        ctx.fillText('॥ સ્વામિનારાયણ હરિપ્રબોધમ્ પરિવાર ॥', CONFIG.WIDTH / 2, 20);

        // Main Title
        ctx.font = 'bold 28px monospace';
        ctx.fillStyle = '#000';
        ctx.fillText('ANNAKUT', CONFIG.WIDTH / 2 + 2, 36);
        ctx.fillStyle = '#FFD700';
        ctx.fillText('ANNAKUT', CONFIG.WIDTH / 2, 34);

        // Subtitle
        ctx.font = 'bold 14px monospace';
        ctx.fillStyle = '#000';
        ctx.fillText('FAMILY PATH — પરિવાર પથ', CONFIG.WIDTH / 2 + 1, 65);
        ctx.fillStyle = '#FB923C';
        ctx.fillText('FAMILY PATH — પરિવાર પથ', CONFIG.WIDTH / 2, 64);

        // Golden divider
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(CONFIG.WIDTH / 2 - 90, 83, 180, 2);

        // Theme Motto
        ctx.font = 'italic 10px "Segoe UI", Arial, sans-serif';
        ctx.fillStyle = '#E2E8F0';
        ctx.fillText('"સંપ, સુહ્રદભાવ અને એકતા એ જ સુખી પરિવારનો પાયો"', CONFIG.WIDTH / 2, 92);
        ctx.font = '9px "Segoe UI", Arial, sans-serif';
        ctx.fillStyle = '#94A3B8';
        ctx.fillText('"Harmony & Right Choices Lead to Family Happiness"', CONFIG.WIDTH / 2, 107);

        // 3-Key Hardware Legend Box
        const bw = 280, bh = 30;
        const bx = CONFIG.WIDTH / 2 - bw / 2, by = 126;
        ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
        ctx.fillRect(bx, by, bw, bh);
        ctx.fillStyle = '#38BDF8';
        ctx.fillRect(bx, by, bw, 1);
        ctx.fillRect(bx, by + bh - 1, bw, 1);

        ctx.font = 'bold 9px monospace';
        ctx.fillStyle = '#38BDF8';
        ctx.fillText('[A / 1] Left Choice   [S / 2] Hold Walk   [D / 3] Right Choice', CONFIG.WIDTH / 2, by + 10);

        // Flashing Start Prompt
        if (Math.sin(frameCount * 0.1) > -0.25) {
            ctx.font = 'bold 12px monospace';
            ctx.fillStyle = '#FFD700';
            ctx.fillText('>> Press [S / 2] or Center Button to Begin <<', CONFIG.WIDTH / 2, 168);
        }

        // Booth pilgrim count badge
        const runs = CONFIG.getBoothRuns();
        ctx.font = '8px "Segoe UI", Arial, sans-serif';
        ctx.fillStyle = '#CBD5E1';
        ctx.fillText(`Booth Pilgrims Completed Today: ${runs}`, CONFIG.WIDTH / 2, CONFIG.HEIGHT - 18);
    }

    // ---- Victory Screen ----

    function renderVictory() {
        const alpha = Math.min(0.85, stateTimer / 60);
        ctx.fillStyle = `rgba(10, 8, 25, ${alpha})`;
        ctx.fillRect(0, 0, CONFIG.WIDTH, CONFIG.HEIGHT);

        if (stateTimer < 20) return;

        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';

        // Victory Title
        ctx.font = 'bold 22px "Segoe UI", Arial, sans-serif';
        ctx.fillStyle = '#000';
        ctx.fillText('જય સ્વામિનારાયણ!', CONFIG.WIDTH / 2 + 2, 22);
        ctx.fillStyle = '#FFD700';
        ctx.fillText('જય સ્વામિનારાયણ!', CONFIG.WIDTH / 2, 20);

        ctx.font = 'bold 12px monospace';
        ctx.fillStyle = '#FFF';
        ctx.fillText('YOU REACHED THE SACRED MANDIR!', CONFIG.WIDTH / 2, 48);

        // Score Badge
        ctx.font = 'bold 13px monospace';
        if (score === Choices.data.length) {
            ctx.fillStyle = '#00FF88';
            ctx.fillText(`PERFECT SCORE: ${score} / ${Choices.data.length} !`, CONFIG.WIDTH / 2, 68);
        } else {
            ctx.fillStyle = '#FFD700';
            ctx.fillText(`FINAL SCORE: ${score} / ${Choices.data.length}`, CONFIG.WIDTH / 2, 68);
        }

        // Family Blessing Message
        ctx.font = 'bold 11px "Segoe UI", Arial, sans-serif';
        ctx.fillStyle = '#FDE68A';
        ctx.fillText('પરિવાર સાથે સત્સંગ, પ્રેમ અને સુહ્રદભાવથી', CONFIG.WIDTH / 2, 94);
        ctx.fillText('જીવનમાં સદા આનંદ અને શાંતિ રહે છે.', CONFIG.WIDTH / 2, 109);

        // Play Again Prompt
        if (stateTimer > 70 && Math.sin(frameCount * 0.09) > -0.2) {
            ctx.font = 'bold 10px monospace';
            ctx.fillStyle = '#FFF';
            ctx.fillText('Press [S / 2] to Play Again for Next Pilgrim', CONFIG.WIDTH / 2, CONFIG.HEIGHT - 32);
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
