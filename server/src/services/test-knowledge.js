const { buildKnowledgeBase } = require("./knowledge.service");

buildKnowledgeBase()
  .then((documents) => {
    console.log("\nKnowledge base ready!");

    console.log("First document:");
    console.log(documents[0]);
  })
  .catch((error) => {
    console.error("Knowledge base error:", error.message);
  });