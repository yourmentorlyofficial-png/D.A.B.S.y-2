// DABSy Frontend App - Direct Client Mode

const GEMINI_API_KEY = "YOUR_API_KEY_HERE"; // <-- Paste your actual Gemini API key inside these quotes!
const MODEL_NAME = "gemini-1.5-flash";

let studyMode = false;
let isListening = false;
let isSpeaking = false;

// Speech Synthesis (DABSy talking out loud)
function speakText(text) {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.1; // Friendly robotic tone
    
    utterance.onstart = () => { isSpeaking = true; updateFaceState('speaking'); };
    utterance.onend = () => { isSpeaking = false; updateFaceState('idle'); };
    utterance.onerror = () => { isSpeaking = false; updateFaceState('idle'); };
    
    window.speechSynthesis.speak(utterance);
}

// Core AI communication function talking directly to Gemini
async function askDABSy(userMessage) {
    if (!GEMINI_API_KEY || GEMINI_API_KEY === "YOUR_API_KEY_HERE") {
        const errAlert = "Please put your API key in app.js!";
        speakText(errAlert);
        return errAlert;
    }

    updateFaceState('thinking');

    let promptText = userMessage;
    if (studyMode) {
        promptText = `You are DABSy, a lively, friendly AI study buddy. Explain things step-by-step in a simple, clear, and encouraging way suitable for a student. User question: ${userMessage}`;
    } else {
        promptText = `You are DABSy, a lively, friendly AI study buddy companion. Keep responses relatively concise, engaging, and warm. User says: ${userMessage}`;
    }

    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${GEMINI_API_KEY}`;
        
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [{ text: promptText }]
                    }
                ]
            })
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm awake, but I couldn't think of anything to say!";

        speakText(reply);
        updateFaceState('happy');
        return reply;

    } catch (error) {
        console.error("DABSy AI Error:", error);
        const failMsg = "My connection hiccuped, but I am still here!";
        speakText(failMsg);
        updateFaceState('confused');
        return failMsg;
    }
}

// Facial expression states
function updateFaceState(state) {
    const faceEl = document.getElementById('dabsy-face') || document.body;
    faceEl.className = `dabsy-state-${state}`;
}

// Touch interactions (Single tap = listen, Double tap = toggle Study Mode)
let lastTap = 0;
document.addEventListener('click', (e) => {
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTap;
    
    if (tapLength < 300 && tapLength > 0) {
        studyMode = !studyMode;
        speakText(studyMode ? "Study mode activated!" : "Study mode deactivated!");
    } else {
        if (!isListening && !isSpeaking) {
            startListeningSimulation();
        }
    }
    lastTap = currentTime;
});

// Voice Recognition / Fallback
function startListeningSimulation() {
    isListening = true;
    updateFaceState('listening');
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.onresult = async (event) => {
            const spokenText = event.results[0][0].transcript;
            isListening = false;
            await askDABSy(spokenText);
        };
        recognition.onerror = () => { isListening = false; updateFaceState('idle'); };
        recognition.onend = () => { isListening = false; };
        try {
            recognition.start();
        } catch(e) {
            isListening = false;
            fallbackTextInput();
        }
    } else {
        fallbackTextInput();
    }
}

function fallbackTextInput() {
    isListening = false;
    const userInput = prompt("DABSy is listening (Type your message):");
    if (userInput) {
        askDABSy(userInput);
    } else {
        updateFaceState('idle');
    }
}

// Shake detection for dizzy reaction
window.addEventListener('devicemotion', (event) => {
    const acc = event.accelerationIncludingGravity;
    if (acc && (Math.abs(acc.x) > 25 || Math.abs(acc.y) > 25)) {
        updateFaceState('dizzy');
        speakText("Whoa! I'm dizzy!");
    }
});

console.log("DABSy Direct Client Initialized.");
