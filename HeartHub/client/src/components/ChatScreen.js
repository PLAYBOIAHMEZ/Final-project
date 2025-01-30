import { useState, useEffect, useContext, useRef } from "react";
import axios from "axios";
import { SocketContext } from "../context/socket";

function ChatScreen() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState({});
  const [newMessage, setNewMessage] = useState("");
  const socket = useContext(SocketContext);
  const messagesEndRef = useRef(null);

  const scrollToBottom = (chatId) => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = async (chatId) => {
    if (!newMessage.trim() || !socket) return;

    const userId = localStorage.getItem("userId");
    try {
      socket.emit("send message", {
        chatId,
        message: newMessage,
        senderId: userId,
      });

      // Optimistically add message to UI
      setMessages((prev) => ({
        ...prev,
        [chatId]: [
          ...(prev[chatId] || []),
          {
            sender: userId,
            content: newMessage,
            timestamp: new Date(),
          },
        ],
      }));

      setNewMessage("");
      scrollToBottom(chatId);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  useEffect(() => {
    if (socket) {
      socket.on("new message", (data) => {
        setMessages((prev) => ({
          ...prev,
          [data.chatId]: [...(prev[data.chatId] || []), data.message],
        }));
        scrollToBottom(data.chatId);
      });
    }
  }, [socket]);

  useEffect(() => {
    const fetchMatches = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await axios.get(
          "http://localhost:5000/api/users/matches",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.data.success) {
          setMatches(response.data.matches);

          // Fetch initial messages for each match
          response.data.matches.forEach(async (match) => {
            try {
              const chatResponse = await axios.get(
                `http://localhost:5000/api/chats/${match.chatId}`,
                {
                  headers: { Authorization: `Bearer ${token}` },
                }
              );
              if (chatResponse.data.success) {
                setMessages((prev) => ({
                  ...prev,
                  [match.chatId]: chatResponse.data.chat.messages,
                }));
              }
            } catch (error) {
              console.error(`Error fetching chat ${match.chatId}:`, error);
            }
          });
        }
      } catch (error) {
        console.error("Error fetching matches:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  return (
    <div className="matches-container">
      <h2 className="text-2xl font-bold mb-4">Your Matches</h2>
      {loading ? (
        <p className="text-center text-gray-500">Loading matches...</p>
      ) : matches.length === 0 ? (
        <p className="text-center text-gray-500">No matches yet</p>
      ) : (
        <div className="matches-list space-y-4">
          {matches.map((match) => (
            <div
              key={match._id}
              className="match-item bg-white rounded-lg shadow p-4"
            >
              <div className="flex items-center gap-4 mb-3">
                <img
                  src={match.imageUrl || "/images/default-avatar.png"}
                  alt={match.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <h3 className="font-semibold">{match.name}</h3>
              </div>

              <div className="chat-messages max-h-60 overflow-y-auto mb-3">
                {messages[match.chatId]?.map((msg, index) => (
                  <div
                    key={index}
                    className={`message mb-2 ${
                      msg.sender === localStorage.getItem("userId")
                        ? "sent ml-auto"
                        : "received"
                    }`}
                  >
                    <div
                      className={`message-bubble p-2 rounded-lg max-w-[80%] ${
                        msg.sender === localStorage.getItem("userId")
                          ? "bg-pink-500 text-white"
                          : "bg-gray-100"
                      }`}
                    >
                      <p>{msg.content}</p>
                      <small className="text-xs opacity-70">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </small>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div className="chat-input flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" && sendMessage(match.chatId)
                  }
                  placeholder="Type a message..."
                  className="flex-1 p-2 border rounded-full"
                />
                <button
                  onClick={() => sendMessage(match.chatId)}
                  className="px-4 py-2 bg-pink-500 text-white rounded-full hover:bg-pink-600"
                >
                  Send
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ChatScreen;
