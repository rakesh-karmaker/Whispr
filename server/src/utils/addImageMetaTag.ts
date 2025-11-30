import getUrlMetaData from "../lib/getUrlMetaData.js";
import { MessageType } from "../types/modelType.js";

export default async function addMetaTag(messages: MessageType[]) {
  const newMessages = await Promise.all(
    messages.map(async (message: MessageType) => {
      if (
        (message.messageType === "link" || message.messageType === "hybrid") &&
        message.link &&
        message.link.url
      ) {
        const url = message.link.url;

        // Fetch metadata from redis
        const metaData = await getUrlMetaData(url);

        return {
          ...message,
          link: {
            ...message.link,
            ...metaData,
          },
        };
      } else {
        return message;
      }
    })
  );

  return newMessages;
}
