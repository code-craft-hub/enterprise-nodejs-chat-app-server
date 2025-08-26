import express, { Request, Response } from "express";
import { Server } from "socket.io";
import http from "http";
import morgan from "morgan";
import router from "./routes";
import { addUser, getUser } from "./utils/users";

const PORT = process.env.PORT || 5000;

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    allowedHeaders: "*",
  },
});
app.use(morgan("combined"));

app.get("/", async (req: Request, res: Response) => {
  console.log(`${req.method} ${req.path}`);
  await sleep(1000);
  res.json({
    message: "Hello World!",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

io.on("connection", (socket) => {
  console.log("We have a new connection !!!");

  socket.on("message", (message) => {
    console.log("Message received : ", message);
    io.emit("message", message);
  });

  socket.on("disconnect", () => {
    console.log("User had left the chat");
  });

  socket.on("join", ({ name, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, name, room });

    if (error) {
      return callback(error);
    }
    console.log(name, room);

    if (error) {
      callback({ error: "error" });
    }

    socket.emit("message", {
      user: "admin",
      text: `${user?.name}, welcome to the room ${user?.room}`,
    });

    socket.broadcast
      .to(user?.room)
      .emit("message", { user: "admin", text: `${user?.name}, has joined!` });

    socket.join(user?.room);

    callback();
  });

  socket.on("sendMessage", (message, callback) => {
    const user = getUser(socket.id);

    io.to(user?.room).emit("message", { user: user?.name, text: message });

    callback();
  });

  socket.on("disconnect", () => {
    console.log("User had left the chat");
  });
});

app.use(router);
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
