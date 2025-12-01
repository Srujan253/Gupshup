import { create } from 'zustand';
import { sendMessageToGemini, sendImageToGemini } from '../lib/gemini.js';
import toast from 'react-hot-toast';
import { apiCall } from '../lib/api.js';

export const useGeminiStore = create((set, get) => ({
  geminiMessages: [],
  isGeminiLoading: false,
  isLoadingHistory: false,
  
  // Virtual GupShup AI user object for UI consistency
  geminiUser: {
    _id: 'gupshup-ai',
    fullname: 'GupShup AI',
    email: 'ai@gupshup.com',
    profilePic: '/gupshup-ai-avatar.svg',
  },

  // Load chat history from database
  loadChatHistory: async () => {
    set({ isLoadingHistory: true });
    try {
      const response = await apiCall('/api/gemini/history?limit=100');
      const data = await response.json();
      
      if (data.success) {
        // Transform database messages to UI format
        const messages = data.data.map((msg) => ({
          _id: msg._id,
          text: msg.content,
          image: msg.imageData,
          senderId: msg.role === 'user' ? 'user' : 'gupshup-ai',
          createdAt: msg.createdAt,
          messageType: msg.messageType,
        }));
        
        set({ geminiMessages: messages, isLoadingHistory: false });
      } else {
        set({ isLoadingHistory: false });
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
      set({ isLoadingHistory: false });
      // Don't show error toast, just fail silently
    }
  },

  // Save a message to database
  saveChatMessage: async (role, content, messageType = 'text', imageData = null, metadata = {}) => {
    try {
      const response = await apiCall('/api/gemini/save', {
        method: 'POST',
        body: JSON.stringify({
          role,
          content,
          messageType,
          imageData,
          metadata,
        }),
      });
      await response.json();
    } catch (error) {
      console.error('Error saving chat message:', error);
      // Fail silently - don't interrupt user experience
    }
  },

  sendMessageToGemini: async (message, imageData = null) => {
    const { geminiMessages, saveChatMessage } = get();
    
    // Add user message to conversation
    const userMessage = {
      _id: Date.now().toString(),
      text: message,
      image: imageData,
      senderId: 'user',
      createdAt: new Date().toISOString(),
      messageType: imageData ? 'image' : 'text',
    };
    
    set({ 
      geminiMessages: [...geminiMessages, userMessage],
      isGeminiLoading: true 
    });

    // Save user message to database
    saveChatMessage('user', message, imageData ? 'image' : 'text', imageData);

    try {
      const startTime = Date.now();
      let response;
      
      if (imageData) {
        // Send image with text prompt to GupShup AI
        response = await sendImageToGemini(imageData, message || "What's in this image?");
      } else {
        // Send text message with conversation history to GupShup AI
        response = await sendMessageToGemini(message, 0, geminiMessages);
      }

      const processingTime = Date.now() - startTime;

      // Add GupShup AI's response to conversation
      const geminiMessage = {
        _id: (Date.now() + 1).toString(),
        text: response,
        senderId: 'gupshup-ai',
        createdAt: new Date().toISOString(),
        messageType: 'text',
      };

      set({ 
        geminiMessages: [...get().geminiMessages, geminiMessage],
        isGeminiLoading: false 
      });

      // Save assistant response to database
      saveChatMessage('assistant', response, 'text', null, {
        model: 'gemini-2.0-flash-lite',
        processingTime,
      });

    } catch (error) {
      console.error('Error in GupShup AI conversation:', error);
      toast.error('Failed to get response from GupShup AI');
      
      // Add error message
      const errorMessage = {
        _id: (Date.now() + 1).toString(),
        text: 'Sorry, I encountered an error. Please try again.',
        senderId: 'gupshup-ai',
        createdAt: new Date().toISOString(),
        messageType: 'text',
      };

      set({ 
        geminiMessages: [...get().geminiMessages, errorMessage],
        isGeminiLoading: false 
      });
    }
  },

  clearGeminiMessages: async () => {
    try {
      const response = await apiCall('/api/gemini/history', {
        method: 'DELETE',
      });
      const data = await response.json();
      
      if (data.success) {
        set({ geminiMessages: [] });
        toast.success('Chat history cleared');
      }
    } catch (error) {
      console.error('Error clearing chat history:', error);
      toast.error('Failed to clear chat history');
    }
  },

  getChatStats: async () => {
    try {
      const response = await apiCall('/api/gemini/stats');
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching chat stats:', error);
      return null;
    }
  },
}));