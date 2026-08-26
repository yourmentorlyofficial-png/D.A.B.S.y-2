"use strict";

/* =========================================================
   DABSy CORE
========================================================= */

const WORKER_URL =
  "https://dabsy-ai.swagatdemo9292.workers.dev";


/* =========================================================
   ELEMENTS
========================================================= */

const face = document.getElementById("face");

const eyes = document.getElementById("eyes");

const leftEye =
  document.getElementById("leftEye");

const rightEye =
  document.getElementById("rightEye");

const leftPupil =
  leftEye.querySelector(".pupil");

const rightPupil =
  rightEye.querySelector(".pupil");

const speech =
  document.getElementById("speech");

const status =
  document.getElementById("status");

const heart =
  document.getElementById("heart");

const menu =
  document.getElementById("menu");


/* =========================================================
   BUTTONS
========================================================= */

const studyBubble =
  document.getElementById("studyBubble");

const settingsBubble =
  document.getElementById("settingsBubble");

const installBubble =
  document.getElementById("installBubble");

const closeBubble =
  document.getElementById("closeBubble");

const settings =
  document.getElementById("settings");

const study =
  document.getElementById("study");

const closeSettings =
  document.getElementById("closeSettings");

const closeStudy =
  document.getElementById("closeStudy");

const testAI =
  document.getElementById("testAI");

const connectionStatus =
  document.getElementById("connectionStatus");

const studyTalk =
  document.getElementById("studyTalk");

const answer =
  document.getElementById("answer");

const answerText =
  document.getElementById("answerText");

const closeAnswer =
  document.getElementById("closeAnswer");


/* =========================================================
   STATE
========================================================= */

let currentState = "idle";

let listening = false;
let thinking = false;
let speaking = false;

let studyMode = false;

let recognition = null;

let deferredInstallPrompt = null;

let tapTimer = null;
let lastTap = 0;

let touching = false;
let touchStartX = 0;
let touchStartY = 0;
let touchMoved = false;

let petTimer = null;

let lastShake = 0;


/* =========================================================
   STATE ENGINE
========================================================= */

function state(name) {

  currentState = name;

  face.className = "";

  face.classList.add(name);

  if (name === "idle") {
    face.classList.add("showSpeech");
  }
}


/* =========================================================
   MESSAGE
========================================================= */

function message(
  text,
  label = "DABSy"
) {

  status.textContent = label;

  speech.textContent = text;

  face.classList.add(
    "showSpeech"
  );
}


/* =========================================================
   EYES
========================================================= */

function moveEyes(x, y) {

  if (
    listening ||
    thinking
  ) return;

  const px =
    (x / window.innerWidth - .5) * 18;

  const py =
    (y / window.innerHeight - .5) * 13;

  leftPupil.style.transform =
    `translate(
      calc(-50% + ${px}px),
      calc(-50% + ${py}px)
    )`;

  rightPupil.style.transform =
    `translate(
      calc(-50% + ${px}px),
      calc(-50% + ${py}px)
    )`;
}


document.addEventListener(
  "pointermove",
  event => {

    moveEyes(
      event.clientX,
      event.clientY
    );

  }
);


/* =========================================================
   BLINK
========================================================= */

function blink(
  duration = 120
) {

  if (
    listening ||
    thinking ||
    speaking
  ) return;

  leftEye.style.transform =
    "scaleY(.08)";

  rightEye.style.transform =
    "scaleY(.08)";

  setTimeout(() => {

    leftEye.style.transform = "";
    rightEye.style.transform = "";

  }, duration);
}


/* =========================================================
   RANDOM LIFE
========================================================= */

function lifeLoop() {

  const delay =
    1800 +
    Math.random() * 3800;

  setTimeout(() => {

    if (
      !listening &&
      !thinking &&
      !speaking &&
      !document.body.classList.contains(
        "menuOpen"
      )
    ) {

      const r =
        Math.random();

      if (r < .55) {

        blink(
          90 +
          Math.random() * 100
        );

      }

      else if (r < .78) {

        const x =
          Math.random() *
          window.innerWidth;

        const y =
          Math.random() *
          window.innerHeight;

        moveEyes(x, y);

      }

      else {

        state("curious");

        setTimeout(
          () => state("idle"),
          700
        );

      }

    }

    lifeLoop();

  }, delay);
}


