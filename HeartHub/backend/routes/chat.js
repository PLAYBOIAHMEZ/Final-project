const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { createChat, getChats } = require("../controllers/chatController");
const Chat = require("../models/Chat");

router.post("/", auth, createChat);
router.get("/", auth, getChats);
router.get("/:chatId", auth, async (req, res) => {
  try {
    console.log("Fetching chat:", req.params.chatId); // Debug log

    const chat = await Chat.findById(req.params.chatId)
      .populate("participants", "name imageUrl") // Updated fields
      .populate("messages.sender", "name");

    if (!chat) {
      console.log("Chat not found"); // Debug log
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      });
    }

    // Verify user is participant
    if (!chat.participants.some((p) => p._id.toString() === req.user.id)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this chat",
      });
    }

    // Get chat partner info
    const chatPartner = chat.participants.find(
      (p) => p._id.toString() !== req.user.id
    );

    res.json({
      success: true,
      chat: {
        _id: chat._id,
        messages: chat.messages,
        participants: chat.participants,
        chatPartner: chatPartner,
      },
    });
  } catch (error) {
    console.error("Get chat error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get chat",
      error: error.message,
    });
  }
});

module.exports = router;
