// server/server.js
const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// Endpoint pour le chatbot
app.post("/api/chat", async (req, res) => {
    const { message } = req.body;

    if (!message || message.trim() === "") {
        return res.status(400).json({ error: "Le message est vide." });
    }

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: message }] }],
                }),
            }
        );

        const data = await response.json();

        // Vérifie que la réponse contient le texte attendu
        if (!response.ok || !data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
            return res.status(500).json({ error: data.error?.message || "Réponse API invalide." });
        }

        res.json(data);
    } catch (error) {
        console.error("Erreur serveur :", error);
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
