require("dotenv").config();

const { MongoClient } = require("mongodb");

const client = new MongoClient(process.env.MONGODB_URI);

async function test() {
  try {
    await client.connect();

    await client.db("admin").command({ ping: 1 });

    console.log("✅ MongoDB Atlas connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection failed");
    console.error(error.message);
  } finally {
    await client.close();
  }
}

test();