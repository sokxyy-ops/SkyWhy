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
  const expire = Math.floor(new Date("2390-09-02T00:00:00Z").getTime() / 1000);

  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Profile-Title", title);
  res.setHeader("X-Profile-Title", title);
  res.setHeader("Profile-Update-Interval", "1");
  res.setHeader("X-Profile-Update-Interval", "1");
  res.setHeader("Profile-Web-Page-URL", "https://t.me/sokxyybc");
  res.setHeader("Support-URL", "https://t.me/sokxyybc");
  res.setHeader(
    "Subscription-Userinfo",
    `upload=0; download=0; total=1125899906842624; expire=${expire}`
  );
}

function readFileSafe(filePath) {
  if (!fs.existsSync(filePath)) return null;
  return fs.readFileSync(filePath, "utf8").trim() + "\n";
}

app.get("/", (req, res) => {
  res.type("text/plain").send("OK");
});

app.get("/standart", (req, res) => {
  const content = readFileSafe(STANDART_FILE);

  if (!content) {
    return res.status(404).type("text/plain").send("standart.txt not found");
  }

  setSubHeaders(res, "SkyWhy Standart");
  return res.status(200).send(content);
});

app.get("/family", (req, res) => {
  const content = readFileSafe(FAMILY_FILE);

  if (!content) {
    return res.status(404).type("text/plain").send("family.txt not found");
  }

  setSubHeaders(res, "SkyWhy Family");
  return res.status(200).send(content);
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server started on port ${PORT}`);
});
