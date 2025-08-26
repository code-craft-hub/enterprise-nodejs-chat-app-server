export const config = {
  port: process.env.PORT || 3001,
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5173",
  jwtSecret: process.env.JWT_SECRET || "your-super-secret-jwt-key",
  mongoUrl: process.env.MONGO_URL || "mongodb://localhost:27017/enterprise-chat",
  redis: {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379"),
    password: process.env.REDIS_PASSWORD || undefined,
  },
  environment: process.env.NODE_ENV || "development",
};