async function search(q){

resultsDiv.innerHTML="Searching..."

const res = await fetch(`https://api.deezer.com/search?q=${encodeURIComponent(q)}`)

const data = await res.json()

playlist = data.data.map(track => ({
trackName: track.title,
artistName: track.artist.name,
artworkUrl100: track.album.cover_medium,
previewUrl: track.preview
}))

resultsDiv.innerHTML=""

playlist.forEach((t,i)=>{

const row=document.createElement("div")

row.className="song"

row.innerHTML=`
<img src="${t.artworkUrl100}">

<div>
<div>${t.trackName}</div>
<div style="font-size:12px;color:#777">${t.artistName}</div>
</div>

<button class="play">Play</button>
<button class="add">+</button>
`

row.querySelector(".play").onclick=()=>{
index=i
playTrack(playlist[i])
}

row.querySelector(".add").onclick=()=>{
queue.push(playlist[i])
updateQueue()
}

resultsDiv.appendChild(row)

})

}
