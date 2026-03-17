
const http = require("http");

const SUBS = {
  standart: {
    file: "https://raw.githubusercontent.com/sokxyy-ops/SkyWhy/refs/heads/main/standart.txt",
    title: "SkyWhy Standart",
    total: "107374182400",
    expire: "1893456000",
    tg: "https://t.me/your_channel"
  },
  family: {
    file: "https://raw.githubusercontent.com/ТВОЙ_ЮЗЕРНЕЙМ/vpn-sub/main/family.txt",
    title: "SkyWhy Family",
    total: "214748364800",
    expire: "1893456000",
    tg: "https://t.me/your_channel"
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
        "profile-update-interval": "24",
        "subscription-userinfo": `upload=0; download=0; total=${sub.total}; expire=${sub.expire}`,
        "profile-web-page-url": sub.tg,
        "support-url": sub.tg
      });
      return res.end();
    }

    const body = await getText(sub.file);

    res.writeHead(200, {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store, no-cache, must-revalidate",
      "Pragma": "no-cache",
      "Expires": "0",
      "Access-Control-Allow-Origin": "*",
      "Profile-Title": sub.title,
      "profile-update-interval": "24",
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
