require("dotenv").config();

const { MongoClient } = require("mongodb");
const { GoogleGenerativeAIEmbeddings } = require("@langchain/google-genai");

const client = new MongoClient(process.env.MONGODB_URI);

const embeddings = new GoogleGenerativeAIEmbeddings({
  apiKey: process.env.GOOGLE_API_KEY,
  model: "gemini-embedding-001",
});

async function test() {
  try {
    await client.connect();

    const db = client.db("kprit_helpdesk");
    const collection = db.collection("kprit_knowledge");

    const count = await collection.countDocuments();
    const sample = await collection.findOne({});

    console.log("Documents:", count);
    console.log(
      "Embedding dimensions:",
      sample?.embedding?.length
    );
    console.log("Text exists:", !!sample?.text);

    const queryEmbedding = await embeddings.embedQuery(
      "What is KPRIT?"
    );

    console.log(
      "Query embedding dimensions:",
      queryEmbedding.length
    );

    const results = await collection
      .aggregate([
        {
          $vectorSearch: {
            index: "vector_index",
            path: "embedding",
            queryVector: queryEmbedding,
            numCandidates: 50,
            limit: 5,
          },
        },
        {
          $project: {
            text: 1,
            metadata: 1,
            score: {
              $meta: "vectorSearchScore",
            },
          },
        },
      ])
      .toArray();

    console.log("Search results:", results.length);

    results.forEach((r, i) => {
      console.log(
        `${i + 1}. Score: ${r.score} | ${r.metadata?.title}`
      );
    });
  } catch (error) {
    console.error("ERROR:", error.message);
  } finally {
    await client.close();
  }
}

test();