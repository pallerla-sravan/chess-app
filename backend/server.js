const express = require("express");
const cors = require("cors");
const app = express();
const http = require("http").createServer(app);

const io = require("socket.io")(http, {
  cors: {
    origin: "http://localhost:5173", // Update this to your frontend URL on deployment
    methods: ["GET", "POST"],
  },
});

app.use(cors());

app.get("/", (req, res) => {
  res.send("Backend is running!");
});

const rooms = {};

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("joinRoom", (roomId) => {
    if (!rooms[roomId]) {
      rooms[roomId] = [];
    }

    if (rooms[roomId].length < 2) {
      const color = rooms[roomId].length === 0 ? "white" : "black";
      rooms[roomId].push(socket.id);
      socket.join(roomId);
      socket.emit("assignColor", color);
      console.log(`User joined room ${roomId} as ${color}`);
    }
  });

  socket.on("move", ({ roomId, move }) => {
    socket.to(roomId).emit("opponentMove", move);
  });

  socket.on("disconnect", () => {
    for (const room in rooms) {
      rooms[room] = rooms[room].filter((id) => id !== socket.id);
      if (rooms[room].length === 0) {
        delete rooms[room];
      }
    }
    console.log("User disconnected");
  });
});

const PORT = process.env.PORT || 5001;
http.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