/* =========================================================
   MENU
========================================================= */

function openMenu() {

  document.body.classList.add(
    "menuOpen"
  );

  state("curious");
}


function closeMenu() {

  document.body.classList.remove(
    "menuOpen"
  );

  state("idle");
}


function toggleMenu() {

  if (
    document.body.classList.contains(
      "menuOpen"
    )
  ) {

    closeMenu();

  } else {

    openMenu();

  }
}


/* =========================================================
   FACE TOUCH SYSTEM
========================================================= */

/*
   IMPORTANT:

   We use pointer events directly on #face.

   This avoids relying on browser-generated
   click/dblclick behaviour, which was one of
   the things causing the old interaction to
   be unreliable on phones.
*/

face.addEventListener(
  "pointerdown",
  event => {

    if (
      event.button !== 0 &&
      event.pointerType !== "touch"
    ) return;

    touching = true;

    touchMoved = false;

    touchStartX =
      event.clientX;

    touchStartY =
      event.clientY;

    try {
      face.setPointerCapture(
        event.pointerId
      );
    } catch {}

    petTimer =
      setTimeout(() => {

        if (
          touching &&
          touchMoved
        ) {

          petDABSy();

        }

      }, 300);

  },
  {
    passive: true
  }
);


face.addEventListener(
  "pointermove",
  event => {

    if (!touching) return;

    const dx =
      event.clientX -
      touchStartX;

    const dy =
      event.clientY -
      touchStartY;

    if (
      Math.abs(dx) > 8 ||
      Math.abs(dy) > 8
    ) {

      touchMoved = true;

    }

    moveEyes(
      event.clientX,
      event.clientY
    );

  },
  {
    passive: true
  }
);


face.addEventListener(
  "pointerup",
  event => {

    if (!touching) return;

    touching = false;

    clearTimeout(
      petTimer
    );

    petTimer = null;


    /*
       Don't treat a drag as a tap.
    */

    if (touchMoved) {

      return;

    }


    /*
       DOUBLE TAP
    */

    const now =
      Date.now();

    const gap =
      now - lastTap;


    if (
      gap > 0 &&
      gap < 350
    ) {

      clearTimeout(
        tapTimer
      );

      lastTap = 0;

      toggleMenu();

      return;

    }


    /*
       POSSIBLE SINGLE TAP

       Wait briefly so a second tap
       can become a double tap.
    */

    lastTap = now;

    clearTimeout(
      tapTimer
    );

    tapTimer =
      setTimeout(() => {

        lastTap = 0;

        startListening();

      }, 360);

  },
  {
    passive: true
  }
);


/* =========================================================
   PETTING
========================================================= */

function petDABSy() {

  if (
    listening ||
    thinking
  ) return;

  state("happy");

  message(
    "Hehe. That tickles.",
    "DABSy"
  );

  heart.classList.remove(
    "pop"
  );

  void heart.offsetWidth;

  heart.classList.add(
    "pop"
  );


  setTimeout(() => {

    if (
      !listening &&
      !thinking
    ) {

      state("idle");

    }

  }, 1000);
}


/* =========================================================
   SPEECH
========================================================= */

function speak(text) {

  if (
    !text ||
    !("speechSynthesis" in window)
  ) return;

  speechSynthesis.cancel();

  const voice =
    new SpeechSynthesisUtterance(
      text
    );

  voice.lang = "en-IN";

  voice.rate = 1;

  voice.pitch = 1.05;

  voice.volume = 1;


  voice.onstart = () => {

    speaking = true;

    state("speaking");

    message(
      text,
      studyMode
        ? "Study Mode"
        : "DABSy"
    );

  };


  voice.onend = () => {

    speaking = false;

    state("idle");

  };


  voice.onerror = () => {

    speaking = false;

    state("idle");

  };


  speechSynthesis.speak(
    voice
  );
}


