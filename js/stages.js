// ============================================================
// STAGES — the four lesson stages and the screens that show them
//
// The game runs until the player reaches a stage gate, then hands over to
// this module. The run is paused while a stage is on screen.
//
// EDITING THE CONTENT
//   Everything players read is in STAGE_DATA below. Each stage has:
//     title    shown on every screen of the stage
//     intro    the opening card            { icon, lead, bullets, delay }
//     chain    (optional) flow-chart steps shown above the questions
//     steps    the questions, asked in order
//     outro    (optional) the closing card  { icon, title, lead }
//   Each step has a prompt and exactly two options:
//     { text, good: true,  then: {card} }   right answer; "then" is optional
//     { text, good: false, why: '...' }     wrong answer: costs a life, shows
//                                           why, then asks the question again
//     { text, good: false, wrong: {card} }  same, with a custom card
//   yesno: true keeps the first option on the left (YES) and the second on
//   the right (NO); otherwise the two sides are shuffled every time.
//   Any card or step may carry a "guj" line, shown under the English.
//   delay is how long before the continue button appears (30 = 1 second).
// ============================================================
const STAGE_DATA = [
    // ---------------------------------------------------------
    {
        title: 'The Best Way to Start Your Day',
        intro: {
            icon: '⏰', ring: true,
            lead: 'Begin your day by remembering Bhagwan.',
            bullets: [
                'Brush your teeth',
                'Take a shower',
                'Wear clean clothes',
                'Perform your daily puja',
                'Start your best day!'
            ],
            delay: 90
        },
        chain: ['Wake up', 'Brush + shower', 'Clean clothes', 'Daily puja', 'Best day!'],
        steps: [
            {
                prompt: 'You wake up. What do you do first?',
                options: [
                    { text: 'Brush your teeth and take a shower', good: true },
                    { text: 'Check your phone', good: false,
                      why: 'The phone can wait. Freshen up first: brush your teeth and take a shower.' }
                ]
            },
            {
                prompt: 'You are fresh and clean. What do you wear?',
                options: [
                    { text: 'Clean clothes', good: true },
                    { text: 'The same clothes as yesterday', good: false,
                      why: "Yesterday's clothes are not fresh. Clean clothes help you feel ready for the day." }
                ]
            },
            {
                prompt: 'You are dressed and ready. What comes next?',
                options: [
                    { text: 'Perform your daily puja', good: true },
                    { text: 'Check social media', good: false,
                      why: 'Social media can wait. Give the first part of your day to Bhagwan with your daily puja.' }
                ]
            }
        ],
        outro: {
            icon: '🌅',
            title: 'You have started your best day!',
            lead: 'Bhagwan first, then a fresh body, clean clothes and puja.'
        }
    },

    // ---------------------------------------------------------
    {
        title: 'The Power of Choice',
        intro: {
            icon: '🔀',
            lead: 'Every choice takes you somewhere. Choose where you want to go.',
            delay: 45
        },
        steps: [
            {
                prompt: "It's Friday night. Who do you spend it with?",
                options: [
                    { text: 'Good friends who inspire, motivate and guide you, and connect you with Bhagwan', good: true },
                    { text: 'Hang out and party with friends all night', good: false,
                      wrong: {
                          tone: 'dark',
                          title: 'Where that road leads',
                          cons: ['Bad grades', 'Bad habits', 'An unhappy life'],
                          delay: 60,
                          ask: 'Do you want to be rescued?',
                          button: 'RESCUE ME'
                      } }
                ]
            }
        ],
        outro: {
            icon: '🤝',
            title: 'Stage cleared!',
            lead: 'Good company lifts you up. Choose friends who bring you closer to Bhagwan.'
        }
    },

    // ---------------------------------------------------------
    {
        title: 'Good Friends and Focus',
        intro: {
            icon: '📚',
            lead: 'Good friends push you to be your best, even when you do not feel like hearing it.',
            delay: 45
        },
        steps: [
            {
                prompt: 'Your good friends keep nagging you to study well and stay focused. What do you think?',
                options: [
                    { text: 'They are saying it for my own good. I should listen.', good: true,
                      then: { title: 'You read and work hard', grade: 'B+', lead: 'Good work! But is there more in you?' } },
                    { text: '“Fari khav!” I ignore their advice.', good: false,
                      wrong: {
                          tone: 'dark',
                          title: 'You ignored good advice',
                          grade: 'C · D',
                          cons: ['Poor grades', 'Unhappy'],
                          delay: 45,
                          button: 'TRY AGAIN'
                      } }
                ]
            },
            {
                prompt: 'You got a B+. Do you want to upgrade?',
                yesno: true,
                options: [
                    { text: 'YES', good: true,
                      then: { title: 'You also pray for 15 minutes every day', grade: 'A+',
                              lead: 'Hard work + prayer gets you the best results.' } },
                    { text: 'NO', good: true,
                      then: { title: 'You keep your B+', grade: 'B+',
                              lead: 'Hard work got you this far. Add 15 minutes of daily prayer and you reach A+. Hard work + prayer gets the best results.' } }
                ]
            }
        ]
    },

    // ---------------------------------------------------------
    {
        title: 'Work While You Work, Play While You Play',
        intro: {
            icon: '🎯',
            lead: 'Give your full attention to whatever you are doing right now.',
            delay: 45
        },
        steps: [
            {
                prompt: "It's homework time. Will you put your game away and start?",
                yesno: true,
                options: [
                    { text: 'YES', good: true, then: { lead: 'Great start! Focus helps you make progress.' } },
                    { text: 'NO', good: false, why: 'Playing now leaves less time for your work.' }
                ]
            },
            {
                prompt: 'Your phone buzzes. Will you check it while working?',
                yesno: true,
                options: [
                    { text: 'YES', good: false, why: 'Switching attention slows you down.' },
                    { text: 'NO', good: true, then: { lead: 'That message can wait. Keep going!' } }
                ]
            },
            {
                prompt: "You've worked hard and feel tired. Will you take a short break?",
                yesno: true,
                options: [
                    { text: 'YES', good: true, then: { lead: 'A short break helps you return refreshed.' } },
                    { text: 'NO', good: false, why: 'Working well includes knowing when to rest.' }
                ]
            },
            {
                prompt: "You're on the football field. Will you put your phone away and join your friends?",
                yesno: true,
                options: [
                    { text: 'YES', good: true, then: { lead: 'Be here! Give your play your full attention too.' } },
                    { text: 'NO', good: false, why: "You're missing the fun happening around you." }
                ]
            }
        ],
        outro: {
            icon: '🏆',
            title: 'Work while you work, play while you play',
            lead: 'One thing at a time, with your full attention. Now, on to the Mandir!'
        }
    }
];

