// ollama.js – WordCraze: KI-Unterstützung über Ollama

export async function getWordsFromOllama(length, category) {
    try {
        const response = await fetch("https://at1.dynproxy.net/api/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer sk-d0e3a491b19c435a975b234969298cd0"
            },
            body: JSON.stringify({
                model: "gemma3:1b",
                messages: [
                    {
                        role: "system",
                        content: `Gib ein zufälliges Thema an (z. B. Tiere, Essen, Möbel) und dann ein Array mit 5 Wörtern dieses Themas mit 3 bis 6 Buchstaben im JSON-Format. Nur das Array, keine Einleitung.`
                    },
                    {
                        role: "user",
                        content: "Einfaches Thema und 5 passende Wörter mit 3–6 Buchstaben im JSON-Array."
                    }
                ],
                stream: false
            })
        });

        if (!response.ok) {
            console.error("Ollama API Error:", response.status);
            return [];
        }

        const data = await response.json();
        const raw = data.choices?.[0]?.message?.content || "[]";
        const clean = raw.trim().replace(/^```json\s*/i, "").replace(/```$/, "");
        try {
            const parsed = JSON.parse(clean);
            return parsed;
        } catch (e) {
            console.warn("Ollama hat kein parsebares JSON geliefert:", raw);
            return [];
        }

    } catch (error) {
        console.error("Fehler beim Abrufen von Wörtern via Ollama:", error);
        return [];
    }
}