/* =========================================================
   MICROPHONE
========================================================= */

function setupRecognition() {

  const Recognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;


  if (!Recognition) {

    return null;

  }


  const r =
    new Recognition();


  r.lang =
    "en-IN";

  r.continuous =
    false;

  r.interimResults =
    true;

  r.maxAlternatives =
    1;


  r.onstart = () => {

    listening = true;

    state("listening");

    message(
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


    if (interimText) {

      speech.textContent =
        interimText;

    }


    if (
      finalText.trim()
    ) {

      askAI(
        finalText.trim()
      );

    }

  };


  r.onerror = event => {

    listening = false;

    state("confused");


    if (
      event.error ===
      "not-allowed"
    ) {

      message(
        "I need microphone permission.",
        "Microphone"
      );

    }

    else {

      message(
        "I didn't catch that.",
        "Ready"
      );

    }


    setTimeout(
      () => state("idle"),
      1200
    );

  };


  r.onend = () => {

    listening = false;

    if (
      !thinking &&
      !speaking
    ) {

      state("idle");

    }

  };


  return r;
}


recognition =
  setupRecognition();


function startListening() {

  if (
    listening ||
    thinking
  ) return;


  if (!recognition) {

    message(
      "Voice input isn't supported here. Try Chrome.",
      "Voice"
    );

    return;

  }


  try {

    recognition.start();

  }

  catch (error) {

    console.log(
      "Recognition:",
      error
    );

  }

}


/* =========================================================
   AI
========================================================= */

async function askAI(
  userMessage
) {

  if (!userMessage) return;


  listening = false;

  thinking = true;

  state("thinking");


  message(
    "Thinking...",
    studyMode
      ? "Study Mode"
      : "DABSy"
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

            message:
              userMessage,

            studyMode:
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

    }

    catch {

      throw new Error(
        "Invalid response from AI server."
      );

    }


    if (
      !response.ok
    ) {

      throw new Error(
        data.error ||
        `Server error ${response.status}`
      );

    }


    if (
      data.ok === false
    ) {

      throw new Error(
        data.error ||
        "AI request failed."
      );

    }


    const answerValue =
      data.answer ||
      data.response ||
      data.text ||
      data.spoken;


    if (!answerValue) {

      throw new Error(
        "The AI server returned no answer."
      );

    }


    thinking = false;


    message(
      data.spoken ||
      answerValue,

      studyMode
        ? "Study Mode"
        : "DABSy"
    );


    showAnswer(
      answerValue
    );


    speak(
      data.spoken ||
      answerValue
    );

  }


  catch (error) {

    thinking = false;

    console.error(
      "DABSy AI:",
      error
    );


    state("confused");


    if (
      error.name ===
      "AbortError"
    ) {

      message(
        "My AI brain took too long to answer.",
        "Connection"
      );

    }

    else {

      message(
        "I can't reach my AI brain right now.",
        "Connection"
      );

    }


    setTimeout(
      () => state("idle"),
      1800
    );

  }

}


/* =========================================================
   ANSWER
========================================================= */

function showAnswer(
  text
) {

  answerText.textContent =
    text;

  answer.classList.add(
    "open"
  );

}


closeAnswer.addEventListener(
  "click",
  () => {

    answer.classList.remove(
      "open"
    );

  }
);


/* =========================================================
   STUDY MENU
========================================================= */

studyBubble.addEventListener(
  "click",
  () => {

    closeMenu();

    study.classList.add(
      "open"
    );

  }
);


closeStudy.addEventListener(
  "click",
  () => {

    study.classList.remove(
      "open"
    );

  }
);


