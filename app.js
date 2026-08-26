import { GoogleGenAI } from "https://cdn.jsdelivr.net/npm/@google/genai@2.17.1/+esm";


/* =====================================================
   ELEMENTS
===================================================== */

const face = document.getElementById("face");

const leftEye = document.getElementById("leftEye");
const rightEye = document.getElementById("rightEye");

const leftPupil = leftEye.querySelector(".pupil");
const rightPupil = rightEye.querySelector(".pupil");

const status = document.getElementById("status");
const speech = document.getElementById("speech");
const hint = document.getElementById("hint");

const bubbleMenu = document.getElementById("bubbleMenu");

const studyButton = document.getElementById("studyButton");
const settingsButton = document.getElementById("settingsButton");
const closeMenuButton = document.getElementById("closeMenuButton");

const settingsOverlay = document.getElementById("settingsOverlay");
const studyOverlay = document.getElementById("studyOverlay");

const closeSettings = document.getElementById("closeSettings");
const closeStudy = document.getElementById("closeStudy");

const apiKeyInput = document.getElementById("apiKey");

const saveApiKey = document.getElementById("saveApiKey");
const forgetApiKey = document.getElementById("forgetApiKey");

const settingStatus = document.getElementById("settingStatus");

const studyTalkButton = document.getElementById("studyTalkButton");

const answerPanel = document.getElementById("answerPanel");
const answerContent = document.getElementById("answerContent");
const answerTitle = document.getElementById("answerTitle");
const closeAnswer = document.getElementById("closeAnswer");

const heart = document.getElementById("heart");


/* =====================================================
   STATE
===================================================== */

let geminiApiKey =
  localStorage.getItem("dabsy_gemini_key") || "";

let recognition = null;

let listening = false;

let thinking = false;

let studyMode = false;

let lastTap = 0;

let tapTimer = null;

let touchStart = null;

let lastShake = 0;

let petCooldown = false;


/* =====================================================
   BASIC DABSY SPEECH
===================================================== */

function showDABSy(message, state = "DABSy") {

  status.textContent = state;

  speech.textContent = message;

}


function speak(message) {

  if (!("speechSynthesis" in window)) return;

  try {

    window.speechSynthesis.cancel();

    const utterance =
      new SpeechSynthesisUtterance(message);

    utterance.rate = 1.03;

    utterance.pitch = 1.0;

    utterance.volume = 1;

    window.speechSynthesis.speak(utterance);

  } catch (error) {

    console.log("Speech unavailable.");

  }

}


/* =====================================================
   STARTUP
===================================================== */

window.addEventListener("load", () => {

  showDABSy(
    "Hello Swagat, how can I help you today?",
    "DABSy"
  );

  setTimeout(() => {

    speak(
      "Hello Swagat, how can I help you today?"
    );

  }, 700);

});


/* =====================================================
   EYE MOVEMENT
===================================================== */

document.addEventListener("pointermove", event => {

  const x =
    (event.clientX / window.innerWidth - 0.5) * 16;

  const y =
    (event.clientY / window.innerHeight - 0.5) * 16;

  leftPupil.style.transform =
    `translate(${x}px, ${y}px)`;

  rightPupil.style.transform =
    `translate(${x}px, ${y}px)`;

});


/* =====================================================
   TAP / DOUBLE TAP
===================================================== */

face.addEventListener("pointerup", event => {

  const now = Date.now();

  const difference = now - lastTap;

  if (difference < 320) {

    clearTimeout(tapTimer);

    lastTap = 0;

    toggleMenu();

  } else {

    lastTap = now;

    clearTimeout(tapTimer);

    tapTimer = setTimeout(() => {

      lastTap = 0;

      startListening();

    }, 330);

  }

});


/* =====================================================
   MENU
===================================================== */

function toggleMenu() {

  document.body.classList.toggle("menu-open");

}


function closeMenu() {

  document.body.classList.remove("menu-open");

}


