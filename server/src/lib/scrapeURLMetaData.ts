import got from "got";
import redisClient from "@/config/redis/client.js";
import scraper from "@/config/scraper.js";

export type URLMetaData = {
  title: string;
  description: string;
  image: string;
};

export default async function scrapeURLMetaData(
  url: string
): Promise<URLMetaData> {
  if (!url) return { title: "", description: "", image: "" };

  // clean the url
  url = url.replace("https://", "").replace("http://", "").replace("www.", "");

  // check if url data exists
  const data: URLMetaData = JSON.parse(
    (await redisClient.get(`url_data:${url}`)) || "{}"
  );

  if (!data.title || !data.description || !data.image) {
    // fetch new data and store it
    const { body: html, url: finalUrl } = await got.get(url);
    const metadata = await scraper({ html, url: finalUrl });
    const newData: URLMetaData = {
      title: metadata.title ?? "",
      description: metadata.description ?? "",
      image: metadata.image ?? "",
    };

    await redisClient.set(`url_data:${url}`, JSON.stringify(newData));
    await redisClient.expire(`url_data:${url}`, 60 * 60 * 24); // 1 day
    return newData;
  }

  return {
    title: data.title ?? "",
    description: data.description ?? "",
    image: data.image ?? "",
  };
}
