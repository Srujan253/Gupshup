import { useRef, useState } from 'react';
import { useGeminiStore } from '../store/useGeminiStore.js';
import { Image, Send, X, Sparkles } from "lucide-react";
import toast from "react-hot-toast";

function GeminiMessageInput() {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const { sendMessageToGemini, isGeminiLoading } = useGeminiStore();

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) {
      toast.error("Please enter a message or select an image");
      return;
    }

    try {
      await sendMessageToGemini(text.trim(), imagePreview);
      setText("");
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Error sending message to GupShup AI:", error);
      toast.error("Failed to send message to GupShup AI");
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="p-4 w-full border-t border-base-300">
      {imagePreview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
            />
            <button
              onClick={removeImage}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300
              flex items-center justify-center"
              type="button"
            >
              <X className="size-3" />
            </button>
          </div>
          <div className="text-sm text-base-content/70">
            <p>Image will be analyzed by GupShup AI</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            className="w-full input input-bordered rounded-lg input-sm sm:input-md"
            placeholder={imagePreview ? "Ask about this image..." : "Ask GupShup AI anything..."}
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={isGeminiLoading}
          />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageChange}
          />

          <button
            type="button"
            className={`hidden sm:flex btn btn-circle btn-sm
                     ${imagePreview ? "text-emerald-500" : "text-zinc-400"}`}
            onClick={() => fileInputRef.current?.click()}
            disabled={isGeminiLoading}
          >
            <Image size={20} />
          </button>
        </div>
        <button
          type="submit"
          className="btn btn-sm btn-circle btn-primary bg-gradient-to-r from-purple-600 to-blue-600 border-none"
          disabled={(!text.trim() && !imagePreview) || isGeminiLoading}
        >
          {isGeminiLoading ? (
            <Sparkles className="size-5 animate-spin" />
          ) : (
            <Send size={16} />
          )}
        </button>
      </form>
      
      <div className="text-xs text-base-content/50 mt-2 text-center">
        Powered by GupShup AI • Can analyze images and answer questions
      </div>
    </div>
  );
}

export default GeminiMessageInput;