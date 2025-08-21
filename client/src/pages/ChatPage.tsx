import { useEffect, useState } from "react";
import queryString from "query-string";
import {io, Socket} from "socket.io-client";
import { useLocation } from "react-router-dom";

let socket: Socket;
const ChatPage = () => {
  const location = useLocation();
  const [, setName] = useState<string | (string | null)[] | null>("");
  const [, setRoom] = useState<string | (string | null)[] | null>("");

  const ENDPOINT = "http://localhost:5000";

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
      socket.emit("message", "Hello World");
    });

    socket.on("message", (msg) => {
      console.log("Received from server:", msg);
    });

    return () => {
      socket.disconnect();
      console.log("Disconnected from socket server ❌");
    };
  }, [ENDPOINT, location.search]);

  return <div>Chat Page</div>;
};

export default ChatPage;
