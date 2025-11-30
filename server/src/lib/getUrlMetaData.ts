import redisClient from "../config/redis/client.js";
import { URLMetaData } from "./scrapeURLMetaData.js";

export default async function getUrlMetaData(
  url: string
): Promise<URLMetaData> {
  try {
    // check if url data exists
    const data: URLMetaData = JSON.parse(
      (await redisClient.get(`url_data:${url}`)) || "{}"
    );

    // return if both title and imageURL exist
    if (data.title && data.imageURL) {
      return { title: data.title, imageURL: data.imageURL };
    } else {
      return { title: "", imageURL: "" };
    }
  } catch (error) {
    console.error("Error fetching URL metadata:", error);
    return { title: "", imageURL: "" };
  }
}
