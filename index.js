import express from "express";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// файлы лежат в этом же репо
const STANDART_FILE = path.join(__dirname, "standart.txt");
const FAMILY_FILE = path.join(__dirname, "family.txt");

// ===== общие заголовки =====
function setSubHeaders(res, profileTitle) {
  res.setHeader("Content-Type", "text/plain; charset=utf-8");

  // название подписки
  res.setHeader("Profile-Title", encodeURIComponent(profileTitle));
  res.setHeader("X-Profile-Title", encodeURIComponent(profileTitle));

  // автообновление 1 час
  res.setHeader("Profile-Update-Interval", "1");
  res.setHeader("X-Profile-Update-Interval", "1");

  // кнопка / ссылка
  res.setHeader("Profile-Web-Page-URL", "https://t.me/sokxyybc");
  res.setHeader("Support-URL", "https://t.me/sokxyybc");
  res.setHeader("X-Profile-Web-Page-URL", "https://t.me/sokxyybc");

  // инфа подписки
  // expire = 02.09.2390 00:00:00 UTC
  const expire = Math.floor(new Date("2390-09-02T00:00:00Z").getTime() / 1000);

  res.setHeader(
    "Subscription-Userinfo",
    `upload=0; download=0; total=1125899906842624; expire=${expire}`
  );
}

// ===== чтение файла =====
async function readLocalFile(filePath) {
  const content = await fs.readFile(filePath, "utf8");
  return content.trim() + "\n";
}

// ===== главная =====
app.get("/", (req, res) => {
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.send(
`SkyWhy subscription server is running

Доступно:
- /standart
- /family`
  );
});

// ===== standart =====
app.get("/standart", async (req, res) => {
  try {
    const content = await readLocalFile(STANDART_FILE);
    setSubHeaders(res, "SkyWhy Standart");
    res.status(200).send(content);
  } catch (e) {
    res.status(500).send(`Ошибка чтения standart.txt: ${e.message}`);
  }
});

// ===== family =====
app.get("/family", async (req, res) => {
  try {
    const content = await readLocalFile(FAMILY_FILE);
    setSubHeaders(res, "SkyWhy Family");
    res.status(200).send(content);
  } catch (e) {
    res.status(500).send(`Ошибка чтения family.txt: ${e.message}`);
  }
});

// ===== health =====
app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
