const {ipcRenderer, desktopCapturer} = require('electron')

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

function handleStream (stream) {
  document.querySelector('audio').src = URL.createObjectURL(stream)
}

function handleError (e) {
  console.log(e)
}

let audioElement = document.querySelector('audio')
ipcRenderer.on('listen', (event, arg) => {
  if (arg) audioElement.play()
  else audioElement.pause()
})

let testButton = document.getElementById('test')
testButton.addEventListener('click', e => {
  if (audioElement.paused) {
    audioElement.play()
    setTimeout(function() {
      audioElement.pause()
    }, 5000);
  }
})