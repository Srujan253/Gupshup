import { create } from 'zustand';
import { sendMessageToGemini, sendImageToGemini } from '../lib/gemini.js';
import toast from 'react-hot-toast';

export const useGeminiStore = create((set, get) => ({
  geminiMessages: [],
  isGeminiLoading: false,
  
  // Virtual GupShup AI user object for UI consistency
  geminiUser: {
    _id: 'gupshup-ai',
    fullname: 'GupShup AI',
    email: 'ai@gupshup.com',
    profilePic: '/gupshup-ai-avatar.svg',
  },

  sendMessageToGemini: async (message, imageData = null) => {
    const { geminiMessages } = get();
    
    // Add user message to conversation
    const userMessage = {
      _id: Date.now().toString(),
      text: message,
      image: imageData,
      senderId: 'user',
      createdAt: new Date().toISOString(),
    };
    
    set({ 
      geminiMessages: [...geminiMessages, userMessage],
      isGeminiLoading: true 
    });

    try {
      let response;
      
      if (imageData) {
        // Send image with text prompt to GupShup AI
        response = await sendImageToGemini(imageData, message || "What's in this image?");
      } else {
        // Send text message to GupShup AI
        response = await sendMessageToGemini(message);
      }

      // Add GupShup AI's response to conversation
      const geminiMessage = {
        _id: (Date.now() + 1).toString(),
        text: response,
        senderId: 'gupshup-ai',
        createdAt: new Date().toISOString(),
      };

      set({ 
        geminiMessages: [...get().geminiMessages, geminiMessage],
        isGeminiLoading: false 
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
      };

      set({ 
        geminiMessages: [...get().geminiMessages, errorMessage],
        isGeminiLoading: false 
      });
    }
  },

  clearGeminiMessages: () => {
    set({ geminiMessages: [] });
  },
}));