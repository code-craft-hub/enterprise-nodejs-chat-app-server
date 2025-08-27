import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Link } from "react-router-dom";

const HomePage = () => {
  const [name, setName] = useState("");
  const [room, setRoom] = useState("");
  return (
    <div className="flex flex-col gap-4">
      <Input
        placeholder="Name"
        value={name}
        type="text"
        onChange={(e) => setName(e.target.value)}
      />
      <Input
        placeholder="Room"
        value={room}
        type="text"
        onChange={(e) => setRoom(e.target.value)}
      />
      <Link
        onClick={(e) => (!name || !room ? e.preventDefault() : null)}
        to={`/chat?name=${name}&room=${room}`}
      >
        <Button type="submit">Sign In</Button>
      </Link>
    </div>
  );
};

export default HomePage;
