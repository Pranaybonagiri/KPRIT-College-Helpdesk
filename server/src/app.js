const express = require("express");
const cors = require("cors");

const chatRoutes = require("./routes/chat.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "KPRIT Help Desk API is running" });
});

app.use("/api/chat", chatRoutes);
module.exports = app;