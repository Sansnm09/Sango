const clientId = "YOUR_CLIENT_ID"
const redirectUri = window.location.origin

let accessToken=""
let queue=[]

function loginSpotify(){

const authUrl =
"https://accounts.spotify.com/authorize"+
"?response_type=token"+
"&client_id="+clientId+
"&scope=user-read-private"+
"&redirect_uri="+redirectUri

window.location=authUrl
}

function getToken(){

const hash=window.location.hash

if(hash){

const params=new URLSearchParams(hash.replace("#",""))
accessToken=params.get("access_token")

}

}

async function searchSongs(){

if(!accessToken){

alert("Login with Spotify first")
return
}

const query=document.getElementById("searchInput").value

const result=await fetch(
`https://api.spotify.com/v1/search?q=${query}&type=track&limit=5`,
{
headers:{
Authorization:`Bearer ${accessToken}`
}
}
)

const data=await result.json()

let html=""

data.tracks.items.forEach(track=>{

html+=`
<div class="track">

<p>${track.name} - ${track.artists[0].name}</p>

<button onclick="playSong('${track.id}')">Play</button>

<button onclick="addQueue('${track.id}','${track.name}')">Queue</button>

</div>
`

})

document.getElementById("results").innerHTML=html
}

function playSong(id){

document.getElementById("player").innerHTML=
`<iframe src="https://open.spotify.com/embed/track/${id}" width="320" height="80"></iframe>`
}

function addQueue(id,name){

queue.push({id,name})
updateQueue()
}

function updateQueue(){

let html=""

queue.forEach(song=>{
html+=`<li>${song.name}</li>`
})

document.getElementById("queue").innerHTML=html
}

getToken()
