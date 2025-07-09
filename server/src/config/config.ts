import dotenv from "dotenv";
dotenv.config();

interface Config {
  port: number;
  nodeEnv: string;
  mongoUrl: string;
  serverUrl: string;
  clientUrl: string;
  imagekitPublicKey: string;
  imagekitPrivateKey: string;
  redisUrl: string;
  googleClientId: string;
  googleClientSecret: string;
  mailAddress: string;
  mailPass: string;
  cloudinaryCloudName: string;
  cloudinaryApiKey: string;
  cloudinaryApiSecret: string;
  jwtSecret: string;
}

const config: Config = {
  port: Number(process.env.PORT) || 5000,
  nodeEnv: process.env.NODE_ENV || "development",
  mongoUrl: process.env.MONGO_URL || "",
  serverUrl: process.env.SERVER_URL || "",
  clientUrl: process.env.CLIENT_URL || "",
  imagekitPublicKey: process.env.IMAGEKIT_PUBLIC_KEY || "",
  imagekitPrivateKey: process.env.IMAGEKIT_PRIVATE_KEY || "",
  redisUrl: process.env.REDIS_URL || "",
  googleClientId: process.env.GOOGLE_CLIENT_ID || "",
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
  mailAddress: process.env.MAIL_ADDRESS || "",
  mailPass: process.env.MAIL_PASS || "",
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY || "",
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET || "",
  jwtSecret: process.env.JWT_SECRET || "",
};

export default config;
