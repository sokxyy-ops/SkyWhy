import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const PORT = Number(process.env.PORT || 3000);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TG_CHANNEL_URL = "https://t.me/sokxyybc";
const PROFILE_WEB_PAGE_URL = "https://t.me/sokxyybc";

// 02.09.2390 00:00:00 UTC
const EXPIRE_UNIX = "13275014400";

// Файлы прямо из репозитория
const STANDART_FILE = path.join(__dirname, "standart.txt");
const FAMILY_FILE = path.join(__dirname, "family.txt");

function makeHeaders(title) {
  return {
    "Content-Type": "text/plain; charset=utf-8",
    "Profile-Title": title,
    "profile-update-interval": "1",
    "Subscription-Userinfo": `upload=0; download=0; total=999999999999999; expire=${EXPIRE_UNIX}`,
    "support-url": TG_CHANNEL_URL,
    "profile-web-page-url": PROFILE_WEB_PAGE_URL,
    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    "Pragma": "no-cache",
    "Expires": "0"
  };
}

function normalizeVlessText(text) {
  return String(text)
    .replace(/\r/g, "")
    .split("\n")
    .map(line => line.trim())
    .filter(line => line && line.startsWith("vless://"))
    .join("\n");
}

async function loadSubscriptionFromFile(filePath) {
  const text = await fs.readFile(filePath, "utf8");
  const normalized = normalizeVlessText(text);

  if (!normalized) {
    throw new Error(`No valid vless:// links found in ${path.basename(filePath)}`);
  }

  return normalized;
}

function send(res, status, body, headers = {}) {
  res.writeHead(status, headers);
  res.end(body);
}

const server = http.createServer(async (req, res) => {
  try {
    const host = req.headers.host || "localhost";
    const url = new URL(req.url || "/", `http://${host}`);
    const pathname = url.pathname.toLowerCase();

    if (pathname === "/health") {
      return send(res, 200, "ok", {
        "Content-Type": "text/plain; charset=utf-8"
      });
    }

    if (pathname === "/" || pathname === "/standart" || pathname === "/standart.txt") {
      const body = await loadSubscriptionFromFile(STANDART_FILE);
      return send(res, 200, body, makeHeaders("SkyWhy Standart"));
    }

    if (pathname === "/family" || pathname === "/family.txt") {
      const body = await loadSubscriptionFromFile(FAMILY_FILE);
      return send(res, 200, body, makeHeaders("SkyWhy Family"));
    }

    return send(
      res,
      404,
      [
        "Not found.",
        "",
        "Use:",
        "/standart",
        "/family",
        "/health"
      ].join("\n"),
      {
        "Content-Type": "text/plain; charset=utf-8"
      }
    );
  } catch (error) {
    return send(
      res,
      500,
      `Subscription error: ${error instanceof Error ? error.message : String(error)}`,
      {
        "Content-Type": "text/plain; charset=utf-8"
      }
    );
  }
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`SkyWhy subscription server running on port ${PORT}`);
});
