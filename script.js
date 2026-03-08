// ===================================
// APPLICATION STATE
// ===================================
const FIELDS = ['mask', 'network', 'firstHost', 'lastHost', 'broadcast', 'nextSubnet'];
const TOTAL_FIELDS = FIELDS.length;

const LEVELS = [
    { name: 'Beginner', xp: 0 },
    { name: 'Novice', xp: 100 },
    { name: 'Apprentice', xp: 300 },
    { name: 'Intermediate', xp: 600 },
    { name: 'Skilled', xp: 1000 },
    { name: 'Advanced', xp: 1500 },
    { name: 'Expert', xp: 2200 },
    { name: 'Master', xp: 3000 },
    { name: 'Grandmaster', xp: 4000 },
    { name: 'Legend', xp: 5500 },
];

const appState = {
    currentIP: '',
    currentPrefix: 0,
    correctAnswers: {},
    difficulty: 'easy',
    score: 0,
    streak: 0,
    bestStreak: 0,
    totalAttempts: 0,
    correctAttempts: 0,
    timerInterval: null,
    startTime: null,
    examMode: false,
    customRange: false,
    minPrefix: 24,
    maxPrefix: 30,
    history: [],
    prefixStats: {},
    totalXP: 0,
};

// ===================================
// LOCAL STORAGE
// ===================================
function loadState() {
    const saved = localStorage.getItem('subnetAppState');
    if (saved) {
        const data = JSON.parse(saved);
        appState.examMode = data.examMode || false;
        appState.customRange = data.customRange || false;
        appState.minPrefix = data.minPrefix || 24;
        appState.maxPrefix = data.maxPrefix || 30;
        appState.history = data.history || [];
        appState.prefixStats = data.prefixStats || {};
        appState.totalXP = data.totalXP || 0;
        appState.bestStreak = data.bestStreak || 0;
    }
}

function saveState() {
    localStorage.setItem('subnetAppState', JSON.stringify({
        examMode: appState.examMode,
        customRange: appState.customRange,
        minPrefix: appState.minPrefix,
        maxPrefix: appState.maxPrefix,
        history: appState.history.slice(-50),
        prefixStats: appState.prefixStats,
        totalXP: appState.totalXP,
        bestStreak: appState.bestStreak,
    }));
}

// ===================================
// IP CONVERSION
// ===================================
function ipToInt(ip) {
    const parts = ip.split('.').map(Number);
    return (parts[0] << 24) + (parts[1] << 16) + (parts[2] << 8) + parts[3];
}

function intToIp(int) {
    return [
        (int >>> 24) & 255,
        (int >>> 16) & 255,
        (int >>> 8) & 255,
        int & 255,
    ].join('.');
}

function generateRandomIP() {
    return [
        Math.floor(Math.random() * 223) + 1, // Avoid 0.x.x.x and >= 224 (multicast)
        Math.floor(Math.random() * 256),
        Math.floor(Math.random() * 256),
        Math.floor(Math.random() * 254) + 1, // Avoid .0 and .255 for more realistic IPs
    ].join('.');
}

// ===================================
// SUBNET CALCULATION
// ===================================
function calculateSubnet(ip, prefix) {
    const ipInt = ipToInt(ip);
    const maskInt = (0xFFFFFFFF << (32 - prefix)) >>> 0;
    const network = (ipInt & maskInt) >>> 0;
    const broadcast = (network | (~maskInt >>> 0)) >>> 0;
    const firstHost = network + 1;
    const lastHost = broadcast - 1;
    const nextSubnet = (broadcast + 1) >>> 0;
    const blockSize = Math.pow(2, 32 - prefix);

    return {
        mask: intToIp(maskInt),
        network: intToIp(network),
        firstHost: intToIp(firstHost),
        lastHost: intToIp(lastHost),
        broadcast: intToIp(broadcast),
        nextSubnet: intToIp(nextSubnet),
        blockSize: blockSize,
    };
}

