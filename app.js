import { GoogleGenAI } from 'https://cdn.jsdelivr.net/npm/@google/genai@2.17.1/+esm';

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
const settingsBtn = document.getElementById('settingsBtn');

// Key is stored securely in browser LocalStorage — NO SECRETS LEAKED TO GITHUB!
let geminiApiKey = localStorage.getItem('dabsy_gemini_key') || '';
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
  setMood('happy', 'DABSy Online', 'Welcome back! Let me know if you need anything else.');
}

panelCloseBtn.addEventListener('click', exitCornerMode);

settingsBtn.addEventListener('click', () => {
  const newKey = prompt('Enter your Google Gemini API Key (stored safely in your browser):', geminiApiKey);
  if (newKey !== null) {
    geminiApiKey = newKey.trim();
    localStorage.setItem('dabsy_gemini_key', geminiApiKey);
    alert(geminiApiKey ? 'API Key saved securely on your device!' : 'API Key cleared.');
  }
});

function triggerInputFlow() {
  if (!geminiApiKey) {
    const key = prompt('Please enter your Google Gemini API Key (stored securely in browser):');
    if (key) {
      geminiApiKey = key.trim();
      localStorage.setItem('dabsy_gemini_key', geminiApiKey);
    } else {
      alert('API Key is required for smart responses.');
      return;
    }
  }

  if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        talkBtnText.textContent = 'Listening...';
        setMood('thinking', 'Listening...', 'I am listening...');
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript.toLowerCase();
        talkBtnText.textContent = 'Talk to DABSy';
        processWithGemini(transcript);
      };

      recognition.onerror = () => {
        talkBtnText.textContent = 'Talk to DABSy';
        fallbackToTextPrompt();
      };

      recognition.start();
    } catch (e) {
      fallbackToTextPrompt();
    }
  } else {
    fallbackToTextPrompt();
  }
}

function fallbackToTextPrompt() {
  const query = prompt('Type your study question or command for DABSy:');
  if (query) {
    processWithGemini(query.toLowerCase());
  } else {
    setMood('happy', 'DABSy Online', 'Ready when you are!');
  }
}

talkBtn.addEventListener('click', triggerInputFlow);

async function processWithGemini(userPrompt) {
  if (userPrompt.includes("i'm done") || userPrompt.includes("im done") || userPrompt.includes("done") || userPrompt.includes("close")) {
    exitCornerMode();
    return;
  }

  setMood('thinking', 'Neural Processing...', `Thinking about "${userPrompt}"...`);

  try {
    const ai = new GoogleGenAI({ apiKey: geminiApiKey });
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are DABSy, an elite AI desk study buddy for a Class 11 Science student in India. 
      The user asked: "${userPrompt}". 
      Provide a smart, accurate, step-by-step breakdown or answer. 
      Format your response strictly as JSON with two fields: 
      1. "spoken_summary": A short, friendly 1-2 sentence summary to be spoken out loud.
      2. "steps": An array of objects, each containing "title" and "content" for the step-by-step breakdown card.`
    });

    const rawText = response.text;
    const cleanJsonText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsedData = JSON.parse(cleanJsonText);

    setMood('study', 'Study Breakdown', parsedData.spoken_summary);

    let stepsHTML = '';
    parsedData.steps.forEach((step, idx) => {
      stepsHTML += `
        <div class="step-card">
          <strong>Step ${idx + 1}: ${step.title}</strong>
          ${step.content}
        </div>
      `;
    });
    stepsHTML += `
      <div class="step-card" style="text-align: center; color: var(--text-muted);">
        Say or type "I'm done" when you are ready to return!
      </div>
    `;

    enterCornerMode(`Breakdown: ${userPrompt}`, stepsHTML);

  } catch (error) {
    console.error(error);
    setMood('happy', 'DABSy Online', `Error communicating with Gemini. Check your API key in settings.`);
  }
}
