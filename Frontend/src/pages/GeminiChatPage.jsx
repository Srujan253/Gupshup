import { useEffect } from "react";
import GeminiChatContainer from "../components/GeminiChatContainer";
import GeminiMessageInput from "../components/GeminiMessageInput";
import { useGeminiStore } from "../store/useGeminiStore";

const GeminiChatPage = () => {
  const { loadChatHistory } = useGeminiStore();

  // Load chat history when component mounts
  useEffect(() => {
    loadChatHistory();
  }, [loadChatHistory]);

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <GeminiChatContainer />
      <GeminiMessageInput />
    </div>
  );
};

export default GeminiChatPage;