import GeminiChatContainer from "../components/GeminiChatContainer";
import GeminiMessageInput from "../components/GeminiMessageInput";

const GeminiChatPage = () => {
  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <GeminiChatContainer />
      <GeminiMessageInput />
    </div>
  );
};

export default GeminiChatPage;