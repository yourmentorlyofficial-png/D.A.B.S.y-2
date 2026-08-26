"use strict";

/*
==========================================================
 DABSy FINAL CORE
 Private AI backend:
 https://dabsy-ai.swagatdemo9292.workers.dev
==========================================================
*/

const WORKER_URL =
  "https://dabsy-ai.swagatdemo9292.workers.dev";


/* ========================================================
   ELEMENTS
======================================================== */

const face = document.getElementById("face");
const eyes = document.getElementById("eyes");

const leftEye = document.getElementById("leftEye");
const rightEye = document.getElementById("rightEye");

const leftPupil = leftEye.querySelector(".pupil");
const rightPupil = rightEye.querySelector(".pupil");

const speechArea = document.getElementById("speechArea");
const statusEl = document.getElementById("status");
const speechEl = document.getElementById("speech");

const hint = document.getElementById("hint");
const heart = document.getElementById("heart");

const bubbleMenu = document.getElementById("bubbleMenu");

const studyButton = document.getElementById("studyButton");
const settingsButton = document.getElementById("settingsButton");
const installButton = document.getElementById("installButton");
const closeMenuButton = document.getElementById("closeMenuButton");

const settingsOverlay =
  document.getElementById("settingsOverlay");

const studyOverlay =
  document.getElementById("studyOverlay");

const closeSettings =
  document.getElementById("closeSettings");

const closeStudy =
  document.getElementById("closeStudy");

const testConnection =
  document.getElementById("testConnection");

const settingStatus =
  document.getElementById("settingStatus");

const studyTalkButton =
  document.getElementById("studyTalkButton");

const answerPanel =
  document.getElementById("answerPanel");

const answerTitle =
  document.getElementById("answerTitle");

const answerContent =
  document.getElementById("answerContent");

const closeAnswer =
  document.getElementById("closeAnswer");


/* ========================================================
   STATE
======================================================== */

let state = "idle";

let listening = false;
let thinking = false;
let speaking = false;

let studyMode = false;
let menuOpen = false;

let recognition = null;

let lastTap = 0;
let tapTimer = null;

let pointerDown = false;
let petTimer = null;

let deferredInstallPrompt = null;

let lastShake = 0;

let speechTimer = null;


/* ========================================================
   HELPERS
======================================================== */

function setState(newState) {

  state = newState;

  document.body.classList.remove(
    "state-idle",
    "state-curious",
    "state-listening",
    "state-thinking",
    "state-speaking",
    "state-happy",
    "state-excited",
    "state-confused",
    "state-sleepy",
    "state-dizzy",
    "state-shaken"
  );

  document.body.classList.add(
    `state-${newState}`
  );

  updateEyesForState(newState);
}


function updateEyesForState(current) {

  leftEye.style.transform = "";
  rightEye.style.transform = "";

  leftEye.style.height = "";
  rightEye.style.height = "";

  leftEye.style.borderRadius = "";
  rightEye.style.borderRadius = "";

  switch (current) {

    case "curious":

      leftEye.style.transform =
        "rotate(-5deg) scaleY(1.04)";

      rightEye.style.transform =
        "rotate(5deg) scaleY(.92)";

      break;


    case "listening":

      leftEye.style.transform =
        "scale(1.08)";

      rightEye.style.transform =
        "scale(1.08)";

      break;


    case "thinking":

      leftEye.style.transform =
        "translateY(-7px) rotate(-3deg)";

      rightEye.style.transform =
        "translateY(7px) rotate(3deg)";

      break;


    case "speaking":

      leftEye.style.transform =
        "scaleY(1.06)";

      rightEye.style.transform =
        "scaleY(1.06)";

      break;


    case "happy":

      leftEye.style.height = "60%";
      rightEye.style.height = "60%";

      leftEye.style.borderRadius =
        "50% 50% 70% 70%";

      rightEye.style.borderRadius =
        "50% 50% 70% 70%";

      break;


    case "excited":

      leftEye.style.transform =
        "scale(1.13)";

      rightEye.style.transform =
        "scale(1.13)";

      break;


    case "confused":

      leftEye.style.transform =
        "rotate(9deg)";

      rightEye.style.transform =
        "rotate(-7deg)";

      break;


    case "sleepy":

      leftEye.style.transform =
        "scaleY(.42)";

      rightEye.style.transform =
        "scaleY(.42)";

      break;


    case "dizzy":

      break;


    default:

      break;
  }
}


