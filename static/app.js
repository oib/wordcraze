let currentWord = [];
let attemptsLeft = 0;

const wordDisplay = document.getElementById("word");
const input = document.getElementById("input");
const feedback = document.getElementById("feedback");
const attemptsDisplay = document.getElementById("attempts");
const startBtn = document.getElementById("start");
const topicLabel = document.createElement("div");
topicLabel.id = "topic-label";
topicLabel.style.marginTop = "1rem";
topicLabel.style.fontWeight = "bold";
wordDisplay.parentElement.insertBefore(topicLabel, wordDisplay);

function renderWord() {
    wordDisplay.textContent = currentWord.join(" ");
    attemptsDisplay.textContent = `Versuche übrig: ${attemptsLeft}`;
}

async function startGame() {
    const res = await fetch("/api/start", {
        method: "POST"
    });

    const data = await res.json();
    if (!data.word) {
        feedback.textContent = "❌ Fehler: Keine gültige Antwort vom Server.";
        return;
    }

    currentWord = data.word;
    attemptsLeft = data.attempts;
    topicLabel.textContent = `🧠 Thema: ${data.topic || '(unbekannt)'}`;
    feedback.textContent = `Spiel gestartet (${data.source})`;
    renderWord();
    input.focus();
}

async function guessLetter() {
    if (!currentWord.length) {
        feedback.textContent = "❌ Bitte zuerst ein Spiel starten!";
        return;
    }

    const letter = input.value.trim().toLowerCase();
    if (!letter || letter.length !== 1) return;

    const res = await fetch(`/api/guess/${letter}`, { method: "POST" });
    const data = await res.json();

    if (!data.word) {
        feedback.textContent = "❌ Kein aktives Spiel – bitte erst starten!";
        return;
    }

    currentWord = data.word;
    attemptsLeft = data.attempts;

    let msg = data.correct_this_turn > 0 ? "✅" : "❌";
    if (data.status === "won") {
        msg += " 🎉 Gewonnen!";
    } else if (data.status === "lost") {
        msg += ` 💥 Verloren! ⇨ ${data.target} ⇦`;
    }
    feedback.textContent = msg;
    renderWord();
    input.value = "";
    input.focus();
}

startBtn.addEventListener("click", startGame);
input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") guessLetter();
});

