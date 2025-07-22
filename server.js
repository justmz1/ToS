const express = require("express");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;
const KEY_FILE = path.join(__dirname, "keys.json");

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

function loadKeys() {
  if (!fs.existsSync(KEY_FILE)) return [];
  return JSON.parse(fs.readFileSync(KEY_FILE));
}

function saveKeys(keys) {
  fs.writeFileSync(KEY_FILE, JSON.stringify(keys, null, 2));
}

app.get("/generate", (req, res) => {
  const key = uuidv4().slice(0, 8).toUpperCase();
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

app.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}`);
});
