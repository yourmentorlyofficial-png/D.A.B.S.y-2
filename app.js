if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then((reg) => console.log('DABSy ServiceWorker registered:', reg.scope))
      .catch((err) => console.error('ServiceWorker error:', err));
  });
}

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

const navItems = document.querySelectorAll('.nav-item');
const views = document.querySelectorAll('.view');

navItems.forEach(item => {
  item.addEventListener('click', () => {
    const target = item.getAttribute('data-target');
    navItems.forEach(n => n.classList.remove('active'));
    item.classList.add('active');
    views.forEach(v => {
      v.classList.remove('active');
      if (v.id === target) v.classList.add('active');
    });
  });
});

const themeToggle = document.getElementById('themeToggle');
const htmlRoot = document.documentElement;
themeToggle.addEventListener('click', () => {
  const current = htmlRoot.getAttribute('data-theme');
  htmlRoot.setAttribute('data-theme', current === 'dark' ? 'light' : 'dark');
});

const leftEye = document.getElementById('leftEye');
const rightEye = document.getElementById('rightEye');
const companionTitle = document.getElementById('companionTitle');
const companionStatus = document.getElementById('companionStatus');

function setCompanionMood(mood, statusText) {
  companionTitle.textContent = mood;
  companionStatus.textContent = statusText;
  
  if (mood === 'Deep Focus') {
    leftEye.style.background = 'var(--primary)';
    rightEye.style.background = 'var(--primary)';
    leftEye.style.transform = 'scaleY(0.7)';
    rightEye.style.transform = 'scaleY(0.7)';
  } else if (mood === 'Rest Break') {
    leftEye.style.background = 'var(--success)';
    rightEye.style.background = 'var(--success)';
    leftEye.style.transform = 'scaleY(1)';
    rightEye.style.transform = 'scaleY(1)';
  } else if (mood === 'AI Thinking') {
    leftEye.style.background = 'var(--accent)';
    rightEye.style.background = 'var(--accent)';
    leftEye.style.transform = 'scale(1.1)';
    rightEye.style.transform = 'scale(1.1)';
  } else {
    leftEye.style.background = 'var(--primary)';
    rightEye.style.background = 'var(--primary)';
    leftEye.style.transform = 'scaleY(1)';
    rightEye.style.transform = 'scaleY(1)';
  }

  sendHardwareState(mood);
}

let stats = JSON.parse(localStorage.getItem('dabsy_stats')) || { sessions: 0, tasks: 0 };
function updateStatsDisplay() {
  document.getElementById('statCompleted').textContent = stats.sessions;
  document.getElementById('statTasks').textContent = stats.tasks;
  localStorage.setItem('dabsy_stats', JSON.stringify(stats));
}
updateStatsDisplay();

let timerInterval;
let timeLeft = 25 * 60;
let isRunning = false;

const timerDisplay = document.getElementById('timerDisplay');
const timerToggleBtn = document.getElementById('timerToggleBtn');
const timerResetBtn = document.getElementById('timerResetBtn');
const quickTimerBtn = document.getElementById('quickTimerBtn');

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function toggleTimer() {
  if (isRunning) {
    clearInterval(timerInterval);
    isRunning = false;
    timerToggleBtn.textContent = 'Start';
    setCompanionMood('DABSy Online', 'Focus session paused.');
  } else {
    isRunning = true;
    timerToggleBtn.textContent = 'Pause';
    setCompanionMood('Deep Focus', 'Locking in. Distractions minimized.');
    
    timerInterval = setInterval(() => {
      if (timeLeft > 0) {
        timeLeft--;
        timerDisplay.textContent = formatTime(timeLeft);
      } else {
        clearInterval(timerInterval);
        isRunning = false;
        timerToggleBtn.textContent = 'Start';
        stats.sessions++;
        updateStatsDisplay();
        setCompanionMood('Rest Break', 'Session complete! Take a well-deserved break.');
        alert('Pomodoro focus session completed!');
      }
    }, 1000);
  }
}

timerToggleBtn.addEventListener('click', toggleTimer);
quickTimerBtn.addEventListener('click', () => {
  document.querySelector('[data-target="view-tools"]').click();
  if (!isRunning) toggleTimer();
});
timerResetBtn.addEventListener('click', () => {
  clearInterval(timerInterval);
  isRunning = false;
  timeLeft = 25 * 60;
  timerDisplay.textContent = formatTime(timeLeft);
  timerToggleBtn.textContent = 'Start';
  setCompanionMood('DABSy Online', 'Ready to assist your study session.');
});

let tasks = JSON.parse(localStorage.getItem('dabsy_tasks')) || [];
const taskInput = document.getElementById('taskInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');

function renderTasks() {
  taskList.innerHTML = '';
  if (tasks.length === 0) {
    taskList.innerHTML = '<p style="font-size: 0.8rem; color: var(--text-muted); text-align: center; padding: 10px;">No pending study tasks.</p>';
    return;
  }
  tasks.forEach((task, index) => {
    const item = document.createElement('div');
    item.style.cssText = 'display: flex; align-items: center; justify-content: space-between; background: var(--bg-color); border: 1px solid var(--border); padding: 10px 12px; border-radius: 10px; font-size: 0.85rem;';
    item.innerHTML = `
      <span style="${task.done ? 'text-decoration: line-through; opacity: 0.6;' : ''}">${task.text}</span>
      <div style="display: flex; gap: 6px;">
        <button onclick="toggleTask(${index})" style="background: ${task.done ? 'var(--success)' : 'transparent'}; border: 1px solid var(--border); color: white; border-radius: 6px; padding: 4px 8px; cursor: pointer;">✓</button>
        <button onclick="deleteTask(${index})" style="background: transparent; border: 1px solid var(--border); color: var(--danger); border-radius: 6px; padding: 4px 8px; cursor: pointer;">✕</button>
      </div>
    `;
    taskList.appendChild(item);
  });
  localStorage.setItem('dabsy_tasks', JSON.stringify(tasks));
}

