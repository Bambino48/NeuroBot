const express = require("express");
const fetch = require("node-fetch");
require("dotenv").config();

const app = express();
app.use(express.json());

// ✅ Middleware CORS amélioré
const corsHeaders = {
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true"
};

const allowedOrigins = [
    "https://bambino48.github.io",
    "http://127.0.0.1:5500"
];

app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.setHeader("Access-Control-Allow-Origin", origin);
    }

    for (const [key, value] of Object.entries(corsHeaders)) {
        res.setHeader(key, value);
    }

    next();
});

// ✅ Route OPTIONS universelle (Express 5 compatible)
app.options(/^\/.*$/, (req, res) => {
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.setHeader("Access-Control-Allow-Origin", origin);
    }

    for (const [key, value] of Object.entries(corsHeaders)) {
        res.setHeader(key, value);
    }

    res.status(204).send();
});

// ✅ Route principale
app.post("/api/chat", async (req, res) => {
    console.log("Requête reçue:", req.body);
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
        console.log("Réponse API:", data);

        if (!response.ok || !data.candidates?.[0]?.content?.parts?.[0]?.text) {
            return res.status(500).json({ error: "Réponse API invalide" });
        }

        res.json(data);
    } catch (error) {
        console.error("Erreur Gemini:", error);
        res.status(500).json({ error: error.message });
    }
});

// ✅ Démarrage du serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));