// Sélectionne les éléments du DOM nécessaires pour le chatbot
const chatBody = document.querySelector(".chatbot-body");
const messageInput = document.querySelector(".message-input");
const sendMessageButton = document.querySelector("#send-message");

// Fonction pour créer un élément de message avec des classes dynamiques et le retourner
const createMessageElement = (content, ...classes) => {
    const div = document.createElement("div");
    div.classList.add("message", ...classes);
    div.innerHTML = content;
    return div;
};

// Liste des termes de neurosciences
const neuroscienceTerms = [
    "neurone",
    "synapse",
    "neurotransmetteur",
    "cortex",
    "hippocampe",
    "neuroplasticité",
    "système nerveux",
    "glie",
    "axone",
    "dendrite",
];

// Fonction pour vérifier si le texte contient des termes de neurosciences
const containsNeuroscienceTerms = (text) =>
    neuroscienceTerms.some((term) => text.toLowerCase().includes(term));

// Fonction pour générer la réponse du bot en appelant le backend sécurisé
const generateBotResponse = async (incomingMessageDiv) => {
    const messageElement = incomingMessageDiv.querySelector(".message-text");

    try {
        const response = await fetch(
            "https://neurobot-fol7.onrender.com/api/chat",
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: userData.message }),
            }
        );

        const data = await response.json();

        let apiResponseText = "Erreur : aucune réponse de l'IA.";

        // Vérifie que la réponse contient bien le texte attendu
        if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
            apiResponseText = data.candidates[0].content.parts[0].text
                .replace(/\*\*(.*?)\*\*/g, "$1")
                .trim();
        }

        // Vérifie si la réponse contient des termes de neurosciences
        if (!containsNeuroscienceTerms(apiResponseText)) {
            apiResponseText =
                "Je suis désolé, je ne peux répondre qu'aux questions liées aux neurosciences.";
        }

        messageElement.innerText = apiResponseText;
    } catch (error) {
        console.error("Erreur fetch:", error);
        messageElement.innerText = "Erreur : impossible de récupérer la réponse.";
    } finally {
        incomingMessageDiv.classList.remove("thinking");
        chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });
    }
};

// Objet pour stocker les données de l'utilisateur
const userData = { message: null };

// Fonction pour gérer l'envoi des messages de l'utilisateur
const handleOutgoingMessage = (e) => {
    e.preventDefault();
    userData.message = messageInput.value.trim();
    if (!userData.message) return;
    messageInput.value = "";

    // Créer et afficher le message de l'utilisateur
    const messageContent = `<div class="message-text"></div>`;
    const outgoingMessageDiv = createMessageElement(
        messageContent,
        "user-message"
    );
    outgoingMessageDiv.querySelector(".message-text").textContent =
        userData.message;
    chatBody.appendChild(outgoingMessageDiv);
    chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });

    // Afficher le message de réflexion du bot après un petit délai
    setTimeout(() => {
        const messageContent = `<span class="material-symbols-outlined">
                smart_toy
                </span>
            <div class="message-text">
                <div class="thinking-indicator">
                    <div class="dot"></div>
                    <div class="dot"></div>
                    <div class="dot"></div>
                </div>
            </div>`;
        const incomingMessageDiv = createMessageElement(
            messageContent,
            "bot-message",
            "thinking"
        );
        chatBody.appendChild(incomingMessageDiv);
        chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });
        generateBotResponse(incomingMessageDiv);
    }, 600);
};

// Gérer l'appui sur la touche Entrée pour envoyer des messages
messageInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleOutgoingMessage(e);
});

// Gérer le clic sur le bouton d'envoi pour envoyer des messages
sendMessageButton.addEventListener("click", (e) => handleOutgoingMessage(e));
