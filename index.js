import express from "express";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 3000;

const BOT_API_URL = (process.env.BOT_API_URL || "").trim().replace(/\/+$/, "");
const TRIAL_SHARED_SECRET = (process.env.TRIAL_SHARED_SECRET || "").trim();
const TG_CHANNEL = (process.env.TG_CHANNEL || "https://t.me/sokxyybc").trim();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const STANDART_FILE = path.join(__dirname, "standart.txt");
const FAMILY_FILE = path.join(__dirname, "family.txt");

function setSubHeaders(res, title, expireTs = null) {
  const expire =
    Number.isFinite(expireTs) && expireTs > 0
      ? Math.floor(expireTs)
      : Math.floor(new Date("2999-09-02T00:00:00Z").getTime() / 1000);

  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Profile-Title", title);
  res.setHeader("Profile-Update-Interval", "1");
  res.setHeader("Subscription-Userinfo", `upload=0; download=0; total=0; expire=${expire}`);
  res.setHeader("Support-URL", TG_CHANNEL);
  res.setHeader("Profile-Web-Page-URL", TG_CHANNEL);
}

function readFileSafe(filePath) {
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf8");
  return raw.trim() ? raw.trim() + "\n" : "";
}

function sha256(text) {
  return crypto.createHash("sha256").update(text).digest("hex");
}

async function fetchTrialInfo(token) {
  if (!BOT_API_URL) {
    throw new Error("BOT_API_URL не задан");
  }
  if (!TRIAL_SHARED_SECRET) {
    throw new Error("TRIAL_SHARED_SECRET не задан");
  }

  const sign = sha256(`${token}:${TRIAL_SHARED_SECRET}`);
  const url = `${BOT_API_URL}/trial-info?token=${encodeURIComponent(token)}&sign=${encodeURIComponent(sign)}`;

  const resp = await fetch(url, {
    method: "GET",
    headers: {
      "User-Agent": "SkyWhy-SubServer/1.0",
      "Accept": "application/json, text/plain, */*",
    },
  });

  const text = await resp.text().catch(() => "");

  if (resp.status === 404) {
    return { ok: false, reason: "not_found", raw: text };
  }

  if (!resp.ok) {
    throw new Error(`trial-info ${resp.status}: ${text || "request failed"}`);
  }

  try {
    return JSON.parse(text || "{}");
  } catch {
    throw new Error(`trial-info invalid json: ${text}`);
  }
}

app.get("/", (req, res) => {
  res.type("text/plain; charset=utf-8").send("OK\nhttps://t.me/sokxyybc");
});

app.get("/standart", (req, res) => {
  const content = readFileSafe(STANDART_FILE);

  if (content === null) {
    return res.status(404).type("text/plain; charset=utf-8").send("standart.txt not found");
  }

  setSubHeaders(res, "SkyWhy Standart");
  return res.status(200).send(content);
});

app.get("/family", (req, res) => {
  const content = readFileSafe(FAMILY_FILE);

  if (content === null) {
    return res.status(404).type("text/plain; charset=utf-8").send("family.txt not found");
  }

  setSubHeaders(res, "SkyWhy Family");
  return res.status(200).send(content);
});

app.get("/trial/:token", async (req, res) => {
  try {
    const token = String(req.params.token || "").trim();
    if (!token) {
      return res.status(200).type("text/plain; charset=utf-8").send("trial not found: empty token");
    }

    const info = await fetchTrialInfo(token);
    console.log("[trial] token:", token);
    console.log("[trial] info:", info);

    if (!info || info.ok === false) {
      return res
        .status(200)
        .type("text/plain; charset=utf-8")
        .send(`trial invalid\n${JSON.stringify(info, null, 2)}`);
    }

    const now = Math.floor(Date.now() / 1000);
    const expiresAt = Number(info.expires_at || 0);

    if (!expiresAt) {
      return res
        .status(200)
        .type("text/plain; charset=utf-8")
        .send(`trial invalid: no expires_at\n${JSON.stringify(info, null, 2)}`);
    }

    if (now >= expiresAt) {
      setSubHeaders(res, "SkyWhy Trial", expiresAt || now);
      return res
        .status(200)
        .type("text/plain; charset=utf-8")
        .send(`trial expired\nnow=${now}\nexpires_at=${expiresAt}\n${JSON.stringify(info, null, 2)}`);
    }

    const plan = String(info.plan || "standard").toLowerCase();
    const filePath = plan === "family" ? FAMILY_FILE : STANDART_FILE;
    const title = plan === "family" ? "SkyWhy Trial Family" : "SkyWhy Trial Standart";

    const content = readFileSafe(filePath);

    if (content === null) {
      return res
        .status(200)
        .type("text/plain; charset=utf-8")
        .send(`trial file missing\nplan=${plan}\nfilePath=${filePath}`);
    }

    if (!content.trim()) {
      return res
        .status(200)
        .type("text/plain; charset=utf-8")
        .send(`trial file empty\nplan=${plan}\nfilePath=${filePath}`);
    }

    setSubHeaders(res, title, expiresAt);
    return res.status(200).send(content);
  } catch (e) {
    console.error("[trial] error:", e?.message || e);
    return res
      .status(200)
      .type("text/plain; charset=utf-8")
      .send(`trial error: ${e?.message || e}`);
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server started on port ${PORT}`);
});