document
  .querySelectorAll(
    ".subjects button"
  )
  .forEach(
    button => {

      button.addEventListener(
        "click",
        () => {

          const subject =
            button.dataset.subject;

          studyMode = true;

          study.classList.remove(
            "open"
          );

          state("excited");

          message(
            `${subject} mode ready. What are we learning?`,
            "Study Mode"
          );

          speak(
            `${subject} mode ready. What are we learning?`
          );

          setTimeout(
            startListening,
            900
          );

        }
      );

    }
  );


studyTalk.addEventListener(
  "click",
  () => {

    studyMode = true;

    study.classList.remove(
      "open"
    );

    startListening();

  }
);


/* =========================================================
   SETTINGS
========================================================= */

settingsBubble.addEventListener(
  "click",
  () => {

    closeMenu();

    settings.classList.add(
      "open"
    );

  }
);


closeSettings.addEventListener(
  "click",
  () => {

    settings.classList.remove(
      "open"
    );

  }
);


testAI.addEventListener(
  "click",
  async () => {

    connectionStatus.textContent =
      "Testing...";

    state("thinking");


    try {

      /*
        Use a tiny POST instead of assuming
        the Worker has a GET health endpoint.
      */

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
              message:
                "Reply with exactly: DABSy online.",
              studyMode:
                false
            })
          }
        );


      if (!response.ok) {

        throw new Error(
          `HTTP ${response.status}`
        );

      }


      connectionStatus.textContent =
        "✓ AI backend responded.";

      state("happy");

    }

    catch (error) {

      console.error(
        error
      );

      connectionStatus.textContent =
        "✕ AI backend could not be reached.";

      state("confused");

    }


    setTimeout(
      () => state("idle"),
      1500
    );

  }
);


/* =========================================================
   INSTALL
========================================================= */

window.addEventListener(
  "beforeinstallprompt",
  event => {

    event.preventDefault();

    deferredInstallPrompt =
      event;

  }
);


installBubble.addEventListener(
  "click",
  async () => {

    closeMenu();


    if (
      deferredInstallPrompt
    ) {

      try {

        deferredInstallPrompt.prompt();

        await deferredInstallPrompt.userChoice;

      }

      catch {}

      deferredInstallPrompt =
        null;

    }

    else {

      message(
        "Open your browser menu and choose Install app.",
        "Install"
      );

    }

  }
);


/* =========================================================
   SHAKE
========================================================= */

window.addEventListener(
  "devicemotion",
  event => {

    const a =
      event.accelerationIncludingGravity;


    if (!a) return;


    const x =
      a.x || 0;

    const y =
      a.y || 0;

    const z =
      a.z || 0;


    const force =
      Math.sqrt(
        x*x +
        y*y +
        z*z
      );


    const now =
      Date.now();


    if (
      force > 21 &&
      now - lastShake > 1200
    ) {

      lastShake =
        now;

      dizzy();

    }

  }
);


function dizzy() {

  if (
    listening ||
    thinking
  ) return;


  state("dizzy");

  face.classList.add(
    "shaking"
  );


  message(
    "WHOA! 🫨",
    "DABSy"
  );


  speak(
    "Whoa!"
  );


  setTimeout(
    () => {

      message(
        "Okay... I'm good. 😵‍💫",
        "DABSy"
      );

    },
    650
  );


  setTimeout(
    () => {

      face.classList.remove(
        "shaking"
      );

      state("idle");

    },
    1700
  );

}


/* =========================================================
   START
========================================================= */

state("idle");

message(
  "Hello. I'm here.",
  "DABSy"
);

face.classList.remove(
  "showSpeech"
);

lifeLoop();


/* =========================================================
   SERVICE WORKER
========================================================= */

if (
  "serviceWorker" in navigator
) {

  window.addEventListener(
    "load",
    () => {

      navigator.serviceWorker
        .register(
          "./sw.js"
        )
        .then(
          registration => {

            console.log(
              "DABSy PWA ready:",
              registration.scope
            );

          }
        )
        .catch(
          error => {

            console.warn(
              "PWA:",
              error
            );

          }
        );

    }
  );

}
