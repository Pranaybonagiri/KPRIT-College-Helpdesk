const { GoogleGenerativeAI } = require("@google/generative-ai");
const { MongoClient } = require("mongodb");
const { GoogleGenerativeAIEmbeddings } = require("@langchain/google-genai");

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

const client = new MongoClient(process.env.MONGODB_URI);

const embeddings = new GoogleGenerativeAIEmbeddings({
  apiKey: process.env.GOOGLE_API_KEY,
  model: "gemini-embedding-001",
});

async function answerQuestion(question) {
  await client.connect();

  const db = client.db("kprit_helpdesk");
  const collection = db.collection("kprit_knowledge");

  // Convert question into an embedding
  const queryEmbedding = await embeddings.embedQuery(question);

  // Search MongoDB Vector Search
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
          score: { $meta: "vectorSearchScore" },
        },
      },
    ])
    .toArray();

  const context = results
    .map(
      (item) =>
        `Source: ${item.metadata?.url || "KPRIT Website"}\n${item.text}`
    )
    .join("\n\n");

  const model = genAI.getGenerativeModel({
   model: "gemini-3.6-flash",
  });

  const prompt = `
You are the KPRIT College Help Desk AI Assistant.

Answer the user's question using the KPRIT website information provided below.

Rules:
- Give a clear and helpful answer.
- Use the retrieved KPRIT information as the primary source.
- If the retrieved information does not contain the answer, clearly say that the KPRIT website information available to you does not provide the answer.
- Do not invent KPRIT-specific information.
- Keep the answer conversational and easy to understand.

KPRIT WEBSITE INFORMATION:
${context}

USER QUESTION:
${question}
`;

  const result = await model.generateContent(prompt);

  return {
    answer: result.response.text(),
    sources: results.map((item) => ({
      title: item.metadata?.title,
      url: item.metadata?.url,
    })),
  };
}

module.exports = {
  answerQuestion,
};