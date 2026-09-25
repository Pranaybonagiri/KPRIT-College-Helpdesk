const express = require("express");
const { answerQuestion } = require("../services/rag.service");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { question } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({
        error: "Question is required",
      });
    }

    const result = await answerQuestion(question.trim());

    res.json(result);
  } catch (error) {
    console.error("Chat error:", error.message);
console.error(error.stack);

    res.status(500).json({
      error: "Failed to process your question",
    });
  }
});

module.exports = router;