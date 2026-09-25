const { crawlWebsite } = require("./crawler.service");

crawlWebsite()
  .then((pages) => {
    console.log("Total pages:", pages.length);

    pages.slice(0, 5).forEach((page, index) => {
      console.log(`\n--- Page ${index + 1} ---`);
      console.log("Title:", page.title);
      console.log("URL:", page.url);
      console.log("Text:", page.text.slice(0, 300));
    });
  })
  .catch((error) => {
    console.error("Crawler error:", error.message);
  });