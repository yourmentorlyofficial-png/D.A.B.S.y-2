// Register Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(err => console.error(err));
  });
}

// PWA Install Prompt
let deferredPrompt;
const installCard = document.getElementById('installCard');
const installBtn = document.getElementById('installBtn');
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  if (installCard) installCard.style.display = 'flex';
});
if (installBtn) {
  installBtn.addEventListener('click', async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') installCard.style.display = 'none';
      deferredPrompt = null;
    }
  });
}

// Navigation
const navItems = document.querySelectorAll('.nav-item');
const views = document.querySelectorAll('.view');
navItems.forEach(item => {
  item.addEventListener('click', () => {
    const targetId = item.getAttribute('data-target');
    navItems.forEach(n => n.classList.remove('active'));
    item.classList.add('active');
    views.forEach(v => {
      v.classList.remove('active');
      if (v.id === targetId) v.classList.add('active');
    });
  });
});

// Theme Toggle
const themeToggle = document.getElementById('themeToggle');
const htmlRoot = document.documentElement;
themeToggle.addEventListener('click', () => {
  const next = htmlRoot.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  htmlRoot.setAttribute('data-theme', next);
});

// Companion Eye Mood Manager
function setEyeMood(mood) {
  const root = document.documentElement;
  const status = document.getElementById('companionStatus');
  const title = document.getElementById('companionTitle');
  if (mood === 'focus') {
    root.style.setProperty('--eye-color', '#3b82f6'); // Blue
    if(title) title.textContent = 'Deep Focus Active';
    if(status) status.textContent = 'Locking in. Minimizing distractions.';
  } else if (mood === 'thinking') {
    root.style.setProperty('--eye-color', '#eab308'); // Yellow
    if(title) title.textContent = 'DABSy Processing';
    if(status) status.textContent = 'Analyzing neural query...';
  } else if (mood === 'success') {
    root.style.setProperty('--eye-color', '#10b981'); // Green
    if(title) title.textContent = 'Milestone Reached!';
    if(status) status.textContent = 'Fantastic study progress.';
  } else {
    root.style.setProperty('--eye-color', '#6366f1'); // Indigo default
    if(title) title.textContent = 'DABSy Online';
    if(status) status.textContent = 'Ready to assist your study session.';
  }
}

// Pomodoro Timer
let timerInterval, timeLeft = 25 * 60, isRunning = false;
const timerDisplay = document.getElementById('timerDisplay');
const timerToggleBtn = document.getElementById('timerToggleBtn');
const timerResetBtn = document.getElementById('timerResetBtn');
const quickTimerBtn = document.getElementById('quickTimerBtn');

function updateTimer() {
  const m = Math.floor(timeLeft / 60), s = timeLeft % 60;
  timerDisplay.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function toggleTimer() {
  if (isRunning) {
    clearInterval(timerInterval);
    isRunning = false;
    timerToggleBtn.textContent = 'Start';
    setEyeMood('idle');
  } else {
    isRunning = true;
    timerToggleBtn.textContent = 'Pause';
    setEyeMood('focus');
    timerInterval = setInterval(() => {
      if (timeLeft > 0) {
        timeLeft--;
        updateTimer();
      } else {
        clearInterval(timerInterval);
        isRunning = false;
        timerToggleBtn.textContent = 'Start';
        setEyeMood('success');
        alert('Pomodoro session complete!');
      }
    }, 1000);
  }
}
if (timerToggleBtn) timerToggleBtn.addEventListener('click', toggleTimer);
if (quickTimerBtn) quickTimerBtn.addEventListener('click', () => {
  document.querySelector('[data-target="view-tools"]').click();
  if (!isRunning) toggleTimer();
});
if (timerResetBtn) timerResetBtn.addEventListener('click', () => {
  clearInterval(timerInterval);
  isRunning = false;
  timeLeft = 25 * 60;
  updateTimer();
  timerToggleBtn.textContent = 'Start';
  setEyeMood('idle');
});

// AI Chat with Gemini API Integration & Offline Fallback
const chatInput = document.getElementById('chatInput');
const chatSend = document.getElementById('chatSend');
const chatMessages = document.getElementById('chatMessages');

async function sendAIMessage() {
  const txt = chatInput.value.trim();
  if (!txt) return;

  const userBubble = document.createElement('div');
  userBubble.style.cssText = 'background: var(--primary); color: white; padding: 10px 14px; border-radius: 12px; font-size: 0.85rem; max-width: 85%; align-self: flex-end; margin-left: auto;';
  userBubble.textContent = txt;
  chatMessages.appendChild(userBubble);
  chatInput.value = '';
  chatMessages.scrollTop = chatMessages.scrollHeight;

  setEyeMood('thinking');
  const apiKey = localStorage.getItem('dabsy_gemini_key');

  let replyText = '';
  if (apiKey) {
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: `You are DABSy, an intelligent, friendly AI desk study buddy. Answer clearly and concisely: ${txt}` }] }] })
      });
      const data = await res.json();
      replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'I received empty neural data.';
    } catch (err) {
      replyText = 'Connection error reaching Gemini API. Check your API key in settings.';
    }
  } else {
    replyText = `[Offline Mode]: Received "${txt}". Add your Gemini API key in Settings to unlock full live neural responses!`;
  }

  setEyeMood('success');
  setTimeout(() => setEyeMood('idle'), 2000);

  const aiBubble = document.createElement('div');
  aiBubble.style.cssText = 'background: var(--bg-color); border: 1px solid var(--border); padding: 10px 14px; border-radius: 12px; font-size: 0.85rem; max-width: 85%;';
  aiBubble.textContent = replyText;
  chatMessages.appendChild(aiBubble);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  // Text to Speech
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(replyText.slice(0, 150));
    window.speechSynthesis.speak(utterance);
  }
}

