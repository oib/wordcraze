let currentWord = [];
let attemptsLeft = 0;
let roundCount = 0;
let scoreCount = 0;

const wordDisplay = document.getElementById("word");
const input = document.getElementById("input");
const feedback = document.getElementById("feedback");
const attemptsDisplay = document.getElementById("attempts");
const startBtn = document.getElementById("start");
const topicLabel = document.getElementById("topic-label");
const roundCountEl = document.getElementById("round-count");
const scoreCountEl = document.getElementById("score-count");

function renderWord() {
    wordDisplay.textContent = currentWord.join(" ");
    const attemptsText = attemptsDisplay.querySelector(".attempts-text");
    attemptsText.textContent = `Versuche übrig: ${attemptsLeft}`;
}

async function startGame() {
    const res = await fetch("/api/start", {
        method: "POST"
    });

    const data = await res.json();
    if (!data.word) {
        feedback.textContent = "⚠️ Fehler: Keine gültige Antwort vom Server.";
        feedback.className = "feedback error";
        return;
    }

    currentWord = data.word;
    attemptsLeft = data.attempts;
    roundCount++;
    roundCountEl.textContent = roundCount;
    topicLabel.textContent = `🧠 Thema: ${data.topic || '(unbekannt)'}`;
    feedback.textContent = `Spiel gestartet (${data.source})`;
    feedback.className = "feedback warning";
    renderWord();
    input.focus();
}

async function guessLetter() {
    if (!currentWord.length) {
        feedback.textContent = "⚠️ Bitte zuerst ein Spiel starten!";
        feedback.className = "feedback warning";
        return;
    }

    const letter = input.value.trim().toLowerCase();
    if (!letter || letter.length !== 1) return;

    const res = await fetch(`/api/guess/${letter}`, { method: "POST" });
    const data = await res.json();

    if (!data.word) {
        feedback.textContent = "⚠️ Kein aktives Spiel – bitte erst starten!";
        feedback.className = "feedback warning";
        return;
    }

    currentWord = data.word;
    attemptsLeft = data.attempts;

    if (data.correct_this_turn > 0) {
        scoreCount += data.correct_this_turn;
        scoreCountEl.textContent = scoreCount;
        feedback.textContent = `✅ Richtig! (+${data.correct_this_turn})`;
        feedback.className = "feedback success";
    } else {
        feedback.textContent = "❌ Falsch!";
        feedback.className = "feedback error";
    }
    
    if (data.status === "won") {
        feedback.textContent += " 🎉 Gewonnen!";
        feedback.className = "feedback success";
    } else if (data.status === "lost") {
        feedback.textContent += ` 💥 Verloren! Das Wort war: ${data.target}`;
        feedback.className = "feedback error";
    }
    renderWord();
    input.value = "";
    input.focus();
}

startBtn.addEventListener("click", startGame);
input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") guessLetter();
});

