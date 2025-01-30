import React, { useState, useEffect, useRef } from "react";
import { useParams, useHistory } from "react-router-dom";
import io from "socket.io-client";
import axios from "axios";

const SOCKET_URL = "http://localhost:5000";

function ChatPage() {
  const { chatId } = useParams();
  const history = useHistory();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chatPartner, setChatPartner] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      history.push("/login");
      return;
    }

    const newSocket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket"],
      upgrade: false,
    });

    newSocket.on("connect_error", (err) => {
      console.error("Socket connection error:", err);
      setError("Failed to connect to chat server");
    });

    newSocket.on("connect", () => {
      console.log("Socket connected");
      newSocket.emit("join chat", chatId);
    });

    setSocket(newSocket);

    // Load chat details and messages
    const loadChat = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `http://localhost:5000/api/chats/${chatId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.data.success) {
          console.log("Chat data:", response.data); // Debug log
          setMessages(response.data.chat.messages);

          // Set chat partner details
          const currentUserId = localStorage.getItem("userId");
          const partner = response.data.chat.participants.find(
            (p) => p._id !== currentUserId
          );
          setChatPartner(partner);
        }
      } catch (error) {
        console.error("Error loading chat:", error);
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          history.push("/login");
        } else {
          setError(error.response?.data?.message || "Failed to load chat");
        }
      } finally {
        setLoading(false);
      }
    };

    loadChat();

    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, [chatId, history]);

  useEffect(() => {
    if (socket) {
      const messageHandler = (data) => {
        console.log("New message received:", data); // Debug log
        if (data.chatId === chatId) {
          setMessages((prev) => [...prev, data.message]);
          scrollToBottom();
        }
      };

      socket.on("new message", messageHandler);
      socket.emit("join chat", chatId);

      return () => {
        socket.off("new message", messageHandler);
      };
    }
  }, [socket, chatId]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket) return;

    const userId = localStorage.getItem("userId");
    if (!userId) {
      setError("User not authenticated");
      return;
    }

    try {
      const messageData = {
        chatId,
        message: newMessage,
        senderId: userId,
      };

      socket.emit("send message", messageData);
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      setError("Failed to send message");
    }
  };

  if (loading) {
    return <div className="chat-loading">Loading chat...</div>;
  }

  if (error) {
    return <div className="chat-error">{error}</div>;
  }

  return (
    <div className="chat-container">
      {chatPartner && (
        <div className="chat-header">
          <img
            src={chatPartner.imageUrl || "/images/default-avatar.png"}
            alt={chatPartner.name}
            className="chat-avatar"
          />
          <h2>{chatPartner.name}</h2>
        </div>
      )}

      <div className="messages">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message ${
              msg.sender === localStorage.getItem("userId")
                ? "sent"
                : "received"
            }`}
          >
            <div className="message-bubble">
              <p>{msg.content}</p>
              <small>{new Date(msg.timestamp).toLocaleTimeString()}</small>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="message-form">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="message-input"
        />
        <button type="submit" className="send-button">
          Send
        </button>
      </form>
    </div>
  );
}

export default ChatPage;
