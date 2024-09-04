const { app, BrowserWindow, ipcMain } = require('electron');
const { autoUpdater } = require('electron-updater');
//const log = require('electron-log');

// Configure logging
//log.transports.file.level = 'info';
//autoUpdater.logger = log;
//log.info('App starting...');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
    },
  });
  mainWindow.loadFile('index.html');
  mainWindow.on('closed', function () {
    mainWindow = null;
  });
  mainWindow.once('ready-to-show', () => {
    try {
      autoUpdater.checkForUpdatesAndNotify();
    } catch (error) {
      console.log('Error while checking for updates: ', error);
    }
  });
}

app.on('ready', () => {
  createWindow();
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  }

  autoUpdater.checkForUpdates();
});

ipcMain.on('app_version', (event) => {
  event.sender.send('app_version', { version: app.getVersion() });
});

// AutoUpdater Event Handlers with Logging
autoUpdater.on('checking-for-update', () => {
  console.log('Checking for update...');
});

autoUpdater.on('update-available', (info) => {
  //log.info('Update available.', info);
  mainWindow.webContents.send('update_available');
});

autoUpdater.on('update-not-available', (info) => {
  //log.info('Update not available.', info);
});

autoUpdater.on('error', (err) => {
  console.log('Error in auto-updater. ', err);
});
/*
autoUpdater.on('download-progress', (progressObj) => {
  log.info(`Download speed: ${progressObj.bytesPerSecond}`);
  log.info(`Downloaded ${progressObj.percent}%`);
  log.info(`(${progressObj.transferred}/${progressObj.total})`);
});
*/
autoUpdater.on('update-downloaded', (info) => {
  //log.info('Update downloaded', info);
  mainWindow.webContents.send('update_downloaded');
});

ipcMain.on('restart_app', () => {
  //log.info('Restarting app to install update...');
  autoUpdater.quitAndInstall();
});
