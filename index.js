const express = require("express")
const { spawn } = require("child_process")
const path = require("path")

const app = express()
const PORT = process.env.PORT || 3000

// ─────────────────────────────────────
// Health check
// ─────────────────────────────────────
app.get("/", (req, res) => {
  res.send("✅ yt-dlp Audio API is running")
})

/*
  ✅ FAST & STABLE (M4A)
  ❌ No ffmpeg
  ✅ Heroku safe
  ✅ WhatsApp supported
*/
app.get("/audio", (req, res) => {
  const url = req.query.url
  if (!url) {
    return res.status(400).json({ error: "No url provided" })
  }

  // WhatsApp prefers attachment
  res.setHeader("Content-Type", "audio/mp4")
  res.setHeader(
    "Content-Disposition",
    "attachment; filename=audio.m4a"
  )
  res.setHeader("Cache-Control", "no-store")
  res.setHeader("Connection", "keep-alive")

  // yt-dlp wrapper inside repo
  const ytDlpPath = path.join(__dirname, "bin", "yt-dlp")

  const yt = spawn("bash", [
    ytDlpPath,
    "-f", "bestaudio[ext=m4a]/bestaudio",
    "--no-playlist",
    "--no-progress",
    "--newline",
    "-o", "-",
    url
  ])

  // stream audio
  yt.stdout.pipe(res)

  // log errors only (don’t crash)
  yt.stderr.on("data", data => {
    console.error("[yt-dlp]", data.toString())
  })

  yt.on("error", err => {
    console.error("[spawn error]", err)
    if (!res.headersSent) {
      res.status(500).end("yt-dlp failed to start")
    }
  })

  yt.on("close", code => {
    if (code !== 0) {
      console.error("yt-dlp exited with code", code)
    }
    res.end()
  })
})

app.listen(PORT, () => {
  console.log("Server running on", PORT)
})
