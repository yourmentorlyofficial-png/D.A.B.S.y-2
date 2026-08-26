const WORKER_URL =
  "https://dabsy-ai.swagatdemo9292.workers.dev";


/* =========================================================
   DABSy CORE
========================================================= */

const face =
  document.getElementById("face");

const eyes =
  document.getElementById("eyes");

const leftEye =
  document.getElementById("leftEye");

const rightEye =
  document.getElementById("rightEye");

const leftPupil =
  leftEye.querySelector(".pupil");

const rightPupil =
  rightEye.querySelector(".pupil");

const status =
  document.getElementById("status");

const speech =
  document.getElementById("speech");

const hint =
  document.getElementById("hint");

const heart =
  document.getElementById("heart");


/* =========================================================
   UI
========================================================= */

const bubbleMenu =
  document.getElementById("bubbleMenu");

const studyButton =
  document.getElementById("studyButton");

const settingsButton =
  document.getElementById("settingsButton");

const closeMenuButton =
  document.getElementById("closeMenuButton");


const settingsOverlay =
  document.getElementById("settingsOverlay");

const studyOverlay =
  document.getElementById("studyOverlay");


const closeSettings =
  document.getElementById("closeSettings");

const closeStudy =
  document.getElementById("closeStudy");


const studyTalkButton =
  document.getElementById("studyTalkButton");


const answerPanel =
  document.getElementById("answerPanel");

const answerContent =
  document.getElementById("answerContent");

const answerTitle =
  document.getElementById("answerTitle");

const closeAnswer =
  document.getElementById("closeAnswer");


/* =========================================================
   STATE
========================================================= */

let recognition = null;

let listening = false;

let thinking = false;

let speaking = false;

let studyMode = false;

let menuOpen = false;

let lastTap = 0;

let tapTimer = null;

let idleTimer = null;

let personalityTimer = null;

let lastShake = 0;

let petCooldown = false;

let currentEmotion = "calm";


/* =========================================================
   PERSONALITY
========================================================= */

const emotions = {

  calm() {

    resetEyes();

  },


  happy() {

    leftEye.style.transform =
      "scaleY(.78) translateY(-4px)";

    rightEye.style.transform =
      "scaleY(.78) translateY(-4px)";

  },


  curious() {

    leftEye.style.transform =
      "rotate(-7deg) scaleY(.94)";

    rightEye.style.transform =
      "rotate(7deg) scaleY(1.08)";

  },


  thinking() {

    leftEye.style.transform =
      "translateY(-7px) scale(.94)";

    rightEye.style.transform =
      "translateY(7px) scale(1.04)";

  },


  confused() {

    leftEye.style.transform =
      "rotate(9deg) scaleY(.88)";

    rightEye.style.transform =
      "rotate(-9deg) scaleY(1.08)";

  },


  excited() {

    leftEye.style.transform =
      "scale(1.12)";

    rightEye.style.transform =
      "scale(1.12)";

  },


  sleepy() {

    leftEye.style.transform =
      "scaleY(.38)";

    rightEye.style.transform =
      "scaleY(.38)";

  }

};


/* =========================================================
   EMOTION ENGINE
========================================================= */

function setEmotion(
  emotion
) {

  if (!emotions[emotion]) {

    emotion = "calm";

  }


  currentEmotion =
    emotion;


  Object.values(
    emotions
  ).forEach(
    () => {}
  );


  emotions[
    emotion
  ]();

}


/* =========================================================
   EYE RESET
========================================================= */

function resetEyes() {

  leftEye.style.transform = "";

  rightEye.style.transform = "";

}


/* =========================================================
   NATURAL BLINKING
========================================================= */

function randomBlink() {

  if (
    listening ||
    thinking
  ) {

    return;

  }


  leftEye.style.transform =
    "scaleY(.08)";

  rightEye.style.transform =
    "scaleY(.08)";


  setTimeout(() => {

    setEmotion(
      currentEmotion
    );

  }, 130);

}


