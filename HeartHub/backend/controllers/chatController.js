const Chat = require("../models/Chat");
const User = require("../models/User");

const createChat = async (req, res) => {
  try {
    const { matchedUserId } = req.body;
    const currentUserId = req.user.id;

    // Check if chat already exists
    const existingChat = await Chat.findOne({
      participants: {
        $all: [currentUserId, matchedUserId],
      },
    });

    if (existingChat) {
      return res.json({
        success: true,
        chatId: existingChat._id,
      });
    }

    // Create new chat
    const newChat = new Chat({
      participants: [currentUserId, matchedUserId],
      messages: [],
    });

    await newChat.save();

    res.json({
      success: true,
      chatId: newChat._id,
    });
  } catch (error) {
    console.error("Create chat error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create chat",
    });
  }
};

const getChats = async (req, res) => {
  try {
    const userId = req.user.id;

    const chats = await Chat.find({
      participants: userId,
    })
      .populate("participants", "profile.name profile.imageUrl")
      .populate("messages.sender", "profile.name");

    res.json({
      success: true,
      chats,
    });
  } catch (error) {
    console.error("Get chats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get chats",
    });
  }
};

module.exports = {
  createChat,
  getChats,
};
