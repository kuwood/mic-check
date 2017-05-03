const {
  app,
  BrowserWindow,
  Menu,
  Tray,
  ipcMain,
  globalShortcut,
} = require('electron')

const path = require('path')
const url = require('url')

// live-reload for development
require('electron-reload')(__dirname, {
  electron: path.join(__dirname, 'node_modules', '.bin', 'electron'),
  hardResetMethod: 'exit',
})

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win
let tray = null
let willQuitApp = false

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  // create window
  win = new BrowserWindow({
    width: 600,
    height: 230,
    resizable: false,
    autoHideMenuBar: true
  })

  // and load the index.html of the app.
  win.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  // Open the DevTools.
  // win.webContents.openDevTools()

  // Emitted when the window is closed.
  win.on('close', (e) => {
    if (willQuitApp) {
      // the user tried to quit the app 
      window = null;
      // Unregister all shortcuts.
      globalShortcut.unregisterAll()
    } else {
      // the user only tried to close the window
      e.preventDefault();
      win.hide();
    }
  })

  // set up the tray
  tray = new Tray('/home/kuwood/projects/mic-check/icon.png')
  const contextMenu = Menu.buildFromTemplate([{
      label: 'Listen',
      type: 'checkbox',
      click() {
        sendListenState()
      }
    },
    {
      type: 'separator'
    },
    {
      label: 'Settings',
      type: 'normal',
      click() {
        win.show()
      }
    },
    {
      type: 'separator'
    },
    {
      label: 'Quit',
      role: 'quit'
    }
  ])

  tray.setContextMenu(contextMenu)

  tray.setToolTip(`Mic Check is not listening.`)

  // sets tooltip based on listen state
  function checkToolTip(label) {
    if (label) tray.setToolTip(`Mic Check is listening.`)
    else tray.setToolTip(`Mic Check is not listening.`)
  }

  // sends listen event with boolean
  function sendListenState() {
    const listenLabelChecked = contextMenu.items[0].checked
    win.webContents.send('listen', listenLabelChecked)
    checkToolTip(listenLabelChecked)
  }

  bindings = {
    'listen': 'CommandOrControl+Shift+]',
    'increaseGain': '',
    'decreaseGain': '',
  }

  ipcMain.on('setListenBinding', (event, keys) => {
    console.log(keys)
    globalShortcut.unregister(bindings.listen)
    globalShortcut.register(keys, () => {
      bindings.listen = keys
      handleListenBind()
      sendListenState()
    })
  })

  function handleListenBind() {
    console.log(bindings.listen, 'is pressed')
    contextMenu.items[0].checked = !contextMenu.items[0].checked
    // Call this again for Linux because we modified the context menu
    tray.setContextMenu(contextMenu)
  }

  // register listen binding
  globalShortcut.register(bindings.listen, () => {
    handleListenBind()
    sendListenState()
  })

  ipcMain.on('initialHide', () => {
    win.close()
  })
})

// 'before-quit' is emitted when Electron receives 
// the signal to exit and wants to start closing windows
app.on('before-quit', () => willQuitApp = true)