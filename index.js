const express = require("express")
const { spawn } = require("child_process")
const path = require("path")

const app = express()
const PORT = process.env.PORT || 3000

app.get("/", (req, res) => {
  res.send("✅ yt-dlp MP3 API is running")
})

app.get("/mp3", (req, res) => {
  const url = req.query.url
  if (!url) return res.status(400).json({ error: "No url provided" })

  const forceDownload = req.query.dl === "1"

  res.setHeader("Content-Type", "audio/mpeg")
  res.setHeader(
    "Content-Disposition",
    forceDownload
      ? "attachment; filename=song.mp3"
      : "inline; filename=song.mp3"
  )

  const ytDlpPath = path.join(__dirname, "bin", "yt-dlp")

  const yt = spawn("bash", [
    ytDlpPath,
    "-f", "bestaudio/best",
    "-x",
    "--audio-format", "mp3",
    "--audio-quality", "0",
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
