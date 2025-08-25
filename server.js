const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const GOOGLE_API_KEY = "AIzaSyA8x9xT58pV1OLt_VNygywsEpBNnJkuSF8"; // replace with your real key
const GENAI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GOOGLE_API_KEY}`;

app.post("/ask", async (req, res) => {
  const prompt = req.body.prompt;

  try {
    const response = await fetch(GENAI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response.";
    res.json({ reply });
  } catch (err) {
    res.status(500).json({ error: "Failed to connect to Google GenAI." });
  }
});

app.listen(3000, () => {
  console.log("🚀 Server running at http://localhost:3000");
});