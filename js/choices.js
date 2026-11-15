// ============================================================
// CHOICES — 12-question bank, 5-pick system, bilingual UI & moral banner
// V1: 960×540 canvas scaling, 5 questions per run, 5s moral banner
// ============================================================
const Choices = (() => {

    const data = [
        {
            id: 1,
            question: 'Your phone is buzzing with notifications...',
            questionGuj: 'ફોન વાગી રહ્યો છે...',
            good: 'Read a Good Book',
            goodGuj: 'સારું પુસ્તક વાંચવું',
            bad: 'Endless Social Media',
            badGuj: 'સોશિયલ મીડિયા સ્ક્રોલ',
            moral: 'Knowledge & reading bring peace and focus.',
            moralGuj: 'વાંચનથી જ્ઞાન અને એકાગ્રતા વધે છે.',
            goodSide: null, passed: false, worldX: 0
        },
        {
            id: 2,
            question: "It's dinner time with the family!",
            questionGuj: 'સાંજે જમવાનો સમય થયો છે!',
            good: 'Eat Dinner Together',
            goodGuj: 'પરિવાર સાથે બેસીને જમવું',
            bad: 'Eat Alone in Room',
            badGuj: 'રૂમમાં એકલા જમવું',
            moral: 'Sharing meals together builds loving family bonds.',
            moralGuj: 'સાથે જમવાથી પરિવારમાં પ્રેમ વધે છે.',
            goodSide: null, passed: false, worldX: 0
        },
        {
            id: 3,
            question: 'Parents need help with household chores...',
            questionGuj: 'માતા-પિતાને ઘરમાં મદદ જોઈએ છે...',
            good: 'Happily Help with Chores',
            goodGuj: 'આનંદથી સેવા/મદદ કરવી',
            bad: 'Ignore & Be Lazy',
            badGuj: 'ધ્યાન ન આપવું / આળસ',
            moral: 'Helping our parents is the highest service.',
            moralGuj: 'મા-બાપની સેવા એ જ સૌથી મોટો ધર્મ છે.',
            goodSide: null, passed: false, worldX: 0
        },
        {
            id: 4,
            question: 'Grandparents want to share stories with you!',
            questionGuj: 'દાદા-દાદી વાત કરવા બોલાવે છે!',
            good: 'Sit & Listen Lovingly',
            goodGuj: 'પ્રેમથી તેમની પાસે બેસવું',
            bad: 'Keep Headphones On',
            badGuj: 'હેડફોન લગાવી બેસી રહેવું',
            moral: 'Elders’ wisdom and blessings protect our lives.',
            moralGuj: 'વડીલોના આશીર્વાદ જીવન સુખી બનાવે છે.',
            goodSide: null, passed: false, worldX: 0
        },
        {
            id: 5,
            question: "It's a refreshing holiday morning...",
            questionGuj: 'રવિવારની સુંદર સવાર છે...',
            good: 'Walk & Exercise Outside',
            goodGuj: 'બહાર કસરત / ચાલવા જવું',
            bad: 'Binge-watch Screen All Day',
            badGuj: 'આખો દિવસ ટીવી/સ્ક્રીન જોવી',
            moral: 'A healthy body creates a pure, active mind.',
            moralGuj: 'તંદુરસ્ત તનમાં પવિત્ર મન રહે છે.',
            goodSide: null, passed: false, worldX: 0
        },
        {
            id: 6,
            question: 'Time for evening prayer & devotional aarti...',
            questionGuj: 'સાંજની સંધ્યા આરતીનો સમય છે...',
            good: 'Do Daily Puja & Niyam',
            goodGuj: 'નિયમિત પૂજા-દર્શન કરવું',
            bad: 'Skip, "I will do it later"',
            badGuj: '"પછી કરીશ" કહી ટાળવું',
            moral: 'Daily devotion keeps God close in our hearts.',
            moralGuj: 'નિયમિત ભક્તિથી ભગવાન સદા સાથે રહે છે.',
            goodSide: null, passed: false, worldX: 0
        },
        {
            id: 7,
            question: 'A friend or relative said something hurtful...',
            questionGuj: 'કોઈએ અણગમતું વેણ કહ્યું...',
            good: 'Forgive with a Big Heart',
            goodGuj: 'મોટા મનથી માફ કરી દેવું',
            bad: 'Hold Anger & Grudge',
            badGuj: 'ગુસ્સો અને વેર રાખવું',
            moral: 'Forgiveness and Suhradbhav bring ultimate peace.',
            moralGuj: 'ક્ષમા અને સુહ્રદભાવથી મનની શાંતિ મળે છે.',
            goodSide: null, passed: false, worldX: 0
        },
        {
            id: 8,
            question: 'How do you choose to spend your weekend?',
            questionGuj: 'નવરાશના સમયમાં શું પસંદ કરશો?',
            good: 'Quality Time with Family',
            goodGuj: 'પરિવારજનો સાથે પ્રેમપૂર્વક',
            bad: 'Selfish & Lonely Habits',
            badGuj: 'માત્ર પોતાનો જ સ્વાર્થ જોવો',
            moral: 'United families bring heaven into our home.',
            moralGuj: 'સંપ, સુહ્રદભાવ અને એકતાથી ઘરમાં સ્વર્ગ બને.',
            goodSide: null, passed: false, worldX: 0
        },
        {
            id: 9,
            question: 'A new movie or show releases today...',
            questionGuj: 'ઘરમાં નવી ફિલ્મ કે શો જોવો છે...',
            good: 'Watch Together as Family',
            goodGuj: 'પરિવાર સાથે બેસીને જોવી',
            bad: 'Watch Alone in the Dark',
            badGuj: 'હેડફોન સાથે એકલા જોવી',
            moral: 'Shared experiences create lifelong family memories.',
            moralGuj: 'સાથે અનુભવેલી ક્ષણો જીવનભર યાદ રહે છે.',
            goodSide: null, passed: false, worldX: 0
        },
        {
            id: 10,
            question: 'Your sibling is struggling with school studies...',
            questionGuj: 'નાના ભાઈ-બહેનને ભણવામાં મુશ્કેલી છે...',
            good: 'Patiently Help Them Learn',
            goodGuj: 'ધૈર્યથી પ્રેમપૂર્વક મદદ કરવી',
            bad: 'Ignore, Say "I am Busy"',
            badGuj: 'વ્યસ્ત છું કહી ટાળવું',
            moral: 'Helping siblings today builds a friendship for life.',
            moralGuj: 'ભાઈ-બહેનને મદદ કરવી એ જ સૌથી સુંદર મૈત્રી છે.',
            goodSide: null, passed: false, worldX: 0
        },
        {
            id: 11,
            question: "It's a family member's special birthday today...",
            questionGuj: 'આજે સગા-વહાલાનો જન્મદિવસ છે...',
            good: 'Call & Wish Them Warmly',
            goodGuj: 'ફોન કરી પ્રેમથી આદર આપવો',
            bad: 'Forget & Scroll Online Reels',
            badGuj: 'ભૂલી જઈ રીલ્સ જોવી',
            moral: 'Small gestures of love strengthen family bonds.',
            moralGuj: 'પ્રેમભરી વાતોથી સંબંધો હંમેશા મજબૂત રહે છે.',
            goodSide: null, passed: false, worldX: 0
        },
        {
            id: 12,
            question: 'You feel frustrated about a disagreement at home...',
            questionGuj: 'ઘરમાં કોઈ બાબતે મતભેદ થયો છે...',
            good: 'Talk Calmly & Understand',
            goodGuj: 'શાંતિથી બેસી વાત સમજવી',
            bad: 'Yell & Slam the Door',
            badGuj: 'ગુસ્સો કરી ચાલ્યા જવું',
            moral: 'Calm communication is the foundation of a happy home.',
            moralGuj: 'શાંત સંવાદ એ સુખી પરિવારનો પાયો છે.',
            goodSide: null, passed: false, worldX: 0
        }
    ];

    let selectedQuestions = [];

    // Fisher-Yates shuffle
    function shuffle(array) {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    /**
     * Randomizes and picks 5 questions for this run.
     * Maps each of the 5 chosen questions to the question events in CONFIG.WORLD_EVENTS.
     */
    function randomizeSides() {
        const questionEvents = CONFIG.WORLD_EVENTS.filter(ev => ev.type === 'question');
        const shuffled = shuffle(data);

        selectedQuestions = shuffled.slice(0, 5).map((q, idx) => {
            const targetX = questionEvents[idx] ? questionEvents[idx].worldX : (800 + idx * 450);
            return {
                ...q,
                worldX: targetX,
                goodSide: Math.random() < 0.5 ? 'left' : 'right',
                passed: false
            };
        });
    }

    function randomizeOneSide(idx) {
        if (selectedQuestions[idx]) {
            selectedQuestions[idx].goodSide = Math.random() < 0.5 ? 'left' : 'right';
        }
    }

    function getSelected() {
        return selectedQuestions;
    }

    // ---- Panel drawing helper ----

    function drawPanel(ctx, x, y, w, h, borderColor) {
        ctx.fillStyle = '#0F1226';
        ctx.fillRect(x, y, w, h);

        ctx.fillStyle = borderColor;
        ctx.fillRect(x, y, w, 3);
        ctx.fillRect(x, y + h - 3, w, 3);
        ctx.fillRect(x, y, 3, h);
        ctx.fillRect(x + w - 3, y, 3, h);

        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(x, y, 5, 5);
        ctx.fillRect(x + w - 5, y, 5, 5);
        ctx.fillRect(x, y + h - 5, 5, 5);
        ctx.fillRect(x + w - 5, y + h - 5, 5, 5);

        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.fillRect(x + 5, y + 5, w - 10, h - 10);
    }

    function wrapText(ctx, text, x, y, maxW, lineH) {
        const words = text.split(' ');
        let line = '', ty = y;
        for (const word of words) {
            const test = line + (line ? ' ' : '') + word;
            if (ctx.measureText(test).width > maxW && line) {
                ctx.fillText(line, x, ty);
                line = word;
                ty += lineH;
            } else {
                line = test;
            }
        }
        ctx.fillText(line, x, ty);
    }

    // ---- Scaled Pixel Art Choice Icons ----

    function drawChoiceIcon(ctx, x, y, text) {
        const t = text.toLowerCase();
        ctx.save();

        if (t.includes('book') || t.includes('read') || t.includes('પુસ્તક')) {
            // Book
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(x, y, 32, 24);
            ctx.fillStyle = '#FFF8DC';
            ctx.fillRect(x + 4, y + 3, 11, 18);
            ctx.fillRect(x + 17, y + 3, 11, 18);
            ctx.fillStyle = '#B45309';
            ctx.fillRect(x + 14, y + 2, 4, 20);
            ctx.fillStyle = '#666';
            ctx.fillRect(x + 6, y + 7, 7, 2);
            ctx.fillRect(x + 6, y + 12, 7, 2);
            ctx.fillRect(x + 19, y + 7, 7, 2);
            ctx.fillRect(x + 19, y + 12, 7, 2);
        } else if (t.includes('social') || t.includes('phone') || t.includes('મીડિયા') || t.includes('reels')) {
            // Smartphone
            ctx.fillStyle = '#222';
            ctx.fillRect(x + 6, y, 22, 28);
            ctx.fillStyle = '#38BDF8';
            ctx.fillRect(x + 9, y + 3, 16, 18);
            ctx.fillStyle = '#FFF';
            ctx.fillRect(x + 13, y + 23, 8, 2);
            ctx.fillStyle = '#EF4444';
            ctx.fillRect(x + 19, y + 5, 4, 4);
        } else if (t.includes('dinner') || t.includes('eat') || t.includes('જમવું')) {
            // Family Thali
            ctx.fillStyle = '#D4A574';
            ctx.fillRect(x + 4, y + 2, 8, 8);
            ctx.fillRect(x + 22, y + 2, 8, 8);
            ctx.fillStyle = '#C0C0C0';
            ctx.fillRect(x + 5, y + 14, 24, 12);
            ctx.fillStyle = '#EAB308';
            ctx.fillRect(x + 8, y + 17, 6, 6);
            ctx.fillStyle = '#EF4444';
            ctx.fillRect(x + 18, y + 17, 6, 6);
        } else if (t.includes('alone') || t.includes('room') || t.includes('એકલા')) {
            // Dark room box
            ctx.fillStyle = '#374151';
            ctx.fillRect(x + 4, y + 4, 26, 22);
            ctx.fillStyle = '#9CA3AF';
            ctx.fillRect(x + 13, y + 8, 8, 8);
            ctx.fillStyle = '#111827';
            ctx.fillRect(x + 11, y + 18, 12, 8);
        } else if (t.includes('help') || t.includes('chores') || t.includes('સેવા') || t.includes('studies')) {
            // Helping Heart
            ctx.fillStyle = '#EF4444';
            ctx.fillRect(x + 6, y + 3, 8, 8);
            ctx.fillRect(x + 18, y + 3, 8, 8);
            ctx.fillRect(x + 4, y + 7, 24, 8);
            ctx.fillRect(x + 8, y + 15, 16, 6);
            ctx.fillRect(x + 12, y + 21, 8, 4);
            ctx.fillStyle = '#FFD700';
            ctx.fillRect(x + 14, y + 9, 4, 4);
        } else if (t.includes('ignore') || t.includes('lazy') || t.includes('આળસ') || t.includes('busy')) {
            // Sleeping figure & Z
            ctx.fillStyle = '#6B7280';
            ctx.fillRect(x + 5, y + 12, 22, 12);
            ctx.fillStyle = '#F59E0B';
            ctx.font = 'bold 14px monospace';
            ctx.textAlign = 'left';
            ctx.fillText('Z', x + 19, y + 10);
        } else if (t.includes('grandparent') || t.includes('listen') || t.includes('દાદા')) {
            // Grandparents with staff
            ctx.fillStyle = '#D4A574';
            ctx.fillRect(x + 5, y + 4, 8, 8);
            ctx.fillStyle = '#E5E7EB';
            ctx.fillRect(x + 3, y + 2, 12, 4);
            ctx.fillStyle = '#F3F4F6';
            ctx.fillRect(x + 4, y + 12, 12, 12);
            ctx.fillStyle = '#B45309';
            ctx.fillRect(x + 18, y + 8, 4, 18);
            ctx.fillRect(x + 18, y + 8, 8, 4);
        } else if (t.includes('headphone') || t.includes('હેડફોન')) {
            // Headphones
            ctx.fillStyle = '#1F2937';
            ctx.fillRect(x + 7, y + 2, 18, 4);
            ctx.fillRect(x + 5, y + 4, 4, 16);
            ctx.fillRect(x + 23, y + 4, 4, 16);
            ctx.fillStyle = '#3B82F6';
            ctx.fillRect(x + 3, y + 16, 7, 10);
            ctx.fillRect(x + 22, y + 16, 7, 10);
        } else if (t.includes('exercise') || t.includes('walk') || t.includes('કસરત')) {
            // Runner figure
            ctx.fillStyle = '#D4A574';
            ctx.fillRect(x + 13, y + 2, 8, 8);
            ctx.fillStyle = '#10B981';
            ctx.fillRect(x + 11, y + 10, 12, 10);
            ctx.fillStyle = '#1E3A8A';
            ctx.fillRect(x + 7, y + 20, 8, 8);
            ctx.fillRect(x + 19, y + 20, 8, 8);
        } else if (t.includes('tv') || t.includes('binge') || t.includes('સ્ક્રીન') || t.includes('movie') || t.includes('ફિલ્મ')) {
            // TV / Screen
            ctx.fillStyle = '#1F2937';
            ctx.fillRect(x + 4, y + 4, 26, 18);
            ctx.fillStyle = '#60A5FA';
            ctx.fillRect(x + 7, y + 7, 20, 12);
            ctx.fillStyle = '#4B5563';
            ctx.fillRect(x + 13, y + 22, 8, 4);
        } else if (t.includes('puja') || t.includes('prayer') || t.includes('પૂજા')) {
            // Auspicious Diya
            ctx.fillStyle = '#D97706';
            ctx.fillRect(x + 7, y + 14, 18, 8);
            ctx.fillRect(x + 4, y + 22, 24, 4);
            ctx.fillStyle = '#F59E0B';
            ctx.fillRect(x + 13, y + 7, 6, 7);
            ctx.fillStyle = '#EF4444';
            ctx.fillRect(x + 14, y + 3, 4, 5);
            ctx.fillStyle = '#FFF';
            ctx.fillRect(x + 15, y + 8, 3, 3);
        } else if (t.includes('skip') || t.includes('later') || t.includes('ટાળવું')) {
            // Clock with red X
            ctx.fillStyle = '#9CA3AF';
            ctx.fillRect(x + 5, y + 4, 22, 22);
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(x + 9, y + 8, 14, 14);
            ctx.fillStyle = '#EF4444';
            ctx.fillRect(x + 14, y + 10, 4, 7);
            ctx.fillRect(x + 14, y + 13, 6, 4);
        } else if (t.includes('forgive') || t.includes('heart') || t.includes('માફ') || t.includes('calmly') || t.includes('શાંતિ')) {
            // Auspicious Lotus / Peace Heart
            ctx.fillStyle = '#EC4899';
            ctx.fillRect(x + 6, y + 5, 8, 8);
            ctx.fillRect(x + 20, y + 5, 8, 8);
            ctx.fillRect(x + 4, y + 9, 26, 8);
            ctx.fillRect(x + 9, y + 17, 16, 6);
            ctx.fillRect(x + 13, y + 23, 8, 4);
        } else {
            // Auspicious Kalash Star
            ctx.fillStyle = '#FFD700';
            ctx.fillRect(x + 13, y + 2, 7, 26);
            ctx.fillRect(x + 4, y + 12, 25, 7);
            ctx.fillStyle = '#FFF';
            ctx.fillRect(x + 13, y + 12, 7, 7);
        }

        ctx.restore();
    }

    // ---- Main Choice UI Rendering (960×540 scale) ----

    function renderChoiceUI(ctx, cp, timer) {
        if (!cp) return;

        const isLeftGood = cp.goodSide === 'left';
        const leftMain   = isLeftGood ? cp.good : cp.bad;
        const leftSub    = isLeftGood ? cp.goodGuj : cp.badGuj;
        const rightMain  = isLeftGood ? cp.bad : cp.good;
        const rightSub   = isLeftGood ? cp.badGuj : cp.goodGuj;

        // Dark ambient overlay
        ctx.fillStyle = 'rgba(7, 9, 22, 0.82)';
        ctx.fillRect(0, 0, CONFIG.WIDTH, CONFIG.HEIGHT);

        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';

        // Question Box / Banner
        const qBoxW = 740, qBoxH = 82;
        const qBoxX = CONFIG.WIDTH / 2 - qBoxW / 2, qBoxY = 32;

        ctx.fillStyle = '#111827';
        ctx.fillRect(qBoxX, qBoxY, qBoxW, qBoxH);
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(qBoxX, qBoxY, qBoxW, 3);
        ctx.fillRect(qBoxX, qBoxY + qBoxH - 3, qBoxW, 3);

        // English Question
        ctx.font = 'bold 20px "Segoe UI", Arial, sans-serif';
        ctx.fillStyle = '#000';
        ctx.fillText(cp.question, CONFIG.WIDTH / 2 + 1, qBoxY + 14);
        ctx.fillStyle = '#FFD700';
        ctx.fillText(cp.question, CONFIG.WIDTH / 2, qBoxY + 13);

        // Gujarati Question
        ctx.font = 'bold 18px "Segoe UI", Arial, sans-serif';
        ctx.fillStyle = '#000';
        ctx.fillText(cp.questionGuj, CONFIG.WIDTH / 2 + 1, qBoxY + 45);
        ctx.fillStyle = '#FDE68A';
        ctx.fillText(cp.questionGuj, CONFIG.WIDTH / 2, qBoxY + 44);

        // Subtitle prompt
        ctx.font = 'bold 13px monospace';
        ctx.fillStyle = '#94A3B8';
        ctx.fillText('Choose: Left [A / 1]  or  Right [D / 3]', CONFIG.WIDTH / 2, 126);

        // Two Choice Panels
        const pw = 340, ph = 210;
        const py = 152, gap = 44;
        const lx = CONFIG.WIDTH / 2 - pw - gap / 2;
        const rx = CONFIG.WIDTH / 2 + gap / 2;
        const pulse = 0.6 + 0.4 * Math.sin(timer * 0.14);

        // Left Panel (Key A / 1)
        drawPanel(ctx, lx, py, pw, ph, '#38BDF8');
        drawChoiceIcon(ctx, lx + pw / 2 - 17, py + 16, leftMain);

        ctx.font = 'bold 18px "Segoe UI", Arial, sans-serif';
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        wrapText(ctx, leftMain, lx + pw / 2, py + 62, pw - 24, 24);

        ctx.font = '16px "Segoe UI", Arial, sans-serif';
        ctx.fillStyle = '#93C5FD';
        ctx.fillText(leftSub, lx + pw / 2, py + 120);

        // Button Key Indicator
        ctx.fillStyle = 'rgba(56, 189, 248, 0.22)';
        ctx.fillRect(lx + pw / 2 - 60, py + ph - 42, 120, 28);
        ctx.font = 'bold 16px monospace';
        ctx.globalAlpha = pulse;
        ctx.fillStyle = '#38BDF8';
        ctx.fillText('[ A / 1 ]', lx + pw / 2, py + ph - 36);
        ctx.globalAlpha = 1;

        // Right Panel (Key D / 3)
        drawPanel(ctx, rx, py, pw, ph, '#FB923C');
        drawChoiceIcon(ctx, rx + pw / 2 - 17, py + 16, rightMain);

        ctx.font = 'bold 18px "Segoe UI", Arial, sans-serif';
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        wrapText(ctx, rightMain, rx + pw / 2, py + 62, pw - 24, 24);

        ctx.font = '16px "Segoe UI", Arial, sans-serif';
        ctx.fillStyle = '#FDBA74';
        ctx.fillText(rightSub, rx + pw / 2, py + 120);

        // Button Key Indicator
        ctx.fillStyle = 'rgba(251, 146, 60, 0.22)';
        ctx.fillRect(rx + pw / 2 - 60, py + ph - 42, 120, 28);
        ctx.font = 'bold 16px monospace';
        ctx.globalAlpha = pulse;
        ctx.fillStyle = '#FB923C';
        ctx.fillText('[ D / 3 ]', rx + pw / 2, py + ph - 36);
        ctx.globalAlpha = 1;
    }

    /**
     * Render the 5-second moral takeaway banner while running.
     * Stays on screen for 150 frames (5 seconds at 30fps).
     */
    function renderMoralBanner(ctx, cp, moralTimer) {
        if (!cp || moralTimer >= 150) return false;

        let alpha = 1.0;
        if (moralTimer < 15) {
            alpha = moralTimer / 15;
        } else if (moralTimer > 135) {
            alpha = (150 - moralTimer) / 15;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, alpha));

        const bw = 780, bh = 80;
        const bx = CONFIG.WIDTH / 2 - bw / 2;
        const by = CONFIG.HEIGHT - bh - 18;

        // Outer glow & container
        ctx.fillStyle = 'rgba(10, 16, 32, 0.94)';
        ctx.fillRect(bx, by, bw, bh);

        // Golden borders
        ctx.fillStyle = '#00FF88';
        ctx.fillRect(bx, by, bw, 3);
        ctx.fillRect(bx, by + bh - 3, bw, 3);

        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';

        // Header Pill
        ctx.font = 'bold 13px monospace';
        ctx.fillStyle = '#00FF88';
        ctx.fillText('✨ GREAT CHOICE! સાચો નિર્ણય! ✨', CONFIG.WIDTH / 2, by + 9);

        // English Moral
        ctx.font = 'bold 16px "Segoe UI", Arial, sans-serif';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(cp.moral, CONFIG.WIDTH / 2, by + 30);

        // Gujarati Moral
        ctx.font = '15px "Segoe UI", Arial, sans-serif';
        ctx.fillStyle = '#FDE68A';
        ctx.fillText(cp.moralGuj, CONFIG.WIDTH / 2, by + 53);

        ctx.restore();
        return true;
    }

    return {
        data,
        randomizeSides,
        randomizeOneSide,
        getSelected,
        renderChoiceUI,
        renderMoralBanner
    };
})();
