import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import axios from "axios";
import io from "socket.io-client";
import "../index.css";
import "./swipe-card.css";
import ChatWindow from "./ChatWindow";

const SOCKET_URL = "http://localhost:5000";

function SwipeScreen({ profiles, currentIndex, setCurrentIndex, handleLike }) {
  const currentProfile = profiles[currentIndex];

  if (!currentProfile) {
    return (
      <div className="swipe-card">
        <div className="swipe-card-content">
          <h2>No more profiles</h2>
          <p>Check back later for new matches!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="swipe-card">
      <div className="relative h-[500px]">
        <img
          src={currentProfile.imageUrl || "/images/default-avatar.png"}
          alt={currentProfile.name}
          className="w-full h-full object-cover"
        />
        <div className="swipe-card-info">
          <h2>
            {currentProfile.name}, {currentProfile.age}
          </h2>
          <p>{currentProfile.bio}</p>
        </div>
      </div>
      <div className="swipe-buttons">
        <button
          className="swipe-button pass-button"
          onClick={() => setCurrentIndex((prev) => prev + 1)}
        >
          ✕
        </button>
        <button
          className="swipe-button like-button"
          onClick={() => handleLike(currentProfile._id)}
        >
          ♥
        </button>
      </div>
    </div>
  );
}

function ChatScreen({
  socket,
  matches,
  setMatches,
  activeChat,
  setActiveChat,
}) {
  const [loading, setLoading] = useState(true);
  const history = useHistory();

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
        }
      } catch (error) {
        console.error("Error fetching matches:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [setMatches]); // Added setMatches to the dependency array

  if (loading) {
    return <div className="loading">Loading matches...</div>;
  }

  return (
    <div className="matches-container">
      <h2>Your Matches</h2>
      {matches.length === 0 ? (
        <p>No matches yet😭</p>
      ) : (
        <div className="matches-list">
          {matches.map((match) => (
            <div
              key={match._id}
              className="match-item"
              onClick={() => {
                setActiveChat(match.chatId);
                history.push(`/chat/${match.chatId}`);
              }}
            >
              <img
                src={match.imageUrl || "/images/default-avatar.png"}
                alt={match.name}
                className="match-avatar"
              />
              <div className="match-info">
                <h3>{match.name}</h3>
                <p>Click to chat</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function NotificationsScreen() {
  return (
    <div className="notifications-container">
      <h2>Notifications</h2>
      <p>No new notifications</p>
      <p>What a lonely person🥲</p>
    </div>
  );
}

function MatchModal({ matchedUser, onClose, onStartChat }) {
  return (
    <div className="match-modal-overlay">
      <div className="match-modal">
        <h2>It's a Match! 🎉</h2>
        <div className="match-profile">
          <img
            src={matchedUser.imageUrl || "/images/default-avatar.png"}
            alt={matchedUser.name}
          />
          <p>You and {matchedUser.name} liked each other!</p>
        </div>
        <div className="match-buttons">
          <button
            className="chat-now-button"
            onClick={() => onStartChat(matchedUser.chatId)}
          >
            Send a Message
          </button>
          <button className="keep-swiping-button" onClick={onClose}>
            Keep Swiping
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const history = useHistory();
  const [view, setView] = useState("swipe");
  const [profiles, setProfiles] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [socket, setSocket] = useState(null);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [matchedUser, setMatchedUser] = useState(null);
  const [matches, setMatches] = useState([]);
  const [activeChat, setActiveChat] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const newSocket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket"],
    });

    newSocket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    const handleMatch = (matchData) => {
      const { matchedUsers, chatId } = matchData;
      const otherUserId = matchedUsers.find(
        (id) => id !== localStorage.getItem("userId")
      );
      const matchedProfile = profiles.find((p) => p._id === otherUserId);

      if (matchedProfile) {
        setMatchedUser({ ...matchedProfile, chatId });
        setShowMatchModal(true);
      }
    };

    newSocket.on("new match", handleMatch);

    setSocket(newSocket);

    return () => {
      if (newSocket) newSocket.disconnect();
    };
  }, [profiles]);

  useEffect(() => {
    const fetchProfiles = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        history.push("/login");
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get(
          "http://localhost:5000/api/users/profiles",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.data.success && response.data.profiles) {
          setProfiles(response.data.profiles);
        } else {
          setError("No profiles available");
        }
      } catch (error) {
        console.error("Error fetching profiles:", error);
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          history.push("/login");
        } else {
          setError("Please complete your profile first");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfiles();
  }, [history]);

  const handleLike = async (profileId) => {
    if (!profileId) return;

    const token = localStorage.getItem("token");
    if (!token) {
      history.push("/login");
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:5000/api/users/like/${profileId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setCurrentIndex((prev) => prev + 1);

      if (response.data.isMatch) {
        const matchedProfile = profiles.find((p) => p._id === profileId);
        if (matchedProfile) {
          setMatchedUser({
            ...matchedProfile,
            chatId: response.data.chatId,
          });
          setShowMatchModal(true);
          setMatches((prev) => [
            ...prev,
            { ...matchedProfile, chatId: response.data.chatId },
          ]);

          if (socket) {
            socket.emit("match created", {
              matchedUsers: [localStorage.getItem("userId"), profileId],
              chatId: response.data.chatId,
            });
          }
        }
      }
    } catch (error) {
      console.error("Error liking profile:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-salmon shadow-md px-4 py-2 fixed top-0 w-full z-50, justify-end">
        <img
          className="logo"
          src="/images/logo-small.png"
          alt="HeartHub logo"
        />

        <div className="flex gap-4 ">
          <button
            className={`nav-button p-3 rounded-full transition-all ${
              view === "swipe"
                ? "bg-pink-50 text-pink-500"
                : "hover:bg-gray-100"
            }`}
            onClick={() => setView("swipe")}
          >
            <span className="text-2xl">❤️</span>
          </button>

          <button
            className={`nav-button p-3 rounded-full transition-all relative ${
              view === "chat" ? "bg-pink-50 text-pink-500" : "hover:bg-gray-100"
            }`}
            onClick={() => setView("chat")}
          >
            <span className="text-2xl">💬</span>
            {showMatchModal && (
              <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                1
              </span>
            )}
          </button>

          <button
            className={`nav-button p-3 rounded-full transition-all ${
              view === "notifications"
                ? "bg-pink-50 text-pink-500"
                : "hover:bg-gray-100"
            }`}
            onClick={() => setView("notifications")}
          >
            <span className="text-2xl">🔔</span>
          </button>
        </div>
      </nav>

      <main className="pt-20 px-4 max-w-6xl mx-auto">
        <div className="dash-container">
          {loading ? (
            <div className="flex items-center justify-center h-[calc(100vh-5rem)]">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-pink-500 border-t-transparent"></div>
            </div>
          ) : error ? (
            <div className="text-center p-8 bg-white rounded-lg shadow-sm">
              <p className="text-red-500">{error}</p>
            </div>
          ) : (
            <div className="min-h-[calc(100vh-5rem)]">
              {view === "swipe" && (
                <div className="max-w-md mx-auto p-15px">
                  <SwipeScreen
                    profiles={profiles}
                    currentIndex={currentIndex}
                    setCurrentIndex={setCurrentIndex}
                    handleLike={handleLike}
                  />
                </div>
              )}
              {view === "chat" && (
                <ChatScreen
                  socket={socket}
                  matches={matches}
                  setMatches={setMatches}
                  activeChat={activeChat}
                  setActiveChat={setActiveChat}
                />
              )}
              {view === "notifications" && <NotificationsScreen />}
            </div>
          )}
        </div>
      </main>

      {showMatchModal && matchedUser && (
        <MatchModal
          matchedUser={matchedUser}
          onClose={() => setShowMatchModal(false)}
          onStartChat={(chatId) => {
            setActiveChat(chatId);
            setView("chat");
            setShowMatchModal(false);
          }}
        />
      )}

      {activeChat && (
        <ChatWindow
          chatId={activeChat}
          socket={socket}
          onClose={() => setActiveChat(null)}
        />
      )}
    </div>
  );
}
