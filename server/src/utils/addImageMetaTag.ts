import redisClient from "../config/redis/client.js";
import scrapeURLMetaData from "../lib/scrapeURLMetaData.js";
import { MessageType } from "../types/modelType.js";

export default async function addImageMetaTag(messages: MessageType[]) {
  const newMessages = await Promise.all(
    messages.map(async (message: MessageType) => {
      if (message.messageType === "link" && message.link) {
        const metaData = JSON.parse(
          (await redisClient.get(`linkPreview:${message.link.url}`)) || "{}"
        );
        if (Object.keys(metaData).length !== 0) {
          return {
            ...message,
            link: {
              ...message.link,
              ...metaData,
            },
          };
        } else {
          // get new metaData
          const newMetaData = await scrapeURLMetaData(message.link.url);
          await redisClient.set(
            `linkPreview:${message.link.url}`,
            JSON.stringify(newMetaData)
          );
          await redisClient.expire(
            `linkPreview:${message.link.url}`,
            60 * 60 * 24 * 7 // 7 days
          );
          return {
            ...message,
            link: {
              ...message.link,
              ogImageURL: newMetaData.image,
              ogTitle: newMetaData.title,
              ogDescription: newMetaData.description,
            },
          };
        }
      } else {
        return message;
      }
    })
  );

  return newMessages;
}
