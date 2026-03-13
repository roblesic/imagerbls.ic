require('dotenv').config();
const express = require('express');
const multer = require('multer');
const fetch = require('node-fetch');
const FormData = require('form-data');
const path = require('path');
const fs = require('fs');

const app = express();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  }
});

// Load env
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const DISCORD_CHANNEL_ID = process.env.DISCORD_CHANNEL_ID;

if (!DISCORD_BOT_TOKEN || !DISCORD_CHANNEL_ID) {
  console.error('❌  Missing DISCORD_BOT_TOKEN or DISCORD_CHANNEL_ID in .env');
  process.exit(1);
}

app.use(express.static(path.join(__dirname, 'public')));

// Upload endpoint
app.post('/upload', upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file provided' });

  try {
    const form = new FormData();
    form.append('file', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });
    form.append('payload_json', JSON.stringify({ content: '' }));

    const response = await fetch(
      `https://discord.com/api/v10/channels/${DISCORD_CHANNEL_ID}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
          ...form.getHeaders(),
        },
        body: form,
      }
    );

    if (!response.ok) {
      const err = await response.text();
      console.error('Discord API error:', err);
      return res.status(500).json({ error: 'Failed to upload to Discord' });
    }

    const data = await response.json();
    const attachment = data.attachments?.[0];

    if (!attachment?.url) {
      return res.status(500).json({ error: 'No attachment URL returned' });
    }

    // Return a proxied URL so Discord origin is hidden
    const proxiedUrl = `/proxy/${data.id}/${encodeURIComponent(attachment.filename)}?url=${encodeURIComponent(attachment.url)}`;

    res.json({
      url: proxiedUrl,
      directUrl: attachment.url,
      filename: attachment.filename,
      size: attachment.size,
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Proxy endpoint - fetches image from Discord and serves it
app.get('/proxy/:messageId/:filename', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).send('Missing url param');

  try {
    const discordRes = await fetch(decodeURIComponent(url), {
      headers: { Authorization: `Bot ${DISCORD_BOT_TOKEN}` }
    });
    if (!discordRes.ok) return res.status(404).send('Image not found');

    res.set('Content-Type', discordRes.headers.get('content-type') || 'image/jpeg');
    res.set('Cache-Control', 'public, max-age=31536000');
    discordRes.body.pipe(res);
  } catch (err) {
    res.status(500).send('Failed to fetch image');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅  Image host running at http://localhost:${PORT}`);
});