closeMenuButton.addEventListener(
  "click",
  closeMenu
);


/* =====================================================
   SETTINGS
===================================================== */

settingsButton.addEventListener("click", () => {

  closeMenu();

  openOverlay(settingsOverlay);

  apiKeyInput.value = geminiApiKey;

});


closeSettings.addEventListener("click", () => {

  closeOverlay(settingsOverlay);

});


saveApiKey.addEventListener("click", () => {

  const key =
    apiKeyInput.value.trim();

  if (!key) {

    settingStatus.textContent =
      "Please enter your Gemini key.";

    return;

  }

  geminiApiKey = key;

  localStorage.setItem(
    "dabsy_gemini_key",
    geminiApiKey
  );

  settingStatus.textContent =
    "Key saved. DABSy is ready.";

  showDABSy(
    "I'm connected. Let's do this.",
    "Ready"
  );

  setTimeout(() => {

    closeOverlay(settingsOverlay);

  }, 900);

});


forgetApiKey.addEventListener("click", () => {

  localStorage.removeItem("dabsy_gemini_key");

  geminiApiKey = "";

  apiKeyInput.value = "";

  settingStatus.textContent =
    "Saved key forgotten.";

});


/* =====================================================
   OVERLAYS
===================================================== */

function openOverlay(element) {

  element.classList.add("open");

}


function closeOverlay(element) {

  element.classList.remove("open");

}


studyButton.addEventListener("click", () => {

  closeMenu();

  openOverlay(studyOverlay);

});


closeStudy.addEventListener("click", () => {

  closeOverlay(studyOverlay);

});


/* =====================================================
   STUDY TOPICS
===================================================== */

document.querySelectorAll(".studyOption")
  .forEach(button => {

    button.addEventListener("click", () => {

      const topic =
        button.dataset.topic;

      closeOverlay(studyOverlay);

      studyMode = true;

      showDABSy(
        `I'm ready for ${topic}. Tell me what you're stuck on.`,
        "Study Mode"
      );

      speak(
        `I'm ready for ${topic}. Tell me what you're stuck on.`
      );

      setTimeout(() => {

        startListening();

      }, 700);

    });

  });


studyTalkButton.addEventListener(
  "click",
  () => {

    closeOverlay(studyOverlay);

    studyMode = true;

    startListening();

  }
);


/* =====================================================
   SPEECH RECOGNITION
===================================================== */

function setupRecognition() {

  const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

  if (!SpeechRecognition) {

    return null;

  }

  const r =
    new SpeechRecognition();

  r.lang = "en-IN";

  r.continuous = false;

  r.interimResults = true;

  r.maxAlternatives = 1;


  r.onstart = () => {

    listening = true;

    document.body.classList.add(
      "listening"
    );

    showDABSy(
      "I'm listening...",
      "Listening"
    );

  };


  r.onresult = event => {

    let finalText = "";

    let interimText = "";

    for (
      let i = event.resultIndex;
      i < event.results.length;
      i++
    ) {

      const result =
        event.results[i];

      if (result.isFinal) {

        finalText +=
          result[0].transcript;

      } else {

        interimText +=
          result[0].transcript;

      }

    }

    const visibleText =
      finalText || interimText;

    if (visibleText) {

      speech.textContent =
        visibleText;

    }

    if (finalText) {

      processUserRequest(
        finalText.trim()
      );

    }

  };


  r.onerror = event => {

    listening = false;

    document.body.classList.remove(
      "listening"
    );

    console.log(
      "Speech error:",
      event.error
    );

    if (
      event.error === "not-allowed"
    ) {

      showDABSy(
        "I need microphone permission first.",
        "Microphone"
      );

      speak(
        "I need microphone permission first."
      );

    } else {

      showDABSy(
        "I didn't catch that. Tap me and try again.",
        "Ready"
      );

    }

  };


  r.onend = () => {

    listening = false;

    document.body.classList.remove(
      "listening"
    );

  };


  return r;

}


