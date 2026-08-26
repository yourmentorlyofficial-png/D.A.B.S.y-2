// D.A.B.S.y Application Logic
document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const dabsyContainer = document.getElementById('dabsy-container');
    const eyes = document.querySelectorAll('.eye');
    const statusIndicator = document.getElementById('status-indicator');
    const glassMenu = document.getElementById('glass-menu');
    const bubbleStudy = document.getElementById('bubble-study');
    const studyStatus = document.getElementById('study-status');
    const bubbleSettings = document.getElementById('bubble-settings');
    const settingsOverlay = document.getElementById('settings-overlay');
    const apiKeyInput = document.getElementById('api-key-input');
    const voiceSelect = document.getElementById('voice-select');
    const saveSettingsBtn = document.getElementById('save-settings');

    // App States
    let studyModeActive = false;
    let isListening = false;
    let isSpeaking = false;
    let lastTapTime = 0;
    let touchStartX = 0;
    let touchStartY = 0;
    let voices = [];

    // Load saved API key
    const savedApiKey = localStorage.getItem('dabsy_gemini_key') || '';
    apiKeyInput.value = savedApiKey;

    // Speech Synthesis Voices Setup
    function loadVoices() {
        if (!('speechSynthesis' in window)) return;
        voices = window.speechSynthesis.getVoices();
        voiceSelect.innerHTML = '';
        voices.forEach((voice, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = `${voice.name} (${voice.lang})`;
            voiceSelect.appendChild(option);
        });
        const savedVoiceIndex = localStorage.getItem('dabsy_voice_index');
        if (savedVoiceIndex !== null && voices[savedVoiceIndex]) {
            voiceSelect.value = savedVoiceIndex;
        }
    }

    if ('speechSynthesis' in window) {
        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    // Save Settings
    saveSettingsBtn.addEventListener('click', () => {
        localStorage.setItem('dabsy_gemini_key', apiKeyInput.value.trim());
        localStorage.setItem('dabsy_voice_index', voiceSelect.value);
        settingsOverlay.classList.add('hidden');
        speak("Settings saved successfully.");
    });

    // Interaction Gestures: Single Tap vs Double Tap
    dabsyContainer.addEventListener('click', (e) => {
        if (!settingsOverlay.classList.contains('hidden')) return;

        const currentTime = new Date().getTime();
        const tapLength = currentTime - lastTapTime;

        if (tapLength < 350 && tapLength > 0) {
            // Double Tap -> Toggle Glass Bubbles Menu
            glassMenu.classList.toggle('hidden');
            if (!glassMenu.classList.contains('hidden')) {
                speak("Menu opened.");
            }
            e.stopPropagation();
        } else {
            setTimeout(() => {
                if (new Date().getTime() - lastTapTime >= 350) {
                    if (!glassMenu.classList.contains('hidden')) {
                        glassMenu.classList.add('hidden');
                        return;
                    }
                    triggerListening();
                }
            }, 350);
        }
        lastTapTime = currentTime;
    });

    // Rubbing / Swiping detection on face
    dabsyContainer.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        }
    }, {passive: true});

    dabsyContainer.addEventListener('touchmove', (e) => {
        if (!touchStartX || !touchStartY) return;
        let touchEndX = e.touches[0].clientX;
        let touchEndY = e.touches[0].clientY;
        let diffX = Math.abs(touchEndX - touchStartX);
        let diffY = Math.abs(touchEndY - touchStartY);

        if (diffX > 30 || diffY > 30) {
            triggerTactileReaction();
            touchStartX = null;
            touchStartY = null;
        }
    }, {passive: true});

    function triggerTactileReaction() {
        if ('vibrate' in navigator) {
            navigator.vibrate([30, 50, 30]);
        }
        eyes.forEach(eye => eye.classList.add('happy'));
        statusIndicator.textContent = "DABSy is happy! ✨";
        setTimeout(() => {
            eyes.forEach(eye => eye.classList.remove('happy'));
            statusIndicator.textContent = "Tap to speak";
        }, 1200);
    }

    // Shake Phone Detection for Dizzy Reaction
    let lastX = 0, lastY = 0, lastZ = 0;
    let lastShakeTime = 0;
    window.addEventListener('devicemotion', (e) => {
        let currentX = e.accelerationIncludingGravity.x;
        let currentY = e.accelerationIncludingGravity.y;
        let currentZ = e.accelerationIncludingGravity.z;

        if (currentX !== null && currentY !== null && currentZ !== null) {
            let deltaX = Math.abs(currentX - lastX);
            let deltaY = Math.abs(currentY - lastY);
            let deltaZ = Math.abs(currentZ - lastZ);

            if ((deltaX + deltaY + deltaZ) > 25) {
                let currentTime = new Date().getTime();
                if (currentTime - lastShakeTime > 3000) {
                    lastShakeTime = currentTime;
                    triggerDizzyReaction();
                }
            }
            lastX = currentX;
            lastY = currentY;
            lastZ = currentZ;
        }
    });

    function triggerDizzyReaction() {
        if ('vibrate' in navigator) {
            navigator.vibrate([100, 50, 100, 50, 100]);
        }
        eyes.forEach(eye => eye.classList.add('dizzy'));
        statusIndicator.textContent = "Whoa! DABSy is dizzy 🫨";
        speak("Whoa! I'm dizzy!");
        setTimeout(() => {
            eyes.forEach(eye => eye.classList.remove('dizzy'));
            statusIndicator.textContent = "Tap to speak";
        }, 2000);
    }

    // Glass Menu Interactions
    bubbleStudy.addEventListener('click', (e) => {
        e.stopPropagation();
        studyModeActive = !studyModeActive;
        studyStatus.textContent = studyModeActive ? 'On' : 'Off';
        glassMenu.classList.add('hidden');
        speak(studyModeActive ? "Study Mode enabled. Explanations will be step by step." : "Study Mode disabled.");
    });

    bubbleSettings.addEventListener('click', (e) => {
        e.stopPropagation();
        glassMenu.classList.add('hidden');
        settingsOverlay.classList.remove('hidden');
    });

    settingsOverlay.addEventListener('click', (e) => {
        if (e.target === settingsOverlay) {
            settingsOverlay.classList.add('hidden');
        }
    });

    // Microphone & Speech Recognition Integration
    function triggerListening() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            speak("Speech recognition is not supported on this browser. Please use Chrome.");
            return;
        }

        if (isListening || isSpeaking) return;

        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            isListening = true;
            eyes.forEach(eye => eye.classList.add('listening'));
            statusIndicator.textContent = "Listening...";
        };

        recognition.onresult = async (event) => {
            const speechText = event.results[0][0].transcript;
            statusIndicator.textContent = `You: "${speechText}"`;
            await askGemini(speechText);
        };

        recognition.onerror = (event) => {
            console.error("Speech Recognition Error:", event.error);
            statusIndicator.textContent = "Didn't catch that. Tap to retry.";
            resetFaceState();
        };

        recognition.onend = () => {
            isListening = false;
        };

        try {
            recognition.start();
        } catch (err) {
            console.error(err);
            isListening = false;
            resetFaceState();
        }
    }

    // Gemini API Request Function using gemini-3.6-flash
    async function askGemini(promptText) {
        const apiKey = localStorage.getItem('dabsy_gemini_key');
        if (!apiKey) {
            speak("Please configure your Gemini API key in settings.");
            settingsOverlay.classList.remove('hidden');
            resetFaceState();
            return;
        }

        eyes.forEach(eye => {
            eye.classList.remove('listening');
            eye.classList.add('thinking');
        });
        statusIndicator.textContent = "DABSy is thinking...";

        let systemInstruction = "You are DABSy, a friendly, expressive face interface companion.";
        if (studyModeActive) {
            systemInstruction += " Study Mode is active: provide clear, structured, step-by-step, student-friendly explanations.";
        }

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`;
        
        const payload = {
            contents: [
                {
                    parts: [
                        { text: `${systemInstruction}\n\nUser query: ${promptText}` }
                    ]
                }
            ]
        };

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            const data = await response.json();
            const aiResponseText = data.candidates?.[0]?.content?.parts?.[0]?.text || "I couldn't generate a response.";
            
            statusIndicator.textContent = aiResponseText;
            speak(aiResponseText);

        } catch (error) {
            console.error("Gemini API Error:", error);
            const errMessage = "Sorry, I encountered an error connecting to my AI core.";
            statusIndicator.textContent = errMessage;
            speak(errMessage);
        } finally {
            resetFaceState();
        }
    }

    // Speech Output Synthesis
    function speak(text) {
        if (!('speechSynthesis' in window)) return;
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        const selectedVoiceIndex = voiceSelect.value;
        if (voices[selectedVoiceIndex]) {
            utterance.voice = voices[selectedVoiceIndex];
        }
        utterance.rate = 1.0;
        utterance.pitch = 1.1;

        utterance.onstart = () => {
            isSpeaking = true;
            eyes.forEach(eye => eye.classList.add('happy'));
        };

        utterance.onend = () => {
            isSpeaking = false;
            resetFaceState();
        };

        utterance.onerror = () => {
            isSpeaking = false;
            resetFaceState();
        };

        window.speechSynthesis.speak(utterance);
    }

    function resetFaceState() {
        eyes.forEach(eye => {
            eye.classList.remove('listening', 'thinking', 'dizzy', 'happy');
        });
        if (!isListening && !isSpeaking) {
            statusIndicator.textContent = "Tap to speak";
        }
    }

    // Periodic blinking animation for life-like presence
    setInterval(() => {
        if (!isListening && !isSpeaking && settingsOverlay.classList.contains('hidden')) {
            eyes.forEach(eye => eye.classList.add('blink'));
            setTimeout(() => {
                eyes.forEach(eye => eye.classList.remove('blink'));
            }, 150);
        }
    }, 4000);
});
