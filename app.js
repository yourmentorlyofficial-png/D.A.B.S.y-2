import {
  GoogleGenAI
} from "https://cdn.jsdelivr.net/npm/@google/genai@2.17.1/+esm";


/* =========================================================
   D.A.B.S.y
   AI DESK STUDY BUDDY
========================================================= */


/* =========================
   ELEMENTS
========================= */

const $ = id => document.getElementById(id);

const dabsy = $("dabsy");

const leftEye = $("leftEye");
const rightEye = $("rightEye");

const mouth = $("mouth");

const status = $("status");
const speech = $("speech");

const aura = $("ambientAura");

const talkButton = $("talkButton");
const talkText = $("talkText");

const micIcon = $("micIcon");

const studyButton = $("studyButton");
const settingsButton = $("settingsButton");

const modeIndicator = $("modeIndicator");

const panel = $("presentationPanel");
const panelTitle = $("panelTitle");
const panelContent = $("panelContent");
const closePanel = $("closePanel");


/* =========================
   STATE
========================= */

let apiKey =
  localStorage.getItem("dabsy_gemini_key") || "";

let studyMode =
  localStorage.getItem("dabsy_study_mode") === "true";

let recognition = null;

let listening = false;

let conversation = [];


/* =========================
   STARTUP
========================= */

window.addEventListener(
  "DOMContentLoaded",
  initialize
);


function initialize() {

  updateMode();

  setMood(
    "happy",
    "DABSy Online",
    "Hello Swagat. How can I help you today?"
  );

  setupSpeechRecognition();

  startPersonality();

}


/* =========================================================
   DABSY PERSONALITY
========================================================= */

function startPersonality() {

  setInterval(() => {

    if (
      listening ||
      document.body.classList.contains("thinking")
    ) {
      return;
    }

    const random =
      Math.random();

    if (random < 0.25) {

      lookAround();

    }

  }, 5000);

}


/* =========================
   LOOK AROUND
========================= */

function lookAround() {

  const direction =
    Math.random() > 0.5
      ? "left"
      : "right";

  dabsy.classList.add(
    direction === "left"
      ? "look-left"
      : "look-right"
  );

  setTimeout(() => {

    dabsy.classList.remove(
      "look-left",
      "look-right"
    );

  }, 1200);

}


/* =========================
   BLINK
========================= */

function blink() {

  dabsy.classList.add("blink");

  setTimeout(() => {

    dabsy.classList.remove("blink");

  }, 180);

}


setInterval(() => {

  if (!listening) {
    blink();
  }

}, 3500);


/* =========================================================
   MOODS
========================================================= */

function setMood(
  mood,
  statusText,
  dialogue
) {

  status.textContent =
    statusText || "";

  speech.textContent =
    dialogue || "";


  document.body.classList.remove(
    "thinking"
  );


  mouth.classList.remove(
    "thinking",
    "speaking"
  );


  if (mood === "happy") {

    setEyeColor(
      "var(--primary)"
    );

    aura.style.background =
      "rgba(120,100,255,.30)";

    mouth.style.borderColor =
      "var(--primary)";

    mouth.style.width =
      "45px";

  }


  if (mood === "thinking") {

    document.body.classList.add(
      "thinking"
    );

    setEyeColor(
      "var(--success)"
    );

    aura.style.background =
      "rgba(60,255,180,.25)";

    mouth.classList.add(
      "thinking"
    );

  }


  if (mood === "listening") {

    setEyeColor(
      "#ffffff"
    );

    aura.style.background =
      "rgba(255,255,255,.18)";

    mouth.style.borderColor =
      "#ffffff";

  }


  if (mood === "study") {

    setEyeColor(
      "var(--accent)"
    );

    aura.style.background =
      "rgba(50,220,255,.25)";

    mouth.style.borderColor =
      "var(--accent)";

  }


  if (mood === "error") {

    setEyeColor(
      "#ff6b81"
    );

    aura.style.background =
      "rgba(255,70,100,.20)";

  }

}


function setEyeColor(color) {

  leftEye.style.background =
    color;

  rightEye.style.background =
    color;

}


/* =========================================================
   TEXT TO SPEECH
========================================================= */

