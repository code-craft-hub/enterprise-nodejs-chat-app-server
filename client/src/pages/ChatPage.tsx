import { useEffect, useState } from "react";
import queryString from "query-string";
import { io, Socket } from "socket.io-client";
import { useLocation } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

let socket: Socket;
const ChatPage = () => {
  const location = useLocation();
  const [, setName] = useState<string | (string | null)[] | null>("");
  const [, setRoom] = useState<string | (string | null)[] | null>("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<string[]>([]);
  const ENDPOINT = "http://localhost:5000";

  console.log(messages)
  useEffect(() => {
    const { name, room } = queryString?.parse(location?.search);
    socket = io(ENDPOINT, {
      transports: ["websocket"],
    });
    setName(name);
    setRoom(room);
    console.log(name, room);
    console.log(socket);

    socket.on("connect", () => {
      console.log("Connected to socket server ✅");
      socket.emit("message", `${name} joined ${room}`);
    });

    socket.on("message", (msg) => {
      console.log("Received from server:", msg);
    });

    socket.emit("join", { name, room }, (error: any) => alert(error));

    return () => {
      socket.off();
      socket.disconnect();
      console.log("Disconnected from socket server ❌");
    };
  }, [ENDPOINT, location.search]);

  useEffect(() => {
    socket.on("message", (message) => {
      setMessages((messages) => [...messages, message]);
    });
  }, [messages]);

  const sendMessage = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (message && socket) {
      console.log(message)
      socket.emit("sendMessage", message, () => setMessage(""));
    }
  };
  return (
    <div>
      <div className="flex w-full max-w-sm items-center gap-2">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage(e)}
          type="email"
          placeholder="Email"
        />
        <Button type="submit" variant="outline">
          Subscribe
        </Button>
      </div>
    </div>
  );
};

export default ChatPage;
