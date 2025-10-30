// API configuration that works in both development and production
const getApiUrl = () => {
  // In production, use relative URLs (same domain as frontend)
  if (import.meta.env.PROD) {
    return '';
  }
  
  // In development, use the backend server URL
  return import.meta.env.VITE_API_URL || 'http://localhost:5001';
};

export const API_BASE_URL = getApiUrl();

// Helper function for making API calls
export const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Include cookies for authentication
  };

  const finalOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  const response = await fetch(url, finalOptions);
  return response;
};