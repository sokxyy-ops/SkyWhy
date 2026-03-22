const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

function sendJsonFile(res, filename) {
  const filePath = path.join(__dirname, filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({
      error: true,
      message: `Файл ${filename} не найден`
    });
  }

  try {
    const data = fs.readFileSync(filePath, "utf8");
    const parsed = JSON.parse(data);

    res.setHeader("Content-Type", "application/json; charset=utf-8");
    return res.status(200).send(JSON.stringify(parsed, null, 2));
  } catch (e) {
    return res.status(500).json({
      error: true,
      message: `Ошибка в ${filename}: ${e.message}`
    });
  }
}

app.get("/", (req, res) => {
  res.json({
    ok: true,
    message: "JSON подписки работают",
    endpoints: {
      standart: "/standart",
      family: "/family"
    }
  });
});

app.get("/standart", (req, res) => {
  sendJsonFile(res, "standart.json");
});

app.get("/family", (req, res) => {
  sendJsonFile(res, "family.json");
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server started on port ${PORT}`);
});
