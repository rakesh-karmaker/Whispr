import got from "got";
import redisClient from "../config/redis/client.js";
import scraper from "../config/scraper.js";

export type URLMetaData = {
  title: string;
  description: string;
  imageURL: string;
};

// Array of realistic User-Agents to rotate through
const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15",
];

async function fetchWithRetry(
  url: string,
  maxRetries = 3
): Promise<{ body: string; url: string }> {
  let lastError: Error = new Error("Failed to fetch after retries");

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const userAgent = USER_AGENTS[attempt % USER_AGENTS.length];

      const response = await got.get(url, {
        headers: {
          "User-Agent": userAgent,
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
          "Accept-Language": "en-US,en;q=0.9",
          "Accept-Encoding": "gzip, deflate, br",
          DNT: "1",
          Connection: "keep-alive",
          "Upgrade-Insecure-Requests": "1",
          "Sec-Fetch-Dest": "document",
          "Sec-Fetch-Mode": "navigate",
          "Sec-Fetch-Site": "none",
          "Sec-Fetch-User": "?1",
          "Cache-Control": "max-age=0",
        },
        timeout: {
          request: 10000, // 10 seconds
        },
        retry: 0, // Disable got's built-in retry
        followRedirect: true,
      });

      return { body: response.body, url: response.url };
    } catch (error: unknown) {
      lastError = error as Error;

      const isGotError = (
        err: unknown
      ): err is { response?: { statusCode?: number }; code?: string } => {
        return typeof err === "object" && err !== null;
      };

      if (isGotError(error) && error.response?.statusCode === 403) {
        console.warn(
          `Attempt ${attempt + 1} failed with 403 for ${url}, trying different User-Agent...`
        );
        // Wait before retrying with different User-Agent
        await new Promise((resolve) =>
          setTimeout(resolve, 1000 * (attempt + 1))
        );
        continue;
      }

      if (isGotError(error) && error.response?.statusCode === 429) {
        console.warn(`Rate limited (429) for ${url}, waiting before retry...`);
        await new Promise((resolve) =>
          setTimeout(resolve, 2000 * (attempt + 1))
        );
        continue;
      }

      if (
        isGotError(error) &&
        (error.code === "ETIMEDOUT" || error.code === "ECONNRESET")
      ) {
        console.warn(`Network error (${error.code}) for ${url}, retrying...`);
        await new Promise((resolve) =>
          setTimeout(resolve, 500 * (attempt + 1))
        );
        continue;
      }

      // For other errors, don't retry
      break;
    }
  }

  throw lastError;
}

export default async function scrapeURLMetaData(
  url: string
): Promise<URLMetaData> {
  if (!url) return { title: "", description: "", imageURL: "" };

  // check if url data exists
  const data: URLMetaData = JSON.parse(
    (await redisClient.get(`url_data:${url}`)) || "{}"
  );

  if (!data.title || !data.description || !data.imageURL) {
    // fetch new data with retry logic
    const { body: html, url: finalUrl } = await fetchWithRetry(url);

    const metadata = await scraper({ html, url: finalUrl });

    const newData: URLMetaData = {
      title: metadata.title ?? "",
      description: metadata.description ?? "",
      imageURL: metadata.image ?? "",
    };

    // Only cache if we got meaningful data
    if (newData.title || newData.description || newData.imageURL) {
      await redisClient.set(`url_data:${url}`, JSON.stringify(newData));
      await redisClient.expire(`url_data:${url}`, 60 * 60 * 24 * 3); // 3 days
    }

    return newData;
  }

  return {
    title: data.title ?? "",
    description: data.description ?? "",
    imageURL: data.imageURL ?? "",
  };
}
