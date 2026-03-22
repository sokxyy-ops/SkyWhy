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

function setHeaders(res, title) {
  const expire = Math.floor(new Date("2390-09-02T00:00:00Z").getTime() / 1000);

  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Profile-Title", encodeURIComponent(title));
  res.setHeader("Profile-Update-Interval", "1");
  res.setHeader("Subscription-Userinfo", `upload=0; download=0; total=1125899906842624; expire=${expire}`);
  res.setHeader("Profile-Web-Page-URL", "https://t.me/sokxyybc");
  res.setHeader("Support-URL", "https://t.me/sokxyybc");
}

function readFileSafe(filePath) {
  if (!fs.existsSync(filePath)) {
    return null;
  }
  return fs.readFileSync(filePath, "utf8").trim() + "\n";
}

app.get("/", (req, res) => {
  res.status(200).send("OK");
});

app.get("/standart", (req, res) => {
  const content = readFileSafe(STANDART_FILE);

  if (!content) {
    return res.status(404).send("standart.txt not found");
  }

  setHeaders(res, "SkyWhy Standart");
  res.status(200).send(content);
});

app.get("/family", (req, res) => {
  const content = readFileSafe(FAMILY_FILE);

  if (!content) {
    return res.status(404).send("family.txt not found");
  }

  setHeaders(res, "SkyWhy Family");
  res.status(200).send(content);
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