if (chatSend) chatSend.addEventListener('click', sendAIMessage);
if (chatInput) chatInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendAIMessage(); });

// Voice Input (Speech Recognition)
const micBtn = document.getElementById('micBtn');
if (micBtn && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;

  micBtn.addEventListener('click', () => {
    setEyeMood('thinking');
    recognition.start();
  });

  recognition.onresult = (event) => {
    const speechToText = event.results[0][0].transcript;
    document.querySelector('[data-target="view-chat"]').click();
    chatInput.value = speechToText;
    sendAIMessage();
  };
  recognition.onerror = () => setEyeMood('idle');
  recognition.onend = () => setEyeMood('idle');
}

// Tasks & Homework Manager
const taskInput = document.getElementById('taskInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');
let tasks = JSON.parse(localStorage.getItem('dabsy_tasks') || '[]');

function renderTasks() {
  taskList.innerHTML = '';
  tasks.forEach((task, index) => {
    const item = document.createElement('div');
    item.style.cssText = 'display: flex; justify-content: space-between; align-items: center; background: var(--bg-color); padding: 8px 12px; border-radius: 10px; border: 1px solid var(--border); font-size: 0.85rem;';
    item.innerHTML = `<span>${task}</span><button style="background:none; border:none; color: #ef4444; cursor:pointer; font-weight:bold;">&times;</button>`;
    item.querySelector('button').addEventListener('click', () => {
      tasks.splice(index, 1);
      localStorage.setItem('dabsy_tasks', JSON.stringify(tasks));
      renderTasks();
    });
    taskList.appendChild(item);
  });
}
if (addTaskBtn) {
  addTaskBtn.addEventListener('click', () => {
    const val = taskInput.value.trim();
    if (!val) return;
    tasks.push(val);
    localStorage.setItem('dabsy_tasks', JSON.stringify(tasks));
    taskInput.value = '';
    renderTasks();
  });
}
renderTasks();

// Quick Quiz Engine
const quizQuestions = [
  { q: "What is the powerhouse of the cell?", options: ["Nucleus", "Mitochondria", "Ribosome"], answer: 1 },
  { q: "What is the value of acceleration due to gravity (approx)?", options: ["9.8 m/s²", "3.0 × 10⁸ m/s", "6.67 × 10⁻¹¹"], answer: 0 }
];
let currentQuiz = 0;
const quizQuestion = document.getElementById('quizQuestion');
const quizOptions = document.getElementById('quizOptions');

function loadQuiz() {
  const qObj = quizQuestions[currentQuiz];
  quizQuestion.textContent = qObj.q;
  quizOptions.innerHTML = '';
  qObj.options.forEach((opt, idx) => {
    const btn = document.createElement('button');
    btn.className = 'btn-primary';
    btn.style.cssText = 'background: var(--bg-color); border: 1px solid var(--border); color: var(--text-main); font-size: 0.8rem; padding: 8px; text-align: left;';
    btn.textContent = opt;
    btn.addEventListener('click', () => {
      if (idx === qObj.answer) {
        setEyeMood('success');
        alert('Correct!');
      } else {
        alert('Incorrect, keep studying!');
      }
      currentQuiz = (currentQuiz + 1) % quizQuestions.length;
      loadQuiz();
    });
    quizOptions.appendChild(btn);
  });
}
loadQuiz();

// Settings & Hardware Bridge Setup
const apiKeyInput = document.getElementById('apiKeyInput');
const saveApiKey = document.getElementById('saveApiKey');
if (localStorage.getItem('dabsy_gemini_key')) {
  apiKeyInput.value = localStorage.getItem('dabsy_gemini_key');
}
saveApiKey.addEventListener('click', () => {
  localStorage.setItem('dabsy_gemini_key', apiKeyInput.value.trim());
  alert('Gemini API key saved securely in browser storage!');
});

const wsUrlInput = document.getElementById('wsUrlInput');
const connectHardware = document.getElementById('connectHardware');
const hwStatus = document.getElementById('hwStatus');
connectHardware.addEventListener('click', () => {
  const url = wsUrlInput.value.trim();
  if (!url) return alert('Enter valid WebSocket URL');
  hwStatus.textContent = 'Status: Connecting to Desk Buddy...';
  try {
    const ws = new WebSocket(url);
    ws.onopen = () => { hwStatus.textContent = 'Status: Connected to Hardware!'; };
    ws.onerror = () => { hwStatus.textContent = 'Status: Connection Failed.'; };
  } catch(e) {
    hwStatus.textContent = 'Status: Invalid WebSocket Endpoint.';
  }
});
