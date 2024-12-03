let currentSong = new Audio();
let songs;
let currFolder;


function formatTime(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }
  // Calculate minutes and remaining seconds
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  // Format minutes and seconds with leading zeros
  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(remainingSeconds).padStart(2, '0');

  // Combine and return the result
  return `${formattedMinutes}:${formattedSeconds}`;
}



async function getSongs(folder) {
  currFolder = folder;
  let a = await fetch(`/${folder}/`)
  let response = await a.text();
  
  let div = document.createElement("div")
  div.innerHTML = response;
  let as = div.getElementsByTagName("a")


  songs = []
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${folder}/`)[1])
    }

  }

  // list of all song shown in the library
  let songUl = document.querySelector(".songList").getElementsByTagName("ul")[0]
  songUl.innerHTML = ""
  for (const song of songs) {
    songUl.innerHTML = songUl.innerHTML + `<li>
                <img class="invert" src="image/music.svg" alt="">
                <div class="info">
                  <div>${song.replaceAll("%20", "")}</div>
                  <div>Arjit Singh</div>
                </div>
                <div class="playNow">
                  <span>Play Now</span>
                  <img class="invert" src="image/play.svg" alt="">
                </div>
                 </ul>`;
  }
  // Attach an event listener to each song
  Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
    e.addEventListener("click", element => {

      playMusic(e.querySelector(".info").firstElementChild.innerHTML)

    })
  })
  return songs
}





// play Music
const playMusic = (track, pause = false) => {
  // let audio =new Audio("/songs/"+track)
  currentSong.src = `/${currFolder}/` + decodeURI(track)
  if (!pause) {
    currentSong.play()
    play.src = "image/pause.svg"
  }

  document.querySelector(".songinfo").innerHTML = decodeURI(track)
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00"

  // Attach event listener for automatic next song
currentSong.addEventListener("ended", () => {
  let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
  if ((index + 1) < songs.length) {
      playMusic(songs[index + 1]); // Play the next song
  } else {
      playMusic(songs[0], true); // Replay the first song if the playlist ends
  }
});

}


async function displayAlbums() {

  let a = await fetch(`/songs/`)
  let response = await a.text();
  let div = document.createElement("div")
  div.innerHTML = response;
  let cardContainer = document.querySelector(".cardContainer")
  let anchors = div.getElementsByTagName("a")
  let array = Array.from(anchors)
  for (let index = 0; index < array.length; index++) {
    const e = array[index];


    if (e.href.includes("/songs/")) {
      let folder = e.href.split("/").slice(-2)[1];
      // get the metadata of the folder
      let a = await fetch(`/songs/${folder}/info.json`)
      let response = await a.json();
      
      cardContainer.innerHTML = cardContainer.innerHTML + `
          <div data-folder="${folder}" class="card">
        
            <img src="/songs/${folder}/cover.png" alt="">
            <h2>${response.title}</h2>
            <p>${response.discription}</p>
          </div>`

    }
  }


  // Load the playList whenever card is clicked
  Array.from(document.getElementsByClassName("card")).forEach(e => {
    e.addEventListener("click", async item => {
      console.log("Fetching Songs")
      songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
      playMusic(songs[0])

    })
  })
}




async function main() {

  // get the list of all song
  await getSongs("songs/cs")
  playMusic(songs[0], true)

  // display all albums on the page
  displayAlbums()


  // Attach an event listener to play, next and previous
  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play()
      play.src = "image/pause.svg"
      // document.querySelector(".playNow img").src="image/pause.svg"
    } else {
      currentSong.pause()
      play.src = "image/play.svg"
      // document.querySelector(".playNow img").src="image/play.svg"
    }
  })



  //Listen for timeupdate event
  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML = `${formatTime(currentSong.currentTime)}/${formatTime(currentSong.duration)}`
    document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
  })


  // Add an event listner to seekbar
  document.querySelector(".seekbar").addEventListener("click", e => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = ((currentSong.duration) * percent) / 100
  })


  // Add an event listner on hamburger
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0"
  })
  // Add an event listner on close
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%"
  })
  // Add  an event listner to prev
  previous.addEventListener("click", () => {
    currentSong.pause()
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
    if ((index - 1) >= 0) {
      playMusic(songs[index - 1]);
    }
  })
  // Add  an event listner to next
  next.addEventListener("click", () => {
    currentSong.pause()
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
    if ((index + 1) < songs.length) {
      playMusic(songs[index + 1]);
    }
  })

  // add an event listner on volume
  document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
    currentSong.volume = parseInt(e.target.value) / 100
  })

   // add event listner on mute the track
   document.querySelector(".volume>img").addEventListener("click", e=>{ 
    if(e.target.src.includes("volume.svg")){
        e.target.src = e.target.src.replace("volume.svg", "mute.svg")
        currentSong.volume = 0;
        document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
    }
    else{
        e.target.src = e.target.src.replace("mute.svg", "volume.svg")
        currentSong.volume = .10;
        document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
    }

})


}
main()