recognition =
  setupRecognition();


/* =====================================================
   START LISTENING
===================================================== */

function startListening() {

  if (thinking) return;

  if (!recognition) {

    showDABSy(
      "Voice input isn't supported here. Try Chrome on Android.",
      "Voice unavailable"
    );

    speak(
      "Voice input isn't supported here."
    );

    return;

  }

  try {

    recognition.start();

  } catch (error) {

    console.log(
      "Recognition already running."
    );

  }

}


/* =====================================================
   PROCESS USER REQUEST
===================================================== */

async function processUserRequest(
  userText
) {

  if (!userText) return;

  if (
    userText.toLowerCase()
      .includes("stop listening")
  ) {

    return;

  }


  if (!geminiApiKey) {

    showDABSy(
      "I need my Gemini connection first. Double-tap me and open Settings.",
      "Needs setup"
    );

    speak(
      "I need my Gemini connection first. Double-tap me and open Settings."
    );

    return;

  }


  await askGemini(userText);

}


/* =====================================================
   GEMINI
===================================================== */

async function askGemini(question) {

  thinking = true;

  document.body.classList.remove(
    "listening"
  );

  document.body.classList.add(
    "thinking"
  );


  showDABSy(
    "Let me think about that...",
    "Thinking"
  );


  try {

    const ai =
      new GoogleGenAI({
        apiKey: geminiApiKey
      });


    const modeInstruction =
      studyMode

        ? `
You are in STUDY MODE.

The user is a Class 11 science student in India.

Explain concepts clearly and patiently.

Use simple language.

Break difficult ideas into logical steps.

Do not just dump an answer.

Help the student understand WHY the answer works.
`

        : `
You are DABSy, a friendly AI desk companion.

Be helpful, calm, concise and natural.

You can help with studying, planning, questions and everyday tasks.
`;


    const prompt = `

${modeInstruction}

The user's question is:

"${question}"

Return ONLY valid JSON in this structure:

{
  "spoken": "A short natural response of 1 or 2 sentences.",
  "answer": "A useful explanation for the screen."
}

Do not use markdown fences.
`;


    const response =
      await ai.models.generateContent({

        model:
          "gemini-2.5-flash",

        contents:
          prompt

      });


    const raw =
      response.text || "";


    let data;


    try {

      const match =
        raw.match(/\{[\s\S]*\}/);

      data =
        JSON.parse(
          match ? match[0] : raw
        );

    } catch {

      data = {

        spoken:
          "I've got the answer for you.",

        answer:
          raw

      };

    }


    const spoken =
      data.spoken ||
      "I've got something for you.";

    const answer =
      data.answer ||
      "I couldn't format that answer properly.";


    document.body.classList.remove(
      "thinking"
    );


    thinking = false;


    showDABSy(
      spoken,
      studyMode
        ? "Study Mode"
        : "DABSy"
    );


    speak(spoken);


    showAnswer(
      question,
      answer
    );


  } catch (error) {

    console.error(
      "Gemini error:",
      error
    );


    thinking = false;

    document.body.classList.remove(
      "thinking"
    );


    showDABSy(
      "Something went wrong with my AI connection. Double-tap me and check Settings.",
      "Connection problem"
    );


    speak(
      "Something went wrong with my AI connection."
    );

  }

}


/* =====================================================
   ANSWER PANEL
===================================================== */

