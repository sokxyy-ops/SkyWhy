const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 8080;

function sendFile(res, filename) {
  const filePath = path.join(__dirname, filename);

  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end(`Файл не найден: ${filename}`);
      return;
    }

    res.writeHead(200, {
      "Content-Type": "text/plain; charset=utf-8"
    });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  const url = req.url.split("?")[0];

  if (url === "/") {
    res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
    res.end(
      [
        "SkyWhy JSON server works",
        "",
        "/standart -> standart.json",
        "/family -> family.json"
      ].join("\n")
    );
    return;
  }

  if (url === "/standart") {
    sendFile(res, "standart.json");
    return;
  }

  if (url === "/family") {
    sendFile(res, "family.json");
    return;
  }

  res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
  res.end("Not found");
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server started on port ${PORT}`);
});
