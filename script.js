const audio = document.getElementById("audio")
const playBtn = document.getElementById("playBtn")
const prevBtn = document.getElementById("prevBtn")
const nextBtn = document.getElementById("nextBtn")
const barFill = document.getElementById("barFill")
const barBg = document.getElementById("barBg")
const timeCur = document.getElementById("timeCur")
const timeEnd = document.getElementById("timeEnd")
const searchInput = document.getElementById("searchInput")
const resultsDiv = document.getElementById("results")
const cover = document.getElementById("cover")
const titleEl = document.getElementById("title")
const artistEl = document.getElementById("artist")
const queueBtn = document.getElementById("queueBtn")
const queuePanel = document.getElementById("queuePanel")
const queueList = document.getElementById("queueList")

let playlist = []
let queue = []
let index = -1

audio.volume = 0.7

function fmt(sec) {
  if (!sec || isNaN(sec)) return "0:00"
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return m + ":" + (s < 10 ? "0" + s : s)
}

async function search(q) {
  if (!q.trim()) return
  resultsDiv.innerHTML = '<div id="loading">Searching...</div>'

  try {
    const proxy = "https://corsproxy.io/?"
    const url = proxy + encodeURIComponent("https://api.deezer.com/search?q=" + encodeURIComponent(q) + "&limit=20")
    const res = await fetch(url)
    const data = await res.json()

    if (!data.data || data.data.length === 0) {
      resultsDiv.innerHTML = '<div id="loading">No results found.</div>'
      return
    }

    playlist = data.data.filter(t => t.preview).map(t => ({
      trackName: t.title,
      artistName: t.artist.name,
      artworkUrl: t.album.cover_medium,
      previewUrl: t.preview
    }))

    renderResults()
  } catch (e) {
    resultsDiv.innerHTML = '<div id="loading">Search failed. Try again.</div>'
    console.error(e)
  }
}

function renderResults() {
  resultsDiv.innerHTML = ""
  playlist.forEach((t, i) => {
    const row = document.createElement("div")
    row.className = "song"
    row.innerHTML = `
      <img src="${t.artworkUrl}" alt="" />
      <div class="song-info">
        <div class="sname">${t.trackName}</div>
        <div class="sartist">${t.artistName}</div>
      </div>
      <div class="song-btns">
        <button class="play-btn">&#9654; Play</button>
        <button class="add-btn">+</button>
      </div>
    `
    row.querySelector(".play-btn").onclick = () => { index = i; playTrack(playlist[i]) }
    row.querySelector(".add-btn").onclick = () => { queue.push(playlist[i]); renderQueue() }
    resultsDiv.appendChild(row)
  })
}

function playTrack(track) {
  if (!track || !track.previewUrl) return
  audio.pause()
  audio.src = track.previewUrl
  audio.load()
  audio.play().catch(err => console.warn("Playback error:", err))
  cover.src = track.artworkUrl
  titleEl.textContent = track.trackName
  artistEl.textContent = track.artistName
  playBtn.innerHTML = "&#9646;&#9646;"
}

playBtn.onclick = () => {
  if (!audio.src) return
  if (audio.paused) {
    audio.play()
    playBtn.innerHTML = "&#9646;&#9646;"
  } else {
    audio.pause()
    playBtn.innerHTML = "&#9654;"
  }
}

prevBtn.onclick = () => {
  if (index > 0) { index--; playTrack(playlist[index]) }
}

nextBtn.onclick = () => {
  if (index < playlist.length - 1) { index++; playTrack(playlist[index]) }
}

audio.onended = () => {
  if (index < playlist.length - 1) { index++; playTrack(playlist[index]) }
  else playBtn.innerHTML = "&#9654;"
}

audio.onloadedmetadata = () => { timeEnd.textContent = fmt(audio.duration) }

audio.ontimeupdate = () => {
  if (!audio.duration) return
  timeCur.textContent = fmt(audio.currentTime)
  barFill.style.width = (audio.currentTime / audio.duration * 100) + "%"
}

barBg.onclick = e => {
  if (!audio.duration) return
  const rect = barBg.getBoundingClientRect()
  audio.currentTime = ((e.clientX - rect.left) / rect.width) * audio.duration
}

document.getElementById("volSlider").oninput = e => { audio.volume = e.target.value }

function renderQueue() {
  queueList.innerHTML = ""
  queue.forEach(s => {
    const li = document.createElement("li")
    li.textContent = s.trackName + " — " + s.artistName
    queueList.appendChild(li)
  })
}

document.getElementById("clearQueue").onclick = () => { queue = []; renderQueue() }

queueBtn.onclick = () => {
  queuePanel.style.display = queuePanel.style.display === "block" ? "none" : "block"
}

searchInput.addEventListener("keypress", e => {
  if (e.key === "Enter") search(searchInput.value)
})