const Stages = (() => {
    const READ_DELAY = 30;       // default wait before a card can be dismissed
    const ANSWER_DELAY = 12;     // short guard so a held button can't answer instantly

    let el = null;
    let active = false;
    let hooks = null;
    let stageIdx = 0, stage = null, stepIdx = 0;
    let view = null;             // the screen currently shown
    let timer = 0;
    let sides = [0, 1];          // which option sits on the left / right

    const HEART_SVG =
        '<svg viewBox="0 0 10 9" aria-hidden="true"><path fill="currentColor" d="' +
        'M2 0h2v1H2zM6 0h2v1H6zM1 1h4v1H1zM5 1h4v1H5zM0 2h10v3H0zM1 5h8v1H1zM2 6h6v1H2zM3 7h4v1H3zM4 8h2v1H4z"/></svg>';

    function esc(s) {
        return String(s).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
    }

    function ensureEl() {
        if (el) return;
        el = document.getElementById('overlay');
        // Tapping an option picks it; tapping a card presses "continue".
        el.addEventListener('pointerdown', e => {
            Input.markActivity();
            const opt = e.target.closest('.ov-opt');
            if (opt) { Input.tap(opt.dataset.side); return; }
            if (view && view.kind === 'card') Input.tap('jump');
        });
    }

    // ---------------- building screens ----------------

    function heartsHtml(breakingIndex) {
        const lives = hooks.getLives();
        let h = '<div class="ov-hearts">';
        for (let i = 0; i < CONFIG.MAX_LIVES; i++) {
            const cls = i === breakingIndex ? ' breaking' : (i >= lives ? ' lost' : '');
            h += `<div class="ov-heart${cls}">${HEART_SVG}</div>`;
        }
        return h + '</div>';
    }

    function chainHtml(doneCount) {
        if (!stage.chain) return '';
        let h = '<div class="ov-chain">';
        stage.chain.forEach((label, i) => {
            if (i > 0) h += '<span class="ov-arrow">▶</span>';
            const cls = i < doneCount ? ' done' : (i === doneCount ? ' now' : '');
            h += `<span class="ov-step${cls}">${esc(label)}</span>`;
        });
        return h + '</div>';
    }

    function pillHtml() {
        return `<div class="ov-pill">STAGE ${stageIdx + 1} OF ${STAGE_DATA.length}</div>`;
    }

    function showCard(card, onContinue) {
        view = Object.assign({ kind: 'card', tone: 'info', delay: READ_DELAY, button: 'CONTINUE' }, card, { onContinue });
        timer = 0;
        let h = '<div class="ov-card">';
        if (view.lifeLost) {
            h += heartsHtml(hooks.getLives()) + '<div class="ov-lifelost">YOU LOST A LIFE</div>';
        }
        h += pillHtml();
        if (view.icon) h += `<div><span class="ov-icon${view.ring ? ' ring' : ''}">${view.icon}</span></div>`;
        if (view.title) h += `<h1 class="ov-title">${esc(view.title)}</h1>`;
        if (view.chainDone !== undefined) h += chainHtml(view.chainDone);
        if (view.grade) h += `<div><span class="ov-grade">${esc(view.grade)}</span></div>`;
        if (view.cons) h += '<ul class="ov-list cons">' + view.cons.map(c => `<li>${esc(c)}</li>`).join('') + '</ul>';
        if (view.lead) h += `<p class="ov-lead">${esc(view.lead)}</p>`;
        if (view.bullets) h += '<ul class="ov-list">' + view.bullets.map(b => `<li>${esc(b)}</li>`).join('') + '</ul>';
        if (view.guj) h += `<p class="ov-guj">${esc(view.guj)}</p>`;
        h += '<div class="ov-hint"></div></div>';
        el.className = 'tone-' + view.tone;
        el.innerHTML = h;
        view.ready = false;
        UI.setLabels(null, null, null);
    }

    function showQuestion() {
        const step = stage.steps[stepIdx];
        sides = (step.yesno || Math.random() < 0.5) ? [0, 1] : [1, 0];
        view = { kind: 'question', step };
        timer = 0;
        const label = i => step.yesno ? '' : `<span class="ov-side">${i === 0 ? '◀ LEFT' : 'RIGHT ▶'}</span>`;
        let h = '<div class="ov-card">' + heartsHtml(-1) + pillHtml();
        h += `<h1 class="ov-title">${esc(stage.title)}</h1>`;
        if (stage.chain) h += chainHtml(stepIdx + 1);
        h += `<p class="ov-lead">${esc(step.prompt)}</p>`;
        if (step.guj) h += `<p class="ov-guj">${esc(step.guj)}</p>`;
        h += '<div class="ov-options">';
        ['left', 'right'].forEach((side, i) => {
            const opt = step.options[sides[i]];
            h += `<button type="button" class="ov-opt" data-side="${side}">${label(i)}${esc(opt.text)}</button>`;
        });
        h += '</div><div class="ov-hint">Choose with the left or right button</div></div>';
        el.className = 'tone-info';
        el.innerHTML = h;
        UI.setLabels(step.yesno ? 'YES' : '◀ THIS ONE', null, step.yesno ? 'NO' : 'THIS ONE ▶');
        Sound.choiceAppear();
    }

    // ---------------- flow ----------------

    function start(index, gameHooks) {
        ensureEl();
        hooks = gameHooks;
        stageIdx = index;
        stage = STAGE_DATA[index];
        stepIdx = 0;
        active = true;
        const intro = stage.intro || {};
        showCard(Object.assign({ title: stage.title }, intro), askNext);
    }

    function askNext() {
        if (stepIdx < stage.steps.length) {
            showQuestion();
        } else if (stage.outro) {
            Sound.goodChoice();
            showCard(Object.assign({ tone: 'good', chainDone: stage.chain ? stage.chain.length : undefined }, stage.outro), finish);
        } else {
            finish();
        }
    }

    function finish() {
        close();
        hooks.onClear(stageIdx);
    }

    function choose(side) {
        const step = view.step;
        const opt = step.options[sides[side === 'left' ? 0 : 1]];
        if (opt.good) {
            Sound.goodChoice();
            stepIdx++;
            if (opt.then) {
                showCard(Object.assign({ tone: 'good', title: 'Good choice!' }, opt.then), askNext);
            } else {
                askNext();
            }
            return;
        }
        // Wrong: lose a life, show why, then ask the same question again.
        const livesLeft = hooks.loseLife();
        const card = Object.assign(
            { tone: 'bad', title: 'Not the best choice', lead: opt.why, delay: 45, button: 'TRY AGAIN' },
            opt.wrong || {},
            { lifeLost: true }
        );
        if (livesLeft <= 0) card.button = 'CONTINUE';
        showCard(card, () => {
            if (livesLeft <= 0) { close(); hooks.onGameOver(); }
            else askNext();
        });
    }

    /** Call once per frame while a stage is on screen. */
    function update() {
        if (!active || !view) return;
        timer++;
        if (view.kind === 'card') {
            if (!view.ready && timer >= view.delay) {
                view.ready = true;
                const hint = el.querySelector('.ov-hint');
                if (hint) {
                    hint.textContent = view.ask ? view.ask : `Press ${view.button} to go on`;
                    hint.classList.add('ready');
                    if (view.ask) hint.classList.add('ask');
                }
            }
            UI.setLabels(null, view.ready ? view.button : null, null);
            if (view.ready && Input.justPressed.jump) view.onContinue();
        } else {
            const yn = view.step.yesno;
            UI.setLabels(yn ? 'YES' : '◀ THIS ONE', null, yn ? 'NO' : 'THIS ONE ▶');
            if (timer >= ANSWER_DELAY) {
                if (Input.justPressed.left) choose('left');
                else if (Input.justPressed.right) choose('right');
            }
        }
    }

    function close() {
        active = false;
        view = null;
        if (el) { el.className = 'hidden'; el.innerHTML = ''; }
    }

    return {
        start, update, close,
        get active() { return active; },
        get count() { return STAGE_DATA.length; }
    };
})();
