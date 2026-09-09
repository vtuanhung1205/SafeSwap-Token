// This file is used to check if environment variables are properly set
export const checkEnv = () => {
  return {
    apiUrl: import.meta.env.VITE_API_URL,
    wsUrl: import.meta.env.VITE_WEBSOCKET_URL
  };
};