const express = require("express");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const app = express();

app.get("/", (req, res) => {
  res.json({ status: true, message: "YT-DLP MP3 API Running" });
});

app.get("/mp3", async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ status: false, message: "Missing url" });

  const id = Date.now();
  const out = `/tmp/${id}.mp3`;

  const cmd = `yt-dlp -x --audio-format mp3 --audio-quality 128K --no-playlist -o "${out}" "${url}"`;

  exec(cmd, { timeout: 180000 }, (err) => {
    if (err) {
      console.error("YT-DLP ERROR:", err);
      return res.status(500).json({ status: false, message: "yt-dlp failed" });
    }

    if (!fs.existsSync(out)) {
      return res.status(500).json({ status: false, message: "MP3 not created" });
    }

    res.json({
      status: true,
      title: "YouTube MP3",
      mp3: `/download/${id}.mp3`
    });
  });
});

app.get("/download/:file", (req, res) => {
  const file = `/tmp/${req.params.file}`;
  if (!fs.existsSync(file)) return res.sendStatus(404);

  res.download(file, () => {
    fs.unlinkSync(file);
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on", PORT));
