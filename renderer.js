const {ipcRenderer, desktopCapturer} = require('electron')

const MILLISECONDS_IN_5_SECONDS = 5000

// selectors
let audioElement = document.querySelector('audio')
let testButton = document.getElementById('test')
let listenBinding = document.getElementById('listen')

// Get electron window
desktopCapturer.getSources({types: ['window', 'screen']}, (error, sources) => {
  if (error) throw error
  for (let i = 0; i < sources.length; ++i) {
    if (sources[i].name === 'Mic Check: Settings') {
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
  let ctx = new AudioContext()
  let source = ctx.createMediaStreamSource(stream)
  let dest = ctx.createMediaStreamDestination()
  let gainNode = ctx.createGain()
  let filter = ctx.createBiquadFilter()

  filter.Q.value = 3.50
  filter.frequency.value = 355
  filter.type = 'bandpass'

  source.connect(filter)
  filter.connect(gainNode)
  gainNode.connect(dest)

  document.getElementById('gain').onchange = function() {
      gainNode.gain.value = this.value // Any number between 0 and 1.
  }
  gainNode.gain.value = document.getElementById('gain').value

  // // Store the source and destination in a global variable
  // // to avoid losing the audio to garbage collection.
  // window.leakMyAudioNodes = [source, dest]
  audioElement.src = URL.createObjectURL(dest.stream)
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

listenBinding.addEventListener('click', e => {
  let bindingArr = []
  function endIfThree() {
    if (bindingArr.length === 3) {
      listenBinding.innerHTML = bindingArr.join(' + ')
      ipcRenderer.send('setListenBinding', bindingArr.join('+'))
      window.removeEventListener('keydown', buildString)
      window.removeEventListener('keyup', endIfThree)
    }
  }
  window.addEventListener('keyup', endIfThree)
  function buildString(event) {
    if (event.keyCode === 13 || event.keyCode === 27) {
      ipcRenderer.send('setListenBinding', bindingArr.join('+'))
      listenBinding.innerHTML = bindingArr.join(' + ')
      window.removeEventListener('keydown', buildString)
      window.removeEventListener('keyup', endIfThree)
    } else if (bindingArr.length < 3) {
      bindingArr.push(event.key)
      listenBinding.innerHTML = bindingArr.join(' + ')
    } else {
      ipcRenderer.send('setListenBinding', bindingArr.join('+'))
      listenBinding.innerHTML = bindingArr.join(' + ')
      window.removeEventListener('keydown', buildString)
    }
  }
  window.addEventListener('keydown', buildString)
})

// ipcRenderer.send('initialHide')
// alert('WARNING: Use headphones to prevent audio feedback.')