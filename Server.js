import express from "express";
import fetch from "node-fetch"; // if you're on Node 18+, you could use the built-in global fetch

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/health", (_, res) => res.send("ok"));

app.get("/oauth-callback", async (req, res) => {
  const { code, state } = req.query;
  if (!code) return res.status(400).send("Missing ?code");

  try {
    const r = await fetch("https://api.hubapi.com/oauth/v1/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: process.env.HS_CLIENT_ID,
        client_secret: process.env.HS_CLIENT_SECRET,
        redirect_uri: `http://localhost:${PORT}/oauth-callback`,
        code
      })
    });

    const data = await r.json();
    if (!r.ok) return res.status(r.status).send(`<pre>${JSON.stringify(data, null, 2)}</pre>`);
    res.send(`<pre>${JSON.stringify(data, null, 2)}</pre>`); // TODO: persista tokens com segurança
  } catch (e) {
    res.status(500).send(String(e));
  }
});

app.listen(PORT, () => console.log(`OAuth server on http://localhost:${PORT}`));
