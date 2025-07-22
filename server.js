const express = require("express");
const fs = require("fs");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

const app = express();
const PORT = process.env.PORT || 3000;
const KEY_FILE = "keys.json";

app.use(cors());
app.use(express.json());

function loadKeys() {
  if (!fs.existsSync(KEY_FILE)) return [];
  return JSON.parse(fs.readFileSync(KEY_FILE));
}

function saveKeys(keys) {
  fs.writeFileSync(KEY_FILE, JSON.stringify(keys, null, 2));
}

app.get("/", (req, res) => {
  res.send("Key-API online");
});

app.get("/generate", (req, res) => {
  const key = uuidv4().slice(0, 8);
  const keys = loadKeys();
  keys.push({ key, used: false });
  saveKeys(keys);
  res.json({ key });
});

app.post("/verify", (req, res) => {
  const { key } = req.body;
  const keys = loadKeys();
  const entry = keys.find(k => k.key === key);

  if (!entry) return res.json({ success: false, error: "invalid key" });
  if (entry.used) return res.json({ success: false, error: "already used" });

  entry.used = true;
  saveKeys(keys);
  res.json({ success: true });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
