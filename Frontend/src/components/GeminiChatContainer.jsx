import { useEffect, useRef } from "react";
import { useGeminiStore } from "../store/useGeminiStore";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils.js";
import { Sparkles, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const GeminiChatContainer = () => {
  const { geminiMessages, isGeminiLoading, geminiUser, clearGeminiMessages } = useGeminiStore();
  const { authUser, logout } = useAuthStore();
  const messageEndRef = useRef(null);
  const navigate = useNavigate();
  const processedMessageIdsRef = useRef(new Set());

  // Clean up old sessionStorage on mount and reset processed messages when user changes
  useEffect(() => {
    sessionStorage.removeItem('gupshup_last_route_id');
    // Clear processed IDs when auth user changes (login/logout)
    processedMessageIdsRef.current.clear();
  }, [authUser?._id]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [geminiMessages]);

  // Handle AI routing commands - only process new unprocessed messages
  useEffect(() => {
    if (geminiMessages.length > 0) {
      const lastMessage = geminiMessages[geminiMessages.length - 1];
      
      console.log('🔍 Checking last message:', {
        id: lastMessage._id,
        sender: lastMessage.senderId,
        text: lastMessage.text?.substring(0, 100),
        createdAt: lastMessage.createdAt
      });
      
      // Only process AI messages
      if (lastMessage.senderId === 'gupshup-ai' && lastMessage.text && lastMessage._id) {
        
        // Skip if this message was already processed
        if (processedMessageIdsRef.current.has(lastMessage._id)) {
          console.log('⏭️ Message already processed, skipping:', lastMessage._id);
          return;
        }
        
        // Check if message is recent (within last 2 seconds) to prevent processing old messages from history
        const messageTime = new Date(lastMessage.createdAt).getTime();
        const now = Date.now();
        const ageInSeconds = (now - messageTime) / 1000;
        const isRecent = (now - messageTime) < 2000; // Only 2 seconds

        console.log('⏰ Message age:', {
          ageInSeconds: ageInSeconds.toFixed(2),
          isRecent,
          messageTime: new Date(messageTime).toISOString(),
          now: new Date(now).toISOString()
        });

        if (!isRecent) {
          console.log('⏸️ Message too old, skipping route command');
          // Still mark as processed to avoid checking again
          processedMessageIdsRef.current.add(lastMessage._id);
          return;
        }

        // Check if message contains route commands
        const hasRouteCommand = lastMessage.text.includes('[ROUTE:') || lastMessage.text.includes('[ACTION:');
        
        if (!hasRouteCommand) {
          console.log('❌ No route command found in message');
          return;
        }

        // Mark as processed BEFORE executing to prevent duplicates
        processedMessageIdsRef.current.add(lastMessage._id);
        console.log('✅ Message marked as processed:', lastMessage._id);
        console.log('📋 Total processed messages:', processedMessageIdsRef.current.size);

        // Check for routing commands
        if (lastMessage.text.includes('[ACTION:LOGOUT]')) {
          console.log('🚪 LOGOUT action detected - logging out...');
          setTimeout(() => {
            logout();
            navigate('/login');
          }, 1500);
        } else if (lastMessage.text.includes('[ROUTE:/settings]')) {
          console.log('⚙️ SETTINGS route detected - navigating to /settings...');
          setTimeout(() => navigate('/settings'), 1500);
        } else if (lastMessage.text.includes('[ROUTE:/profile]')) {
          console.log('👤 PROFILE route detected - navigating to /profile...');
          setTimeout(() => navigate('/profile'), 1500);
        }
      }
    }
  }, [geminiMessages, navigate, logout, authUser?._id]);

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      {/* Header */}
      <div className="p-2.5 border-b border-base-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Gemini Avatar */}
            <div className="avatar">
              <div className="size-10 rounded-full relative bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                <Sparkles className="size-6 text-white" />
              </div>
            </div>

            {/* User info */}
            <div>
              <h3 className="font-medium flex items-center gap-2">
                {geminiUser.fullname}
                <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                  AI Assistant
                </span>
              </h3>
              <p className="text-sm text-base-content/70">
                Powered by Google Gemini
              </p>
            </div>
          </div>

          {/* Clear Chat Button */}
          {geminiMessages.length > 0 && (
            <button
              onClick={clearGeminiMessages}
              className="btn btn-ghost btn-sm"
              title="Clear chat"
            >
              <Trash2 className="size-4" />
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {geminiMessages.length === 0 && (
          <div className="text-center text-base-content/60 py-8">
            <Sparkles className="size-16 mx-auto mb-4 text-purple-500" />
            <h3 className="text-lg font-medium mb-2">Chat with GupShup AI</h3>
            <p className="text-sm">
              Ask me anything! I can help with questions, analyze images, and have conversations.
            </p>
          </div>
        )}

        {geminiMessages.map((message) => (
          <div
            key={message._id}
            className={`chat ${
              message.senderId === 'user' ? "chat-end" : "chat-start"
            }`}
          >
            <div className="chat-image avatar">
              <div className="size-10 rounded-full border">
                {message.senderId === 'user' ? (
                  <img
                    src={authUser?.profilePic || "/avatar.png"}
                    alt="Your profile"
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="bg-gradient-to-r from-purple-500 to-blue-500 w-full h-full rounded-full flex items-center justify-center">
                    <Sparkles className="size-6 text-white" />
                  </div>
                )}
              </div>
            </div>
            <div className="chat-header mb-1">
              <time className="text-xs opacity-50 ml-1">
                {formatMessageTime(message.createdAt)}
              </time>
            </div>
            <div className={`chat-bubble flex flex-col ${
              message.senderId === 'gupshup-ai' 
                ? 'chat-bubble-primary bg-gradient-to-r from-purple-600 to-blue-600 text-white' 
                : ''
            }`}>
              {message.image && (
                <img
                  src={message.image}
                  alt="Attachment"
                  className="sm:max-w-[200px] rounded-md mb-2"
                />
              )}
              {message.text && (
                <div className="whitespace-pre-wrap">
                  {message.text.replace(/\[ROUTE:.*?\]|\[ACTION:.*?\]/g, '')}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {isGeminiLoading && (
          <div className="chat chat-start">
            <div className="chat-image avatar">
              <div className="size-10 rounded-full border bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                <Sparkles className="size-6 text-white animate-pulse" />
              </div>
            </div>
            <div className="chat-bubble chat-bubble-primary bg-gradient-to-r from-purple-600 to-blue-600">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messageEndRef} />
      </div>
    </div>
  );
};

export default GeminiChatContainer;