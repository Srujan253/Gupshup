import { MessageSquare, Sparkles } from "lucide-react";

const NoChatSelected = () => {
  return (
    <div className="w-full flex flex-1 flex-col items-center justify-center p-16 bg-base-100/50">
      <div className="max-w-md text-center space-y-6">
        {/* Icon Display */}
        <div className="flex justify-center gap-4 mb-4">
          <div className="relative">
            <div
              className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center
             justify-center animate-bounce"
            >
              <MessageSquare className="w-8 h-8 text-primary " />
            </div>
          </div>
          <div className="relative">
            <div
              className="w-16 h-16 rounded-2xl bg-gradient-to-r from-purple-500 to-blue-500 flex items-center
             justify-center animate-bounce"
              style={{ animationDelay: '0.2s' }}
            >
              <Sparkles className="w-8 h-8 text-white " />
            </div>
          </div>
        </div>

        {/* Welcome Text */}
        <h2 className="text-2xl font-bold">Welcome to GupShup!</h2>
        <p className="text-base-content/60">
          Select a conversation from the sidebar to start chatting with friends or chat with Gemini AI
        </p>
        
        <div className="bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 
                        rounded-lg p-4 mt-6">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <span className="font-semibold text-purple-600">Try Gemini AI</span>
          </div>
          <p className="text-sm text-base-content/70">
            Chat with Google's powerful AI assistant for questions, image analysis, and creative tasks
          </p>
        </div>
      </div>
    </div>
  );
};

export default NoChatSelected;