// ===================================
// XP / LEVEL SYSTEM
// ===================================
function getLevelInfo(totalXP) {
    let level = 1;
    let currentLevelXP = 0;
    let nextLevelXP = LEVELS[1].xp;

    for (let i = LEVELS.length - 1; i >= 0; i--) {
        if (totalXP >= LEVELS[i].xp) {
            level = i + 1;
            currentLevelXP = LEVELS[i].xp;
            nextLevelXP = i < LEVELS.length - 1 ? LEVELS[i + 1].xp : LEVELS[i].xp + 1000;
            break;
        }
    }

    const xpInLevel = totalXP - currentLevelXP;
    const xpNeeded = nextLevelXP - currentLevelXP;
    const progress = Math.min((xpInLevel / xpNeeded) * 100, 100);

    return {
        level,
        title: LEVELS[Math.min(level - 1, LEVELS.length - 1)].name,
        xpInLevel,
        xpNeeded,
        progress,
        totalXP,
    };
}

function updateXPDisplay() {
    const info = getLevelInfo(appState.totalXP);

    document.getElementById('levelBadge').textContent = info.level;
    document.getElementById('levelText').textContent = info.level;
    document.getElementById('levelTitle').textContent = info.title;
    document.getElementById('xpText').textContent = `${info.xpInLevel} / ${info.xpNeeded} XP`;
    document.getElementById('xpFill').style.width = info.progress + '%';
}

// ===================================
// DIFFICULTY
// ===================================
function setDifficulty(level) {
    appState.difficulty = level;
    document.querySelectorAll('.difficulty-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`diff-${level}`).classList.add('active');
    generateNewProblem();
}

function getPrefixRange() {
    if (appState.customRange) {
        return [appState.minPrefix, appState.maxPrefix];
    }
    if (appState.difficulty === 'easy') return [24, 30];
    if (appState.difficulty === 'medium') return [16, 28];
    return [8, 30];
}

// ===================================
// TIMER
// ===================================
function startTimer() {
    if (appState.timerInterval) clearInterval(appState.timerInterval);
    appState.startTime = Date.now();
    appState.timerInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - appState.startTime) / 1000);
        const mins = Math.floor(elapsed / 60).toString().padStart(2, '0');
        const secs = (elapsed % 60).toString().padStart(2, '0');
        document.getElementById('timer').textContent = `${mins}:${secs}`;
    }, 1000);
}

function getElapsedTime() {
    return appState.startTime ? Math.floor((Date.now() - appState.startTime) / 1000) : 0;
}

// ===================================
// STATS
// ===================================
function updateStats() {
    animateCounter('score', appState.score);
    animateCounter('streak', appState.streak);

    const accuracy = appState.totalAttempts > 0
        ? Math.round((appState.correctAttempts / appState.totalAttempts) * 100)
        : 0;
    document.getElementById('accuracy').textContent = accuracy + '%';

    updateXPDisplay();
}

function animateCounter(elementId, targetValue) {
    const el = document.getElementById(elementId);
    const currentValue = parseInt(el.textContent) || 0;

    if (currentValue === targetValue) return;

    const diff = targetValue - currentValue;
    const steps = Math.min(Math.abs(diff), 20);
    const increment = diff / steps;
    let step = 0;

    const interval = setInterval(() => {
        step++;
        if (step >= steps) {
            el.textContent = targetValue;
            clearInterval(interval);
        } else {
            el.textContent = Math.round(currentValue + increment * step);
        }
    }, 30);
}

function updatePrefixStats(prefix, correct) {
    if (!appState.prefixStats[prefix]) {
        appState.prefixStats[prefix] = { attempts: 0, correct: 0 };
    }
    appState.prefixStats[prefix].attempts++;
    if (correct) appState.prefixStats[prefix].correct++;
    saveState();
}

