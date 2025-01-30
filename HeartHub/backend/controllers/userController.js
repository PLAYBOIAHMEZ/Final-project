const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Chat = require("../models/Chat");

// Register user
const registerUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Registration attempt for:", email);

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide both email and password",
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    // Create new user
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    await newUser.save();

    // Generate token
    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    // Send success response
    res.status(201).json({
      success: true,
      message: "Registration successful",
      token,
      userId: newUser._id,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Registration failed",
      error: error.message,
    });
  }
};

// Login user
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Login attempt for:", email);

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide both email and password",
      });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    // Send success response
    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      userId: user._id,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message,
    });
  }
};

// Update profile
const updateProfile = async (req, res) => {
  try {
    const { name, age, gender, interestedIn, bio } = req.body;
    const imageFile = req.file;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update profile fields
    user.profile = {
      name: name || user.profile?.name,
      age: age || user.profile?.age,
      gender: gender || user.profile?.gender,
      interestedIn: interestedIn || user.profile?.interestedIn,
      bio: bio || user.profile?.bio,
      imageUrl: imageFile
        ? `/uploads/${imageFile.filename}`
        : user.profile?.imageUrl,
    };

    await user.save();

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        ...user.profile,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update profile",
    });
  }
};

// Get profiles
const getProfiles = async (req, res) => {
  try {
    const currentUserId = req.user.id;

    // Find the current user to get their preferences
    const currentUser = await User.findById(currentUserId);

    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!currentUser.profile || !currentUser.profile.name) {
      return res.status(400).json({
        success: false,
        message: "Please complete your profile first",
      });
    }

    // Find profiles that match the user's preferences
    const matchingProfiles = await User.find({
      _id: { $ne: currentUserId },
      "profile.name": { $exists: true },
    }).select("profile");

    if (!matchingProfiles.length) {
      return res.json({
        success: true,
        profiles: [],
      });
    }

    const profiles = matchingProfiles.map((user) => ({
      _id: user._id,
      name: user.profile.name,
      age: user.profile.age,
      gender: user.profile.gender,
      interestedIn: user.profile.interestedIn,
      bio: user.profile.bio,
      imageUrl: user.profile.imageUrl || "/images/default-avatar.png",
    }));

    res.json({
      success: true,
      profiles,
    });
  } catch (error) {
    console.error("Error in getProfiles:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching profiles",
    });
  }
};

// Add this new function to get user profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if user has completed their profile
    const hasProfile = !!(user.profile && user.profile.name);

    res.json({
      success: true,
      hasProfile,
      profile: user.profile,
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get profile",
    });
  }
};

const handleLike = async (req, res) => {
  try {
    const { profileId } = req.params;
    const currentUserId = req.user.id;

    // Add console logs for debugging
    console.log("Current User ID:", currentUserId);
    console.log("Profile ID being liked:", profileId);

    // Find both users
    const currentUser = await User.findById(currentUserId);
    const likedUser = await User.findById(profileId);

    // Add console logs to check if users are found
    console.log("Current User found:", !!currentUser);
    console.log("Liked User found:", !!likedUser);

    if (!currentUser || !likedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Add like to current user's likes array
    if (!currentUser.likes.includes(profileId)) {
      currentUser.likes.push(profileId);
      await currentUser.save();
    }

    // Check if it's a match
    const isMatch = likedUser.likes.includes(currentUserId);

    if (isMatch) {
      // Create a new chat for the match
      const newChat = new Chat({
        participants: [currentUserId, profileId],
        messages: [],
      });
      await newChat.save();

      // Add to matches array for both users
      if (!currentUser.matches.includes(profileId)) {
        currentUser.matches.push(profileId);
        await currentUser.save();
      }
      if (!likedUser.matches.includes(currentUserId)) {
        likedUser.matches.push(currentUserId);
        await likedUser.save();
      }

      return res.json({
        success: true,
        message: "It's a match!",
        isMatch: true,
        chatId: newChat._id,
      });
    }

    // If no match, just return success
    return res.json({
      success: true,
      message: "Profile liked successfully",
      isMatch: false,
    });
  } catch (error) {
    console.error("Server Error in handleLike:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while processing like",
      error: error.message,
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  updateProfile,
  getProfile,
  getProfiles,
  handleLike,
};
