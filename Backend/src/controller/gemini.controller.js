import GeminiChat from "../models/geminiChat.model.js";

// Save a chat message to database
export const saveChatMessage = async (req, res) => {
  try {
    const { role, content, messageType, imageData, metadata } = req.body;
    const userId = req.user._id; // From auth middleware

    if (!role || !content) {
      return res.status(400).json({ 
        error: "Role and content are required" 
      });
    }

    if (!["user", "assistant"].includes(role)) {
      return res.status(400).json({ 
        error: "Role must be 'user' or 'assistant'" 
      });
    }

    const chatMessage = new GeminiChat({
      userId,
      role,
      content,
      messageType: messageType || "text",
      imageData: imageData || null,
      metadata: metadata || {},
    });

    await chatMessage.save();

    res.status(201).json({
      success: true,
      message: "Chat message saved successfully",
      data: chatMessage,
    });
  } catch (error) {
    console.error("❌ Error saving chat message:", error);
    res.status(500).json({ 
      error: "Failed to save chat message",
      details: error.message 
    });
  }
};

// Get chat history for authenticated user
export const getChatHistory = async (req, res) => {
  try {
    const userId = req.user._id; // From auth middleware
    const { limit = 50, skip = 0 } = req.query;

    // Fetch chat history sorted by newest first
    const chatHistory = await GeminiChat.find({ userId })
      .sort({ createdAt: -1 }) // Newest first
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .select("-__v"); // Exclude version key

    // Reverse to get chronological order (oldest to newest)
    const chronologicalHistory = chatHistory.reverse();

    // Get total count for pagination
    const totalMessages = await GeminiChat.countDocuments({ userId });

    res.status(200).json({
      success: true,
      data: chronologicalHistory,
      pagination: {
        total: totalMessages,
        limit: parseInt(limit),
        skip: parseInt(skip),
        hasMore: totalMessages > parseInt(skip) + chronologicalHistory.length,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching chat history:", error);
    res.status(500).json({ 
      error: "Failed to fetch chat history",
      details: error.message 
    });
  }
};

// Delete entire chat history for authenticated user
export const deleteChatHistory = async (req, res) => {
  try {
    const userId = req.user._id; // From auth middleware

    const result = await GeminiChat.deleteMany({ userId });

    res.status(200).json({
      success: true,
      message: "Chat history deleted successfully",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("❌ Error deleting chat history:", error);
    res.status(500).json({ 
      error: "Failed to delete chat history",
      details: error.message 
    });
  }
};

// Delete a specific chat message
export const deleteChatMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id; // From auth middleware

    const message = await GeminiChat.findOne({ _id: messageId, userId });

    if (!message) {
      return res.status(404).json({ 
        error: "Message not found or unauthorized" 
      });
    }

    await GeminiChat.deleteOne({ _id: messageId });

    res.status(200).json({
      success: true,
      message: "Chat message deleted successfully",
    });
  } catch (error) {
    console.error("❌ Error deleting chat message:", error);
    res.status(500).json({ 
      error: "Failed to delete chat message",
      details: error.message 
    });
  }
};

// Get chat statistics for authenticated user
export const getChatStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const stats = await GeminiChat.aggregate([
      { $match: { userId: userId } },
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 },
          avgLength: { $avg: { $strLenCP: "$content" } },
        },
      },
    ]);

    const totalMessages = await GeminiChat.countDocuments({ userId });
    const firstMessage = await GeminiChat.findOne({ userId })
      .sort({ createdAt: 1 })
      .select("createdAt");
    
    const lastMessage = await GeminiChat.findOne({ userId })
      .sort({ createdAt: -1 })
      .select("createdAt");

    res.status(200).json({
      success: true,
      data: {
        totalMessages,
        breakdown: stats,
        firstMessageDate: firstMessage?.createdAt || null,
        lastMessageDate: lastMessage?.createdAt || null,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching chat stats:", error);
    res.status(500).json({ 
      error: "Failed to fetch chat statistics",
      details: error.message 
    });
  }
};
