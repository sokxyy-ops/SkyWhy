const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT;

const server = http.createServer((req, res) => {
  const url = req.url.split("?")[0];

  // health для railway
  if (url === "/health") {
    res.writeHead(200);
    return res.end("ok");
  }

  if (url === "/") {
    res.writeHead(200, { "Content-Type": "text/plain" });
    return res.end("WORKING");
  }

  if (url === "/standart") {
    return sendFile(res, "standart.json");
  }

  if (url === "/family") {
    return sendFile(res, "family.json");
  }

  res.writeHead(404);
  res.end("not found");
});

function sendFile(res, file) {
  const filePath = path.join(__dirname, file);

  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      res.writeHead(404);
      return res.end("file not found");
    }

    res.writeHead(200, {
      "Content-Type": "text/plain; charset=utf-8"
    });

    res.end(data);
  });
}

server.listen(PORT, "0.0.0.0", () => {
  console.log("Server started on port " + PORT);
});