// ===================================
// PROGRESS BAR
// ===================================
function updateProgressBar() {
    let filled = 0;
    FIELDS.forEach(field => {
        const desktopInput = document.getElementById(`input-${field}`);
        const mobileInput = document.getElementById(`input-${field}-mobile`);
        const value = (desktopInput?.value || mobileInput?.value || '').trim();
        if (value && !value.includes('___')) filled++;
    });

    const pct = Math.round((filled / TOTAL_FIELDS) * 100);
    document.getElementById('progressFill').style.width = pct + '%';
    document.getElementById('progressCount').textContent = `${filled}/${TOTAL_FIELDS}`;
}

// ===================================
// HINTS
// ===================================
function generateHint() {
    const octet = Math.floor(appState.currentPrefix / 8);
    const bitsInOctet = appState.currentPrefix % 8;
    const blockSize = Math.pow(2, 8 - bitsInOctet);
    let hint = `Focus on octet ${octet + 1}. The /${appState.currentPrefix} mask means ${appState.currentPrefix} network bits.`;
    if (bitsInOctet > 0) {
        hint += ` Block size in octet ${octet + 1} is ${blockSize}.`;
    }
    return hint;
}

function toggleHint() {
    if (appState.examMode) return;
    const hintBox = document.getElementById('hintBox');
    const hintText = document.getElementById('hintText');
    if (hintBox.classList.contains('visible')) {
        hintBox.classList.remove('visible');
    } else {
        hintText.textContent = generateHint();
        hintBox.classList.add('visible');
    }
}

// ===================================
// STEP-BY-STEP
// ===================================
function toggleSteps() {
    if (appState.examMode) return;
    const stepsPanel = document.getElementById('stepsPanel');
    const stepsContent = document.getElementById('stepsContent');

    if (stepsPanel.classList.contains('visible')) {
        stepsPanel.classList.remove('visible');
    } else {
        const calc = appState.correctAnswers;
        stepsContent.innerHTML = `
            <div class="step-item"><strong>1. Subnet Mask:</strong> ${calc.mask}</div>
            <div class="step-item"><strong>2. Block Size:</strong> ${calculateSubnet(appState.currentIP, appState.currentPrefix).blockSize}</div>
            <div class="step-item"><strong>3. Network Address:</strong> ${calc.network}</div>
            <div class="step-item"><strong>4. Broadcast Address:</strong> ${calc.broadcast}</div>
            <div class="step-item"><strong>5. Host Range:</strong> ${calc.firstHost} – ${calc.lastHost}</div>
            <div class="step-item"><strong>6. Next Subnet:</strong> ${calc.nextSubnet}</div>
        `;
        stepsPanel.classList.add('visible');
    }
}

// ===================================
// BINARY VISUALIZATION
// ===================================
function toggleBinaryViz() {
    if (appState.examMode) return;
    const panel = document.getElementById('binaryViz');
    if (panel.classList.contains('visible')) {
        panel.classList.remove('visible');
    } else {
        renderBinaryViz();
        panel.classList.add('visible');
    }
}

function ipToBinaryArray(ip) {
    return ip.split('.').map(octet =>
        parseInt(octet).toString(2).padStart(8, '0')
    );
}

