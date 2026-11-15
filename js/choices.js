// ============================================================
// CHOICES — Choice-point data, bilingual questions & UI rendering
// ============================================================
const Choices = (() => {

    const data = [
        {
            worldX: 400,
            question: 'Your phone is buzzing...',
            questionGuj: 'ફોન વાગી રહ્યો છે...',
            good: 'Read a Good Book',
            goodGuj: 'સારું પુસ્તક વાંચવું',
            bad: 'Endless Social Media',
            badGuj: 'સોશિયલ મીડિયા સ્ક્રોલ',
            moral: 'Knowledge & reading bring peace and focus.',
            moralGuj: 'વાંચનથી જ્ઞાન અને એકાગ્રતા વધે છે.',
            goodSide: null, passed: false
        },
        {
            worldX: 750,
            question: "It's dinner time with family!",
            questionGuj: 'સાંજે જમવાનો સમય થયો છે!',
            good: 'Eat Dinner Together',
            goodGuj: 'પરિવાર સાથે બેસીને જમવું',
            bad: 'Eat Alone in Room',
            badGuj: 'રૂમમાં એકલા જમવું',
            moral: 'Sharing meals together builds loving family bonds.',
            moralGuj: 'સાથે જમવાથી પરિવારમાં પ્રેમ વધે છે.',
            goodSide: null, passed: false
        },
        {
            worldX: 1150,
            question: 'Parents need help at home...',
            questionGuj: 'માതാ-પિતાને ઘરમાં મદદ જોઈએ છે...',
            good: 'Happily Help with Chores',
            goodGuj: 'આનંદથી સેવા/મદદ કરવી',
            bad: 'Ignore & Be Lazy',
            badGuj: 'ધ્યાન ન આપવું / આળસ',
            moral: 'Helping our parents is the highest service.',
            moralGuj: 'મા-બાપની સેવા એ જ સૌથી મોટો ધર્મ છે.',
            goodSide: null, passed: false
        },
        {
            worldX: 1500,
            question: 'Grandparents want to share stories!',
            questionGuj: 'દાદા-દાદી વાત કરવા બોલાવે છે!',
            good: 'Sit & Listen Lovingly',
            goodGuj: 'પ્રેમથી તેમની પાસે બેસવું',
            bad: 'Keep Headphones On',
            badGuj: 'હેડફોન લગાવી બેસી રહેવું',
            moral: 'Elders’ wisdom and blessings protect our lives.',
            moralGuj: 'વડીલોના આશીર્વાદ જીવન સુખી બનાવે છે.',
            goodSide: null, passed: false
        },
        {
            worldX: 1950,
            question: "It's a refreshing holiday morning...",
            questionGuj: 'રવિવારની સુંદર સવાર છે...',
            good: 'Walk & Exercise Outside',
            goodGuj: 'બહાર કસરત / ચાલવા જવું',
            bad: 'Binge-watch Screen All Day',
            badGuj: 'આખો દિવસ ટીવી/સ્ક્રીન જોવી',
            moral: 'A healthy body creates a pure, active mind.',
            moralGuj: 'તંદુરસ્ત તનમાં પવિત્ર મન રહે છે.',
            goodSide: null, passed: false
        },
        {
            worldX: 2350,
            question: 'Time for evening prayer & thal...',
            questionGuj: 'સાંજની સંધ્યા આરતીનો સમય છે...',
            good: 'Do Daily Puja & Niyam',
            goodGuj: 'નિયમિત પૂજા-દર્શન કરવું',
            bad: 'Skip, "I will do it later"',
            badGuj: '"પછી કરીશ" કહી ટાળવું',
            moral: 'Daily devotion keeps God close in our hearts.',
            moralGuj: 'નિયમિત ભક્તિથી ભગવાન સદા સાથે રહે છે.',
            goodSide: null, passed: false
        },
        {
            worldX: 2750,
            question: 'A friend said something hurtful...',
            questionGuj: 'મિત્રએ અણગમતું વેણ કહ્યું...',
            good: 'Forgive with a Big Heart',
            goodGuj: 'મોટા મનથી માફ કરી દેવું',
            bad: 'Hold Anger & Grudge',
            badGuj: 'ગુસ્સો અને વેર રાખવું',
            moral: 'Forgiveness and Suhradbhav bring ultimate peace.',
            moralGuj: 'ક્ષમા અને સુહ્રદભાવથી મનની શાંતિ મળે છે.',
            goodSide: null, passed: false
        },
        {
            worldX: 3150,
            question: 'How do you spend your free time?',
            questionGuj: 'નવરાશના સમયમાં શું પસંદ કરશો?',
            good: 'Quality Time with Family',
            goodGuj: 'પરિવારજનો સાથે પ્રેમપૂર્વક',
            bad: 'Selfish & Lonely Habits',
            badGuj: 'માત્ર પોતાનો જ સ્વાર્થ જોવો',
            moral: 'United families bring heaven into our home.',
            moralGuj: 'સંપ, સુહ્રદભાવ અને એકતાથી ઘરમાં સ્વર્ગ બને.',
            goodSide: null, passed: false
        }
    ];

    function randomizeSides() {
        data.forEach(cp => {
            cp.goodSide = Math.random() < 0.5 ? 'left' : 'right';
            cp.passed = false;
        });
    }

    function randomizeOneSide(idx) {
        data[idx].goodSide = Math.random() < 0.5 ? 'left' : 'right';
    }

    // ---- Panel drawing helper ----

    function drawPanel(ctx, x, y, w, h, borderColor, isHovered) {
        ctx.fillStyle = '#0F1226';
        ctx.fillRect(x, y, w, h);

        // Border glow
        ctx.fillStyle = borderColor;
        ctx.fillRect(x, y, w, 2);
        ctx.fillRect(x, y + h - 2, w, 2);
        ctx.fillRect(x, y, 2, h);
        ctx.fillRect(x + w - 2, y, 2, h);

        // Corner accents
        ctx.fillStyle = '#FFF';
        ctx.fillRect(x, y, 3, 3);
        ctx.fillRect(x + w - 3, y, 3, 3);
        ctx.fillRect(x, y + h - 3, 3, 3);
        ctx.fillRect(x + w - 3, y + h - 3, 3, 3);

        // Inner soft shading
        ctx.fillStyle = 'rgba(255,255,255,0.05)';
        ctx.fillRect(x + 3, y + 3, w - 6, h - 6);
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

    // ---- Pixel Art Choice Icons ----

    function drawChoiceIcon(ctx, x, y, text) {
        const t = text.toLowerCase();
        ctx.save();

        if (t.includes('book') || t.includes('read') || t.includes('પુસ્તક')) {
            // Book
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(x, y, 18, 14);
            ctx.fillStyle = '#FFF8DC';
            ctx.fillRect(x + 2, y + 2, 6, 10);
            ctx.fillRect(x + 10, y + 2, 6, 10);
            ctx.fillStyle = '#B45309';
            ctx.fillRect(x + 8, y + 1, 2, 12);
            ctx.fillStyle = '#666';
            ctx.fillRect(x + 3, y + 4, 4, 1);
            ctx.fillRect(x + 3, y + 7, 4, 1);
            ctx.fillRect(x + 11, y + 4, 4, 1);
            ctx.fillRect(x + 11, y + 7, 4, 1);
        } else if (t.includes('social') || t.includes('phone') || t.includes('મીડિયા')) {
            // Smartphone
            ctx.fillStyle = '#222';
            ctx.fillRect(x + 3, y, 12, 16);
            ctx.fillStyle = '#38BDF8';
            ctx.fillRect(x + 5, y + 2, 8, 10);
            ctx.fillStyle = '#FFF';
            ctx.fillRect(x + 7, y + 13, 4, 1);
            // Notification dot
            ctx.fillStyle = '#EF4444';
            ctx.fillRect(x + 10, y + 3, 2, 2);
        } else if (t.includes('dinner') || t.includes('eat') || t.includes('જમવું')) {
            // Family dining plate & thali
            ctx.fillStyle = '#D4A574';
            ctx.fillRect(x + 2, y + 1, 4, 4);
            ctx.fillRect(x + 12, y + 1, 4, 4);
            ctx.fillStyle = '#C0C0C0';
            ctx.fillRect(x + 3, y + 8, 12, 7);
            ctx.fillStyle = '#EAB308';
            ctx.fillRect(x + 5, y + 10, 3, 3);
            ctx.fillStyle = '#EF4444';
            ctx.fillRect(x + 10, y + 10, 3, 3);
        } else if (t.includes('alone') || t.includes('room') || t.includes('એકલા')) {
            // Solitary room / dark box
            ctx.fillStyle = '#374151';
            ctx.fillRect(x + 2, y + 2, 14, 12);
            ctx.fillStyle = '#9CA3AF';
            ctx.fillRect(x + 7, y + 5, 4, 4);
            ctx.fillStyle = '#111827';
            ctx.fillRect(x + 6, y + 10, 6, 4);
        } else if (t.includes('help') || t.includes('chores') || t.includes('સેવા')) {
            // Heart & helping hands
            ctx.fillStyle = '#EF4444';
            ctx.fillRect(x + 4, y + 2, 4, 4);
            ctx.fillRect(x + 10, y + 2, 4, 4);
            ctx.fillRect(x + 3, y + 4, 12, 4);
            ctx.fillRect(x + 5, y + 8, 8, 3);
            ctx.fillRect(x + 7, y + 11, 4, 2);
            ctx.fillStyle = '#FFD700';
            ctx.fillRect(x + 8, y + 5, 2, 2);
        } else if (t.includes('ignore') || t.includes('lazy') || t.includes('આળસ')) {
            // Sleeping figure & Zzz
            ctx.fillStyle = '#6B7280';
            ctx.fillRect(x + 3, y + 7, 12, 6);
            ctx.fillStyle = '#F59E0B';
            ctx.font = 'bold 8px monospace';
            ctx.textAlign = 'left';
            ctx.fillText('Z', x + 11, y + 5);
        } else if (t.includes('grandparent') || t.includes('listen') || t.includes('દાદા')) {
            // Grandparents with walking stick
            ctx.fillStyle = '#D4A574';
            ctx.fillRect(x + 3, y + 2, 4, 4);
            ctx.fillStyle = '#E5E7EB';
            ctx.fillRect(x + 2, y + 1, 6, 2); // White hair
            ctx.fillStyle = '#F3F4F6';
            ctx.fillRect(x + 2, y + 6, 6, 7);
            ctx.fillStyle = '#B45309';
            ctx.fillRect(x + 10, y + 4, 2, 10);
            ctx.fillRect(x + 10, y + 4, 4, 2);
        } else if (t.includes('headphone') || t.includes('હેડફોન')) {
            // Headphones
            ctx.fillStyle = '#1F2937';
            ctx.fillRect(x + 4, y + 1, 10, 2);
            ctx.fillRect(x + 3, y + 2, 2, 8);
            ctx.fillRect(x + 13, y + 2, 2, 8);
            ctx.fillStyle = '#3B82F6';
            ctx.fillRect(x + 2, y + 8, 4, 5);
            ctx.fillRect(x + 12, y + 8, 4, 5);
        } else if (t.includes('exercise') || t.includes('walk') || t.includes('કસરત')) {
            // Runner figure
            ctx.fillStyle = '#D4A574';
            ctx.fillRect(x + 7, y + 1, 4, 4);
            ctx.fillStyle = '#10B981';
            ctx.fillRect(x + 6, y + 5, 6, 5);
            ctx.fillStyle = '#1E3A8A';
            ctx.fillRect(x + 4, y + 10, 4, 4);
            ctx.fillRect(x + 10, y + 10, 4, 4);
        } else if (t.includes('tv') || t.includes('binge') || t.includes('સ્ક્રીન')) {
            // TV
            ctx.fillStyle = '#1F2937';
            ctx.fillRect(x + 2, y + 2, 14, 10);
            ctx.fillStyle = '#60A5FA';
            ctx.fillRect(x + 4, y + 4, 10, 6);
            ctx.fillStyle = '#4B5563';
            ctx.fillRect(x + 7, y + 12, 4, 2);
        } else if (t.includes('puja') || t.includes('prayer') || t.includes('પૂજા')) {
            // Diya lamp with auspicious flame
            ctx.fillStyle = '#D97706';
            ctx.fillRect(x + 4, y + 8, 10, 4);
            ctx.fillRect(x + 2, y + 12, 14, 2);
            ctx.fillStyle = '#F59E0B';
            ctx.fillRect(x + 7, y + 4, 4, 4);
            ctx.fillStyle = '#EF4444';
            ctx.fillRect(x + 8, y + 2, 2, 3);
            ctx.fillStyle = '#FFF';
            ctx.fillRect(x + 8, y + 5, 2, 2);
        } else if (t.includes('skip') || t.includes('later') || t.includes('ટાળવું')) {
            // Clock with cross
            ctx.fillStyle = '#9CA3AF';
            ctx.fillRect(x + 3, y + 2, 12, 12);
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(x + 5, y + 4, 8, 8);
            ctx.fillStyle = '#EF4444';
            ctx.fillRect(x + 8, y + 5, 2, 4);
            ctx.fillRect(x + 8, y + 7, 3, 2);
        } else if (t.includes('forgive') || t.includes('heart') || t.includes('માફ')) {
            // Lotus / Peaceful heart
            ctx.fillStyle = '#EC4899';
            ctx.fillRect(x + 3, y + 3, 4, 4);
            ctx.fillRect(x + 11, y + 3, 4, 4);
            ctx.fillRect(x + 2, y + 5, 14, 4);
            ctx.fillRect(x + 5, y + 9, 8, 3);
            ctx.fillRect(x + 7, y + 12, 4, 2);
        } else if (t.includes('grudge') || t.includes('anger') || t.includes('વેર')) {
            // Angry mask
            ctx.fillStyle = '#EF4444';
            ctx.fillRect(x + 3, y + 2, 12, 12);
            ctx.fillStyle = '#000';
            ctx.fillRect(x + 5, y + 5, 2, 2);
            ctx.fillRect(x + 11, y + 5, 2, 2);
            ctx.fillRect(x + 6, y + 10, 6, 2);
        } else {
            // Auspicious Kalash / Star
            ctx.fillStyle = '#FFD700';
            ctx.fillRect(x + 7, y + 1, 4, 14);
            ctx.fillRect(x + 2, y + 6, 14, 4);
            ctx.fillStyle = '#FFF';
            ctx.fillRect(x + 7, y + 6, 4, 4);
        }

        ctx.restore();
    }

    // ---- Main Choice UI Rendering ----

    function renderChoiceUI(ctx, cp, timer) {
        const isLeftGood = cp.goodSide === 'left';
        const leftMain = isLeftGood ? cp.good : cp.bad;
        const leftSub = isLeftGood ? cp.goodGuj : cp.badGuj;
        const rightMain = isLeftGood ? cp.bad : cp.good;
        const rightSub = isLeftGood ? cp.badGuj : cp.goodGuj;

        // Dark ambient overlay
        ctx.fillStyle = 'rgba(7, 9, 22, 0.78)';
        ctx.fillRect(0, 0, CONFIG.WIDTH, CONFIG.HEIGHT);

        // Header Question banner
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';

        // English Question
        ctx.font = 'bold 12px "Segoe UI", Arial, sans-serif';
        ctx.fillStyle = '#000';
        ctx.fillText(cp.question, CONFIG.WIDTH / 2 + 1, 23);
        ctx.fillStyle = '#FFD700';
        ctx.fillText(cp.question, CONFIG.WIDTH / 2, 22);

        // Gujarati Question Subtitle
        ctx.font = 'bold 11px "Segoe UI", Arial, sans-serif';
        ctx.fillStyle = '#000';
        ctx.fillText(cp.questionGuj, CONFIG.WIDTH / 2 + 1, 38);
        ctx.fillStyle = '#FDE68A';
        ctx.fillText(cp.questionGuj, CONFIG.WIDTH / 2, 37);

        // Guidance prompt
        ctx.font = 'bold 8px monospace';
        ctx.fillStyle = '#94A3B8';
        ctx.fillText('Choose with Left [A] or Right [D]', CONFIG.WIDTH / 2, 53);

        // Choice Panels
        const pw = 162, ph = 96;
        const py = 66, gap = 20;
        const lx = CONFIG.WIDTH / 2 - pw - gap / 2;
        const rx = CONFIG.WIDTH / 2 + gap / 2;
        const pulse = 0.6 + 0.4 * Math.sin(timer * 0.14);

        // Left Panel (Key A / 1)
        drawPanel(ctx, lx, py, pw, ph, '#38BDF8');
        drawChoiceIcon(ctx, lx + pw / 2 - 9, py + 10, leftMain);

        ctx.font = 'bold 10px "Segoe UI", Arial, sans-serif';
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        wrapText(ctx, leftMain, lx + pw / 2, py + 33, pw - 14, 13);

        ctx.font = '9px "Segoe UI", Arial, sans-serif';
        ctx.fillStyle = '#93C5FD';
        ctx.fillText(leftSub, lx + pw / 2, py + 59);

        // Key indicator pill
        ctx.fillStyle = 'rgba(56, 189, 248, 0.2)';
        ctx.fillRect(lx + pw / 2 - 28, py + ph - 20, 56, 15);
        ctx.font = 'bold 11px monospace';
        ctx.globalAlpha = pulse;
        ctx.fillStyle = '#38BDF8';
        ctx.fillText('[ A / 1 ]', lx + pw / 2, py + ph - 17);
        ctx.globalAlpha = 1;

        // Right Panel (Key D / 3)
        drawPanel(ctx, rx, py, pw, ph, '#FB923C');
        drawChoiceIcon(ctx, rx + pw / 2 - 9, py + 10, rightMain);

        ctx.font = 'bold 10px "Segoe UI", Arial, sans-serif';
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        wrapText(ctx, rightMain, rx + pw / 2, py + 33, pw - 14, 13);

        ctx.font = '9px "Segoe UI", Arial, sans-serif';
        ctx.fillStyle = '#FDBA74';
        ctx.fillText(rightSub, rx + pw / 2, py + 59);

        // Key indicator pill
        ctx.fillStyle = 'rgba(251, 146, 60, 0.2)';
        ctx.fillRect(rx + pw / 2 - 28, py + ph - 20, 56, 15);
        ctx.font = 'bold 11px monospace';
        ctx.globalAlpha = pulse;
        ctx.fillStyle = '#FB923C';
        ctx.fillText('[ D / 3 ]', rx + pw / 2, py + ph - 17);
        ctx.globalAlpha = 1;
    }

    return {
        data,
        randomizeSides,
        randomizeOneSide,
        renderChoiceUI
    };
})();
