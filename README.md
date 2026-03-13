# imgdrop 🖼️
A minimal personal image host backed by Discord. Upload images, get shareable links instantly.

---

## 🔧 Step 1 — Create a Discord Bot

1. Go to https://discord.com/developers/applications
2. Click **"New Application"** → give it a name (e.g. `imgdrop`)
3. In the left sidebar, click **"Bot"**
4. Click **"Add Bot"** → confirm
5. Under the bot's username, click **"Reset Token"** → copy and save it somewhere safe
   ⚠️ You'll only see this once. This is your `DISCORD_BOT_TOKEN`.

---

## 🔧 Step 2 — Create a Private Discord Server & Channel

1. Open Discord → click the **+** icon to create a new server → "For me and my friends"
2. Once created, right-click the **#general** channel (or create a new one called `#uploads`)
3. Click **"Edit Channel"** → set it to **Private** (optional but recommended)

---

## 🔧 Step 3 — Invite the Bot to Your Server

1. Back in the Developer Portal, go to **OAuth2 → URL Generator**
2. Under **Scopes**, check: `bot`
3. Under **Bot Permissions**, check:
   - `Send Messages`
   - `Attach Files`
   - `Read Message History`
4. Copy the generated URL and open it in your browser
5. Select your server → click **Authorize**

---

## 🔧 Step 4 — Get the Channel ID

1. In Discord, go to **Settings → Advanced → Enable Developer Mode**
2. Right-click your uploads channel → **"Copy Channel ID"**
   This is your `DISCORD_CHANNEL_ID`.

---

## 🚀 Step 5 — Run the App

### Install dependencies
```bash
npm install
```

### Create your `.env` file
```bash
cp .env.example .env
```

Edit `.env` and fill in:
```
DISCORD_BOT_TOKEN=your_token_here
DISCORD_CHANNEL_ID=your_channel_id_here
PORT=3000
```

### Start the server
```bash
npm start
```

Open http://localhost:3000 — you're live! 🎉

---

## 📁 Project Structure

```
imgdrop/
├── server.js          ← Express backend
├── package.json
├── .env.example       ← Copy to .env and fill in
└── public/
    ├── index.html     ← Upload UI
    └── disclaimer.html
```

---

## ⚠️ Known Limitations

- **Discord CDN URLs may expire** — Discord started signing CDN URLs in 2023. This app proxies images through your server to work around this, but images are still served from Discord's infrastructure.
- **25 MB file size limit** per upload (Discord's free server limit).
- **Not suitable for high traffic** — Discord API has rate limits.
- **Discord ToS** — Using Discord as a file host is a gray area in their Terms of Service. Fine for personal use with a handful of friends.

---

## 🌐 Deploying (optional)

To make it accessible from anywhere:

- **Railway** — free tier, easy Node.js deploy: https://railway.app
- **Render** — free tier: https://render.com
- **Fly.io** — generous free tier: https://fly.io

Just set your environment variables in the platform's dashboard instead of a `.env` file.
