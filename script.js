const API_KEY = "943a0bae34mshe1eab6d31155808p12538djsn6e90e57ffe12"

let queue = []

async function searchSongs(){

const query = document.getElementById("searchInput").value

if(query===""){
alert("Please enter a song name")
return
}

const url = `https://spotify23.p.rapidapi.com/search/?q=${query}&type=tracks&limit=5`

const options = {
method:'GET',
headers:{
'X-RapidAPI-Key':API_KEY,
'X-RapidAPI-Host':'spotify23.p.rapidapi.com'
}
}

try{

const response = await fetch(url,options)
const data = await response.json()

const tracks = data.tracks.items

let html=""

tracks.forEach(item=>{

const track = item.data

html += `
<div class="track">

<img src="${track.albumOfTrack.coverArt.sources[0].url}">

<p>${track.name} - ${track.artists.items[0].profile.name}</p>

<button onclick="playSong('${track.id}')">Play</button>

<button onclick="addQueue('${track.id}','${track.name}')">Add to Queue</button>

</div>
`
})

document.getElementById("results").innerHTML = html

}

catch(error){
console.log(error)
alert("Error fetching songs")
}

}

function playSong(id){

document.getElementById("player").innerHTML =
`<iframe src="https://open.spotify.com/embed/track/${id}" width="320" height="80" frameborder="0" allow="encrypted-media"></iframe>`

}

function addQueue(id,name){

queue.push({id,name})
updateQueue()

}

function updateQueue(){

let html=""

queue.forEach(song=>{
html += `<li>${song.name}</li>`
})

document.getElementById("queue").innerHTML = html
}
