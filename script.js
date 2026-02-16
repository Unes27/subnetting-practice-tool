// Application State
const appState = {
    currentIP: '',
    currentPrefix: 0,
    correctAnswers: {},
    difficulty: 'easy',
    score: 0,
    streak: 0,
    totalAttempts: 0,
    correctAttempts: 0,
    timerInterval: null,
    startTime: null,
    examMode: false,
    customRange: false,
    minPrefix: 24,
    maxPrefix: 30,
    history: [],
    prefixStats: {}
};

// Load state from localStorage
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
    }
}

// Save state to localStorage
function saveState() {
    localStorage.setItem('subnetAppState', JSON.stringify({
        examMode: appState.examMode,
        customRange: appState.customRange,
        minPrefix: appState.minPrefix,
        maxPrefix: appState.maxPrefix,
        history: appState.history.slice(-50),
        prefixStats: appState.prefixStats
    }));
}

// IP Conversion Functions
function ipToInt(ip) {
    const parts = ip.split('.').map(Number);
    return (parts[0] << 24) + (parts[1] << 16) + (parts[2] << 8) + parts[3];
}

function intToIp(int) {
    return [
        (int >>> 24) & 255,
        (int >>> 16) & 255,
        (int >>> 8) & 255,
        int & 255
    ].join('.');
}

function generateRandomIP() {
    return [
        Math.floor(Math.random() * 256),
        Math.floor(Math.random() * 256),
        Math.floor(Math.random() * 256),
        Math.floor(Math.random() * 256)
    ].join('.');
}

// Subnet Calculation
function calculateSubnet(ip, prefix) {
    const ipInt = ipToInt(ip);
    const mask = (0xFFFFFFFF << (32 - prefix)) >>> 0;
    const network = (ipInt & mask) >>> 0;
    const broadcast = (network | (~mask >>> 0)) >>> 0;
    const firstHost = network + 1;
    const lastHost = broadcast - 1;
    const nextSubnet = (broadcast + 1) >>> 0;
    const blockSize = Math.pow(2, 32 - prefix);

    return {
        network: intToIp(network),
        firstHost: intToIp(firstHost),
        lastHost: intToIp(lastHost),
        broadcast: intToIp(broadcast),
        nextSubnet: intToIp(nextSubnet),
        mask: intToIp(mask),
        blockSize: blockSize
    };
}

