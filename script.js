// ── Elements ──────────────────────────────────────────────────────────
const searchInput = document.getElementById('searchInput')
const searchBtn   = document.getElementById('searchBtn')
const resultsDiv  = document.getElementById('results')
const statusDiv   = document.getElementById('status')
const queueListEl = document.getElementById('queueList')
const clearBtn    = document.getElementById('clearBtn')
const queueFab    = document.getElementById('queueFab')
const sidebar     = document.getElementById('sidebar')

const audio    = document.getElementById('audio')
const playBtn  = document.getElementById('playBtn')
const prevBtn  = document.getElementById('prevBtn')
const nextBtn  = document.getElementById('nextBtn')
const bar      = document.getElementById('bar')
const barFill  = document.getElementById('barFill')
const curTime  = document.getElementById('curTime')
const endTime  = document.getElementById('endTime')
const volSlider= document.getElementById('vol')
const pImg     = document.getElementById('pImg')
const pTitle   = document.getElementById('pTitle')
const pArtist  = document.getElementById('pArtist')

// ── State ─────────────────────────────────────────────────────────────
let results    = []
let queue      = []
let queueIdx   = -1
let playingFromQueue = false

audio.volume = 0.85

// ── Helpers ───────────────────────────────────────────────────────────
function fmt(sec) {
  if (!sec || isNaN(sec)) return '0:00'
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return m + ':' + (s < 10 ? '0' + s : s)
}

function fmtSec(s) { return fmt(parseInt(s)) }

// pick best quality download url from saavn response
function getBestUrl(downloadUrls) {
  if (!downloadUrls || downloadUrls.length === 0) return null
  // prefer 320kbps > 160kbps > 96kbps
  const q = ['320kbps','160kbps','96kbps','48kbps']
  for (const quality of q) {
    const found = downloadUrls.find(u => u.quality === quality)
    if (found && found.url) return found.url
  }
  return downloadUrls[0]?.url || null
}

// ── Search using saavn.dev API (GitHub: sumitkolhe/jiosaavn-api) ──────
async function doSearch(query) {
  if (!query.trim()) return

  statusDiv.style.display = 'block'
  statusDiv.textContent   = 'Searching...'
  resultsDiv.innerHTML    = ''

  try {
    const url  = `https://saavn.dev/api/search/songs?query=${encodeURIComponent(query)}&page=1&limit=15`
    const resp = await fetch(url)
    const json = await resp.json()

    if (!json.success || !json.data?.results?.length) {
      statusDiv.textContent = 'No results found. Try another search.'
      return
    }

    results = json.data.results.filter(t => getBestUrl(t.downloadUrl))

    if (results.length === 0) {
      statusDiv.textContent = 'No playable songs found. Try another search.'
      return
    }

    statusDiv.style.display = 'none'
    renderResults()

  } catch (err) {
    statusDiv.textContent = 'Search failed. Check your internet and try again.'
    console.error(err)
  }
}

// ── Render results list ───────────────────────────────────────────────
function renderResults() {
  resultsDiv.innerHTML = ''

  results.forEach((song, i) => {
    const img     = song.image?.[1]?.url || song.image?.[0]?.url || ''
    const artist  = song.artists?.primary?.map(a => a.name).join(', ') || 'Unknown Artist'
    const dur     = fmt(song.duration)

    const row = document.createElement('div')
    row.className = 'srow'
    row.id = 'srow_' + i

    row.innerHTML = `
      <img src="${img}" alt="" loading="lazy"/>
      <div class="sinfo">
        <div class="sname">${song.name}</div>
        <div class="sartist">${artist}</div>
      </div>
      <span class="sdur">${dur}</span>
      <div class="sbtns">
        <button class="btn-p">▶ Play</button>
        <button class="btn-q">+ Queue</button>
      </div>
    `

    row.querySelector('.btn-p').onclick = () => {
      playingFromQueue = false
      playResult(i)
    }

    row.querySelector('.btn-q').onclick = () => {
      addToQueue(song)
    }

    resultsDiv.appendChild(row)
  })
}

