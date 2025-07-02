import { Redis } from "ioredis";
import config from "@/config/config.js";

const redisClient = new Redis(config.redisUrl);

export default redisClient;
