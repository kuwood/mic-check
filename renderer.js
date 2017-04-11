const {ipcRenderer, desktopCapturer} = require('electron')

const MILLISECONDS_IN_5_SECONDS = 5000

// selectors
let audioElement = document.querySelector('audio')
let testButton = document.getElementById('test')

// Get electron window
desktopCapturer.getSources({types: ['window', 'screen']}, (error, sources) => {
  if (error) throw error
  for (let i = 0; i < sources.length; ++i) {
    if (sources[i].name === 'Mic Check') {
      navigator.webkitGetUserMedia({
        audio: true,
        video: false
      }, handleStream, handleError)
      return
    }
  }
})

// set audio element source to stream
function handleStream (stream) {
  audioElement.src = URL.createObjectURL(stream)
}

function handleError (e) {
  console.log(e)
}

// on listen event play or pause audio
ipcRenderer.on('listen', (event, arg) => {
  if (arg) audioElement.play()
  else audioElement.pause()
})

// play audio to test mic within settings menu
testButton.addEventListener('click', e => {
  if (audioElement.paused) {
    audioElement.play()
    setTimeout(function() {
      audioElement.pause()
    }, MILLISECONDS_IN_5_SECONDS);
  }
})