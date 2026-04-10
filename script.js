const API_KEY="943a0bae34mshe1eab6d31155808p12538djsn6e90e57ffe12"

let queue=[]
let currentIndex=0

async function searchSongs(){

const query=document.getElementById("searchInput").value

const url=`https://spotify23.p.rapidapi.com/search/?q=${query}&type=tracks&limit=6`

const options={
method:'GET',
headers:{
'X-RapidAPI-Key':API_KEY,
'X-RapidAPI-Host':'spotify23.p.rapidapi.com'
}
}

const response=await fetch(url,options)
const data=await response.json()

const tracks=data.tracks.items

let html=""

tracks.forEach(item=>{

const track=item.data

html+=`
<div class="track">

<p>${track.name} - ${track.artists.items[0].profile.name}</p>

<button onclick="playSong('${track.id}')">Play</button>

<button onclick="addQueue('${track.id}','${track.name}')">
Add to Queue
</button>

</div>
`
})

document.getElementById("results").innerHTML=html
}

function playSong(id){

document.getElementById("player").innerHTML=
`<iframe src="https://open.spotify.com/embed/track/${id}" width="400" height="100"></iframe>`
}

function addQueue(id,name){

queue.push({id,name})

updateQueue()
}

function updateQueue(){

let html=""

queue.forEach((song,index)=>{
html+=`<li>${song.name}</li>`
})

document.getElementById("queue").innerHTML=html
}

function nextSong(){

if(queue.length===0) return

currentIndex++

if(currentIndex>=queue.length){
currentIndex=0
}

playSong(queue[currentIndex].id)
}

function previousSong(){

if(queue.length===0) return

currentIndex--

if(currentIndex<0){
currentIndex=queue.length-1
}

playSong(queue[currentIndex].id)
}
