const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const documentRoutes = require("./routes/documentRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/documents", documentRoutes);

app.get("/", (req, res) => {
  res.send("Smart Document Processing API radi");
});

const PORT = 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => {
      console.log(`Server radi na portu ${PORT}`);
    });
  })
  .catch((error) => {
    console.log("MongoDB connection error:", error.message);
  });