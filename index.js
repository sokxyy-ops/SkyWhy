const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

function sendJsonFile(res, filename) {
  const filePath = path.join(__dirname, filename);

  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      return res.status(500).json({
        error: true,
        message: `Не удалось прочитать файл ${filename}`
      });
    }

    try {
      const parsed = JSON.parse(data);
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      return res.status(200).send(JSON.stringify(parsed, null, 2));
    } catch (e) {
      return res.status(500).json({
        error: true,
        message: `Файл ${filename} содержит невалидный JSON`
      });
    }
  });
}

app.get("/", (req, res) => {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.status(200).send(JSON.stringify({
    ok: true,
    message: "JSON подписки работают",
    endpoints: {
      standart: "/standart",
      family: "/family"
    }
  }, null, 2));
});

app.get("/standart", (req, res) => {
  sendJsonFile(res, "standart.json");
});

app.get("/family", (req, res) => {
  sendJsonFile(res, "family.json");
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
