const http = require("http");
const fs = require("fs");

const PORT = process.env.PORT;

http.createServer((req, res) => {
  if (req.url === "/") {
    res.end("WORKING");
    return;
  }

  if (req.url === "/standart") {
    return fs.createReadStream("standart.json").pipe(res);
  }

  if (req.url === "/family") {
    return fs.createReadStream("family.json").pipe(res);
  }

  res.statusCode = 404;
  res.end("not found");
}).listen(PORT, "0.0.0.0");
