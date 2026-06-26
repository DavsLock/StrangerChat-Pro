const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(__dirname));

let waitingUser = null;
const partners = {};
let onlineUsers = 0;

io.on("connection", (socket) => {
    onlineUsers++;
    io.emit("online users", onlineUsers);

    console.log(`${socket.id} connected`);

    if (waitingUser) {
        partners[socket.id] = waitingUser.id;
        partners[waitingUser.id] = socket.id;

        socket.emit("matched");
        waitingUser.emit("matched");

        waitingUser = null;
    } else {
        waitingUser = socket;
        socket.emit("waiting");
    }

    socket.on("chat message", (msg) => {
        const partnerId = partners[socket.id];

        if (partnerId) {
            io.to(partnerId).emit("chat message", msg);
        }
    });

    socket.on("next stranger", () => {
        const partnerId = partners[socket.id];

        if (partnerId) {
            io.to(partnerId).emit("partner disconnected");

            delete partners[partnerId];
            delete partners[socket.id];
        }

        if (waitingUser === null) {
            waitingUser = socket;
            socket.emit("waiting");
        }
    });

    socket.on("disconnect", () => {
        onlineUsers--;
        io.emit("online users", onlineUsers);

        const partnerId = partners[socket.id];

        if (partnerId) {
            io.to(partnerId).emit("partner disconnected");

            delete partners[partnerId];
            delete partners[socket.id];
        }

        if (waitingUser === socket) {
            waitingUser = null;
        }

        console.log(`${socket.id} disconnected`);
    });
});
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log("Server running on port ${PORT}");
});