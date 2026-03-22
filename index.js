const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT;

function send(res, code, data, type = "text/plain") {
  res.writeHead(code, { "Content-Type": type + "; charset=utf-8" });
  res.end(data);
}

function sendFile(res, file) {
  const filePath = path.join(__dirname, file);

  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) return send(res, 404, "file not found");
    send(res, 200, data);
  });
}

const server = http.createServer((req, res) => {
  const url = req.url.split("?")[0];

  // 🔥 ЭТО ДЛЯ RAILWAY (ВАЖНО)
  if (url === "/health" || url ===
