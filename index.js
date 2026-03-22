const http = require("http");

const SUBS = {
  standart: {
    file: "https://raw.githubusercontent.com/sokxyy-ops/SkyWhy/refs/heads/main/standart.txt",
    title: "SkyWhy Standart",
    total: "107374182400",
    expire: "4447440000",
    tg: "https://t.me/sokxyybc"
  },
  family: {
    file: "https://raw.githubusercontent.com/sokxyy-ops/SkyWhy/refs/heads/main/family.txt",
    title: "SkyWhy Family",
    total: "214748364800",
    expire: "4447440000",
    tg: "https://t.me/sokxyybc"
  }
};

async function getText(url) {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0",
      "Accept": "*/*"
    }
  });

  if (!res.ok) {
    throw new Error(`Source error: ${res.status}`);
  }

  return await res.text();
}

function tryParseJsonBlock(text) {
  try {
    const obj = JSON.parse(text);
    return JSON.stringify(obj, null, 2);
  } catch {
    return null;
  }
}

function extractMixedContent(text) {
  const result = [];
  const lines = text.split(/\r?\n/);

  let i = 0;

  while (i < lines.length) {
    let line = lines[i].trim();

    if (!line) {
      i++;
      continue;
    }

    // 1. VLESS строка
    if (line.startsWith("vless://")) {
      result.push(line);
      i++;
      continue;
    }

    // 2. JSON блок
    if (line.startsWith("{")) {
      let block = [];
      let braceCount = 0;
      let started = false;

      while (i < lines.length) {
        const currentLine = lines[i];
        block.push(currentLine);

        for (const ch of currentLine) {
          if (ch === "{") {
            braceCount++;
            started = true;
          } else if (ch === "}") {
            braceCount--;
          }
        }

        i++;

        if (started && braceCount === 0) {
          break;
        }
      }

      const jsonText = block.join("\n").trim();
      const parsed = tryParseJsonBlock(jsonText);

      if (parsed) {
        result.push(parsed);
      } else {
        result.push(jsonText);
      }

      continue;
    }

    // 3. Если строка вида vless://...|{json}
    if (line.includes("|")) {
      const parts = line.split("|").map(x => x.trim()).filter(Boolean);

      for (const part of parts) {
        if (part.startsWith("vless://")) {
          result.push(part);
        } else if (part.startsWith("{")) {
          const parsed = tryParseJsonBlock(part);
          result.push(parsed || part);
        } else {
          result.push(part);
        }
      }

      i++;
      continue;
    }

    // 4. Всё остальное
    result.push(line);
    i++;
  }

  return result.join("\n\n");
}

const server = http.createServer(async (req, res) => {
  try {
    const path = req.url.split("?")[0].replace(/^\/+|\/+$/g, "");

    if (!path) {
      res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
      return res.end("Use /standart or /family");
    }

    const sub = SUBS[path];

    if (!sub) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      return res.end("Subscription not found");
    }

    if (req.method === "HEAD") {
      res.writeHead(200, {
        "Profile-Title": sub.title,
        "profile-update-interval": "1",
        "subscription-userinfo": `upload=0; download=0; total=${sub.total}; expire=${sub.expire}`,
        "profile-web-page-url": sub.tg,
        "support-url": sub.tg
      });
      return res.end();
    }

    const sourceText = await getText(sub.file);
    const body = extractMixedContent(sourceText);

    res.writeHead(200, {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store, no-cache, must-revalidate",
      "Pragma": "no-cache",
      "Expires": "0",
      "Access-Control-Allow-Origin": "*",
      "Profile-Title": sub.title,
      "profile-update-interval": "1",
      "subscription-userinfo": `upload=0; download=0; total=${sub.total}; expire=${sub.expire}`,
      "profile-web-page-url": sub.tg,
      "support-url": sub.tg
    });

    res.end(body);
  } catch (e) {
    res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Error: " + e.message);
  }
});

server.listen(3000, () => {
  console.log("Server started on port 3000");
});
