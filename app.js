import { GoogleGenAI } from 'https://cdn.jsdelivr.net/npm/@google/genai@2.17.1/+esm';

const leftEye = document.getElementById('leftEye');
const rightEye = document.getElementById('rightEye');
const companionStatus = document.getElementById('companionStatus');
const companionSpeech = document.getElementById('companionSpeech');
const presentationPanel = document.getElementById('presentationPanel');
const panelTitle = document.getElementById('panelTitle');
const panelContentArea = document.getElementById('panelContentArea');
const panelCloseBtn = document.getElementById('panelCloseBtn');

let geminiApiKey = localStorage.getItem('dabsy_gemini_key') || '';

window.addEventListener('DOMContentLoaded', () => {
  setMood('happy', 'DABSy Online', 'Hello Swagat, how can I help you today?');
});

function setMood(mood, status, dialogue) {
  if (companionStatus) companionStatus.textContent = status;
  if (companionSpeech) companionSpeech.innerHTML = dialogue;
  speakText(dialogue);

  if (mood === 'happy') {
    if (leftEye) leftEye.style.transform = 'scale(1)';
    if (rightEye) rightEye.style.transform = 'scale(1)';
  } else if (mood === 'study') {
    if (leftEye) leftEye.style.transform = 'scaleY(0.75)';
    if (rightEye) rightEye.style.transform = 'scaleY(0.75)';
  } else if (mood === 'thinking') {
    if (leftEye) leftEye.style.transform = 'scale(1.15)';
    if (rightEye) rightEye.style.transform = 'scale(1.15)';
  }
}

function speakText(text) {
  try {
    if ('speechSynthesis' in window && typeof text === 'string' && !text.includes('<input')) {
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/<[^>]*>?/gm, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.05;
      window.speechSynthesis.speak(utterance);
    }
  } catch (e) {
    console.warn('Speech synthesis skipped');
  }
}

function enterCornerMode(title, htmlContent) {
  document.body.classList.add('corner-mode');
  if (panelTitle) panelTitle.textContent = title;
  if (panelContentArea) panelContentArea.innerHTML = htmlContent;
}

function exitCornerMode() {
  document.body.classList.remove('corner-mode');
  setMood('happy', 'DABSy Online', 'Welcome back! Tap here to ask another question.');
}

if (panelCloseBtn) panelCloseBtn.addEventListener('click', exitCornerMode);

// Tap status to configure API key
if (companionStatus) {
  companionStatus.addEventListener('click', () => {
    companionStatus.textContent = 'API Key Config';
    companionSpeech.innerHTML = `
      <input type="text" id="inlineInput" placeholder="Paste Gemini API Key..." autofocus>
    `;
    const input = document.getElementById('inlineInput');
    if (input) {
      input.focus();
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          const val = input.value.trim();
          if (val) {
            geminiApiKey = val;
            localStorage.setItem('dabsy_gemini_key', geminiApiKey);
            setMood('happy', 'DABSy Online', 'API Key saved successfully!');
          } else {
            setMood('happy', 'DABSy Online', 'Cancelled.');
          }
        }
      });
    }
  });
}

// Tap speech bubble to ask a question
if (companionSpeech) {
  companionSpeech.addEventListener('click', () => {
    if (companionSpeech.querySelector('input')) return;
    if (!geminiApiKey) {
      if (companionStatus) companionStatus.click();
      return;
    }

    companionStatus.textContent = 'Ask DABSy';
    companionSpeech.innerHTML = `
      <input type="text" id="inlineInput" placeholder="Ask physics, math, chemistry..." autofocus>
    `;
    const input = document.getElementById('inlineInput');
    if (input) {
      input.focus();
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          const query = input.value.trim();
          if (query) {
            processWithGemini(query.toLowerCase());
          }
        }
      });
    }
  });
}

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

    const rawText = response.text || '';
    let parsedData;
    
    try {
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      const cleanJsonText = jsonMatch ? jsonMatch[0] : rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedData = JSON.parse(cleanJsonText);
    } catch (parseErr) {
      // Bulletproof fallback so the app never breaks
      parsedData = {
        spoken_summary: "Here is what I found for your question.",
        steps: [{ title: "Answer", content: rawText }]
      };
    }

    setMood('study', 'Study Breakdown', parsedData.spoken_summary || "Here is your breakdown.");

    let stepsHTML = '';
    if (parsedData.steps && Array.isArray(parsedData.steps)) {
      parsedData.steps.forEach((step, idx) => {
        stepsHTML += `
          <div class="step-card">
            <strong>Step ${idx + 1}: ${step.title || 'Note'}</strong>
            <div>${step.content || ''}</div>
          </div>
        `;
      });
    }
    stepsHTML += `
      <div class="step-card" style="text-align: center; color: var(--text-muted);">
        Type "I'm done" or click the close button when ready to return!
      </div>
    `;

    enterCornerMode(`Breakdown: ${userPrompt}`, stepsHTML);

  } catch (error) {
    console.error('Gemini Error:', error);
    setMood('happy', 'DABSy Online', `Error communicating with Gemini. Tap here to check API key.`);
  }
}
