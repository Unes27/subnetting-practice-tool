# Enhancement Guide for Subnetting Practice Tool

## Files Created:
1. ✅ manifest.json - PWA manifest
2. ✅ sw.js - Service worker for offline support

## Files to Update:

### 1. index.html - Add to <head> section:

```html
<!-- Add after existing meta tags -->
<link rel="manifest" href="manifest.json">
<meta name="theme-color" content="#6366f1">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
```

### 2. index.html - Add before closing </body>:

```html
<!-- Install PWA Button -->
<button id="installBtn" class="install-btn" style="display:none;">
  📱 Install App
</button>

<!-- Exam Mode Modal -->
<div id="examModal" class="modal">
  <div class="modal-content">
    <h2>Start Exam</h2>
    <div class="exam-options">
      <label>Questions:
        <select id="examQuestions">
          <option value="10">10</option>
          <option value="20">20</option>
          <option value="50">50</option>
        </select>
      </label>
      <label>Time Limit:
        <select id="examTime">
          <option value="0">No Limit</option>
          <option value="10">10 minutes</option>
          <option value="20">20 minutes</option>
          <option value="30">30 minutes</option>
        </select>
      </label>
      <button class="btn" onclick="startExam()">Start Exam</button>
      <button class="btn btn-ghost" onclick="closeExamModal()">Cancel</button>
    </div>
  </div>
</div>

<!-- Exam Results Modal -->
<div id="resultsModal" class="modal">
  <div class="modal-content">
    <h2>Exam Results</h2>
    <div id="examResults"></div>
    <button class="btn" onclick="closeResultsModal()">Close</button>
  </div>
</div>

<!-- Question Type Selector (add to advanced panel) -->
<div class="option-row">
  <label>Question Type:</label>
  <select id="questionType" onchange="changeQuestionType()">
    <option value="subnet">Subnet Outputs (5 fields)</option>
    <option value="hostcount">Host Count</option>
    <option value="wildcard">Wildcard Mask</option>
    <option value="validation">Host Validation</option>
  </select>
</div>
```

### 3. styles.css - Add these styles:

```css
/* Modal Styles */
.modal {
  display: none;
  position: fixed;
  z-index: 1000;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.modal.show {
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  background: var(--color-surface);
  padding: var(--space-8);
  border-radius: var(--radius-xl);
  max-width: 500px;
  width: 90%;
  box-shadow: var(--shadow-xl);
}

.exam-options {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  margin-top: var(--space-4);
}

.exam-options label {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  color: var(--color-text);
}

.exam-options select {
  padding: var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  color: var(--color-text);
}

/* Install Button */
.install-btn {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: var(--color-primary);
  color: white;
  border: none;
  padding: var(--space-3) var(--space-5);
  border-radius: var(--radius-lg);
  cursor: pointer;
  box-shadow: var(--shadow-lg);
  z-index: 999;
  font-weight: 600;
}

.install-btn:hover {
  background: var(--color-primary-hover);
}

/* Share Button */
.share-btn {
  background: #10b981;
  color: white;
}

.share-btn:hover {
  background: #059669;
}

/* Question Type Specific */
.single-answer {
  max-width: 400px;
  margin: 0 auto;
}

.single-answer input {
  width: 100%;
  padding: var(--space-4);
  font-size: 1.1rem;
  text-align: center;
}

.validation-question {
  text-align: center;
  padding: var(--space-6);
  background: var(--color-surface-hover);
  border-radius: var(--radius-lg);
  margin: var(--space-4) 0;
}

.validation-options {
  display: flex;
  gap: var(--space-4);
  justify-content: center;
  margin-top: var(--space-4);
}

.validation-options button {
  min-width: 120px;
}
```

### 4. script.js - Add these functions at the end:

