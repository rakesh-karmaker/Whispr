import metascraper from "metascraper";
import title from "metascraper-title";
import image from "metascraper-image";

const scraper = metascraper([title(), image()]);

export default scraper;
