import dotenv from "dotenv";
dotenv.config();

interface Config {
  port: number;
  nodeEnv: string;
  mongoUrl: string;
  imagekitPublicKey: string;
  imagekitPrivateKey: string;
}

const config: Config = {
  port: Number(process.env.PORT) || 5000,
  nodeEnv: process.env.NODE_ENV || "development",
  mongoUrl: process.env.MONGO_URL || "",
  imagekitPublicKey: process.env.IMAGEKIT_PUBLIC_KEY || "",
  imagekitPrivateKey: process.env.IMAGEKIT_PRIVATE_KEY || "",
};

export default config;