function speak(text) {

  if (
    !("speechSynthesis" in window)
  ) {
    return;
  }

  if (!text) {
    return;
  }


  speechSynthesis.cancel();


  const cleanText =
    String(text)
      .replace(/[*_#`]/g, "")
      .replace(/<[^>]*>/g, "");


  const utterance =
    new SpeechSynthesisUtterance(
      cleanText
    );


  utterance.rate =
    1.03;

  utterance.pitch =
    1.0;


  utterance.onstart = () => {

    mouth.classList.add(
      "speaking"
    );

  };


  utterance.onend = () => {

    mouth.classList.remove(
      "speaking"
    );

  };


  speechSynthesis.speak(
    utterance
  );

}


/* =========================================================
   SPEECH RECOGNITION
========================================================= */

function setupSpeechRecognition() {

  const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;


  if (!SpeechRecognition) {

    console.warn(
      "Speech Recognition not supported."
    );

    return;

  }


  recognition =
    new SpeechRecognition();


  recognition.lang =
    "en-IN";


  recognition.continuous =
    false;


  recognition.interimResults =
    false;


  recognition.onstart = () => {

    listening = true;

    talkButton.classList.add(
      "listening"
    );

    talkText.textContent =
      "Listening...";

    micIcon.textContent =
      "🔴";


    setMood(
      "listening",
      "Listening...",
      "I'm listening."
    );

  };


  recognition.onresult =
    event => {

      const result =
        event.results?.[0]?.[0]
          ?.transcript
          ?.trim();


      if (!result) {
        return;
      }


      askDABSy(result);

    };


  recognition.onerror =
    event => {

      console.error(
        "Speech error:",
        event.error
      );


      if (
        event.error ===
        "not-allowed"
      ) {

        setMood(
          "error",
          "Microphone Blocked",
          "Please allow microphone access in your browser."
        );

      } else {

        setMood(
          "error",
          "Didn't catch that",
          "Try speaking again."
        );

      }

    };


  recognition.onend = () => {

    listening = false;

    talkButton.classList.remove(
      "listening"
    );

    talkText.textContent =
      "Talk to DABSy";

    micIcon.textContent =
      "🎙";

  };

}


/* =========================================================
   TALK BUTTON
========================================================= */

talkButton.addEventListener(
  "click",
  () => {

    if (!apiKey) {

      showAPISetup();

      return;

    }


    if (!recognition) {

      showTextInput();

      return;

    }


    if (listening) {

      recognition.stop();

      return;

    }


    try {

      recognition.start();

    } catch (error) {

      console.error(error);

      showTextInput();

    }

  }
);


/* =========================================================
   API KEY
========================================================= */

settingsButton.addEventListener(
  "click",
  showAPISetup
);


function showAPISetup() {

  setMood(
    "happy",
    "Gemini Setup",
    "Connect my Gemini brain to start talking with me."
  );


  speech.innerHTML = `

    <form
      id="apiForm"
      class="ask-form"
    >

      <input
        id="apiInput"
        type="password"
        placeholder="Paste Gemini API key..."
        autocomplete="off"
      >

      <button>
        ✓
      </button>

    </form>

  `;


  const form =
    $("apiForm");

  const input =
    $("apiInput");


  input.value =
    apiKey;


  input.focus();


  form.addEventListener(
    "submit",
    event => {

      event.preventDefault();


      const value =
        input.value.trim();


      if (!value) {
        return;
      }


      apiKey =
        value;


      localStorage.setItem(
        "dabsy_gemini_key",
        apiKey
      );


      setMood(
        "happy",
        "Gemini Connected",
        "My brain is online. Talk to me."
      );


      speak(
        "My Gemini brain is online. Talk to me."
      );

    }
  );

}


/* =========================================================
   TEXT FALLBACK
========================================================= */

function showTextInput() {

  speech.innerHTML = `

    <form
      id="askForm"
      class="ask-form"
    >

      <input
        id="askInput"
        placeholder="Ask DABSy anything..."
        autocomplete="off"
      >

      <button>
        ➤
      </button>

    </form>

  `;


  const form =
    $("askForm");

  const input =
    $("askInput");


  input.focus();


  form.addEventListener(
    "submit",
    event => {

      event.preventDefault();


      const question =
        input.value.trim();


      if (question) {

        askDABSy(question);

      }

    }
  );

}


/* =========================================================
   STUDY MODE
========================================================= */

studyButton.addEventListener(
  "click",
  () => {

    studyMode =
      !studyMode;


    localStorage.setItem(
      "dabsy_study_mode",
      studyMode
    );


    updateMode();


    if (studyMode) {

      setMood(
        "study",
        "Study Mode",
        "Study mode activated. Let's figure this out together."
      );

      speak(
        "Study mode activated. Let's figure this out together."
      );

    } else {

      setMood(
        "happy",
        "Normal Mode",
        "Back to normal mode."
      );

    }

  }
);


function updateMode() {

  if (studyMode) {

    modeIndicator.textContent =
      "📚 Study Mode";

    studyButton.classList.add(
      "active"
    );

  } else {

    modeIndicator.textContent =
      "Normal Mode";

    studyButton.classList.remove(
      "active"
    );

  }

}


/* =========================================================
   GEMINI
========================================================= */

async function askDABSy(question) {

  if (!apiKey) {

    showAPISetup();

    return;

  }


  const userQuestion =
    String(question).trim();


  if (!userQuestion) {
    return;
  }


  setMood(
    "thinking",
    "Thinking...",
    "Give me a second..."
  );


  try {

    const ai =
      new GoogleGenAI({
        apiKey: apiKey
      });


    const systemInstruction =
      `

You are D.A.B.S.y.

You are an AI desk companion and study buddy.

Your personality:
- friendly
- intelligent
- calm
- slightly playful
- concise when the question is simple
- detailed when teaching
- never robotic

The student is in Class 11 Science in India.

Current mode:
${studyMode ? "STUDY MODE" : "NORMAL MODE"}

If STUDY MODE:
- teach instead of dumping an answer
- explain concepts clearly
- use steps
- show formulas when useful
- explain why each step works
- make difficult topics understandable

If NORMAL MODE:
- behave like a general AI desk companion
- answer naturally
- still help with schoolwork when asked

Return ONLY valid JSON.

Format:

{
  "spoken_summary": "A short natural sentence DABSy can say aloud.",
  "answer": "The complete useful answer.",
  "steps": [
    {
      "title": "Step title",
      "content": "Explanation"
    }
  ]
}

For casual conversation, steps may be an empty array.

Do not use HTML.
Do not use markdown fences.
`;


    const contents = [

      ...conversation.slice(-10),

      {
        role: "user",

        parts: [
          {
            text:
              userQuestion
          }
        ]

      }

    ];


    const response =
      await ai.models.generateContent({

        model:
          "gemini-2.5-flash",

        contents,

        config: {

          systemInstruction,

          temperature:
            0.7,

          responseMimeType:
            "application/json"

        }

      });


    let raw =
      typeof response.text ===
      "function"

        ? response.text()

        : response.text;


    raw =
      String(raw || "")
        .replace(
          /^```json\s*/i,
          ""
        )
        .replace(
          /\s*```$/,
          ""
        )
        .trim();


    let data;


    try {

      data =
        JSON.parse(raw);

    } catch {

      data = {

        spoken_summary:
          raw.slice(0, 300),

        answer:
          raw,

        steps: []

      };

    }


    conversation.push(

      {
        role: "user",

        parts: [
          {
            text:
              userQuestion
          }
        ]
      },

      {
        role: "model",

        parts: [
          {
            text:
              raw
          }
        ]
      }

    );


    const summary =
      data.spoken_summary ||
      data.answer ||
      "I've got an answer for you.";


    renderResponse(
      userQuestion,
      data
    );


    setMood(
      studyMode
        ? "study"
        : "happy",

      studyMode
        ? "Study Response"
        : "DABSy Responding",

      summary
    );


    speak(summary);


  } catch (error) {

    console.error(
      "DABSy Gemini error:",
      error
    );


    const message =
      String(
        error?.message || error
      );


    let friendly =
      "I couldn't reach Gemini. Check your internet connection and API key.";


    if (
      /401|403|api.?key|permission|unauthorized/i
        .test(message)
    ) {

      friendly =
        "Your Gemini API key was rejected. Open the settings button and check it.";

    }


    if (
      /429|quota|rate/i
        .test(message)
    ) {

      friendly =
        "Gemini is temporarily rate limiting this key. Try again shortly.";

    }


    setMood(
      "error",
      "Gemini Error",
      friendly
    );


    speak(
      friendly
    );

  }

}


/* =========================================================
   RESPONSE PRESENTATION
========================================================= */

function renderResponse(
  question,
  data
) {

  panelTitle.textContent =
    question;


  let html = "";


  if (
    Array.isArray(data.steps) &&
    data.steps.length > 0
  ) {

    data.steps.forEach(
      (step, index) => {

        html += `

          <article
            class="step-card"
          >

            <strong>
              Step ${index + 1}
              ·
              ${escapeHTML(
                step.title ||
                "Explanation"
              )}
            </strong>

            <div>
              ${escapeHTML(
                step.content ||
                ""
              ).replace(
                /\n/g,
                "<br>"
              )}
            </div>

          </article>

        `;

      }
    );


    if (data.answer) {

      html += `

        <article
          class="step-card"
        >

          <strong>
            Answer
          </strong>

          <div>
            ${escapeHTML(
              data.answer
            ).replace(
              /\n/g,
              "<br>"
            )}
          </div>

        </article>

      `;

    }

  } else {

    html = `

      <article
        class="step-card"
      >

        <div>
          ${escapeHTML(
            data.answer ||
            data.spoken_summary ||
            ""
          ).replace(
            /\n/g,
            "<br>"
          )}
        </div>

      </article>

    `;

  }


  panelContent.innerHTML =
    html;


  panel.classList.add(
    "visible"
  );

}


/* =========================================================
   SECURITY
========================================================= */

function escapeHTML(value) {

  return String(value ?? "")

    .replaceAll(
      "&",
      "&amp;"
    )

    .replaceAll(
      "<",
      "&lt;"
    )

    .replaceAll(
      ">",
      "&gt;"
    )

    .replaceAll(
      '"',
      "&quot;"
    )

    .replaceAll(
      "'",
      "&#039;"
    );

}


/* =========================================================
   CLOSE ANSWER
========================================================= */

closePanel.addEventListener(
  "click",
  () => {

    panel.classList.remove(
      "visible"
    );


    setMood(
      studyMode
        ? "study"
        : "happy",

      studyMode
        ? "Study Mode"
        : "DABSy Online",

      "What shall we do next?"
    );

  }
);


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
        .register("./sw.js")
        .catch(
          console.error
        );

    }
  );

  }
