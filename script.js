// audio player
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
const title = document.getElementById("title")
const artist = document.getElementById("artist")

const queueBtn = document.getElementById("queueBtn")
const queuePanel = document.getElementById("queuePanel")
const queueList = document.getElementById("queueList")

let playlist = []
let queue = []
let index = -1

audio.volume = 0.7

function format(sec){
if(!sec || isNaN(sec)) return "0:00"

const m = Math.floor(sec/60)
const s = Math.floor(sec%60)

return m + ":" + (s < 10 ? "0"+s : s)
}

// search songs
async function search(q){

const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(q)}&media=music&limit=20`)
const data = await res.json()

playlist = data.results.filter(t => t.previewUrl)

resultsDiv.innerHTML = ""

playlist.forEach((t,i)=>{

const row = document.createElement("div")
row.className = "song"

row.innerHTML = `
<img src="${t.artworkUrl100}">

<div>
<div>${t.trackName}</div>
<div style="font-size:12px;color:#777">${t.artistName}</div>
</div>

<button class="play">Play</button>
<button class="add">+</button>
`

row.querySelector(".play").onclick = () => {
index = i
playTrack(playlist[i])
}

row.querySelector(".add").onclick = () => {
queue.push(playlist[i])
updateQueue()
}

resultsDiv.appendChild(row)

})
}

// play track
function playTrack(track){

audio.pause()

audio.src = track.previewUrl
audio.load()

audio.play()

cover.src = track.artworkUrl100
title.innerText = track.trackName
artist.innerText = track.artistName

playBtn.innerText = "⏸"

}

// play pause
playBtn.onclick = () => {

if(audio.paused){

audio.play()
playBtn.innerText = "⏸"

}else{

audio.pause()
playBtn.innerText = "▶"

}

}

// previous
prevBtn.onclick = () => {

if(index > 0){
index--
playTrack(playlist[index])
}

}

// next
nextBtn.onclick = () => {

if(index < playlist.length-1){
index++
playTrack(playlist[index])
}

}

// duration loaded
audio.onloadedmetadata = () => {
timeEnd.innerText = format(audio.duration)
}

// progress update
audio.ontimeupdate = () => {

timeCur.innerText = format(audio.currentTime)

const percent = (audio.currentTime/audio.duration)*100
barFill.style.width = percent + "%"

}

// progress seek
barBg.onclick = (e) => {

const rect = barBg.getBoundingClientRect()
const pos = (e.clientX - rect.left)/rect.width

audio.currentTime = pos * audio.duration

}

// volume
document.getElementById("volSlider").oninput = e => {
audio.volume = e.target.value
}

// queue update
function updateQueue(){

queueList.innerHTML = ""

queue.forEach(song => {

const li = document.createElement("li")
li.innerText = song.trackName

queueList.appendChild(li)

})

}

// queue panel toggle
queueBtn.onclick = () => {

queuePanel.style.display =
queuePanel.style.display === "block" ? "none" : "block"

}

// clear queue
document.getElementById("clearQueue").onclick = () => {

queue = []
updateQueue()

}

// search enter key
searchInput.addEventListener("keypress", e => {

if(e.key === "Enter"){
search(searchInput.value)
}

})
