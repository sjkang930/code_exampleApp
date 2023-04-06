import { useState, useEffect } from "react";
import Pusher from "pusher-js";
import MessageForm from "../components/MessagesForm";
import axios from "axios";

export default function Chat() {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const pusher = new Pusher("77aaedf9cb6a25d82beb", {
      cluster: "us3",
    });
    const channelName = "my-channel";

    const channel = pusher.subscribe(channelName);
    channel.bind("my-event", function (data) {
      setMessages((messages) => [...messages, data]);
      console.log("data", data);
    });

    return () => {
      pusher.unsubscribe(channelName);
      pusher.disconnect();
    };
  }, []);

  const submitHandler = (message) => {
    axios.post("/api/messages", { message });
  };

  return (
    <div>
      <MessageForm onSubmit={submitHandler} />
      {messages.map((message) => (
        <div key={message.id}>{message.message}</div>
      ))}
    </div>
  );
}