function renderBinaryViz() {
    const prefix = appState.currentPrefix;
    const ipBinary = ipToBinaryArray(appState.currentIP);
    const maskBinary = ipToBinaryArray(appState.correctAnswers.mask);
    const netBinary = ipToBinaryArray(appState.correctAnswers.network);

    const content = document.getElementById('binaryContent');

    function renderBitsRow(label, binaryOctets) {
        let html = `<div class="binary-row"><span class="binary-label">${label}</span><div class="binary-bits">`;
        let bitIndex = 0;
        binaryOctets.forEach((octet, octetIdx) => {
            if (octetIdx > 0) html += '<span class="dot-sep">.</span>';
            for (const bit of octet) {
                const cls = bitIndex < prefix ? 'network-bit' : 'host-bit';
                html += `<span class="${cls}">${bit}</span>`;
                bitIndex++;
            }
        });
        html += '</div></div>';
        return html;
    }

    content.innerHTML =
        renderBitsRow('IP Address', ipBinary) +
        renderBitsRow('Subnet Mask', maskBinary) +
        renderBitsRow('Network', netBinary) +
        `<div class="binary-row" style="margin-top:8px;opacity:0.6;font-size:0.7rem;">
            <span class="binary-label"></span>
            <div class="binary-bits">
                <span class="network-bit">■</span><span style="margin-left:4px;color:var(--color-text-muted)">= Network (${prefix} bits)</span>
                <span style="margin-left:12px;" class="host-bit">■</span><span style="margin-left:4px;color:var(--color-text-muted)">= Host (${32 - prefix} bits)</span>
            </div>
        </div>`;
}

// ===================================
// CHEAT SHEET
// ===================================
function toggleCheatSheet() {
    const content = document.getElementById('cheatSheetContent');
    const toggle = document.getElementById('cheatToggle');
    content.classList.toggle('visible');
    toggle.textContent = content.classList.contains('visible') ? '▲' : '▼';
}

// ===================================
// KEYBOARD SHORTCUTS
// ===================================
function toggleShortcuts() {
    const tooltip = document.getElementById('shortcutsTooltip');
    tooltip.classList.toggle('visible');
}

// ===================================
// PROBLEM GENERATION
// ===================================
function generateNewProblem() {
    appState.currentIP = generateRandomIP();
    const [min, max] = getPrefixRange();
    appState.currentPrefix = Math.floor(Math.random() * (max - min + 1)) + min;
    appState.correctAnswers = calculateSubnet(appState.currentIP, appState.currentPrefix);

    document.getElementById('hintBox').classList.remove('visible');
    document.getElementById('stepsPanel').classList.remove('visible');
    document.getElementById('binaryViz').classList.remove('visible');
    startTimer();

    document.getElementById('targetIP').textContent = `${appState.currentIP} /${appState.currentPrefix}`;

    FIELDS.forEach(field => {
        // Desktop inputs
        const desktopInput = document.getElementById(`input-${field}`);
        if (desktopInput) {
            desktopInput.value = '';
            desktopInput.classList.remove('incorrect', 'correct-input');
        }
        const statusEl = document.getElementById(`status-${field}`);
        if (statusEl) statusEl.innerHTML = '';
        const answerEl = document.getElementById(`answer-${field}`);
        if (answerEl) {
            answerEl.innerHTML = '';
            answerEl.classList.remove('visible');
        }
        const errorEl = document.getElementById(`error-${field}`);
        if (errorEl) errorEl.textContent = '';

        // Mobile inputs
        const mobileInput = document.getElementById(`input-${field}-mobile`);
        if (mobileInput) {
            mobileInput.value = '';
            mobileInput.classList.remove('incorrect', 'correct-input');
        }
        const mobileStatus = document.getElementById(`status-${field}-mobile`);
        if (mobileStatus) mobileStatus.innerHTML = '';
        const mobileAnswer = document.getElementById(`answer-${field}-mobile`);
        if (mobileAnswer) {
            mobileAnswer.innerHTML = '';
            mobileAnswer.classList.remove('visible');
        }
        const mobileError = document.getElementById(`error-${field}-mobile`);
        if (mobileError) mobileError.textContent = '';
    });

    updateProgressBar();

    if (document.getElementById('autoFill').checked) {
        applyAutoFill();
    }
}

