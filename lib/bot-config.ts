export const botConfig = {
  apiUrl: process.env.NEXT_PUBLIC_BOT_API_URL || "http://localhost:3001",
  environment: process.env.NEXT_PUBLIC_ENVIRONMENT || "development",
  isProduction: process.env.NEXT_PUBLIC_ENVIRONMENT === "production",
  isDevelopment: process.env.NEXT_PUBLIC_ENVIRONMENT === "development",
};

export const getBotApiUrl = (endpoint: string = "") => {
  return `${botConfig.apiUrl}${endpoint}`;
};

export const getSocketConfig = () => ({
  url: botConfig.apiUrl,
  options: {
    timeout: 5000,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    transports: ["websocket", "polling"],
  },
});

// Connection health check
export const checkBotConnection = async (): Promise<boolean> => {
  try {
    const response = await fetch(getBotApiUrl("/api/bot/status"), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    if (!response.ok) {
      console.error("Failed to check bot connection:", response.statusText);
      return false;
    }
    return response.ok;
  } catch (error) {
    console.error("Bot connection check failed:", error);
    return false;
  }
};
