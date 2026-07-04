const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const { startServer, STORAGE_DIR } = require('./server');
const { getLocalIp, getAllLocalIps, startMdns } = require('./utils/network');
const { getOrCreateQr } = require('./utils/qr');

const PORT = 3000;
let mainWindow;
let ioInstance;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'renderer', 'dashboard.html'));
}

app.whenReady().then(async () => {
  // 1. Start the local server (handles uploads + real-time push)
  const { io } = startServer(PORT);
  ioInstance = io;

  // 2. Try to advertise this PC as datashare.local (works on some networks/
  //    devices, e.g. iPhones). It's a bonus, not something we depend on,
  //    because Android + Windows generally don't resolve .local hostnames.
  try {
    startMdns(PORT);
  } catch (err) {
    console.warn('mDNS advertise failed (safe to ignore):', err.message);
  }

  const localIp = getLocalIp();
  const allIps = getAllLocalIps();
  // Use the PC's actual local IP as the primary share URL - this is what
  // reliably works from any phone's browser without extra setup.
  const shareUrl = `http://${localIp}:${PORT}`;
  const mdnsUrl = `http://datashare.local:${PORT}`;

  // 3. Generate (or reuse cached) QR code for the share URL.
  //    getOrCreateQr only regenerates when this URL actually changes
  //    (e.g. PC got a new IP from the router) - otherwise the same QR
  //    from last time is reused automatically.
  const qrDataUrl = await getOrCreateQr(shareUrl);

  createWindow();

  mainWindow.webContents.once('did-finish-load', () => {
    mainWindow.webContents.send('init-data', {
      qrDataUrl,
      shareUrl,
      mdnsUrl,
      allIps,
      port: PORT
    });
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// ---------- IPC handlers for dashboard actions ----------

// Delete a received file
ipcMain.handle('file:delete', async (event, storedName) => {
  const filePath = path.join(STORAGE_DIR, storedName);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    return { success: true };
  }
  return { success: false, error: 'File not found' };
});

// Save (copy) a received file to a location the user chooses
ipcMain.handle('file:save', async (event, storedName, originalName) => {
  const sourcePath = path.join(STORAGE_DIR, storedName);
  const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
    defaultPath: originalName
  });
  if (canceled || !filePath) return { success: false };

  fs.copyFileSync(sourcePath, filePath);
  return { success: true, savedTo: filePath };
});

// Open a received file directly with the OS default app (no save needed)
ipcMain.handle('file:open', async (event, storedName) => {
  const filePath = path.join(STORAGE_DIR, storedName);
  if (!fs.existsSync(filePath)) {
    return { success: false, error: 'File not found' };
  }
  const errorMessage = await shell.openPath(filePath);
  if (errorMessage) {
    return { success: false, error: errorMessage };
  }
  return { success: true };
});

// Print a received file
ipcMain.handle('file:print', async (event, storedName) => {
  const filePath = path.join(STORAGE_DIR, storedName);
  try {
    const printWin = new BrowserWindow({ show: false });
    await printWin.loadFile(filePath);
    printWin.webContents.print({ silent: false }, (success, errorType) => {
      if (!success) console.error('Print failed:', errorType);
      printWin.close();
    });
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// Open the storage folder in file explorer (handy shortcut)
ipcMain.handle('storage:open-folder', () => {
  shell.openPath(STORAGE_DIR);
});

// User manually picked a different IP from the dropdown (auto-detect can
// occasionally pick a VPN/virtual adapter instead of the real WiFi/LAN one)
ipcMain.handle('network:set-ip', async (event, ip) => {
  const shareUrl = `http://${ip}:${PORT}`;
  const qrDataUrl = await getOrCreateQr(shareUrl);
  return { qrDataUrl, shareUrl };
});