// ===================================
// ANSWER CHECKING
// ===================================
function checkAnswer(field) {
    const desktopInput = document.getElementById(`input-${field}`);
    const mobileInput = document.getElementById(`input-${field}-mobile`);
    const userAnswer = (desktopInput?.value || mobileInput?.value || '').trim();
    const correctAnswer = appState.correctAnswers[field];

    const desktopStatus = document.getElementById(`status-${field}`);
    const mobileStatus = document.getElementById(`status-${field}-mobile`);
    const desktopError = document.getElementById(`error-${field}`);
    const mobileError = document.getElementById(`error-${field}-mobile`);

    if (!userAnswer || userAnswer.includes('___')) {
        if (desktopStatus) desktopStatus.innerHTML = '';
        if (mobileStatus) mobileStatus.innerHTML = '';
        return false;
    }

    if (userAnswer === correctAnswer) {
        const checkMark = '<span class="correct">✔</span>';
        if (desktopStatus) desktopStatus.innerHTML = checkMark;
        if (mobileStatus) mobileStatus.innerHTML = checkMark;
        if (desktopError) desktopError.textContent = '';
        if (mobileError) mobileError.textContent = '';
        if (desktopInput) { desktopInput.classList.remove('incorrect'); desktopInput.classList.add('correct-input'); }
        if (mobileInput) { mobileInput.classList.remove('incorrect'); mobileInput.classList.add('correct-input'); }
        return true;
    } else {
        const xMark = '<span class="incorrect">✖</span>';
        if (desktopStatus) desktopStatus.innerHTML = xMark;
        if (mobileStatus) mobileStatus.innerHTML = xMark;
        if (desktopInput) { desktopInput.classList.add('incorrect'); desktopInput.classList.remove('correct-input'); }
        if (mobileInput) { mobileInput.classList.add('incorrect'); mobileInput.classList.remove('correct-input'); }
        if (!appState.examMode) {
            const explanation = getExplanation(field);
            if (desktopError) desktopError.textContent = explanation;
            if (mobileError) mobileError.textContent = explanation;
        }
        return false;
    }
}

function getExplanation(field) {
    const explanations = {
        mask: "Subnet mask is wrong. For /" + appState.currentPrefix + ", convert prefix bits to dotted decimal.",
        network: "Network address is wrong. AND the IP with the subnet mask.",
        firstHost: "First host is wrong. It should be the network address + 1.",
        lastHost: "Last host is wrong. It should be the broadcast address − 1.",
        broadcast: "Broadcast address is wrong. Set all host bits to 1.",
        nextSubnet: "Next subnet is wrong. Add the block size to the network address.",
    };
    return explanations[field];
}

function checkAll() {
    let allCorrect = true;
    let hasAnswers = false;

    FIELDS.forEach(field => {
        const desktopInput = document.getElementById(`input-${field}`);
        const mobileInput = document.getElementById(`input-${field}-mobile`);
        const userAnswer = (desktopInput?.value || mobileInput?.value || '').trim();

        if (userAnswer && !userAnswer.includes('___')) {
            hasAnswers = true;
            if (!checkAnswer(field)) {
                allCorrect = false;
            }
        } else {
            allCorrect = false;
        }
    });

    if (hasAnswers) {
        appState.totalAttempts++;
        const timeTaken = getElapsedTime();

        if (allCorrect) {
            appState.correctAttempts++;
            appState.streak++;
            if (appState.streak > appState.bestStreak) appState.bestStreak = appState.streak;

            const points = 10 * appState.streak;
            appState.score += points;
            appState.totalXP += points;

            updatePrefixStats(appState.currentPrefix, true);
            showToast(`🎉 Perfect! +${points} XP (×${appState.streak} streak)`, 'success');

            // Celebration on milestones
            if (appState.streak === 5 || appState.streak === 10 || appState.streak === 25 || appState.streak % 25 === 0) {
                launchConfetti();
            }
        } else {
            appState.streak = 0;
            updatePrefixStats(appState.currentPrefix, false);
        }

        appState.history.push({
            timestamp: new Date().toISOString(),
            mode: appState.examMode ? 'exam' : 'practice',
            difficulty: appState.difficulty,
            targetIp: appState.currentIP,
            prefix: appState.currentPrefix,
            completed: true,
            timeTakenSeconds: timeTaken,
            correct: allCorrect,
            scoreAfter: appState.score,
        });

        updateStats();
        saveState();
    }
}