function showAnswer(
  question,
  answer
) {

  answerTitle.textContent =
    studyMode
      ? "📚 Study Breakdown"
      : "DABSy";


  answerContent.innerHTML = "";


  const questionElement =
    document.createElement("div");

  questionElement.className =
    "answerStep";

  const questionTitle =
    document.createElement("strong");

  questionTitle.textContent =
    "You asked";

  const questionText =
    document.createElement("div");

  questionText.textContent =
    question;


  questionElement.appendChild(
    questionTitle
  );

  questionElement.appendChild(
    questionText
  );


  const answerElement =
    document.createElement("div");

  answerElement.className =
    "answerStep";

  const answerTitleElement =
    document.createElement("strong");

  answerTitleElement.textContent =
    studyMode
      ? "Let's understand it"
      : "Here's what I think";


  const answerText =
    document.createElement("div");

  answerText.textContent =
    answer;


  answerElement.appendChild(
    answerTitleElement
  );

  answerElement.appendChild(
    answerText
  );


  answerContent.appendChild(
    questionElement
  );

  answerContent.appendChild(
    answerElement
  );


  answerPanel.classList.add(
    "open"
  );

}


closeAnswer.addEventListener(
  "click",
  () => {

    answerPanel.classList.remove(
      "open"
    );

  }
);


/* =====================================================
   PETTING
===================================================== */

face.addEventListener(
  "pointermove",
  event => {

    if (
      event.buttons !== 1
    ) return;

    if (petCooldown) return;

    petCooldown = true;

    showHeart(
      event.clientX,
      event.clientY
    );


    /* Soft happy eyes */

    leftEye.style.transform =
      "scaleY(0.78)";

    rightEye.style.transform =
      "scaleY(0.78)";


    setTimeout(() => {

      leftEye.style.transform =
        "";

      rightEye.style.transform =
        "";

      petCooldown = false;

    }, 500);

  }
);


/* =====================================================
   HEART
===================================================== */

function showHeart(x, y) {

  heart.style.left =
    `${x - 10}px`;

  heart.style.top =
    `${y - 10}px`;


  heart.classList.remove(
    "pop"
  );


  void heart.offsetWidth;


  heart.classList.add(
    "pop"
  );

}


/* =====================================================
   TOUCH TRACKING
===================================================== */

face.addEventListener(
  "pointerdown",
  event => {

    touchStart = {

      x: event.clientX,

      y: event.clientY,

      time: Date.now()

    };

  }
);


/* =====================================================
   SHAKE DETECTION
===================================================== */

if (
  "DeviceMotionEvent" in window
) {

  window.addEventListener(
    "devicemotion",
    event => {

      const acc =
        event.accelerationIncludingGravity;

      if (!acc) return;


      const x =
        acc.x || 0;

      const y =
        acc.y || 0;

      const z =
        acc.z || 0;


      const magnitude =
        Math.sqrt(
          x * x +
          y * y +
          z * z
        );


      const now =
        Date.now();


      if (
        magnitude > 20 &&
        now - lastShake > 1000
      ) {

        lastShake = now;

        doShakeReaction();

      }

    }
  );

}


/* =====================================================
   SHAKE REACTION
===================================================== */

function doShakeReaction() {

  document.body.classList.remove(
    "shaken"
  );

  void document.body.offsetWidth;

  document.body.classList.add(
    "shaken"
  );


  showDABSy(
    "WHOA! 🫨",
    "DABSy"
  );


  speak(
    "Whoa!"
  );


  setTimeout(() => {

    showDABSy(
      "Okay... I'm good 😵‍💫",
      "DABSy"
    );

  }, 850);

}


/* =====================================================
   MENU AUTO CLOSE
===================================================== */

document.addEventListener(
  "pointerdown",
  event => {

    if (
      document.body.classList.contains(
        "menu-open"
      )
    ) {

      if (
        !event.target.closest(
          ".bubble"
        )
      ) {

        closeMenu();

      }

    }

  }
);


/* =====================================================
   PREVENT ACCIDENTAL ZOOM
===================================================== */

document.addEventListener(
  "gesturestart",
  event => {

    event.preventDefault();

  }
);


/* =====================================================
   DEBUG HELPER
===================================================== */

window.DABSy = {

  listen: startListening,

  menu: toggleMenu,

  shake: doShakeReaction,

  ask: processUserRequest

};
