const {
  app,
  BrowserWindow,
  Menu,
  Tray,
  ipcMain
} = require('electron')

const path = require('path')
const url = require('url')
require('electron-reload')(__dirname)

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
    } else {
      // the user only tried to close the window
      e.preventDefault();
      win.hide();
    }
  })

  // set up the tray
  tray = new Tray('/home/kuwood/projects/mic-check/icon.png')
  const contextMenu = Menu.buildFromTemplate([
    {label: 'Listen', type: 'checkbox', click(){sendListenState()}},
    {type: 'separator'},
    {label: 'Settings', type: 'normal', click(){win.show()}},
    {type: 'separator'},
    {label: 'Quit', role: 'quit'}
  ])

  // Call this again for Linux because we modified the context menu
  tray.setContextMenu(contextMenu)

  tray.setToolTip(`Mic Check is not listening.`)
  
  function checkToolTip(label) {
    if (label) tray.setToolTip(`Mic Check is listening.`)
    else tray.setToolTip(`Mic Check is not listening.`)
  }

  function sendListenState() {
    const listenLabelChecked = contextMenu.items[0].checked
    win.webContents.send('listen', listenLabelChecked)
    checkToolTip(listenLabelChecked)
  }

  ipcMain.on('initialHide', () => {
    win.close()
  })
})

// 'before-quit' is emitted when Electron receives 
// the signal to exit and wants to start closing windows
app.on('before-quit', () => willQuitApp = true)
