// Google Gemini API configuration
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent';
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Rate limiting configuration with persistence - More conservative for Gemini free tier
let lastRequestTime = parseInt(localStorage.getItem('gupshup_last_request_time') || '0');
const MIN_REQUEST_INTERVAL = 15000; // 15 seconds between requests (very conservative)
let requestCount = 0;
const MAX_REQUESTS_PER_MINUTE = 4; // Very conservative - Gemini free tier is 15/min but we stay safe
let requestTimes = JSON.parse(localStorage.getItem('gupshup_request_times') || '[]');

// Clean old request times on load
const now = Date.now();
requestTimes = requestTimes.filter(time => now - time < 60000);
localStorage.setItem('gupshup_request_times', JSON.stringify(requestTimes));

// Check if we can make a request without actually making it
export const canMakeRequest = () => {
  const now = Date.now();
  
  // Clean old requests
  requestTimes = requestTimes.filter(time => now - time < 60000);
  
  // Check rate limits
  if (requestTimes.length >= MAX_REQUESTS_PER_MINUTE) {
    return {
      canRequest: false,
      reason: 'Rate limit exceeded',
      waitTime: Math.ceil((60000 - (now - Math.min(...requestTimes))) / 1000)
    };
  }
  
  // Check minimum interval
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    return {
      canRequest: false,
      reason: 'Too soon',
      waitTime: Math.ceil((MIN_REQUEST_INTERVAL - timeSinceLastRequest) / 1000)
    };
  }
  
  return { canRequest: true };
};

// Utility to clear rate limit data (for debugging or if user gets stuck)
export const clearRateLimitData = () => {
  localStorage.removeItem('gupshup_last_request_time');
  localStorage.removeItem('gupshup_request_times');
  lastRequestTime = 0;
  requestTimes = [];
  console.log('✅ Rate limit data cleared');
};

// Simple rate limiter with persistence (no automatic retries)
const waitForRateLimit = async () => {
  const now = Date.now();
  
  // Remove requests older than 1 minute
  requestTimes = requestTimes.filter(time => now - time < 60000);
  
  // Ensure minimum interval between requests
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    const waitTime = MIN_REQUEST_INTERVAL - timeSinceLastRequest;
    console.log(`⏱️ Throttling request. Waiting ${waitTime}ms...`);
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }
  
  lastRequestTime = Date.now();
  requestTimes.push(lastRequestTime);
  
  // Save to localStorage for persistence
  localStorage.setItem('gupshup_last_request_time', lastRequestTime.toString());
  localStorage.setItem('gupshup_request_times', JSON.stringify(requestTimes));
};

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

