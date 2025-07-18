// This file is used to check if environment variables are properly set
console.log('API URL:', import.meta.env.VITE_API_URL);
console.log('WebSocket URL:', import.meta.env.VITE_WEBSOCKET_URL);

export const checkEnv = () => {
  console.log('API URL from function:', import.meta.env.VITE_API_URL);
  console.log('WebSocket URL from function:', import.meta.env.VITE_WEBSOCKET_URL);
  return {
    apiUrl: import.meta.env.VITE_API_URL,
    wsUrl: import.meta.env.VITE_WEBSOCKET_URL
  };
}; 