/* =========================================================
   RANDOM PERSONALITY
========================================================= */

function personalityLoop() {

  clearTimeout(
    personalityTimer
  );


  const delay =
    2500 +
    Math.random() * 5000;


  personalityTimer =
    setTimeout(() => {

      if (
        !listening &&
        !thinking &&
        !speaking &&
        !menuOpen
      ) {

        const roll =
          Math.random();


        if (roll < .35) {

          randomBlink();

        }

        else if (roll < .55) {

          lookAround();

        }

        else if (roll < .68) {

          becomeCurious();

        }

        else if (roll < .78) {

          sleepyMoment();

        }

      }


      personalityLoop();

    }, delay);

}


function lookAround() {

  const x =
    (Math.random() - .5) * 18;

  const y =
    (Math.random() - .5) * 12;


  leftPupil.style.transform =
    `translate(${x}px,${y}px)`;

  rightPupil.style.transform =
    `translate(${x}px,${y}px)`;


  setTimeout(() => {

    leftPupil.style.transform = "";

    rightPupil.style.transform = "";

  }, 1200);

}


function becomeCurious() {

  setEmotion(
    "curious"
  );


  setTimeout(() => {

    setEmotion(
      "calm"
    );

  }, 1100);

}


function sleepyMoment() {

  setEmotion(
    "sleepy"
  );


  setTimeout(() => {

    setEmotion(
      "calm"
    );

  }, 1800);

}


/* =========================================================
   SPEECH
========================================================= */

function say(
  text
) {

  if (
    !("speechSynthesis" in window)
  ) {

    return;

  }


  try {

    speechSynthesis.cancel();


    const utterance =
      new SpeechSynthesisUtterance(
        text
      );


    utterance.rate =
      .98;

    utterance.pitch =
      1.05;

    utterance.volume =
      1;


    utterance.onstart =
      () => {

        speaking = true;

      };


    utterance.onend =
      () => {

        speaking = false;

        setEmotion(
          "calm"
        );

      };


    speechSynthesis.speak(
      utterance
    );

  }

  catch (
    error
  ) {

    console.log(
      "Speech error:",
      error
    );

  }

}


/* =========================================================
   DABSy MESSAGE
========================================================= */

function showDABSy(
  message,
  label = "DABSy"
) {

  status.textContent =
    label;

  speech.textContent =
    message;

}


/* =========================================================
   STARTUP
========================================================= */

showDABSy(
  "Hello Swagat. I'm here.",
  "DABSy"
);


setEmotion(
  "calm"
);


personalityLoop();


setTimeout(() => {

  say(
    "Hello Swagat. I'm here."
  );

}, 700);


/* =========================================================
   EYE FOLLOW
========================================================= */

document.addEventListener(
  "pointermove",
  event => {

    if (
      thinking
    ) return;


    const x =
      (event.clientX /
        window.innerWidth -
        .5) * 15;


    const y =
      (event.clientY /
        window.innerHeight -
        .5) * 13;


    leftPupil.style.transform =
      `translate(${x}px,${y}px)`;

    rightPupil.style.transform =
      `translate(${x}px,${y}px)`;

  }
);


/* =========================================================
   FACE TAP SYSTEM
========================================================= */

face.addEventListener(
  "pointerup",
  event => {

    const now =
      Date.now();


    const difference =
      now - lastTap;


    if (
      difference < 320
    ) {

      clearTimeout(
        tapTimer
      );


      lastTap = 0;


      toggleMenu();


    }

    else {

      lastTap =
        now;


      clearTimeout(
        tapTimer
      );


      tapTimer =
        setTimeout(() => {

          lastTap = 0;

          startListening();

        }, 330);

    }

  }
);


/* =========================================================
   MENU
========================================================= */

function toggleMenu() {

  menuOpen =
    !menuOpen;


  document.body.classList.toggle(
    "menu-open",
    menuOpen
  );

}


function closeMenu() {

  menuOpen =
    false;


  document.body.classList.remove(
    "menu-open"
  );

}


