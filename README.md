# 🧠 WordCraze

Ein deutsches Worträtselspiel mit KI-Unterstützung

## Beschreibung

WordCraze ist ein unterhaltsames Worträtselspiel für Kinder und Erwachsene. Spieler erraten Buchstaben, um ein verstecktes Wort aufzudecken. Das Spiel verwendet künstliche Intelligenz, um deutsche Wörter mit thematischen Hinweisen zu generieren.

## Features

- 🎮 **Einfache Spielmechanik**: Klassisches Galgenmännchen-Spielprinzip
- 🤖 **KI-generierte Wörter**: Unendliche Wortvielfalt durch Ollama AI
- 🧩 **Thematische Hinweise**: Jedes Wort kommt mit einem Themahinweis
- 🌙 **Dark Mode**: Kinderfreundliches dunkles Design
- 📊 **Spielstatistiken**: Verfolgt richtige und falsche Versuche
- 🛡️ **Kindersicher**: Inhaltsfilter für angemessene Inhalte

## Voraussetzungen

- Python 3.11+
- pip package manager
- Zugang zur Ollama API

## Installation

1. Repository klonen:
```bash
git clone https://github.com/yourusername/wordcraze.git
cd wordcraze
```

2. Virtuelle Umgebung erstellen:
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
# oder
venv\Scripts\activate     # Windows
```

3. Abhängigkeiten installieren:
```bash
pip install -r requirements.txt
```

4. Spiel starten:
```bash
uvicorn main:app --host 0.0.0.0 --port 8006
```

## Systemd Service

Das Spiel kann als systemd Service laufen:

```ini
[Unit]
Description=wordcraze Game Server
After=network.target

[Service]
ExecStart=/var/www/wordcraze/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8006
WorkingDirectory=/var/www/wordcraze
Restart=always
User=games
Group=games
Environment=PYTHONUNBUFFERED=1

[Install]
WantedBy=multi-user.target
```

Service starten:
```bash
sudo systemctl start wordcraze.service
sudo systemctl enable wordcraze.service
```

## API Endpoints

| Endpoint | Methode | Beschreibung |
|----------|---------|-------------|
| `/` | GET | Spiel-Interface |
| `/api/start` | POST | Neues Spiel starten |
| `/api/guess/{letter}` | POST | Buchstaben raten |
| `/api/ping` | GET | Health Check |

## Konfiguration

Die Ollama API Konfiguration befindet sich in `main.py`:

```python
url = "https://at1.dynproxy.net/api/chat/completions"
headers = {"Authorization": "Bearer YOUR_API_KEY"}
```

## Spielverlauf

1. Klicke auf "Spiel starten"
2. Ein zufälliges deutsches Wort wird ausgewählt
3. Dir wird ein Themahinweis angezeigt (z.B. "Tiere")
4. Buchstaben einzeln eingeben und raten
5. 8 Versuche pro Wort
6. Alle Buchstaben finden = Gewonnen!

## Technologien

- **Backend**: FastAPI (Python)
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **KI**: Ollama mit gemma3:1b Modell
- **Deployment**: systemd, uvicorn

## Contributing

Contributions sind willkommen! Bitte erstelle einen Pull Request oder öffne ein Issue.

## License

Dieses Projekt steht unter der MIT License - siehe [LICENSE](LICENSE) Datei für Details.

## Support

Bei Problemen oder Fragen bitte ein Issue erstellen.

---

Viel Spaß beim Raten! 🎯
