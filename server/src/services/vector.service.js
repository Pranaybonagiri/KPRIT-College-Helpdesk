const { GoogleGenerativeAIEmbeddings } = require("@langchain/google-genai");
const { MongoClient } = require("mongodb");
const { RecursiveCharacterTextSplitter } = require("@langchain/textsplitters");

const embeddings = new GoogleGenerativeAIEmbeddings({
  apiKey: process.env.GOOGLE_API_KEY,
  model: "gemini-embedding-001",
});

async function createVectorStore(documents) {
  const client = new MongoClient(process.env.MONGODB_URI);

  try {
    await client.connect();

    const db = client.db("kprit_helpdesk");
    const collection = db.collection("kprit_knowledge");

    await collection.deleteMany({});

    console.log("Old documents deleted");

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const splitDocuments = await splitter.splitDocuments(
      documents.map((doc) => ({
        pageContent: doc.content,
        metadata: doc.metadata,
      }))
    );

    console.log(`Created ${splitDocuments.length} text chunks`);

    // Create embeddings
    const texts = splitDocuments.map((doc) => doc.pageContent);

    const vectors = await embeddings.embedDocuments(texts);

    console.log(`Generated ${vectors.length} embeddings`);
    console.log(`Embedding dimensions: ${Array.from(vectors[0]).length}`);

    // Store manually in MongoDB
    const mongoDocuments = splitDocuments.map((doc, index) => ({
      text: doc.pageContent,
      embedding: Array.from(vectors[index]),
      metadata: doc.metadata,
    }));

    await collection.insertMany(mongoDocuments);

    const stored = await collection.findOne({});

    console.log(
  `Stored embedding dimensions: ${Array.from(stored.embedding).length}`
);

    console.log("Documents stored successfully in MongoDB Atlas");
  } finally {
    await client.close();
  }
}

module.exports = {
  createVectorStore,
};