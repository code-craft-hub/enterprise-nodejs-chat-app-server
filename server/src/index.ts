import express from "express";
import { Server } from "socket.io";
import http from "http";
import router from "./routes";

const PORT = process.env.PORT || 5000;

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    allowedHeaders: "*"
  }
});

io.on("connection", (socket) => {
  console.log("We have a new connection !!!");

  socket.on("message", (message) => {
    io.emit("message", message);
  });

  socket.on("disconnect", () => {
    console.log("User had left the chat")
  })
});

app.use(router);
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
