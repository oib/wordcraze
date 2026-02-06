from fastapi import FastAPI, Request, Body
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
import requests, random, logging, json
from logging.handlers import RotatingFileHandler
from fastapi.responses import HTMLResponse
from pathlib import Path
import os

log_path = "/var/log/games/WordCraze.log"
logger = logging.getLogger("WordCraze")
logger.setLevel(logging.INFO)
handler = RotatingFileHandler(log_path, maxBytes=1_000_000, backupCount=3)
formatter = logging.Formatter('%(asctime)s - %(message)s')
handler.setFormatter(formatter)
logger.addHandler(handler)

app = FastAPI()
app.mount("/static", StaticFiles(directory="static", html=True), name="static")

# OpenWebUI Configuration
OPENWEBUI_API_URL = os.getenv("OPENWEBUI_API_URL", "http://10.1.223.1:8080")
OPENWEBUI_API_KEY = os.getenv("OPENWEBUI_API_KEY", "sk-eaa1c1c6cfe744179999f62a2fe5d3cf")
OPENWEBUI_MODEL = os.getenv("OPENWEBUI_MODEL", "gemma3:1b")

@app.get("/", response_class=HTMLResponse)
async def root():
    return Path("static/index.html").read_text(encoding="utf-8")

class GameState:
    def __init__(self, word: str):
        self.word = word
        self.guessed = ["_"] * len(word)
        self.attempts = 8
        self.status = "playing"
        self.correct_total = 0

state = None

def getWordsFromOllama():
    try:
        url = f"{OPENWEBUI_API_URL}/api/chat/completions"
        headers = {"Authorization": f"Bearer {OPENWEBUI_API_KEY}"}
        body = {
            "model": OPENWEBUI_MODEL,
            "messages": [
                {
                    "role": "system",
                    "content": "Gib ein zufälliges Thema an (z. B. Tiere, Essen, Möbel) und dann ein Array mit 5 Wörtern dieses Themas mit 3 bis 6 Buchstaben im JSON-Format. Nur das Array, keine Einleitung."
                },
                {
                    "role": "user",
                    "content": "Einfaches Thema und 5 passende Wörter mit 3–6 Buchstaben im JSON-Array."
                }
            ],
            "stream": False
        }
        r = requests.post(url, json=body, headers=headers, timeout=5)
        r.raise_for_status()
        content = r.json().get("choices", [{}])[0].get("message", {}).get("content", "[]")
        clean = content.strip()
        if clean.startswith("```json"):
            clean = clean.removeprefix("```json").strip()
        if clean.endswith("```"):
            clean = clean.removesuffix("```").strip()
        logger.info(f"Received words from Ollama")
        return json.loads(clean)
    except Exception as e:
        logger.warning(f"Fallback Ollama getWordsFromOllama(): {e}")
        return []

@app.post("/api/start")
def start_game():
    global state
    words = getWordsFromOllama()
    if not words:
        return JSONResponse({"error": "No words found"}, status_code=500)
    word = random.choice(words)
    state = GameState(word)

    try:
        desc_req = requests.post(
            f"{OPENWEBUI_API_URL}/api/chat/completions",
            headers={"Authorization": f"Bearer {OPENWEBUI_API_KEY}"},
            json={
                "model": OPENWEBUI_MODEL,
                "messages": [
                    {"role": "user", "content": f"Nenne ein Oberthema (wie ‚Möbel‘, ‚Tiere‘, ‚Sport‘), zu dem das Wort ‚{word}‘ gehört. Antworte nur mit einem allgemeinen Wort. Nenne niemals das Wort selbst."}
                ],
                "stream": False
            },
            timeout=5
        )
        desc_req.raise_for_status()
        desc = desc_req.json().get("choices", [{}])[0].get("message", {}).get("content", "(unbekannt)").strip()
    except Exception as e:
        logger.warning(f"Failed to get description for word: {e}")
        desc = "(unbekannt)"

    logger.info(f"Game started with word length: {len(word)}")
    return {"word": state.guessed, "attempts": state.attempts, "source": "ollama", "topic": desc}

@app.post("/api/guess/{letter}")
def guess_letter(letter: str):
    global state
    if not state or state.status != "playing":
        return {"status": "not_started"}
    letter = letter.lower()
    correct_this_turn = 0
    for i, char in enumerate(state.word.lower()):
        if char == letter and state.guessed[i] == "_":
            state.guessed[i] = state.word[i]
            correct_this_turn += 1
    state.correct_total += correct_this_turn
    if "_" not in state.guessed:
        state.status = "won"
    elif correct_this_turn == 0:
        state.attempts -= 1
        if state.attempts <= 0:
            state.status = "lost"
    response = {
    "word": state.guessed,
    "attempts": state.attempts,
    "correct_this_turn": correct_this_turn,
    "total_correct": state.correct_total,
    "status": state.status
}

    if state.status != "playing":
        response["target"] = state.word

    return response

@app.post("/api/moderate")
async def moderate(request: Request):
    data = await request.json()
    text = data.get("text", "")
    bad = any(w in text.lower() for w in ["shit", "fuck", "spam", "idiot", "dumm"])
    logger.info(f"Moderation check: {'REJECTED' if bad else 'APPROVED'}")
    return {"is_ok": not bad}

@app.get("/api/ping")
def ping():
    return {"status": "ok"}

