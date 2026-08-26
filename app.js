if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch((err) => console.error(err));
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

const leftEye = document.getElementById('leftEye');
const rightEye = document.getElementById('rightEye');
const mouthSmile = document.getElementById('mouthSmile');
const companionStatus = document.getElementById('companionStatus');
const companionSpeech = document.getElementById('companionSpeech');
const ambientAura = document.getElementById('ambientAura');
const presentationPanel = document.getElementById('presentationPanel');
const panelTitle = document.getElementById('panelTitle');
const panelContentArea = document.getElementById('panelContentArea');
const panelCloseBtn = document.getElementById('panelCloseBtn');
const talkBtn = document.getElementById('talkBtn');
const talkBtnText = document.getElementById('talkBtnText');
const modeToggleBtn = document.getElementById('modeToggleBtn');
const modeNameDisplay = document.getElementById('modeNameDisplay');

let currentMode = 'fun';
let isCornerModeActive = false;

window.addEventListener('DOMContentLoaded', () => {
  setMood('happy', 'DABSy Online', 'Hello Swagat, how can I help you today?');
});

function setMood(mood, status, dialogue) {
  companionStatus.textContent = status;
  companionSpeech.textContent = dialogue;
  speakText(dialogue);

  if (mood === 'happy') {
    leftEye.style.background = 'var(--primary)';
    rightEye.style.background = 'var(--primary)';
    leftEye.style.transform = 'scale(1)';
    mouthSmile.style.width = '60px';
    mouthSmile.style.borderColor = 'var(--primary)';
    ambientAura.style.background = 'rgba(99, 102, 241, 0.5)';
  } else if (mood === 'study') {
    leftEye.style.background = 'var(--accent)';
    rightEye.style.background = 'var(--accent)';
    leftEye.style.transform = 'scaleY(0.75)';
    mouthSmile.style.width = '35px';
    mouthSmile.style.borderColor = 'var(--accent)';
    ambientAura.style.background = 'rgba(6, 182, 212, 0.5)';
  } else if (mood === 'thinking') {
    leftEye.style.background = 'var(--success)';
    rightEye.style.background = 'var(--success)';
    leftEye.style.transform = 'scale(1.15)';
    mouthSmile.style.width = '20px';
    mouthSmile.style.borderColor = 'var(--success)';
    ambientAura.style.background = 'rgba(16, 185, 129, 0.5)';
  }
}

function speakText(text) {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05;
    window.speechSynthesis.speak(utterance);
  }
}

function enterCornerMode(title, htmlContent) {
  isCornerModeActive = true;
  document.body.classList.add('corner-mode');
  panelTitle.textContent = title;
  panelContentArea.innerHTML = htmlContent;
}

function exitCornerMode() {
  isCornerModeActive = false;
  document.body.classList.remove('corner-mode');
  setMood(currentMode === 'study' ? 'study' : 'happy', currentMode === 'study' ? 'Study Active' : 'Fun Pet Mode', 'Welcome back! Let me know if you need anything else.');
}

panelCloseBtn.addEventListener('click', exitCornerMode);

// Robust Input Handler with Text Fallback Prompt
function triggerInputFlow() {
  if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        talkBtnText.textContent = 'Listening...';
        setMood('thinking', 'Listening...', 'I am listening to your request, Swagat.');
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript.toLowerCase();
        talkBtnText.textContent = 'Talk to DABSy';
        handleUserCommand(transcript);
      };

      recognition.onerror = () => {
        talkBtnText.textContent = 'Talk to DABSy';
        fallbackToPrompt();
      };

      recognition.start();
    } catch (e) {
      fallbackToPrompt();
    }
  } else {
    fallbackToPrompt();
  }
}

function fallbackToPrompt() {
  const query = prompt('Type your study question or command for DABSy (e.g., "explain physics", "study mode", "i am done"):');
  if (query) {
    handleUserCommand(query.toLowerCase());
  } else {
    setMood('happy', 'DABSy Online', 'Ready when you are!');
  }
}

talkBtn.addEventListener('click', triggerInputFlow);

function handleUserCommand(cmd) {
  setMood('thinking', 'Analyzing...', `Processing "${cmd}"...`);

  setTimeout(() => {
    if (cmd.includes("i'm done") || cmd.includes("im done") || cmd.includes("done") || cmd.includes("close")) {
      exitCornerMode();
      return;
    }

    if (cmd.includes('study mode') || cmd.includes('switch to study')) {
      currentMode = 'study';
      modeNameDisplay.textContent = 'Study Mode';
      setMood('study', 'Study Mode Active', 'Study mode engaged. Ready to break down difficult concepts step-by-step.');
      return;
    }

    if (cmd.includes('fun mode') || cmd.includes('switch to fun')) {
      currentMode = 'fun';
      modeNameDisplay.textContent = 'Fun Mode';
      setMood('happy', 'Fun Pet Mode', 'Yay! Let us chill or have some fun together.');
      return;
    }

    if (currentMode === 'study' || cmd.includes('explain') || cmd.includes('solve') || cmd.includes('physics') || cmd.includes('math') || cmd.includes('chemistry')) {
      setMood('study', 'Explaining...', 'Breaking this down into simple steps for you.');
      
      let conceptTitle = `Breakdown: ${cmd}`;
      let stepsHTML = `
        <div class="step-card">
          <strong>Step 1: Core Definition & Concept</strong>
          Analyzing "${cmd}". We establish the foundational principles clearly and concisely.
        </div>
        <div class="step-card">
          <strong>Step 2: Step-by-Step Derivation</strong>
          Applying logical formulas and step-by-step reasoning without skipping key details.
        </div>
        <div class="step-card">
          <strong>Step 3: Conclusion & Summary</strong>
          Review complete. Say or type "Ya DABSy, I'm done" whenever you are ready to return to full screen!
        </div>
      `;

      enterCornerMode(conceptTitle, stepsHTML);
      speakText('Here is the step-by-step breakdown for your study session.');
    } else {
      setMood('happy', 'Fun Pet Mode', `That sounds fun! As your desk pet, I'm right here with you.`);
    }
  }, 900);
}

modeToggleBtn.addEventListener('click', () => {
  if (currentMode === 'fun') {
    currentMode = 'study';
    modeNameDisplay.textContent = 'Study Mode';
    setMood('study', 'Study Mode Active', 'Switched to Study Mode. I will present step-by-step notes.');
  } else {
    currentMode = 'fun';
    modeNameDisplay.textContent = 'Fun Mode';
    setMood('happy', 'Fun Pet Mode', 'Switched to Fun Mode. Ready to chill!');
  }
});
