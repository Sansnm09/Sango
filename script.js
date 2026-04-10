const audio=document.getElementById("audio")

let playlist=[]
let index=0

async function searchMusic(){

const q=document.getElementById("searchInput").value

const res=await fetch(`https://itunes.apple.com/search?term=${q}&media=music&limit=20`)
const data=await res.json()

playlist=data.results

let html=""

playlist.forEach((track,i)=>{

html+=`
<div class="card" onclick="playTrack(${i})">

<img src="${track.artworkUrl100}">
<p>${track.trackName}</p>
<p>${track.artistName}</p>

</div>
`

})

document.getElementById("results").innerHTML=html
}

function playTrack(i){

index=i

const track=playlist[i]

audio.src=track.previewUrl
audio.play()

document.getElementById("title").innerText=track.trackName
document.getElementById("artist").innerText=track.artistName
document.getElementById("cover").src=track.artworkUrl100

document.getElementById("playBtn").innerText="⏸"
}

function togglePlay(){

if(audio.paused){
audio.play()
document.getElementById("playBtn").innerText="⏸"
}
else{
audio.pause()
document.getElementById("playBtn").innerText="▶"
}

}

function nextSong(){

if(index<playlist.length-1){
index++
playTrack(index)
}

}

function previousSong(){

if(index>0){
index--
playTrack(index)
}

}

audio.ontimeupdate=()=>{

const progress=document.getElementById("progress")

progress.value=(audio.currentTime/audio.duration)*100

}

document.getElementById("progress").oninput=(e)=>{

audio.currentTime=(e.target.value/100)*audio.duration

}
