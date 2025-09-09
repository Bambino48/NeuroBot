const express = require("express");
const fetch = require("node-fetch");
require("dotenv").config();

const app = express();
app.use(express.json());

// ✅ Middleware CORS amélioré
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "https://bambino48.github.io");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    next();
});

// ✅ Route OPTIONS universelle pour le preflight
app.options("*", (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "https://bambino48.github.io");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    return res.status(204).send();
});

// ✅ Route principale
app.post("/api/chat", async (req, res) => {
    const { message } = req.body;
    if (!message || message.trim() === "") {
        return res.status(400).json({ error: "Message vide" });
    }

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ contents: [{ parts: [{ text: message }] }] }),
            }
        );

        const data = await response.json();

        if (!response.ok || !data.candidates?.[0]?.content?.parts?.[0]?.text) {
            return res.status(500).json({ error: "Réponse API invalide" });
        }

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));