// ===================================
// SHOW ANSWERS
// ===================================
function showAnswer(field) {
    if (appState.examMode) return;
    const answerText = `<span class="answer">${appState.correctAnswers[field]}</span>`;

    const desktopAnswer = document.getElementById(`answer-${field}`);
    if (desktopAnswer) {
        desktopAnswer.innerHTML = answerText;
        desktopAnswer.classList.add('visible');
    }

    const mobileAnswer = document.getElementById(`answer-${field}-mobile`);
    if (mobileAnswer) {
        mobileAnswer.textContent = appState.correctAnswers[field];
        mobileAnswer.classList.add('visible');
    }
}

function showAll() {
    if (appState.examMode) return;
    FIELDS.forEach(field => showAnswer(field));
}

// ===================================
// AUTO-FILL
// ===================================
function applyAutoFill() {
    const interestingOctet = Math.floor(appState.currentPrefix / 8);

    FIELDS.forEach(field => {
        const correctParts = appState.correctAnswers[field].split('.');
        let prefilled = '';

        for (let i = 0; i < 4; i++) {
            if (i < interestingOctet) {
                prefilled += correctParts[i] + '.';
            } else if (i === interestingOctet) {
                prefilled += '___';
                if (i < 3) prefilled += '.';
            } else {
                if (i < 3) prefilled += '.';
                prefilled += correctParts[i];
            }
        }

        const desktopInput = document.getElementById(`input-${field}`);
        if (desktopInput) desktopInput.value = prefilled;
        const mobileInput = document.getElementById(`input-${field}-mobile`);
        if (mobileInput) mobileInput.value = prefilled;
    });

    updateProgressBar();
}

function handleAutoFill() {
    if (document.getElementById('autoFill').checked) {
        applyAutoFill();
    } else {
        FIELDS.forEach(field => {
            const desktopInput = document.getElementById(`input-${field}`);
            if (desktopInput) desktopInput.value = '';
            const mobileInput = document.getElementById(`input-${field}-mobile`);
            if (mobileInput) mobileInput.value = '';
        });
        updateProgressBar();
    }
}

// ===================================
// AUTO-CHECK
// ===================================
function handleAutoCheck() {
    if (document.getElementById('autoCheck').checked) {
        FIELDS.forEach(field => {
            const desktopInput = document.getElementById(`input-${field}`);
            const mobileInput = document.getElementById(`input-${field}-mobile`);
            if (desktopInput) desktopInput.addEventListener('input', () => { checkAnswer(field); updateProgressBar(); });
            if (mobileInput) mobileInput.addEventListener('input', () => { checkAnswer(field); updateProgressBar(); });
        });
    } else {
        FIELDS.forEach(field => {
            ['', '-mobile'].forEach(suffix => {
                const input = document.getElementById(`input-${field}${suffix}`);
                if (input) {
                    const newInput = input.cloneNode(true);
                    input.parentNode.replaceChild(newInput, input);
                }
            });
            // Re-attach progress bar listeners
            ['', '-mobile'].forEach(suffix => {
                const input = document.getElementById(`input-${field}${suffix}`);
                if (input) {
                    input.addEventListener('input', updateProgressBar);
                }
            });
        });
    }
}

// ===================================
// ADVANCED OPTIONS
// ===================================
function toggleAdvanced() {
    const content = document.getElementById('advancedContent');
    const toggle = document.getElementById('advToggle');
    content.classList.toggle('visible');
    toggle.textContent = content.classList.contains('visible') ? '▲' : '▼';
}

