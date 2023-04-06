import { useState } from "react";

export default function MessageForm({ onSubmit }) {
  const [message, setMessage] = useState("");
  const handleSubmit = e => {
    e.preventDefault();
    onSubmit({message});
    setMessage("");
  };
  return (
    <div>
      <form onSubmit={handleSubmit} method="POST">
        <input
          className="border border-gray-300 rounded-lg font-medium text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

