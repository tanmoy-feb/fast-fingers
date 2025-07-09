const wordDisplay = document.getElementById("wordDisplay");
const hiddenInput = document.getElementById("hiddenInput");
const timerDisplay = document.getElementById("timerDisplay");
const startBtn = document.getElementById("startBtn");
const instruction = document.getElementById("instruction");
const timerBtns = document.querySelectorAll(".timer-btn");
const darkModeToggle = document.getElementById("darkModeToggle");
const darkModeIcon = document.getElementById("darkModeIcon");

let words = [];
let currentWordIndex = 0;
let currentCharIndex = 0;
let timeLeft = 30;
let timer = null;
let gameStarted = false;
let typingStarted = false;
let selectedTime = 30;
let inputBuffer = "";

// Word Bank
const wordList = [
  "not", "us", "be", "out", "where", "class", "blue", "him", "why", "have",
  "cookie", "day", "cake", "dark", "sea", "me", "live", "too", "get", "same",
  "mother", "always", "white", "if", "night", "run", "car", "paper", "freedom",
  "responsibility", "clarity", "support", "generosity", "potential", "teamwork"
];

// Generate Words
function generateWords() {
  words = [];
  wordDisplay.innerHTML = "";
  for (let i = 0; i < 25; i++) {
    const word = wordList[Math.floor(Math.random() * wordList.length)];
    words.push(word);
  }

  words.forEach((word, wordIdx) => {
    const wordSpan = document.createElement("span");
    wordSpan.id = `word-${wordIdx}`;
    for (let char of word) {
      const charSpan = document.createElement("span");
      charSpan.textContent = char;
      charSpan.classList.add("char");
      wordSpan.appendChild(charSpan);
    }
    wordSpan.innerHTML += "&nbsp;";
    wordDisplay.appendChild(wordSpan);
  });

  currentWordIndex = 0;
  currentCharIndex = 0;
  highlightCurrentChar();
  instruction.style.display = "none";
  hiddenInput.focus();
  gameStarted = true;
  typingStarted = false;
}

// Highlight active letter
function highlightCurrentChar() {
  document.querySelectorAll(".char").forEach(span => span.classList.remove("active"));
  const wordSpan = document.getElementById(`word-${currentWordIndex}`);
  if (wordSpan) {
    const charSpans = wordSpan.querySelectorAll(".char");
    if (charSpans[currentCharIndex]) {
      charSpans[currentCharIndex].classList.add("active");
    }
  }
}

// Start Timer
function beginTyping() {
  if (typingStarted) return;
  typingStarted = true;
  timeLeft = selectedTime;
  timer = setInterval(() => {
    timeLeft--;
    timerDisplay.textContent = timeLeft;
    if (timeLeft === 0) {
      clearInterval(timer);
      endGame();
    }
  }, 1000);
}

// Start Game
function startGame() {
  clearInterval(timer);
  timer = null;
  gameStarted = false;
  typingStarted = false;
  inputBuffer = "";
  currentCharIndex = 0;
  currentWordIndex = 0;
  hiddenInput.value = "";
  wordDisplay.innerHTML = "";
  instruction.style.display = "none";
  timerDisplay.textContent = selectedTime;
  startBtn.disabled = false;
  generateWords();
  hiddenInput.focus();
}

// End Game
function endGame() {
  gameStarted = false;
  hiddenInput.blur();
  const correctSpans = document.querySelectorAll(".correct");
  const wpm = ((correctSpans.length) / 5 / selectedTime) * 60;
  timerDisplay.textContent = `WPM: ${wpm.toFixed(2)}`;
  startBtn.disabled = false;
}

// Reset Game
function resetGame(full = true) {
  clearInterval(timer);
  timer = null;
  gameStarted = false;
  typingStarted = false;
  inputBuffer = "";
  currentCharIndex = 0;
  currentWordIndex = 0;
  hiddenInput.value = "";
  if (full) {
    wordDisplay.innerHTML = "";
    instruction.style.display = "block";
  }
  timerDisplay.textContent = selectedTime;
  startBtn.disabled = false;
}

// Handle Typing
hiddenInput.addEventListener("input", () => {
  if (!gameStarted) return;
  beginTyping();

  const typedValue = hiddenInput.value;
  const lastChar = typedValue.slice(-1);
  const currentWord = words[currentWordIndex];
  const wordSpan = document.getElementById(`word-${currentWordIndex}`);
  const charSpans = wordSpan.querySelectorAll(".char");

  if (typedValue.length < inputBuffer.length) {
    currentCharIndex--;
    if (currentCharIndex >= 0) {
      charSpans[currentCharIndex].classList.remove("correct", "incorrect");
    } else {
      currentCharIndex = 0;
    }
    inputBuffer = typedValue;
    highlightCurrentChar();
    return;
  }

  inputBuffer = typedValue;

  if (lastChar === " ") {
    const finalWord = typedValue.trim();
    if (finalWord === currentWord) {
      charSpans.forEach(c => c.classList.add("correct"));
    } else {
      charSpans.forEach((c, i) => {
        if (finalWord[i] !== c.textContent) c.classList.add("incorrect");
      });
    }
    currentWordIndex++;
    currentCharIndex = 0;
    inputBuffer = "";
    hiddenInput.value = "";
    highlightCurrentChar();

    if (currentWordIndex >= words.length) {
      clearInterval(timer);
      endGame();
    }

    return;
  }

  if (currentCharIndex < charSpans.length) {
    if (lastChar === charSpans[currentCharIndex].textContent) {
      charSpans[currentCharIndex].classList.add("correct");
    } else {
      charSpans[currentCharIndex].classList.add("incorrect");
    }
    currentCharIndex++;
    highlightCurrentChar();
  }
});

// Keyboard Events
document.addEventListener("keydown", e => {
  const isTypingAreaEmpty = wordDisplay.innerHTML === "";
  const isTypingNotStarted = !gameStarted && !typingStarted;

  if (isTypingAreaEmpty && isTypingNotStarted) {
    if (e.key === "Enter" || e.key === " " || e.key.length === 1) {
      e.preventDefault(); // prevents input char being typed before start
      generateWords();
    }
  }

  if (e.ctrlKey && e.key === "r") {
    e.preventDefault();
    resetGame(true);
  }
});

// Timer Buttons
timerBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    timerBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    selectedTime = parseInt(btn.dataset.time);
    timerDisplay.textContent = selectedTime;
    startGame();
  });
});

// Dark Mode Toggle with Icon Switch
darkModeToggle.addEventListener("click", () => {
  document.body.classList.toggle("light-mode");
  const isLight = document.body.classList.contains("light-mode");
  darkModeIcon.classList.toggle("fa-sun", isLight);
  darkModeIcon.classList.toggle("fa-moon", !isLight);
});

// Set correct icon on page load
window.addEventListener("DOMContentLoaded", () => {
  const isLight = document.body.classList.contains("light-mode");
  darkModeIcon.classList.toggle("fa-sun", isLight);
  darkModeIcon.classList.toggle("fa-moon", !isLight);
});

// Start button
startBtn.addEventListener("click", startGame);
