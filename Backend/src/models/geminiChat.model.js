import mongoose from "mongoose";

const geminiChatSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, // Index for faster queries
    },
    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    messageType: {
      type: String,
      enum: ["text", "image"],
      default: "text",
    },
    imageData: {
      type: String, // Base64 or URL of the image
      default: null,
    },
    metadata: {
      model: {
        type: String,
        default: "gemini-2.0-flash-lite",
      },
      tokens: Number,
      processingTime: Number, // in milliseconds
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

// Index for efficient querying
geminiChatSchema.index({ userId: 1, createdAt: -1 });

const GeminiChat = mongoose.model("GeminiChat", geminiChatSchema);

export default GeminiChat;
