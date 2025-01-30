import { useState, useEffect, useRef } from "react";
import axios from "axios";

function ChatWindow({
  chatId,
  socket,
  onClose,
  messages: initialMessages = [],
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Fetch previous messages for this chat
    const fetchMessages = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await axios.get(
          `http://localhost:5000/api/chats/${chatId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (response.data.success) {
          setMessages(response.data.chat.messages);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();

    // Listen for new messages
    if (socket) {
      socket.on("new message", (data) => {
        if (data.chatId === chatId) {
          setMessages((prevMessages) => [...prevMessages, data.message]);
          scrollToBottom();
        }
      });
    }

    return () => {
      if (socket) {
        socket.off("new message");
      }
    };
  }, [chatId, socket]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (inputMessage.trim()) {
      const userId = localStorage.getItem("userId");
      const newMessage = {
        sender: userId,
        content: inputMessage,
        timestamp: new Date(),
      };

      socket.emit("send message", {
        chatId,
        message: newMessage,
        senderId: userId,
      });

      // Optimistically add message to UI
      setMessages((prevMessages) => [...prevMessages, newMessage]);
      setInputMessage("");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-lg h-[600px] flex flex-col">
        <div className="chat-header p-4 border-b flex justify-between items-center">
          <h3 className="text-xl font-semibold">Chat</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.sender === localStorage.getItem("userId")
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  message.sender === localStorage.getItem("userId")
                    ? "bg-pink-500 text-white"
                    : "bg-gray-100"
                }`}
              >
                <p>{message.content}</p>
                <small className="text-xs opacity-70">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </small>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="p-4 border-t">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 p-2 border rounded-full focus:outline-none focus:border-pink-500"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-pink-500 text-white rounded-full hover:bg-pink-600 transition-colors"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ChatWindow;
