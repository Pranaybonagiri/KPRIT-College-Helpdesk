const { crawlWebsite } = require("./crawler.service");

async function buildKnowledgeBase() {
  console.log("Starting KPRIT knowledge collection...");

  const pages = await crawlWebsite();

  const documents = pages.map((page) => ({
    content: page.text,
    metadata: {
      title: page.title,
      url: page.url,
      source: "KPRIT Official Website",
    },
  }));

  console.log(`Knowledge documents created: ${documents.length}`);

  return documents;
}

module.exports = {
  buildKnowledgeBase,
};