function showMessage(
  message,
  label = "DABSy",
  temporary = true
) {

  statusEl.textContent = label;
  speechEl.textContent = message;

  face.classList.add("showSpeech");

  if (temporary) {

    clearTimeout(speechTimer);

    speechTimer = setTimeout(() => {

      if (!listening && !thinking && !speaking) {

        face.classList.remove(
          "showSpeech"
        );

      }

    }, 5000);
  }
}


/* ========================================================
   SPEECH
======================================================== */

function speak(text) {

  if (!text) return;

  if (!("speechSynthesis" in window)) {

    return;
  }

  speechSynthesis.cancel();

  const utterance =
    new SpeechSynthesisUtterance(text);

  utterance.lang = "en-IN";
  utterance.rate = 1.0;
  utterance.pitch = 1.05;
  utterance.volume = 1;

  utterance.onstart = () => {

    speaking = true;

    setState("speaking");

    face.classList.add(
      "showSpeech"
    );
  };

  utterance.onend = () => {

    speaking = false;

    if (!listening && !thinking) {

      setState("idle");

    }
  };

  utterance.onerror = () => {

    speaking = false;

    setState("idle");
  };

  speechSynthesis.speak(
    utterance
  );
}


/* ========================================================
   BLINK
======================================================== */

function blink(
  duration = 120
) {

  if (
    listening ||
    thinking ||
    speaking ||
    menuOpen
  ) {

    return;
  }

  leftEye.style.transform =
    "scaleY(.08)";

  rightEye.style.transform =
    "scaleY(.08)";

  setTimeout(() => {

    updateEyesForState(
      state
    );

  }, duration);
}


/* ========================================================
   IDLE LIFE
======================================================== */

function idleLife() {

  const delay =
    1800 +
    Math.random() * 4200;

  setTimeout(() => {

    if (
      !listening &&
      !thinking &&
      !speaking &&
      !menuOpen
    ) {

      const choice =
        Math.random();

      if (choice < .48) {

        blink(
          100 + Math.random() * 80
        );

      } else if (choice < .7) {

        wanderEyes();

      } else if (choice < .86) {

        curiousMoment();

      } else {

        longBlink();

      }
    }

    idleLife();

  }, delay);
}


function wanderEyes() {

  if (
    listening ||
    thinking
  ) return;

  const x =
    (Math.random() - .5) * 20;

  const y =
    (Math.random() - .5) * 13;

  leftPupil.style.transform =
    `translate(${x}px, ${y}px)`;

  rightPupil.style.transform =
    `translate(${x}px, ${y}px)`;

  setTimeout(() => {

    leftPupil.style.transform = "";
    rightPupil.style.transform = "";

  }, 900);
}


function curiousMoment() {

  setState("curious");

  setTimeout(() => {

    if (!listening && !thinking) {

      setState("idle");

    }

  }, 900);
}


function longBlink() {

  blink(300);

}


/* ========================================================
   POINTER GAZE
======================================================== */

document.addEventListener(
  "pointermove",
  event => {

    if (
      listening ||
      thinking ||
      menuOpen
    ) return;

    const x =
      (event.clientX /
        window.innerWidth -
        .5) * 17;

    const y =
      (event.clientY /
        window.innerHeight -
        .5) * 13;

    leftPupil.style.transform =
      `translate(${x}px, ${y}px)`;

    rightPupil.style.transform =
      `translate(${x}px, ${y}px)`;
  }
);


/* ========================================================
   MENU
======================================================== */

function openMenu() {

  menuOpen = true;

  document.body.classList.add(
    "menu-open"
  );

  bubbleMenu.setAttribute(
    "aria-hidden",
    "false"
  );

  setState("curious");
}


function closeMenu() {

  menuOpen = false;

  document.body.classList.remove(
    "menu-open"
  );

  bubbleMenu.setAttribute(
    "aria-hidden",
    "true"
  );

  if (!listening && !thinking) {

    setState("idle");

  }
}


function toggleMenu() {

  if (menuOpen) {

    closeMenu();

  } else {

    openMenu();

  }
}


closeMenuButton.addEventListener(
  "click",
  closeMenu
);


/* ========================================================
   FACE TAP / DOUBLE TAP
======================================================== */

face.addEventListener(
  "pointerup",
  event => {

    if (
      event.target.closest(
        "button"
      )
    ) {

      return;
    }

    const now =
      Date.now();

    const difference =
      now - lastTap;

    if (
      difference > 0 &&
      difference < 320
    ) {

      clearTimeout(
        tapTimer
      );

      lastTap = 0;

      toggleMenu();

      return;
    }

    lastTap = now;

    clearTimeout(
      tapTimer
    );

    tapTimer =
      setTimeout(() => {

        lastTap = 0;

        startListening();

      }, 330);

  }
);


