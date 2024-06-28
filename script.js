let currentsong = new Audio();
let songs;
let currfolder;

async function getsongs(folder) {
  currfolder = folder;
  let a = await fetch(`http://127.0.0.1:3000/${folder}/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  songs = [];
  for (let i = 0; i < as.length; i++) {
    let element = as[i];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${folder}/`)[1]);
    }
  }
  return songs;
}



const playmusic = (track, pause = false) => {
  currentsong.src = `/${currfolder}/` + track;
  if (!pause) {
    currentsong.play();
    play.src = "img/pause.svg";
  }
  document.querySelector(".songinfo").innerHTML = decodeURI(track);
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};

async function main() {
  await getsongs("/songs");
  playmusic(songs[0], true);

  const updateSongList = () => {
    let songul = document.querySelector(".songlist ul");
    songul.innerHTML = ""; // Clear existing songs
    for (const song of songs) {
      songul.innerHTML += `
        <li>
          <img class="invert" src="img/music.svg" alt="">
          <div class="info">
            <div>${song.replaceAll("%20", " ").replace(".mp3", "")}</div>
            <div>${currfolder.replace("songs/", "")}</div>
          </div>
          <div class="playnow">
            <span>Play Now</span>
            <img class="invert" src="img/play.svg" alt="">
          </div>
        </li>`;
    }
    Array.from(document.querySelectorAll(".songlist li")).forEach(
      (e, index) => {
        e.addEventListener("click", () => {
          playmusic(songs[index]);
        });
      }
    );
  };

  updateSongList();

  play.addEventListener("click", () => {
    if (currentsong.paused) {
      currentsong.play();
      play.src = "img/pause.svg";
    } else {
      currentsong.pause();
      play.src = "img/play.svg";
    }
  });

  currentsong.addEventListener("timeupdate", () => {
    let time = currentsong.currentTime;
    let duration = currentsong.duration;
    let min = Math.floor(time / 60);
    let sec = Math.floor(time % 60);
    if (sec < 10) {
      sec = "0" + sec;
    }
    if (isNaN(duration)) {
      document.querySelector(".songtime").innerHTML = `00:00 / 00:00`;
      document.querySelector(".circle").style.left = "0%";
    } else {
      let min2 = Math.floor(duration / 60);
      let sec2 = Math.floor(duration % 60);
      if (sec2 < 10) {
        sec2 = "0" + sec2;
      }
      document.querySelector(
        ".songtime"
      ).innerHTML = `${min}:${sec} / ${min2}:${sec2}`;
      document.querySelector(".circle").style.left =
        (time / duration) * 100 + "%";
    }
  });

  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    let newTime = (currentsong.duration * percent) / 100;
    currentsong.currentTime = newTime;
  });

  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = 0;
  });

  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-110%";
  });

  previous.addEventListener("click", () => {
    let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0]);
    if (index - 1 >= 0) {
      playmusic(songs[index - 1]);
    }
  });

  next.addEventListener("click", () => {
    let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0]);
    if (index + 1 < songs.length) {
      playmusic(songs[index + 1]);
    }
  });

  document.querySelector(".range input").addEventListener("change", (e) => {
    currentsong.volume = parseInt(e.target.value) / 100;
  });

  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    e.addEventListener("click", async (event) => {
      let folder = event.currentTarget.dataset.folder;
      songs = await getsongs(`songs/${folder}`);
      updateSongList();
      playmusic(songs[0]); // Automatically play the first song
    });
  });

  document.querySelector(".volume>img").addEventListener("click", (e) => {
    if (e.target.src.includes("img/volume.svg")) {
      e.target.src = "img/mute.svg";
      currentsong.volume = 0;
    } else {
      e.target.src = "img/volume.svg";
      currentsong.volume = 1;
    }
  });
}

main();