window.toggleTask = function(index) {
  tasks[index].done = !tasks[index].done;
  if (tasks[index].done) {
    stats.tasks++;
    updateStatsDisplay();
  }
  renderTasks();
};

window.deleteTask = function(index) {
  tasks.splice(index, 1);
  renderTasks();
};

addTaskBtn.addEventListener('click', () => {
  const text = taskInput.value.trim();
  if (!text) return;
  tasks.push({ text, done: false });
  taskInput.value = '';
  renderTasks();
});
renderTasks();

const quizData = [
  { q: "What is the powerhouse of the cell?", options: ["Nucleus", "Mitochondria", "Ribosome", "Golgi Body"], correct: 1 },
  { q: "What is Newton's First Law also known as?", options: ["Law of Inertia", "Law of Force", "Law of Action-Reaction", "Gravitation"], correct: 0 },
  { q: "What is the atomic number of Carbon?", options: ["5", "6", "7", "8"], correct: 1 }
];
let currentQuiz = 0;

function loadQuiz() {
  const qObj = quizData[currentQuiz];
  document.getElementById('quizQuestion').textContent = `Q${currentQuiz + 1}: ${qObj.q}`;
  const optsContainer = document.getElementById('quizOptions');
  optsContainer.innerHTML = '';
  qObj.options.forEach((opt, idx) => {
    const btn = document.createElement('button');
    btn.textContent = opt;
    btn.style.cssText = 'background: var(--bg-color); border: 1px solid var(--border); color: var(--text-main); padding: 10px; border-radius: 10px; font-size: 0.85rem; cursor: pointer; text-align: left;';
    btn.onclick = () => {
      if (idx === qObj.correct) {
        btn.style.background = 'var(--success)';
        btn.style.color = 'white';
        setTimeout(() => {
          currentQuiz = (currentQuiz + 1) % quizData.length;
          loadQuiz();
        }, 1000);
      } else {
        btn.style.background = 'var(--danger)';
        btn.style.color = 'white';
      }
    };
    optsContainer.appendChild(btn);
  });
}
loadQuiz();

const chatInput = document.getElementById('chatInput');
const chatSend = document.getElementById('chatSend');
const chatMessages = document.getElementById('chatMessages');
const voiceToggleBtn = document.getElementById('voiceToggleBtn');

function speakText(text) {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    window.speechSynthesis.speak(utterance);
  }
}

function handleSendMessage(textOverride) {
  const txt = textOverride || chatInput.value.trim();
  if (!txt) return;

  const userBubble = document.createElement('div');
  userBubble.style.cssText = 'background: var(--primary); color: white; padding: 10px 14px; border-radius: 12px; font-size: 0.85rem; max-width: 85%; align-self: flex-end; margin-left: auto;';
  userBubble.textContent = txt;
  chatMessages.appendChild(userBubble);
  if (!textOverride) chatInput.value = '';
  chatMessages.scrollTop = chatMessages.scrollHeight;

  setCompanionMood('AI Thinking', 'Analyzing query...');

  setTimeout(() => {
    let reply = `I processed "${txt}". Keep up the great focus on your studies today!`;
    if (txt.toLowerCase().includes('pomodoro')) {
      reply = 'The Pomodoro technique uses 25 minutes of deep focus followed by a 5-minute break.';
    } else if (txt.toLowerCase().includes('quiz')) {
      reply = 'Check out the Quick Practice Quiz tab to test your science and math knowledge!';
    }

    const aiBubble = document.createElement('div');
    aiBubble.style.cssText = 'background: var(--bg-color); border: 1px solid var(--border); padding: 10px 14px; border-radius: 12px; font-size: 0.85rem; max-width: 85%;';
    aiBubble.textContent = reply;
    chatMessages.appendChild(aiBubble);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    setCompanionMood('DABSy Online', 'Ready to assist.');
    speakText(reply);
  }, 600);
}

chatSend.addEventListener('click', () => handleSendMessage());
chatInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') handleSendMessage();
});

if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;

  voiceToggleBtn.addEventListener('click', () => {
    recognition.start();
    voiceToggleBtn.style.color = 'var(--accent)';
  });

  recognition.onresult = (event) => {
    const speechToText = event.results[0][0].transcript;
    voiceToggleBtn.style.color = 'var(--text-main)';
    handleSendMessage(speechToText);
  };

  recognition.onerror = () => {
    voiceToggleBtn.style.color = 'var(--text-main)';
  };
}

let ws;
const wsUrlInput = document.getElementById('wsUrlInput');
const wsConnectBtn = document.getElementById('wsConnectBtn');

wsConnectBtn.addEventListener('click', () => {
  const url = wsUrlInput.value.trim();
  if (!url) return alert('Please enter a valid WebSocket URL');
  
  try {
    ws = new WebSocket(url);
    ws.onopen = () => {
      wsConnectBtn.style.background = 'var(--primary)';
      wsConnectBtn.textContent = 'Hardware Connected';
      alert('Successfully linked to DABSy hardware bridge!');
    };
    ws.onerror = () => {
      alert('Connection failed. Ensure ESP32/Pico W is online.');
    };
  } catch (err) {
    console.error(err);
  }
});

function sendHardwareState(mood) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ device: 'DABSy', state: mood, timestamp: Date.now() }));
  }
}
