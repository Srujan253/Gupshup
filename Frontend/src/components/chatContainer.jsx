import { useEffect } from 'react';
import { useChatStore } from '../store/useChatStore';
import ChatHeader from './chatHeader';
import MessageInput from './MessageInput';
import MessageSkeleton from './Skeltons/MessageSkeleton.jsx';
const ChatContainer = () => {
  const { messages, getMessages, isMessagesLoading, selectedUser } = useChatStore();

  useEffect(() => {
    if (selectedUser?._id) {
      getMessages(selectedUser._id);
    }
  }, [selectedUser?._id, getMessages]);

  if (!selectedUser) return <div>Select a chat to start messaging.</div>;
  if (isMessagesLoading) 
    {
        return (
            <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
  

  );
}

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />
      <p>messsages....</p>
      <MessageInput />
    </div>
  );
};
export default ChatContainer;