import scrapeURLMetaData from "../lib/scrapeURLMetaData.js";
import { MessageType } from "../types/modelType.js";

export default async function addMetaTag(messages: MessageType[]) {
  const newMessages = await Promise.all(
    messages.map(async (message: MessageType) => {
      if (
        (message.messageType === "link" || message.messageType === "hybrid") &&
        message.link &&
        message.link.url
      ) {
        // Normalize the URL to ensure it has a protocol
        let normalizedUrl = message.link.url;
        // Ensure protocol
        if (!/^https?:\/\//i.test(normalizedUrl)) {
          normalizedUrl = "https://" + normalizedUrl;
        }
        // Ensure www if not present and not a subdomain
        const urlObj = new URL(normalizedUrl);
        if (
          !/^www\./i.test(urlObj.hostname) &&
          urlObj.hostname.split(".").length === 2 // e.g., example.com
        ) {
          urlObj.hostname = "www." + urlObj.hostname;
          normalizedUrl = urlObj.toString();
        }

        const metaData = await scrapeURLMetaData(normalizedUrl);

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
