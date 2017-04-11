const {
  app,
  BrowserWindow,
  Menu,
  Tray,
  ipcMain
} = require('electron')

const path = require('path')
const url = require('url')

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
  win = new BrowserWindow({width: 800, height: 600})

  // and load the index.html of the app.
  win.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  // Open the DevTools.
  win.webContents.openDevTools()

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
    {label: 'Listen', type: 'checkbox', click(){ListenState()}},
    {type: 'separator'},
    {label: 'Settings', type: 'normal', click(){win.show()}},
    {type: 'separator'},
    {label: 'Quit', role: 'quit'}
  ])

  tray.setToolTip('This is my application.')

  // Make a change to the context menu
  // contextMenu.items[0].checked = true
  
  // Call this again for Linux because we modified the context menu
  tray.setContextMenu(contextMenu)

  function ListenState() {
    win.webContents.send('listen', contextMenu.items[0].checked)
  }

})

// 'before-quit' is emitted when Electron receives 
// the signal to exit and wants to start closing windows
app.on('before-quit', () => willQuitApp = true)

// Quit when all windows are closed.
// app.on('window-all-closed', () => {
//   // On macOS it is common for applications and their menu bar
//   // to stay active until the user quits explicitly with Cmd + Q
//   if (process.platform !== 'darwin') {
//     app.quit()
//   }
// })

// app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  // if (win === null) {
  //   createWindow()
  // }
// })

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

// function createWindow () {
//   // Create the browser window.
//   win = new BrowserWindow({width: 800, height: 600})

//   // and load the index.html of the app.
//   win.loadURL(url.format({
//     pathname: path.join(__dirname, 'index.html'),
//     protocol: 'file:',
//     slashes: true
//   }))

//   // Open the DevTools.
//   win.webContents.openDevTools()

//   // Emitted when the window is closed.
//   win.on('closed', () => {
//     // Dereference the window object, usually you would store windows
//     // in an array if your app supports multi windows, this is the time
//     // when you should delete the corresponding element.
//     win = null
//   })
// }