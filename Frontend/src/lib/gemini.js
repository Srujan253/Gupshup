// OpenRouter API configuration for Gemini
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Rate limiting configuration with persistence
let lastRequestTime = parseInt(localStorage.getItem('gupshup_last_request_time') || '0');
const MIN_REQUEST_INTERVAL = 10000; // 10 seconds between requests (very conservative)
let requestCount = 0;
const MAX_REQUESTS_PER_MINUTE = 3; // Very conservative limit for free tier
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

export const sendMessageToGemini = async (message) => {
  console.log('🤖 Attempting to send message to GupShup AI...');
  
  // Check if we can make a request BEFORE attempting it
  const rateLimitCheck = canMakeRequest();
  if (!rateLimitCheck.canRequest) {
    console.log(`⏱️ Rate limit check failed: ${rateLimitCheck.reason}. Wait ${rateLimitCheck.waitTime}s`);
    throw new Error(`Rate limit: Please wait ${rateLimitCheck.waitTime} seconds before sending another message.`);
  }
  
  if (!API_KEY) {
    throw new Error('OpenRouter API key not found. Please add VITE_GEMINI_API_KEY to your .env file.');
  }

  try {
    // Now wait for any additional rate limiting if needed
    await waitForRateLimit();
    
    console.log('🤖 Sending message to GupShup AI via OpenRouter...');
    
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'GupShup Chat Application'
      },
      body: JSON.stringify({
        model: 'google/gemini-2.0-flash-exp:free', // Free Gemini model on OpenRouter
        messages: [
          {
            role: 'system',
            content: SYSTEM_PROMPT
          },
          {
            role: 'user',
            content: message
          }
        ],
        max_tokens: 800, // Reduced to be conservative
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      if (response.status === 429) {
        // Rate limit hit - don't retry automatically, let user wait
        throw new Error(`Rate limit exceeded. Please wait ${MIN_REQUEST_INTERVAL/1000} seconds before trying again.`);
      }
      
      if (response.status === 402) {
        throw new Error('Credit limit reached. Please check your OpenRouter account or try again later.');
      }
      
      throw new Error(`OpenRouter API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response format from OpenRouter API');
    }
    
    console.log('✅ Successfully received response from GupShup AI');
    return data.choices[0].message.content;
  } catch (error) {
    console.error('❌ Error communicating with Gemini via OpenRouter:', error);
    
    // Provide user-friendly error messages
    if (error.message.includes('Rate limit')) {
      throw new Error('Too many requests. Please wait a moment before trying again.');
    }
    
    if (error.message.includes('Credit limit')) {
      throw new Error('API usage limit reached. Please try again later.');
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
    
    // Convert base64 image to the format OpenRouter expects
    const imageBase64 = imageData.replace(/^data:image\/[a-z]+;base64,/, '');
    const mimeType = imageData.match(/^data:(image\/[a-z]+);base64,/)?.[1] || 'image/jpeg';
    
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'GupShup Chat Application'
      },
      body: JSON.stringify({
        model: 'google/gemini-2.0-flash-exp:free', // Free Gemini model with vision support
        messages: [
          {
            role: 'system',
            content: SYSTEM_PROMPT
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mimeType};base64,${imageBase64}`
                }
              }
            ]
          }
        ],
        max_tokens: 800, // Reduced to be conservative
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please wait a moment before analyzing another image.');
      }
      
      if (response.status === 402) {
        throw new Error('Credit limit reached. Please check your OpenRouter account or try again later.');
      }
      
      throw new Error(`OpenRouter API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response format from OpenRouter API');
    }
    
    console.log('✅ Successfully analyzed image with GupShup AI');
    return data.choices[0].message.content;
  } catch (error) {
    console.error('❌ Error sending image to Gemini via OpenRouter:', error);
    
    // Provide user-friendly error messages
    if (error.message.includes('Rate limit')) {
      throw new Error('Too many requests. Please wait before analyzing another image.');
    }
    
    if (error.message.includes('Credit limit')) {
      throw new Error('API usage limit reached. Please try again later.');
    }
    
    if (error.message.includes('fetch')) {
      throw new Error('Network error. Please check your internet connection.');
    }
    
    throw new Error('Failed to analyze image with GupShup AI. Please try again.');
  }
};