/* ========================================================
   PETTING
======================================================== */

face.addEventListener(
  "pointerdown",
  () => {

    pointerDown = true;

  }
);


face.addEventListener(
  "pointermove",
  event => {

    if (
      !pointerDown ||
      menuOpen
    ) return;

    if (
      !petTimer
    ) {

      petTimer =
        setTimeout(() => {

          petTimer = null;

          petDABSy();

        }, 350);
    }
  }
);


window.addEventListener(
  "pointerup",
  () => {

    pointerDown = false;

    clearTimeout(
      petTimer
    );

    petTimer = null;

  }
);


function petDABSy() {

  if (
    listening ||
    thinking
  ) return;

  setState("happy");

  showMessage(
    "Hehe. That tickles.",
    "DABSy"
  );

  showHeart();

  setTimeout(() => {

    if (!listening && !thinking) {

      setState("idle");

    }

  }, 900);
}


function showHeart() {

  heart.classList.remove(
    "pop"
  );

  void heart.offsetWidth;

  heart.classList.add(
    "pop"
  );
}


/* ========================================================
   MICROPHONE
======================================================== */

function createRecognition() {

  const Recognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

  if (!Recognition) {

    return null;
  }

  const r =
    new Recognition();

  r.lang = "en-IN";

  r.continuous = false;

  r.interimResults = true;

  r.maxAlternatives = 1;


  r.onstart = () => {

    listening = true;

    face.classList.add(
      "active",
      "showSpeech"
    );

    setState("listening");

    showMessage(
      "I'm listening...",
      "Listening",
      false
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

      if (
        result.isFinal
      ) {

        finalText +=
          result[0].transcript;

      } else {

        interimText +=
          result[0].transcript;
      }
    }

    const visible =
      finalText ||
      interimText;

    if (visible) {

      speechEl.textContent =
        visible;
    }

    if (finalText.trim()) {

      askDABSy(
        finalText.trim()
      );
    }
  };


  r.onerror = event => {

    listening = false;

    face.classList.remove(
      "active"
    );

    console.log(
      "Speech recognition:",
      event.error
    );

    if (
      event.error ===
      "not-allowed"
    ) {

      showMessage(
        "Microphone permission is needed.",
        "Microphone"
      );

      speak(
        "I need microphone permission."
      );

    } else if (
      event.error !==
      "aborted"
    ) {

      showMessage(
        "I didn't catch that.",
        "Ready"
      );
    }

    setState("idle");
  };


  r.onend = () => {

    listening = false;

    face.classList.remove(
      "active"
    );

    if (
      !thinking &&
      !speaking
    ) {

      setState("idle");
    }
  };


  return r;
}


recognition =
  createRecognition();


function startListening() {

  if (
    listening ||
    thinking
  ) return;

  if (!recognition) {

    showMessage(
      "Voice isn't supported here. Try Chrome.",
      "Voice"
    );

    speak(
      "Voice isn't supported here. Try Chrome."
    );

    return;
  }

  try {

    recognition.start();

  } catch (error) {

    console.log(
      "Recognition start:",
      error
    );
  }
}


/* ========================================================
   AI
======================================================== */

async function askDABSy(
  message
) {

  if (!message) return;

  listening = false;
  thinking = true;

  face.classList.remove(
    "active"
  );

  face.classList.add(
    "showSpeech"
  );

  setState("thinking");

  showMessage(
    "Thinking...",
    studyMode
      ? "Study Mode"
      : "DABSy",
    false
  );


  try {

    const controller =
      new AbortController();

    const timeout =
      setTimeout(
        () => controller.abort(),
        30000
      );


    const response =
      await fetch(
        WORKER_URL,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({
            message,
            studyMode
          }),

          signal:
            controller.signal
        }
      );


    clearTimeout(
      timeout
    );


    let data;

    try {

      data =
        await response.json();

    } catch {

      throw new Error(
        "The AI server returned an invalid response."
      );
    }


    if (
      !response.ok ||
      data.ok === false
    ) {

      throw new Error(
        data.error ||
        `AI server returned ${response.status}`
      );
    }


    thinking = false;


    const answer =
      data.answer ||
      data.spoken ||
      "I'm here, but I don't have an answer yet.";


    const spoken =
      data.spoken ||
      answer;


    const emotion =
      typeof data.emotion === "string"
        ? data.emotion
        : "calm";


    setState(
      validEmotion(
        emotion
      )
        ? emotion
        : "calm"
    );


    showMessage(
      spoken,
      studyMode
        ? "Study Mode"
        : "DABSy",
      false
    );


    showAnswer(
      message,
      answer
    );


    speak(
      spoken
    );

  }

  catch (error) {

    thinking = false;

    console.error(
      "DABSy Worker error:",
      error
    );


    setState(
      "confused"
    );


    let messageText =
      "I can't reach my AI brain right now.";


    if (
      error.name ===
      "AbortError"
    ) {

      messageText =
        "My AI brain took too long to answer.";

    } else if (
      error.message &&
      error.message.includes(
        "Failed to fetch"
      )
    ) {

      messageText =
        "I can't reach my private AI server.";

    }


    showMessage(
      messageText,
      "Connection",
      false
    );


    setTimeout(() => {

      if (!speaking) {

        setState("idle");

      }

    }, 1600);

  }
}