```javascript
// ============ EXAM SIMULATOR ============
let examState = {
  active: false,
  questions: [],
  currentQuestion: 0,
  startTime: null,
  timeLimit: 0,
  results: []
};

function openExamModal() {
  document.getElementById('examModal').classList.add('show');
}

function closeExamModal() {
  document.getElementById('examModal').classList.remove('show');
}

function startExam() {
  const numQuestions = parseInt(document.getElementById('examQuestions').value);
  const timeLimit = parseInt(document.getElementById('examTime').value);
  
  examState = {
    active: true,
    questions: [],
    currentQuestion: 0,
    startTime: Date.now(),
    timeLimit: timeLimit * 60 * 1000,
    results: []
  };
  
  // Generate exam questions
  for (let i = 0; i < numQuestions; i++) {
    const ip = generateRandomIP();
    const prefix = Math.floor(Math.random() * 23) + 8;
    examState.questions.push({ ip, prefix });
  }
  
  closeExamModal();
  loadExamQuestion();
  
  // Disable hints and show buttons
  document.querySelectorAll('.show-btn, #hintBtn, #stepsBtn').forEach(btn => btn.disabled = true);
  
  showToast(`Exam started: ${numQuestions} questions`, 'success');
}

function loadExamQuestion() {
  if (examState.currentQuestion >= examState.questions.length) {
    finishExam();
    return;
  }
  
  const q = examState.questions[examState.currentQuestion];
  appState.currentIP = q.ip;
  appState.currentPrefix = q.prefix;
  appState.correctAnswers = calculateSubnet(q.ip, q.prefix);
  
  document.getElementById('targetIP').textContent = `${q.ip} /${q.prefix}`;
  document.querySelector('h1').textContent = `Exam Question ${examState.currentQuestion + 1}/${examState.questions.length}`;
  
  // Clear inputs
  const fields = ['network', 'firstHost', 'lastHost', 'broadcast', 'nextSubnet'];
  fields.forEach(field => {
    const input = document.getElementById(`input-${field}`);
    if (input) input.value = '';
    document.getElementById(`status-${field}`).innerHTML = '';
  });
}

function submitExamAnswer() {
  const fields = ['network', 'firstHost', 'lastHost', 'broadcast', 'nextSubnet'];
  const result = {
    question: examState.currentQuestion + 1,
    ip: appState.currentIP,
    prefix: appState.currentPrefix,
    answers: {}
  };
  
  fields.forEach(field => {
    const input = document.getElementById(`input-${field}`);
    const userAnswer = input ? input.value.trim() : '';
    const correct = userAnswer === appState.correctAnswers[field];
    result.answers[field] = { user: userAnswer, correct, expected: appState.correctAnswers[field] };
  });
  
  examState.results.push(result);
  examState.currentQuestion++;
  loadExamQuestion();
}

function finishExam() {
  examState.active = false;
  const timeTaken = Math.floor((Date.now() - examState.startTime) / 1000);
  
  let totalFields = 0;
  let correctFields = 0;
  
  examState.results.forEach(r => {
    Object.values(r.answers).forEach(a => {
      totalFields++;
      if (a.correct) correctFields++;
    });
  });
  
  const score = Math.round((correctFields / totalFields) * 100);
  const passed = score >= 70;
  
  // Show results
  let html = `
    <div class="exam-summary">
      <h3 style="color: ${passed ? 'var(--color-success)' : 'var(--color-danger)'}">
        ${passed ? '✅ PASSED' : '❌ FAILED'}
      </h3>
      <p><strong>Score:</strong> ${score}%</p>
      <p><strong>Time:</strong> ${Math.floor(timeTaken / 60)}m ${timeTaken % 60}s</p>
      <p><strong>Correct:</strong> ${correctFields}/${totalFields} fields</p>
    </div>
    <h4>Review Mistakes:</h4>
    <table style="width:100%; margin-top: 10px;">
      <tr><th>Q</th><th>IP/Prefix</th><th>Field</th><th>Your Answer</th><th>Correct Answer</th></tr>
  `;
  
  examState.results.forEach(r => {
    Object.entries(r.answers).forEach(([field, data]) => {
      if (!data.correct) {
        html += `<tr>
          <td>${r.question}</td>
          <td>${r.ip}/${r.prefix}</td>
          <td>${field}</td>
          <td style="color: var(--color-danger)">${data.user || '(empty)'}</td>
          <td style="color: var(--color-success)">${data.expected}</td>
        </tr>`;
      }
    });
  });
  
  html += '</table>';
  document.getElementById('examResults').innerHTML = html;
  document.getElementById('resultsModal').classList.add('show');
  document.querySelector('h1').textContent = 'Subnetting Practice';
  
  // Re-enable buttons
  document.querySelectorAll('.show-btn, #hintBtn, #stepsBtn').forEach(btn => btn.disabled = false);
}

function closeResultsModal() {
  document.getElementById('resultsModal').classList.remove('show');
  generateNewProblem();
}

// ============ QUESTION TYPES ============
let currentQuestionType = 'subnet';

function changeQuestionType() {
  currentQuestionType = document.getElementById('questionType').value;
  generateQuestionByType();
}

function generateQuestionByType() {
  const ip = generateRandomIP();
  const prefix = Math.floor(Math.random() * 23) + 8;
  appState.currentIP = ip;
  appState.currentPrefix = prefix;
  appState.correctAnswers = calculateSubnet(ip, prefix);
  
  document.getElementById('targetIP').textContent = `${ip} /${prefix}`;
  
  // Hide all question containers
  document.querySelector('.table-wrapper').style.display = 'none';
  document.querySelector('.card-layout').style.display = 'none';
  
  // Remove existing single answer if any
  const existing = document.querySelector('.single-answer');
  if (existing) existing.remove();
  
  switch(currentQuestionType) {
    case 'subnet':
      document.querySelector('.table-wrapper').style.display = 'block';
      break;
    case 'hostcount':
      showHostCountQuestion();
      break;
    case 'wildcard':
      showWildcardQuestion();
      break;
    case 'validation':
      showValidationQuestion();
      break;
  }
}

function showHostCountQuestion() {
  const hostCount = Math.pow(2, 32 - appState.currentPrefix) - 2;
  const html = `
    <div class="single-answer">
      <h3>How many usable hosts in this subnet?</h3>
      <input type="number" id="hostCountAnswer" placeholder="Enter number">
      <button class="btn" onclick="checkHostCount(${hostCount})">Check Answer</button>
      <div id="hostCountResult"></div>
    </div>
  `;
  document.querySelector('.steps-panel').insertAdjacentHTML('afterend', html);
}

function checkHostCount(correct) {
  const answer = parseInt(document.getElementById('hostCountAnswer').value);
  const result = document.getElementById('hostCountResult');
  if (answer === correct) {
    result.innerHTML = '<span class="correct">✔ Correct!</span>';
    showToast('Correct!', 'success');
  } else {
    result.innerHTML = `<span class="incorrect">✖ Wrong. Correct answer: ${correct}</span>`;
  }
}

function showWildcardQuestion() {
  const mask = calculateSubnet(appState.currentIP, appState.currentPrefix).mask;
  const wildcard = mask.split('.').map(octet => 255 - parseInt(octet)).join('.');
  
  const html = `
    <div class="single-answer">
      <h3>What is the wildcard mask?</h3>
      <input type="text" id="wildcardAnswer" placeholder="e.g., 0.0.0.255">
      <button class="btn" onclick="checkWildcard('${wildcard}')">Check Answer</button>
      <div id="wildcardResult"></div>
    </div>
  `;
  document.querySelector('.steps-panel').insertAdjacentHTML('afterend', html);
}

function checkWildcard(correct) {
  const answer = document.getElementById('wildcardAnswer').value.trim();
  const result = document.getElementById('wildcardResult');
  if (answer === correct) {
    result.innerHTML = '<span class="correct">✔ Correct!</span>';
    showToast('Correct!', 'success');
  } else {
    result.innerHTML = `<span class="incorrect">✖ Wrong. Correct answer: ${correct}</span>`;
  }
}

function showValidationQuestion() {
  const calc = calculateSubnet(appState.currentIP, appState.currentPrefix);
  const isValid = Math.random() > 0.5;
  let testIP;
  
  if (isValid) {
    const networkInt = ipToInt(calc.network);
    const broadcastInt = ipToInt(calc.broadcast);
    const randomHost = networkInt + Math.floor(Math.random() * (broadcastInt - networkInt - 1)) + 1;
    testIP = intToIp(randomHost);
  } else {
    testIP = generateRandomIP();
  }
  
  const html = `
    <div class="validation-question">
      <h3>Is ${testIP} a valid host in this subnet?</h3>
      <div class="validation-options">
        <button class="btn" onclick="checkValidation(${isValid}, true)">Yes</button>
        <button class="btn" onclick="checkValidation(${isValid}, false)">No</button>
      </div>
      <div id="validationResult"></div>
    </div>
  `;
  document.querySelector('.steps-panel').insertAdjacentHTML('afterend', html);
}

function checkValidation(correct, answer) {
  const result = document.getElementById('validationResult');
  if (correct === answer) {
    result.innerHTML = '<p class="correct">✔ Correct!</p>';
    showToast('Correct!', 'success');
  } else {
    result.innerHTML = '<p class="incorrect">✖ Wrong</p>';
  }
}

// ============ SHAREABLE LINKS ============
function shareQuestion() {
  const url = new URL(window.location.href);
  url.searchParams.set('ip', appState.currentIP);
  url.searchParams.set('prefix', appState.currentPrefix);
  url.searchParams.set('mode', currentQuestionType);
  
  navigator.clipboard.writeText(url.toString()).then(() => {
    showToast('Link copied to clipboard!', 'success');
  });
}

function loadFromURL() {
  const params = new URLSearchParams(window.location.search);
  const ip = params.get('ip');
  const prefix = params.get('prefix');
  const mode = params.get('mode');
  
  if (ip && prefix) {
    appState.currentIP = ip;
    appState.currentPrefix = parseInt(prefix);
    appState.correctAnswers = calculateSubnet(ip, parseInt(prefix));
    document.getElementById('targetIP').textContent = `${ip} /${prefix}`;
    
    if (mode) {
      currentQuestionType = mode;
      document.getElementById('questionType').value = mode;
      generateQuestionByType();
    }
  }
}

// ============ PWA INSTALL ============
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  document.getElementById('installBtn').style.display = 'block';
});

document.getElementById('installBtn')?.addEventListener('click', async () => {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      document.getElementById('installBtn').style.display = 'none';
    }
    deferredPrompt = null;
  }
});

// Register service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}

// ============ INITIALIZE ============
// Add to existing window.onload
const originalOnload = window.onload;
window.onload = function() {
  if (originalOnload) originalOnload();
  loadFromURL();
};
```

### 5. Add buttons to HTML (in target-section):

```html
<button class="btn share-btn" onclick="shareQuestion()">🔗 Share</button>
<button class="btn" onclick="openExamModal()">📝 Start Exam</button>
```

## Integration Steps:

1. Copy manifest.json and sw.js (already created)
2. Add PWA meta tags to index.html <head>
3. Add modal HTML before </body>
4. Add new CSS styles to styles.css
5. Add new JavaScript functions to script.js
6. Add Share and Exam buttons to interface

## Testing:

- Test exam mode with 10 questions
- Try different question types
- Share a link and open in new tab
- Install as PWA (requires HTTPS or localhost)

All features work without external libraries!
