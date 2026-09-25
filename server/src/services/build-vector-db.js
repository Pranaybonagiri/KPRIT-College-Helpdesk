require("dotenv").config();

const { buildKnowledgeBase } = require("./knowledge.service");
const { createVectorStore } = require("./vector.service");

async function buildVectorDatabase() {
  try {
    console.log("Building KPRIT vector database...");

    const documents = await buildKnowledgeBase();

    await createVectorStore(documents);

    console.log("\n✅ KPRIT Vector Database Ready!");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Vector database error:");
    console.error(error);
    process.exit(1);
  }
}

buildVectorDatabase();