// ── Play from results list ────────────────────────────────────────────
function playResult(i) {
  document.querySelectorAll('.srow').forEach(r => r.classList.remove('playing'))
  const row = document.getElementById('srow_' + i)
  if (row) row.classList.add('playing')
  loadPlay(results[i])
}

// ── Core play function ────────────────────────────────────────────────
function loadPlay(song) {
  const streamUrl = getBestUrl(song.downloadUrl)
  if (!streamUrl) { alert('This song has no playable audio.'); return }

  const img    = song.image?.[1]?.url || song.image?.[0]?.url || ''
  const artist = song.artists?.primary?.map(a => a.name).join(', ') || 'Unknown Artist'

  audio.pause()
  audio.src = streamUrl
  audio.load()
  audio.play().catch(e => console.warn('Play error:', e))

  pImg.src    = img
  pTitle.textContent  = song.name
  pArtist.textContent = artist
  playBtn.textContent = '⏸'
}

// ── Player controls ───────────────────────────────────────────────────
playBtn.onclick = () => {
  if (!audio.src) return
  if (audio.paused) { audio.play(); playBtn.textContent = '⏸' }
  else              { audio.pause(); playBtn.textContent = '▶' }
}

prevBtn.onclick = () => {
  if (playingFromQueue && queueIdx > 0) {
    queueIdx--
    playQueue(queueIdx)
  }
}

nextBtn.onclick = () => {
  if (playingFromQueue && queueIdx < queue.length - 1) {
    queueIdx++
    playQueue(queueIdx)
  }
}

// auto play next from queue when song ends
audio.onended = () => {
  if (playingFromQueue && queueIdx < queue.length - 1) {
    queueIdx++
    playQueue(queueIdx)
  } else {
    playBtn.textContent = '▶'
  }
}

audio.onplay  = () => { playBtn.textContent = '⏸' }
audio.onpause = () => { playBtn.textContent = '▶' }

audio.onloadedmetadata = () => { endTime.textContent = fmt(audio.duration) }

audio.ontimeupdate = () => {
  if (!audio.duration) return
  curTime.textContent      = fmt(audio.currentTime)
  barFill.style.width      = (audio.currentTime / audio.duration * 100) + '%'
}

bar.onclick = e => {
  if (!audio.duration) return
  const r = bar.getBoundingClientRect()
  audio.currentTime = ((e.clientX - r.left) / r.width) * audio.duration
}

volSlider.oninput = e => { audio.volume = e.target.value }

// ── Queue ─────────────────────────────────────────────────────────────
function addToQueue(song) {
  queue.push(song)
  renderQueue()
}

function playQueue(idx) {
  queueIdx = idx
  playingFromQueue = true
  document.querySelectorAll('.srow').forEach(r => r.classList.remove('playing'))
  loadPlay(queue[idx])
  renderQueue()
}

function renderQueue() {
  queueListEl.innerHTML = ''

  if (queue.length === 0) {
    const li = document.createElement('li')
    li.className = 'q-empty'
    li.textContent = 'Queue is empty'
    queueListEl.appendChild(li)
    return
  }

  queue.forEach((song, i) => {
    const img    = song.image?.[0]?.url || ''
    const artist = song.artists?.primary?.map(a => a.name).join(', ') || ''
    const li     = document.createElement('li')
    if (playingFromQueue && i === queueIdx) li.classList.add('q-active')

    li.innerHTML = `
      <img src="${img}" alt="" loading="lazy"/>
      <div class="qi">
        <div class="qn">${song.name}</div>
        <div class="qa">${artist}</div>
      </div>
    `
    li.onclick = () => playQueue(i)
    queueListEl.appendChild(li)
  })
}

clearBtn.onclick = () => {
  queue = []; queueIdx = -1; playingFromQueue = false
  renderQueue()
}

// ── Mobile toggle ─────────────────────────────────────────────────────
queueFab.onclick = () => sidebar.classList.toggle('open')

// ── Search triggers ───────────────────────────────────────────────────
searchBtn.onclick = () => doSearch(searchInput.value)
searchInput.addEventListener('keypress', e => {
  if (e.key === 'Enter') doSearch(searchInput.value)
})