closeMenuButton.addEventListener(
  "click",
  closeMenu
);


/* =========================================================
   SETTINGS
========================================================= */

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


/* =========================================================
   STUDY
========================================================= */

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

          const topic =
            button.dataset.topic;


          studyMode =
            true;


          studyOverlay.classList.remove(
            "open"
          );


          setEmotion(
            "excited"
          );


          showDABSy(
            `Ready for ${topic}. Tell me what you're stuck on.`,
            "Study Mode"
          );


          say(
            `Ready for ${topic}. Tell me what you're stuck on.`
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

    studyOverlay.classList.remove(
      "open"
    );

    studyMode =
      true;

    startListening();

  }
);


/* =========================================================
   MICROPHONE
========================================================= */

function createRecognition() {

  const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;


  if (
    !SpeechRecognition
  ) {

    return null;

  }


  const r =
    new SpeechRecognition();


  r.lang =
    "en-IN";


  r.continuous =
    false;


  r.interimResults =
    true;


  r.maxAlternatives =
    1;


  r.onstart =
    () => {

      listening =
        true;


      document.body.classList.add(
        "listening"
      );


      setEmotion(
        "curious"
      );


      showDABSy(
        "I'm listening...",
        "Listening"
      );

    };


  r.onresult =
    event => {

      let finalText =
        "";


      let interimText =
        "";


      for (
        let i =
          event.resultIndex;

        i <
          event.results.length;

        i++
      ) {

        const result =
          event.results[i];


        if (
          result.isFinal
        ) {

          finalText +=
            result[0]
              .transcript;

        }

        else {

          interimText +=
            result[0]
              .transcript;

        }

      }


      const visible =
        finalText ||
        interimText;


      if (
        visible
      ) {

        speech.textContent =
          visible;

      }


      if (
        finalText
      ) {

        askDABSy(
          finalText.trim()
        );

      }

    };


  r.onerror =
    error => {

      listening =
        false;


      document.body.classList.remove(
        "listening"
      );


      console.log(
        "Microphone:",
        error
      );


      if (
        error.error ===
        "not-allowed"
      ) {

        showDABSy(
          "I need microphone permission.",
          "Microphone"
        );


        say(
          "I need microphone permission."
        );

      }

      else {

        showDABSy(
          "I didn't catch that.",
          "Ready"
        );

      }

    };


  r.onend =
    () => {

      listening =
        false;


      document.body.classList.remove(
        "listening"
      );

    };


  return r;

}


recognition =
  createRecognition();


/* =========================================================
   START LISTENING
========================================================= */

function startListening() {

  if (
    thinking ||
    listening
  ) return;


  if (
    !recognition
  ) {

    showDABSy(
      "Voice isn't supported here. Try Chrome.",
      "Voice"
    );


    return;

  }


  try {

    recognition.start();

  }

  catch (
    error
  ) {

    console.log(
      error
    );

  }

}


/* =========================================================
   TALK TO PRIVATE WORKER
========================================================= */

async function askDABSy(
  message
) {

  if (
    !message
  ) return;


  thinking =
    true;


  document.body.classList.remove(
    "listening"
  );


  document.body.classList.add(
    "thinking"
  );


  setEmotion(
    "thinking"
  );


  showDABSy(
    "Hmm... let me think.",
    studyMode
      ? "Study Mode"
      : "Thinking"
  );


  try {

    const response =
      await fetch(
        WORKER_URL,
        {

          method:
            "POST",

          headers: {

            "Content-Type":
              "application/json"

          },

          body:
            JSON.stringify({

              message:
                message,

              studyMode:
                studyMode

            })

        }
      );


    const data =
      await response.json();


    if (
      !response.ok ||
      !data.ok
    ) {

      throw new Error(
        data.error ||
        "Worker request failed."
      );

    }


    thinking =
      false;


    document.body.classList.remove(
      "thinking"
    );


    setEmotion(
      data.emotion ||
      "calm"
    );


    showDABSy(
      data.spoken ||
      "I've got something for you.",
      studyMode
        ? "Study Mode"
        : "DABSy"
    );


    say(
      data.spoken ||
      data.answer ||
      "I've got something for you."
    );


    showAnswer(
      message,
      data.answer ||
      data.spoken ||
      ""
    );


  }

  catch (
    error
  ) {

    console.error(
      "DABSy AI:",
      error
    );


    thinking =
      false;


    document.body.classList.remove(
      "thinking"
    );


    setEmotion(
      "confused"
    );


    showDABSy(
      "My brain connection hiccupped. Try me again.",
      "Connection"
    );


    say(
      "My brain connection hiccupped. Try me again."
    );


    setTimeout(() => {

      setEmotion(
        "calm"
      );

    }, 1600);

  }

}


