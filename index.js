const express = require("express")
const { spawn } = require("child_process")
const path = require("path")

const app = express()
const PORT = process.env.PORT || 3000

app.get("/", (req, res) => {
  res.send("✅ yt-dlp Audio API is running")
})

/**
 * ✅ FAST & STABLE (M4A)
 * Heroku timeout se safe
 * WhatsApp supported
 */
app.get("/audio", (req, res) => {
  const url = req.query.url
  if (!url) return res.status(400).json({ error: "No url provided" })

  res.setHeader("Content-Type", "audio/mp4")
  res.setHeader(
    "Content-Disposition",
    "attachment; filename=audio.m4a"
  )

  const ytDlpPath = path.join(__dirname, "bin", "yt-dlp")

  const yt = spawn("bash", [
    ytDlpPath,
    "-f", "bestaudio[ext=m4a]/bestaudio",
    "--no-playlist",
    "--no-progress",
    "-o", "-",
    url
  ])

  yt.stdout.pipe(res)

  yt.stderr.on("data", d => {
    console.error("yt-dlp:", d.toString())
  })

  yt.on("error", err => {
    console.error("spawn error:", err)
    if (!res.headersSent) res.status(500).end("yt-dlp error")
  })

  yt.on("close", () => res.end())
})

app.listen(PORT, () => {
  console.log("Server running on", PORT)
})