function toggleExamMode() {
    appState.examMode = document.getElementById('examMode').checked;

    const showBtns = document.querySelectorAll('.show-btn');
    const showAllBtn = document.getElementById('showAllBtn');
    const showAllBtnMobile = document.getElementById('showAllBtnMobile');
    const hintBtn = document.getElementById('hintBtn');
    const stepsBtn = document.getElementById('stepsBtn');
    const binaryBtn = document.getElementById('binaryBtn');

    if (appState.examMode) {
        showBtns.forEach(btn => btn.disabled = true);
        if (showAllBtn) showAllBtn.disabled = true;
        if (showAllBtnMobile) showAllBtnMobile.disabled = true;
        if (hintBtn) hintBtn.disabled = true;
        if (stepsBtn) stepsBtn.disabled = true;
        if (binaryBtn) binaryBtn.disabled = true;
        document.getElementById('hintBox').classList.remove('visible');
        document.getElementById('stepsPanel').classList.remove('visible');
        document.getElementById('binaryViz').classList.remove('visible');
    } else {
        showBtns.forEach(btn => btn.disabled = false);
        if (showAllBtn) showAllBtn.disabled = false;
        if (showAllBtnMobile) showAllBtnMobile.disabled = false;
        if (hintBtn) hintBtn.disabled = false;
        if (stepsBtn) stepsBtn.disabled = false;
        if (binaryBtn) binaryBtn.disabled = false;
    }

    saveState();
}

function toggleCustomRange() {
    appState.customRange = document.getElementById('customRange').checked;
    const minSelect = document.getElementById('minPrefix');
    const maxSelect = document.getElementById('maxPrefix');

    minSelect.disabled = !appState.customRange;
    maxSelect.disabled = !appState.customRange;

    if (appState.customRange) {
        minSelect.innerHTML = '';
        maxSelect.innerHTML = '';
        for (let i = 8; i <= 30; i++) {
            minSelect.innerHTML += `<option value="${i}">${i}</option>`;
            maxSelect.innerHTML += `<option value="${i}">${i}</option>`;
        }
        minSelect.value = appState.minPrefix;
        maxSelect.value = appState.maxPrefix;

        minSelect.onchange = () => {
            appState.minPrefix = parseInt(minSelect.value);
            saveState();
        };
        maxSelect.onchange = () => {
            appState.maxPrefix = parseInt(maxSelect.value);
            saveState();
        };
    }

    saveState();
}

// ===================================
// STATS VIEW
// ===================================
function showStats() {
    const stats = Object.entries(appState.prefixStats)
        .map(([prefix, data]) => ({
            prefix: parseInt(prefix),
            accuracy: data.attempts > 0 ? (data.correct / data.attempts * 100).toFixed(1) : 0,
            attempts: data.attempts,
        }))
        .sort((a, b) => a.accuracy - b.accuracy)
        .slice(0, 5);

    if (stats.length === 0) {
        showToast('No statistics yet. Complete some problems first!', 'error');
        return;
    }

    let html = '<h3 style="margin-bottom:12px;font-size:0.9rem;">Weakest Prefixes</h3><table class="cheat-table"><thead><tr><th>Prefix</th><th>Attempts</th><th>Accuracy</th></tr></thead><tbody>';
    stats.forEach(s => {
        html += `<tr><td>/${s.prefix}</td><td>${s.attempts}</td><td>${s.accuracy}%</td></tr>`;
    });
    html += '</tbody></table>';

    const statsDiv = document.createElement('div');
    statsDiv.className = 'stats-view';
    statsDiv.innerHTML = html;

    const existing = document.querySelector('.stats-view');
    if (existing) existing.remove();

    document.querySelector('.advanced-panel').after(statsDiv);
}