/* =========================================================
   ANSWER
========================================================= */

function showAnswer(
  question,
  answer
) {

  answerTitle.textContent =
    studyMode
      ? "📚 Study Mode"
      : "DABSy";


  answerContent.innerHTML =
    "";


  const q =
    document.createElement(
      "div"
    );


  q.className =
    "answerStep";


  const qTitle =
    document.createElement(
      "strong"
    );


  qTitle.textContent =
    "You said";


  const qText =
    document.createElement(
      "div"
    );


  qText.textContent =
    question;


  q.appendChild(
    qTitle
  );


  q.appendChild(
    qText
  );


  const a =
    document.createElement(
      "div"
    );


  a.className =
    "answerStep";


  const aTitle =
    document.createElement(
      "strong"
    );


  aTitle.textContent =
    studyMode
      ? "Let's understand it"
      : "DABSy says";


  const aText =
    document.createElement(
      "div"
    );


  aText.textContent =
    answer;


  a.appendChild(
    aTitle
  );


  a.appendChild(
    aText
  );


  answerContent.appendChild(
    q
  );


  answerContent.appendChild(
    a
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


/* =========================================================
   PETTING
========================================================= */

face.addEventListener(
  "pointermove",
  event => {

    if (
      event.buttons !== 1
    ) return;


    if (
      petCooldown
    ) return;


    petCooldown =
      true;


    showHeart(
      event.clientX,
      event.clientY
    );


    setEmotion(
      "happy"
    );


    showDABSy(
      "Hehe...",
      "DABSy"
    );


    setTimeout(
      () => {

        setEmotion(
          "calm"
        );

        petCooldown =
          false;

      },
      650
    );

  }
);


/* =========================================================
   HEART
========================================================= */

function showHeart(
  x,
  y
) {

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


/* =========================================================
   SHAKE
========================================================= */

if (
  "DeviceMotionEvent"
  in window
) {

  window.addEventListener(
    "devicemotion",
    event => {

      const a =
        event.accelerationIncludingGravity;


      if (
        !a
      ) return;


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
        force > 20 &&
        now - lastShake > 1000
      ) {

        lastShake =
          now;


        shakeReaction();

      }

    }
  );

}


function shakeReaction() {

  document.body.classList.remove(
    "shaken"
  );


  void document.body.offsetWidth;


  document.body.classList.add(
    "shaken"
  );


  setEmotion(
    "confused"
  );


  showDABSy(
    "WHOA! 🫨",
    "DABSy"
  );


  say(
    "Whoa!"
  );


  setTimeout(() => {

    showDABSy(
      "Okay... I'm good. 😵‍💫",
      "DABSy"
    );


    setEmotion(
      "calm"
    );

  }, 1000);

}


/* =========================================================
   CLEANUP
========================================================= */

window.addEventListener(
  "visibilitychange",
  () => {

    if (
      document.hidden
    ) {

      if (
        "speechSynthesis"
        in window
      ) {

        speechSynthesis.cancel();

      }

    }

  }
);


/* =========================================================
   DEBUG
========================================================= */

window.DABSy = {

  listen:
    startListening,

  ask:
    askDABSy,

  shake:
    shakeReaction,

  menu:
    toggleMenu

};
