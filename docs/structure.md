# WordCraze Game Structure Documentation

## Overview
WordCraze is a German word guessing game powered by AI. Players guess letters to reveal hidden words with thematic hints.

## Architecture

### Backend (FastAPI)
- **File**: `main.py`
- **Framework**: FastAPI with Python
- **Logging**: RotatingFileHandler to `/var/log/games/WordCraze.log`
- **AI Integration**: Ollama API (gemma3:1b model)

### Frontend
- **HTML**: `static/index.html` - Game interface
- **JavaScript**: `static/app.js` - Game logic and API interactions
- **CSS**: `static/style.css` - Styling and animations

## Game Flow

### 1. Game Initialization
```python
POST /api/start
```
- Fetches 5 German words from Ollama based on a random theme
- Selects one word randomly
- Generates a topic hint for the selected word
- Initializes game state with 8 attempts

### 2. Letter Guessing
```python
POST /api/guess/{letter}
```
- Validates letter input
- Updates guessed letters display
- Decrements attempts on wrong guesses
- Checks win/lose conditions

### 3. Game States
- **playing**: Active game
- **won**: All letters guessed
- **lost**: No attempts remaining

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Serves the game HTML page |
| `/api/start` | POST | Starts a new game session |
| `/api/guess/{letter}` | POST | Submit a letter guess |
| `/api/moderate` | POST | Content moderation filter |
| `/api/ping` | GET | Health check endpoint |

## Data Models

### GameState Class
```python
class GameState:
    word: str          # Target word
    guessed: list      # Display state (['_', '_', '_'])
    attempts: int      # Remaining attempts (max 8)
    status: str        # playing/won/lost
    correct_total: int # Total correct guesses
```

## AI Integration

### Word Generation
- **Endpoint**: `https://at1.dynproxy.net/api/chat/completions`
- **Model**: gemma3:1b
- **Language**: German
- **Word Length**: 3-6 characters
- **Themes**: Animals, food, furniture, etc.

### Topic Generation
- Generates category hints without revealing the word
- Example: For "Katze" → "Tiere"

## Deployment

### Systemd Service
- **Service**: `wordcraze.service`
- **User**: games
- **Port**: 8006
- **Command**: `/var/www/wordcraze/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8006`

### Directory Structure
```
/var/www/wordcraze/
├── main.py              # FastAPI backend
├── static/
│   ├── index.html       # Game interface
│   ├── app.js          # Game logic
│   └── style.css       # Styling
├── venv/               # Python virtual environment
└── docs/               # Documentation
    └── structure.md    # This file
```

## Dependencies

### Python Packages
- fastapi
- uvicorn
- requests
- python-multipart

## Logging
- **Location**: `/var/log/games/WordCraze.log`
- **Rotation**: 1MB max, 3 backup files
- **Format**: Timestamp - Message

## Security Features
- Content moderation for inappropriate words
- Input validation and sanitization
- Error handling for API failures