// Difficulty Management
function setDifficulty(level) {
    appState.difficulty = level;
    document.querySelectorAll('.difficulty-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
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

// Timer Functions
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

// Stats Functions
function updateStats() {
    document.getElementById('score').textContent = appState.score;
    document.getElementById('streak').textContent = appState.streak;
    const accuracy = appState.totalAttempts > 0 
        ? Math.round((appState.correctAttempts / appState.totalAttempts) * 100) 
        : 0;
    document.getElementById('accuracy').textContent = accuracy + '%';
}

function updatePrefixStats(prefix, correct) {
    if (!appState.prefixStats[prefix]) {
        appState.prefixStats[prefix] = { attempts: 0, correct: 0 };
    }
    appState.prefixStats[prefix].attempts++;
    if (correct) appState.prefixStats[prefix].correct++;
    saveState();
}

// Hint Functions
function generateHint() {
    const octet = Math.floor(appState.currentPrefix / 8);
    const bitsInOctet = appState.currentPrefix % 8;
    return `Focus on octet ${octet + 1}. The subnet mask has ${appState.currentPrefix} bits set to 1. ${bitsInOctet > 0 ? `In octet ${octet + 1}, ${bitsInOctet} bits are used for the network.` : ''}`;
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

// Step-by-Step Reveal
function toggleSteps() {
    if (appState.examMode) return;
    const stepsPanel = document.getElementById('stepsPanel');
    const stepsContent = document.getElementById('stepsContent');
    
    if (stepsPanel.classList.contains('visible')) {
        stepsPanel.classList.remove('visible');
    } else {
        const calc = calculateSubnet(appState.currentIP, appState.currentPrefix);
        stepsContent.innerHTML = `
            <div class="step-item"><strong>1. Subnet Mask:</strong> ${calc.mask}</div>
            <div class="step-item"><strong>2. Block Size:</strong> ${calc.blockSize}</div>
            <div class="step-item"><strong>3. Network Address:</strong> ${calc.network}</div>
            <div class="step-item"><strong>4. Broadcast Address:</strong> ${calc.broadcast}</div>
            <div class="step-item"><strong>5. Host Range:</strong> ${calc.firstHost} - ${calc.lastHost}</div>
            <div class="step-item"><strong>6. Next Subnet:</strong> ${calc.nextSubnet}</div>
        `;
        stepsPanel.classList.add('visible');
    }
}

// Mistake Explanations
function showMistakeExplanation(field) {
    const explanations = {
        network: "Network address is wrong. Check the interesting octet and apply the subnet mask correctly.",
        firstHost: "First host is wrong. It should be the network address + 1.",
        lastHost: "Last host is wrong. It should be the broadcast address - 1.",
        broadcast: "Broadcast address is wrong. Check the block size and interesting octet.",
        nextSubnet: "Next subnet is wrong. Add the block size to the network address."
    };
    document.getElementById(`error-${field}`).textContent = explanations[field];
}

function clearMistakeExplanations() {
    const fields = ['network', 'firstHost', 'lastHost', 'broadcast', 'nextSubnet'];
    fields.forEach(field => {
        document.getElementById(`error-${field}`).textContent = '';
    });
}

// Problem Generation
function generateNewProblem() {
    appState.currentIP = generateRandomIP();
    const [min, max] = getPrefixRange();
    appState.currentPrefix = Math.floor(Math.random() * (max - min + 1)) + min;
    appState.correctAnswers = calculateSubnet(appState.currentIP, appState.currentPrefix);
    
    document.getElementById('hintBox').classList.remove('visible');
    document.getElementById('stepsPanel').classList.remove('visible');
    clearMistakeExplanations();
    startTimer();

    document.getElementById('targetIP').textContent = `${appState.currentIP} /${appState.currentPrefix}`;

    const fields = ['network', 'firstHost', 'lastHost', 'broadcast', 'nextSubnet'];
    fields.forEach(field => {
        // Desktop inputs
        const desktopInput = document.getElementById(`input-${field}`);
        if (desktopInput) {
            desktopInput.value = '';
            desktopInput.classList.remove('incorrect');
        }
        document.getElementById(`status-${field}`).innerHTML = '';
        document.getElementById(`answer-${field}`).innerHTML = '';
        document.getElementById(`answer-${field}`).classList.remove('visible');
        document.getElementById(`error-${field}`).textContent = '';
        
        // Mobile inputs
        const mobileInput = document.getElementById(`input-${field}-mobile`);
        if (mobileInput) {
            mobileInput.value = '';
            mobileInput.classList.remove('incorrect');
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

    if (document.getElementById('autoFill').checked) {
        applyAutoFill();
    }
}

// Answer Checking
function checkAnswer(field) {
    // Check both desktop and mobile inputs
    const desktopInput = document.getElementById(`input-${field}`);
    const mobileInput = document.getElementById(`input-${field}-mobile`);
    
    const userAnswer = (desktopInput?.value || mobileInput?.value || '').trim();
    const correctAnswer = appState.correctAnswers[field];
    
    // Update both desktop and mobile status
    const desktopStatus = document.getElementById(`status-${field}`);
    const mobileStatus = document.getElementById(`status-${field}-mobile`);
    const desktopError = document.getElementById(`error-${field}`);
    const mobileError = document.getElementById(`error-${field}-mobile`);

    if (!userAnswer) {
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
        if (desktopInput) desktopInput.classList.remove('incorrect');
        if (mobileInput) mobileInput.classList.remove('incorrect');
        return true;
    } else {
        const xMark = '<span class="incorrect">✖</span>';
        if (desktopStatus) desktopStatus.innerHTML = xMark;
        if (mobileStatus) mobileStatus.innerHTML = xMark;
        if (desktopInput) desktopInput.classList.add('incorrect');
        if (mobileInput) mobileInput.classList.add('incorrect');
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
        network: "Network address is wrong. Check the interesting octet and apply the subnet mask correctly.",
        firstHost: "First host is wrong. It should be the network address + 1.",
        lastHost: "Last host is wrong. It should be the broadcast address - 1.",
        broadcast: "Broadcast address is wrong. Check the block size and interesting octet.",
        nextSubnet: "Next subnet is wrong. Add the block size to the network address."
    };
    return explanations[field];
}

function checkAll() {
    const fields = ['network', 'firstHost', 'lastHost', 'broadcast', 'nextSubnet'];
    let allCorrect = true;
    let hasAnswers = false;
    
    fields.forEach(field => {
        const desktopInput = document.getElementById(`input-${field}`);
        const mobileInput = document.getElementById(`input-${field}-mobile`);
        const userAnswer = (desktopInput?.value || mobileInput?.value || '').trim();
        
        if (userAnswer) {
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
            appState.score += (10 * appState.streak);
            updatePrefixStats(appState.currentPrefix, true);
            showToast('Perfect! +' + (10 * appState.streak) + ' points', 'success');
        } else {
            appState.streak = 0;
            updatePrefixStats(appState.currentPrefix, false);
        }
        
        // Add to history
        appState.history.push({
            timestamp: new Date().toISOString(),
            mode: appState.examMode ? 'exam' : 'practice',
            difficulty: appState.difficulty,
            targetIp: appState.currentIP,
            prefix: appState.currentPrefix,
            completed: true,
            timeTakenSeconds: timeTaken,
            correct: allCorrect,
            scoreAfter: appState.score
        });
        
        updateStats();
        saveState();
    }
}

// Show Answers
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
    const fields = ['network', 'firstHost', 'lastHost', 'broadcast', 'nextSubnet'];
    fields.forEach(field => showAnswer(field));
}

// Auto-fill
function applyAutoFill() {
    const interestingOctet = Math.floor(appState.currentPrefix / 8);
    const fields = ['network', 'firstHost', 'lastHost', 'broadcast', 'nextSubnet'];
    
    fields.forEach(field => {
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
        
        document.getElementById(`input-${field}`).value = prefilled;
    });
}

function handleAutoFill() {
    if (document.getElementById('autoFill').checked) {
        applyAutoFill();
    } else {
        const fields = ['network', 'firstHost', 'lastHost', 'broadcast', 'nextSubnet'];
        fields.forEach(field => {
            document.getElementById(`input-${field}`).value = '';
        });
    }
}

// Auto-check
function handleAutoCheck() {
    const fields = ['network', 'firstHost', 'lastHost', 'broadcast', 'nextSubnet'];
    
    if (document.getElementById('autoCheck').checked) {
        fields.forEach(field => {
            document.getElementById(`input-${field}`).addEventListener('input', () => checkAnswer(field));
        });
    } else {
        fields.forEach(field => {
            const input = document.getElementById(`input-${field}`);
            const newInput = input.cloneNode(true);
            input.parentNode.replaceChild(newInput, input);
        });
    }
}

// Advanced Options
function toggleAdvanced() {
    const content = document.getElementById('advancedContent');
    const toggle = document.getElementById('advToggle');
    content.classList.toggle('visible');
    toggle.textContent = content.classList.contains('visible') ? '▲' : '▼';
}

function toggleExamMode() {
    appState.examMode = document.getElementById('examMode').checked;
    
    // Disable/enable show buttons (both desktop and mobile)
    const showBtns = document.querySelectorAll('.show-btn');
    const showAllBtn = document.getElementById('showAllBtn');
    const showAllBtnMobile = document.getElementById('showAllBtnMobile');
    const hintBtn = document.getElementById('hintBtn');
    const stepsBtn = document.getElementById('stepsBtn');
    
    if (appState.examMode) {
        showBtns.forEach(btn => btn.disabled = true);
        if (showAllBtn) showAllBtn.disabled = true;
        if (showAllBtnMobile) showAllBtnMobile.disabled = true;
        hintBtn.disabled = true;
        stepsBtn.disabled = true;
        document.getElementById('hintBox').classList.remove('visible');
        document.getElementById('stepsPanel').classList.remove('visible');
    } else {
        showBtns.forEach(btn => btn.disabled = false);
        if (showAllBtn) showAllBtn.disabled = false;
        if (showAllBtnMobile) showAllBtnMobile.disabled = false;
        hintBtn.disabled = false;
        stepsBtn.disabled = false;
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
        // Populate dropdowns
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

// Stats View
function showStats() {
    const stats = Object.entries(appState.prefixStats)
        .map(([prefix, data]) => ({
            prefix: parseInt(prefix),
            accuracy: data.attempts > 0 ? (data.correct / data.attempts * 100).toFixed(1) : 0,
            attempts: data.attempts
        }))
        .sort((a, b) => a.accuracy - b.accuracy)
        .slice(0, 5);
    
    if (stats.length === 0) {
        alert('No statistics available yet. Complete some problems first!');
        return;
    }
    
    let html = '<h3>Worst 5 Prefixes by Accuracy</h3><table><tr><th>Prefix</th><th>Attempts</th><th>Accuracy</th></tr>';
    stats.forEach(s => {
        html += `<tr><td>/${s.prefix}</td><td>${s.attempts}</td><td>${s.accuracy}%</td></tr>`;
    });
    html += '</table>';
    
    const statsDiv = document.createElement('div');
    statsDiv.className = 'stats-view';
    statsDiv.innerHTML = html;
    
    const existing = document.querySelector('.stats-view');
    if (existing) existing.remove();
    
    document.querySelector('.advanced-panel').after(statsDiv);
}

// Export Functions
function exportCSV() {
    if (appState.history.length === 0) {
        alert('No history to export!');
        return;
    }
    
    let csv = 'Timestamp,Mode,Difficulty,Target IP,Prefix,Completed,Time (s),Correct,Score After\n';
    appState.history.forEach(h => {
        csv += `${h.timestamp},${h.mode},${h.difficulty},${h.targetIp},${h.prefix},${h.completed},${h.timeTakenSeconds},${h.correct},${h.scoreAfter}\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'subnetting-history.csv';
    a.click();
    URL.revokeObjectURL(url);
}

function exportJSON() {
    if (appState.history.length === 0) {
        alert('No history to export!');
        return;
    }
    
    const json = JSON.stringify(appState.history, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'subnetting-history.json';
    a.click();
    URL.revokeObjectURL(url);
}

// Copy IP Function
function copyIP() {
    const ipText = `${appState.currentIP} /${appState.currentPrefix}`;
    navigator.clipboard.writeText(ipText).then(() => {
        showToast('IP copied to clipboard!', 'success');
    }).catch(() => {
        showToast('Failed to copy', 'error');
    });
}

// Toast Notification
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Sync mobile and desktop inputs
function syncInputs() {
    const fields = ['network', 'firstHost', 'lastHost', 'broadcast', 'nextSubnet'];
    fields.forEach(field => {
        const desktopInput = document.getElementById(`input-${field}`);
        const mobileInput = document.getElementById(`input-${field}-mobile`);
        
        if (desktopInput && mobileInput) {
            desktopInput.addEventListener('input', (e) => {
                mobileInput.value = e.target.value;
            });
            mobileInput.addEventListener('input', (e) => {
                desktopInput.value = e.target.value;
            });
        }
    });
}

// Dark Mode
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
}

// Keyboard Shortcuts
document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT') return;
    
    switch(e.key.toLowerCase()) {
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
    }
});

// Initialize
window.onload = function() {
    loadState();
    syncInputs();
    generateNewProblem();
    
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
        document.getElementById('darkModeToggle').checked = true;
    }
    
    if (appState.examMode) {
        document.getElementById('examMode').checked = true;
        toggleExamMode();
    }
    
    if (appState.customRange) {
        document.getElementById('customRange').checked = true;
        toggleCustomRange();
    }
};