function validEmotion(
  emotion
) {

  return [
    "idle",
    "curious",
    "listening",
    "thinking",
    "speaking",
    "happy",
    "excited",
    "confused",
    "sleepy",
    "dizzy"
  ].includes(
    emotion
  );
}


/* ========================================================
   ANSWER PANEL
======================================================== */

function showAnswer(
  question,
  answer
) {

  answerTitle.textContent =
    studyMode
      ? "📚 Study Mode"
      : "DABSy";


  answerContent.replaceChildren();


  const questionBlock =
    document.createElement(
      "div"
    );

  questionBlock.className =
    "answerStep";


  const questionTitle =
    document.createElement(
      "strong"
    );

  questionTitle.textContent =
    "You said";


  const questionText =
    document.createElement(
      "div"
    );

  questionText.textContent =
    question;


  questionBlock.append(
    questionTitle,
    questionText
  );


  const answerBlock =
    document.createElement(
      "div"
    );

  answerBlock.className =
    "answerStep";


  const answerTitleEl =
    document.createElement(
      "strong"
    );

  answerTitleEl.textContent =
    studyMode
      ? "Let's understand it"
      : "DABSy says";


  const answerText =
    document.createElement(
      "div"
    );

  answerText.textContent =
    answer;


  answerBlock.append(
    answerTitleEl,
    answerText
  );


  answerContent.append(
    questionBlock,
    answerBlock
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


/* ========================================================
   STUDY
======================================================== */

studyButton.addEventListener(
  "click",
  () => {

    closeMenu();

    studyOverlay.classList.add(
      "open"
    );

  }
);


closeStudy.addEventListener(
  "click",
  () => {

    studyOverlay.classList.remove(
      "open"
    );

  }
);


document
  .querySelectorAll(
    ".studyOption"
  )
  .forEach(
    button => {

      button.addEventListener(
        "click",
        () => {

          studyMode = true;

          const subject =
            button.dataset.topic;

          studyOverlay.classList.remove(
            "open"
          );

          setState(
            "excited"
          );

          showMessage(
            `${subject} mode ready. Tell me what you're working on.`,
            "Study Mode"
          );

          speak(
            `${subject} mode ready. Tell me what you're working on.`
          );

          setTimeout(
            startListening,
            900
          );

        }
      );

    }
  );


studyTalkButton.addEventListener(
  "click",
  () => {

    studyMode = true;

    studyOverlay.classList.remove(
      "open"
    );

    startListening();

  }
);


/* ========================================================
   SETTINGS
======================================================== */

settingsButton.addEventListener(
  "click",
  () => {

    closeMenu();

    settingsOverlay.classList.add(
      "open"
    );

  }
);


closeSettings.addEventListener(
  "click",
  () => {

    settingsOverlay.classList.remove(
      "open"
    );

  }
);


testConnection.addEventListener(
  "click",
  async () => {

    settingStatus.textContent =
      "Testing...";

    setState(
      "thinking"
    );


    try {

      const response =
        await fetch(
          WORKER_URL,
          {
            method: "GET",
            cache: "no-store"
          }
        );


      if (!response.ok) {

        throw new Error(
          `Server returned ${response.status}`
        );
      }


      settingStatus.textContent =
        "✓ DABSy's private backend is online.";

      setState(
        "happy"
      );

    } catch (error) {

      settingStatus.textContent =
        "✕ The private backend could not be reached.";

      setState(
        "confused"
      );

    }


    setTimeout(() => {

      setState(
        "