// ===================================
// EXPORTS
// ===================================
function exportCSV() {
    if (appState.history.length === 0) {
        showToast('No history to export!', 'error');
        return;
    }
    let csv = 'Timestamp,Mode,Difficulty,Target IP,Prefix,Completed,Time (s),Correct,Score After\n';
    appState.history.forEach(h => {
        csv += `${h.timestamp},${h.mode},${h.difficulty},${h.targetIp},${h.prefix},${h.completed},${h.timeTakenSeconds},${h.correct},${h.scoreAfter}\n`;
    });
    downloadBlob(csv, 'text/csv', 'subnetting-history.csv');
}

function exportJSON() {
    if (appState.history.length === 0) {
        showToast('No history to export!', 'error');
        return;
    }
    downloadBlob(JSON.stringify(appState.history, null, 2), 'application/json', 'subnetting-history.json');
}

function downloadBlob(content, type, filename) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

// ===================================
// COPY IP
// ===================================
function copyIP() {
    const ipText = `${appState.currentIP} /${appState.currentPrefix}`;
    navigator.clipboard.writeText(ipText).then(() => {
        showToast('📋 IP copied to clipboard!', 'success');
    }).catch(() => {
        showToast('Failed to copy', 'error');
    });
}

// ===================================
// TOAST
// ===================================
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ===================================
// CONFETTI 🎉
// ===================================
function launchConfetti() {
    const container = document.getElementById('confettiContainer');
    const colors = ['#6366f1', '#a78bfa', '#06b6d4', '#10b981', '#f59e0b', '#f43f5e', '#ec4899'];
    const pieceCount = 60;

    for (let i = 0; i < pieceCount; i++) {
        const piece = document.createElement('div');
        piece.className = 'confetti-piece';
        piece.style.left = Math.random() * 100 + '%';
        piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        piece.style.animationDuration = (1.5 + Math.random() * 2) + 's';
        piece.style.animationDelay = Math.random() * 0.5 + 's';
        piece.style.width = (5 + Math.random() * 6) + 'px';
        piece.style.height = (8 + Math.random() * 8) + 'px';
        piece.style.opacity = 0.8 + Math.random() * 0.2;
        container.appendChild(piece);
    }

    setTimeout(() => {
        container.innerHTML = '';
    }, 4000);
}

// ===================================
// SYNC INPUTS
// ===================================
function syncInputs() {
    FIELDS.forEach(field => {
        const desktopInput = document.getElementById(`input-${field}`);
        const mobileInput = document.getElementById(`input-${field}-mobile`);

        if (desktopInput && mobileInput) {
            desktopInput.addEventListener('input', (e) => {
                mobileInput.value = e.target.value;
                updateProgressBar();
            });
            mobileInput.addEventListener('input', (e) => {
                desktopInput.value = e.target.value;
                updateProgressBar();
            });
        } else if (desktopInput) {
            desktopInput.addEventListener('input', updateProgressBar);
        }
    });
}

// ===================================
// KEYBOARD SHORTCUTS
// ===================================
document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;

    switch (e.key.toLowerCase()) {
        case 'enter':
            checkAll();
            break;
        case 'n':
            generateNewProblem();
            break;
        case 'h':
            if (!appState.examMode) toggleHint();
            break;
        case 's':
            if (!appState.examMode) showAll();
            break;
        case 'b':
            if (!appState.examMode) toggleBinaryViz();
            break;
    }
});

// Close shortcuts tooltip on outside click
document.addEventListener('click', (e) => {
    const tooltip = document.getElementById('shortcutsTooltip');
    const btn = document.getElementById('shortcutsBtn');
    if (tooltip && btn && !tooltip.contains(e.target) && !btn.contains(e.target)) {
        tooltip.classList.remove('visible');
    }
});

// ===================================
// INIT
// ===================================
window.onload = function () {
    loadState();
    syncInputs();
    generateNewProblem();
    updateXPDisplay();

    // Restore exam mode
    if (appState.examMode) {
        document.getElementById('examMode').checked = true;
        toggleExamMode();
    }

    // Restore custom range
    if (appState.customRange) {
        document.getElementById('customRange').checked = true;
        toggleCustomRange();
    }
};
