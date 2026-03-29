import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const STANDART_FILE = path.join(__dirname, "standart.txt");
const FAMILY_FILE = path.join(__dirname, "family.txt");

function setSubHeaders(res, title) {
  const expire = Math.floor(new Date("2999-09-02T00:00:00Z").getTime() / 1000);

  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Profile-Title", title);
  res.setHeader("Profile-Update-Interval", "1");
  res.setHeader("Subscription-Userinfo", `upload=0; download=0; total=0; expire=${expire}`);
  res.setHeader("Support-URL", "https://t.me/sokxyybc");
  res.setHeader("Profile-Web-Page-URL", "https://t.me/sokxyybc");
}

function readFileSafe(filePath) {
  if (!fs.existsSync(filePath)) return null;

  // 👇 ВАЖНО: ничего не трогаем, отдаем как есть
  return fs.readFileSync(filePath, "utf8").trim() + "\n";
}

app.get("/", (req, res) => {
  res.type("text/plain").send("OK\nhttps://t.me/sokxyybc");
});

app.get("/standart", (req, res) => {
  const content = readFileSafe(STANDART_FILE);

  if (!content) {
    return res.status(404).send("standart.txt not found");
  }

  setSubHeaders(res, "SkyWhy Standart");
  return res.send(content);
});

app.get("/family", (req, res) => {
  const content = readFileSafe(FAMILY_FILE);

  if (!content) {
    return res.status(404).send("family.txt not found");
  }

  setSubHeaders(res, "SkyWhy Family");
  return res.send(content);
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server started on port ${PORT}`);
});
