const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8"
  });
  res.end(JSON.stringify(data, null, 2));
}

function sendJsonFile(res, filename) {
  const filePath = path.join(__dirname, filename);

  if (!fs.existsSync(filePath)) {
    return sendJson(res, 404, {
      error: true,
      message: `Файл ${filename} не найден`
    });
  }

  try {
    const raw = fs.readFileSync(filePath, "utf8");
    const parsed = JSON.parse(raw);
    return sendJson(res, 200, parsed);
  } catch (e) {
    return sendJson(res, 500, {
      error: true,
      message: `Ошибка в ${filename}: ${e.message}`
    });
  }
}

const server = http.createServer((req, res) => {
  const url = req.url.split("?")[0];

  if (url === "/") {
    return sendJson(res, 200, {
      ok: true,
      message: "JSON подписки работают",
      endpoints: {
        standart: "/standart",
        family: "/family"
      }
    });
  }

  if (url === "/standart") {
    return sendJsonFile(res, "standart.json");
  }

  if (url === "/family") {
    return sendJsonFile(res, "family.json");
  }

  return sendJson(res, 404, {
    error: true,
    message: "Маршрут не найден"
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server started on port ${PORT}`);
});
