import { GoogleGenerativeAI } from '@google/generative-ai';

// Project context for Gemini AI assistant
const PROJECT_CONTEXT = {
  "project": {
    "name": "GupShup",
    "type": "Real-time Chat Application",
    "description": "A secure, full-stack real-time chat application with AI integration",
    "purpose": "Academic final project demonstrating secure full-stack development practices"
  },
  "technology_stack": {
    "frontend": "React.js + Vite + Tailwind CSS + DaisyUI + Zustand + Socket.io",
    "backend": "Node.js + Express.js + MongoDB + Mongoose + JWT + Cloudinary",
    "ai_integration": "Google Generative AI (Gemini) with GupShup AI branding"
  },
  "team": {
    "leader": "Srujan H M",
    "members": ["Srujan H M", "S K Thilak Raj", "Balaji V Kodle"],
    "course": "Secure Full Stack Development",
    "branch": "Cyber Security"
  },
  "features": [
    "Real-time messaging", "User authentication", "Profile management", 
    "Image sharing", "AI chat assistant", "Image analysis"
  ],
  "security_focus": [
    "Password encryption with bcryptjs", "JWT authentication", 
    "Input validation", "Secure file uploads", "CORS protection"
  ]
};

// System prompt for Gemini to understand the project context
const SYSTEM_PROMPT = `You are GupShup AI, an intelligent assistant integrated into the GupShup chat application. 

Project Context: ${JSON.stringify(PROJECT_CONTEXT, null, 2)}

You are helping users of this MERN stack chat application. You can:
1. Answer questions about web development, React, Node.js, MongoDB
2. Help with coding problems related to the tech stack
3. Provide guidance on security best practices
4. Analyze images that users share
5. Assist with general queries while maintaining the context of being part of GupShup

Always be helpful, concise, and remember you're integrated into this specific chat application built by cybersecurity students.`;

// Initialize Gemini AI with API key from environment variables
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

// Get the generative model
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

export const sendMessageToGemini = async (message) => {
  try {
    // Create a chat session with system context
    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: SYSTEM_PROMPT }]
        },
        {
          role: "model", 
          parts: [{ text: "Hello! I'm GupShup AI, your intelligent assistant integrated into this chat application. I understand the project context and I'm here to help with development questions, provide coding assistance, analyze images, and support your team's work on this secure MERN stack application. How can I assist you today?" }]
        }
      ],
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.7,
      },
    });

    // Send message to Gemini
    const result = await chat.sendMessage(message);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error communicating with Gemini:', error);
    throw new Error('Failed to get response from GupShup AI');
  }
};

export const sendImageToGemini = async (imageData, prompt = "What's in this image? Please analyze it in the context of the GupShup chat application if relevant.") => {
  try {
    // Convert base64 image to the format Gemini expects
    const imageBase64 = imageData.replace(/^data:image\/[a-z]+;base64,/, '');
    
    const imageParts = [
      {
        inlineData: {
          data: imageBase64,
          mimeType: "image/jpeg"
        }
      }
    ];

    // Include system context in image analysis
    const contextualPrompt = `${SYSTEM_PROMPT}\n\nUser has shared an image. ${prompt}`;

    const result = await model.generateContent([contextualPrompt, ...imageParts]);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error sending image to Gemini:', error);
    throw new Error('Failed to analyze image with GupShup AI');
  }
};