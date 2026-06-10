const express = require('express');
const path = require('path');
const { execFile } = require('child_process');
const fs = require('fs');
const os = require('os');

const app = express();
const PORT = process.env.PORT || 3000;

// Edge TTS binary paths (try multiple Python versions)
const EDGE_TTS_BIN = [
  '/Library/Frameworks/Python.framework/Versions/3.12/bin/edge-tts',
  '/opt/homebrew/bin/edge-tts',
  '/usr/local/bin/edge-tts',
].find(p => fs.existsSync(p)) || 'edge-tts';

console.log(`  🔊 Edge TTS: ${EDGE_TTS_BIN}`);

// Parse JSON bodies
app.use(express.json());

// Serve static files
app.use(express.static(__dirname));

// Proxy endpoint for Anthropic API
app.post('/api/anthropic', async (req, res) => {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    return res.status(400).json({ error: { message: 'Missing x-api-key header' } });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    res.json(data);
  } catch (error) {
    console.error('Anthropic proxy error:', error);
    res.status(502).json({
      error: { message: `Proxy error: ${error.message}` }
    });
  }
});

// Proxy endpoint for DeepSeek API
app.post('/api/deepseek', async (req, res) => {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    return res.status(400).json({ error: { message: 'Missing x-api-key header' } });
  }

  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    res.json(data);
  } catch (error) {
    console.error('DeepSeek proxy error:', error);
    res.status(502).json({
      error: { message: `Proxy error: ${error.message}` }
    });
  }
});

// TTS endpoint using Microsoft Edge neural voices
app.post('/api/tts', async (req, res) => {
  const { text, voice, rate } = req.body;

  if (!text) {
    return res.status(400).json({ error: { message: 'Missing text' } });
  }

  const voiceName = voice || 'zh-CN-YunyangNeural';
  const rateStr = rate || '+30%';
  const tmpFile = path.join(os.tmpdir(), `tts-${Date.now()}.mp3`);

  try {
    await new Promise((resolve, reject) => {
      execFile(EDGE_TTS_BIN, [
        '--voice', voiceName,
        '--rate', rateStr,
        '--text', text,
        '--write-media', tmpFile,
      ], { timeout: 15000 }, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Stream the audio file back
    const stat = fs.statSync(tmpFile);
    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': stat.size,
    });

    const readStream = fs.createReadStream(tmpFile);
    readStream.pipe(res);
    readStream.on('end', () => {
      fs.unlink(tmpFile, () => {}); // Clean up
    });
    readStream.on('error', () => {
      try { fs.unlink(tmpFile, () => {}); } catch {}
    });

  } catch (error) {
    console.error('TTS error:', error.message);
    try { fs.unlink(tmpFile, () => {}); } catch {}
    res.status(502).json({
      error: { message: `TTS error: ${error.message}` }
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`\n  🎙️  语音面试官已启动！`);
  console.log(`  📍 打开浏览器访问: http://localhost:${PORT}`);
  console.log(`  🧠 API: Anthropic + DeepSeek`);
  console.log(`  🔊 TTS: Microsoft Edge 神经网络语音`);
  console.log(`  ⌨️  按 Ctrl+C 停止服务器\n`);
});
