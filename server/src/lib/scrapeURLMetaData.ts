import got from "got";
import redisClient from "../config/redis/client.js";
import scraper from "../config/scraper.js";

export type URLMetaData = {
  title: string;
  description: string;
  imageURL: string;
};

export default async function scrapeURLMetaData(
  url: string
): Promise<URLMetaData> {
  if (!url) return { title: "", description: "", imageURL: "" };

  // check if url data exists
  const data: URLMetaData = JSON.parse(
    (await redisClient.get(`url_data:${url}`)) || "{}"
  );

  if (!data.title || !data.description || !data.imageURL) {
    // fetch new data and store it
    const { body: html, url: finalUrl } = await got.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
          "(KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36 ",
        Accept: "text/html",
      },
    });
    const metadata = await scraper({ html, url: finalUrl });
    const newData: URLMetaData = {
      title: metadata.title ?? "",
      description: metadata.description ?? "",
      imageURL: metadata.image ?? "",
    };

    await redisClient.set(`url_data:${url}`, JSON.stringify(newData));
    await redisClient.expire(`url_data:${url}`, 60 * 60 * 24); // 1 day
    return newData;
  }

  return {
    title: data.title ?? "",
    description: data.description ?? "",
    imageURL: data.imageURL ?? "",
  };
}