export const sendMessageToGemini = async (message, retryCount = 0) => {
  console.log('🤖 Attempting to send message to GupShup AI...');
  
  // Check if we can make a request BEFORE attempting it
  const rateLimitCheck = canMakeRequest();
  if (!rateLimitCheck.canRequest) {
    console.log(`⏱️ Rate limit check failed: ${rateLimitCheck.reason}. Wait ${rateLimitCheck.waitTime}s`);
    throw new Error(`Rate limit: Please wait ${rateLimitCheck.waitTime} seconds before sending another message.`);
  }
  
  if (!API_KEY) {
    throw new Error('Gemini API key not found. Please add VITE_GEMINI_API_KEY to your .env file.');
  }

  try {
    // Now wait for any additional rate limiting if needed
    await waitForRateLimit();
    
    console.log('🤖 Sending message to GupShup AI via Google Gemini...');
    
    const response = await fetch(`${GEMINI_API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `${SYSTEM_PROMPT}\n\nUser: ${message}`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 800, // Reduced to be conservative
          topP: 0.8,
          topK: 10
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      if (response.status === 429) {
        const errorMessage = errorData.error?.message || '';
        
        // Check if it's a quota exhaustion vs rate limit
        if (errorMessage.toLowerCase().includes('quota') || errorMessage.toLowerCase().includes('daily')) {
          console.error('🚫 Daily quota exhausted:', errorMessage);
          throw new Error('Gemini API daily quota exhausted (1,500 requests/day). Please wait until midnight Pacific Time for reset, or create a new API key at https://makersuite.google.com/app/apikey');
        }
        
        // Rate limit hit - implement exponential backoff retry
        if (retryCount < 2) {
          const waitTime = Math.pow(2, retryCount) * 20000; // 20s, 40s
          console.log(`⏱️ Rate limited. Auto-retrying in ${waitTime/1000}s... (attempt ${retryCount + 1}/2)`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          return sendMessageToGemini(message, retryCount + 1);
        } else {
          // Update local rate limit tracking to prevent immediate retries
          const now = Date.now();
          lastRequestTime = now;
          requestTimes.push(now);
          localStorage.setItem('gupshup_last_request_time', lastRequestTime.toString());
          localStorage.setItem('gupshup_request_times', JSON.stringify(requestTimes));
          
          console.error('🚫 Persistent 429 error - likely quota exhaustion');
          throw new Error('Gemini API quota may be exhausted. Please create a new API key at https://makersuite.google.com/app/apikey or wait for daily reset at midnight Pacific Time.');
        }
      }
      
      if (response.status === 403) {
        throw new Error('API key is invalid or has been disabled. Please check your Gemini API key.');
      }
      
      if (response.status === 400) {
        const errorMsg = errorData.error?.message || 'Invalid request';
        throw new Error(`Request error: ${errorMsg}. Please try a different message.`);
      }
      
      throw new Error(`Gemini API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('Invalid response format from Gemini API');
    }
    
    const responseText = data.candidates[0].content.parts[0].text;
    console.log('✅ Successfully received response from GupShup AI');
    return responseText;
  } catch (error) {
    console.error('❌ Error communicating with Gemini:', error);
    
    // Provide user-friendly error messages
    if (error.message.includes('Rate limit')) {
      throw new Error('Too many requests. Please wait 15-20 seconds before trying again.');
    }
    
    if (error.message.includes('API key')) {
      throw new Error('API key error. Please check your configuration.');
    }
    
    if (error.message.includes('fetch')) {
      throw new Error('Network error. Please check your internet connection.');
    }
    
    throw new Error('Failed to get response from GupShup AI. Please try again.');
  }
};

export const sendImageToGemini = async (imageData, prompt = "What's in this image? Please analyze it in the context of the GupShup chat application if relevant.") => {
  try {
    // Wait for rate limit
    await waitForRateLimit();
    
    console.log('🖼️ Sending image to GupShup AI for analysis...');
    
    // Convert base64 image to the format Gemini expects
    const imageBase64 = imageData.replace(/^data:image\/[a-z]+;base64,/, '');
    const mimeType = imageData.match(/^data:(image\/[a-z]+);base64,/)?.[1] || 'image/jpeg';
    
    // Use gemini-2.0-flash-lite for image analysis (supports vision with best rate limits)
    const visionUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent';
    
    const response = await fetch(`${visionUrl}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `${SYSTEM_PROMPT}\n\n${prompt}`
              },
              {
                inline_data: {
                  mime_type: mimeType,
                  data: imageBase64
                }
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000,
          topP: 0.8,
          topK: 10
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please wait a moment before analyzing another image.');
      }
      
      if (response.status === 403) {
        throw new Error('API key is invalid or has been disabled. Please check your Gemini API key.');
      }
      
      if (response.status === 400) {
        throw new Error('Invalid image format or request. Please try a different image.');
      }
      
      throw new Error(`Gemini API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('Invalid response format from Gemini API');
    }
    
    const responseText = data.candidates[0].content.parts[0].text;
    console.log('✅ Successfully analyzed image with GupShup AI');
    return responseText;
  } catch (error) {
    console.error('❌ Error sending image to Gemini:', error);
    
    // Provide user-friendly error messages
    if (error.message.includes('Rate limit')) {
      throw new Error('Too many requests. Please wait before analyzing another image.');
    }
    
    if (error.message.includes('API key')) {
      throw new Error('API key error. Please check your configuration.');
    }
    
    if (error.message.includes('fetch')) {
      throw new Error('Network error. Please check your internet connection.');
    }
    
    throw new Error('Failed to analyze image with GupShup AI. Please try again.');
  }
};