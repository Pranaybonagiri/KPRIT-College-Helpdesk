const axios = require("axios");
const cheerio = require("cheerio");
const robotsParser = require("robots-parser");

const BASE_URL = "https://kpritech.ac.in/";
const MAX_PAGES = 200;

async function crawlWebsite() {
  const robotsUrl = new URL("/robots.txt", BASE_URL).href;
  const robotsResponse = await axios.get(robotsUrl).catch(() => ({ data: "" }));

  const robots = robotsParser(robotsUrl, robotsResponse.data);

  const visited = new Set();
  const queue = [BASE_URL];
  const pages = [];

  while (queue.length > 0 && pages.length < MAX_PAGES) {
    const url = queue.shift();

    if (visited.has(url)) continue;
    visited.add(url);

    if (!robots.isAllowed(url, "KPRIT-Helpdesk-Agent")) {
      continue;
    }

    try {
      console.log(`Crawling: ${url}`);

      const response = await axios.get(url, {
        timeout: 15000,
        headers: {
          "User-Agent": "KPRIT-Helpdesk-Agent",
        },
      });

      const contentType = response.headers["content-type"] || "";

      if (!contentType.includes("text/html")) continue;

      const $ = cheerio.load(response.data);

      $("script, style, noscript, header, footer, nav").remove();

      const title = $("title").text().trim();
      const text = $("body").text().replace(/\s+/g, " ").trim();

      if (text.length > 100) {
        pages.push({
          url,
          title,
          text,
        });
      }

      $("a[href]").each((_, element) => {
        const href = $(element).attr("href");

        if (!href) return;

        try {
          const nextUrl = new URL(href, url);

          const blockedExtensions = [
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".webp",
  ".svg",
  ".pdf",
  ".mp4",
  ".mp3",
  ".zip",
];

const pathname = nextUrl.pathname.toLowerCase();

if (
  nextUrl.hostname === new URL(BASE_URL).hostname &&
  ["http:", "https:"].includes(nextUrl.protocol) &&
  !blockedExtensions.some((ext) => pathname.endsWith(ext))
){
            nextUrl.hash = "";

            const normalizedUrl = nextUrl.href;

            if (!visited.has(normalizedUrl) && !queue.includes(normalizedUrl)) {
              queue.push(normalizedUrl);
            }
          }
        } catch {
          // Ignore invalid URLs
        }
      });
    } catch (error) {
      console.log(`Failed: ${url}`);
    }
  }

  console.log(`Crawled ${pages.length} pages`);

  return pages;
}

module.exports = {
  crawlWebsite,
};