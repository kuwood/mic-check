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

ipcRenderer.on('listen', (event, arg) => {
  let audioElement = document.querySelector('audio')
  if (arg) audioElement.play()
  else audioElement.pause()
})