const socket = io();

const messagesArea = document.getElementById("messagesArea");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");

let connected = false;

function addMessage(text, type) {
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("message", type);
    messageDiv.textContent = text;
    messagesArea.appendChild(messageDiv);
    messagesArea.scrollTop = messagesArea.scrollHeight;
}

socket.on("waiting", () => {
    connected = false;
    addMessage("⏳ Waiting for a stranger...", "stranger");
});

socket.on("matched", () => {
    connected = true;
    addMessage("🟢 Connected to a stranger!", "stranger");
});

socket.on("partner disconnected", () => {
    connected = false;
    addMessage("🔴 Stranger disconnected.", "stranger");
});

socket.on("online users", (count) => {
    const online = document.getElementById("onlineUsers");
    if (online) {
        online.textContent = "👥 Online Users: " + count;
    }
});

function sendMessage() {
    const text = messageInput.value.trim();

    if (text === "") return;

    if (!connected) {
        alert("Please wait until you connect to a stranger.");
        return;
    }

    addMessage(text, "you");

    socket.emit("chat message", text);

    messageInput.value = "";
}

sendBtn.addEventListener("click", sendMessage);

messageInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        sendMessage();
    }
});

socket.on("chat message", (msg) => {
    addMessage(msg, "stranger");
});

const nextBtn = document.getElementById("nextBtn");

if (nextBtn) {
    nextBtn.addEventListener("click", () => {
        messagesArea.innerHTML = "";
        connected = false;
        socket.emit("next stranger");
    });
}