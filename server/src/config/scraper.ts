import metascraper from "metascraper";
import title from "metascraper-title";
import image from "metascraper-image";
import description from "metascraper-description";

const scraper = metascraper([title(), image(), description()]);

export default scraper;
