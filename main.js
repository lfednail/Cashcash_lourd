const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { startServer, stopServer } = require('./server');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1100,
    minHeight: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
      preload: path.join(__dirname, 'preload.js'),
    },
    icon: path.join(__dirname, 'public', 'images', 'cashcash-logov3.png'),
    backgroundColor: '#f8fafc',
    show: false,
    titleBarStyle: 'default',
    title: 'CashCash - Application de Gestion',
  });

  mainWindow.loadFile(path.join(__dirname, 'public', 'index.html'));

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// ─── IPC Handlers ─────────────────────────────────────────────────────────────
ipcMain.handle('save-file', async (event, { fileName, content, defaultPath }) => {
  const { filePath } = await dialog.showSaveDialog(mainWindow, {
    title: 'Enregistrer le fichier',
    defaultPath: path.join(app.getPath('documents'), fileName),
    buttonLabel: 'Enregistrer',
  });

  if (filePath) {
    // Si c'est un PDF, le contenu est en Base64 et doit être décodé en Buffer
    const buffer = fileName.toLowerCase().endsWith('.pdf') 
      ? Buffer.from(content, 'base64') 
      : content;
    
    fs.writeFileSync(filePath, buffer);
    return { success: true, path: filePath };
  }
  return { success: false };
});

ipcMain.handle('get-app-path', () => app.getAppPath());

app.whenReady().then(async () => {
  try {
    await startServer();
    console.log('Express server started successfully');
  } catch (err) {
    console.error('Failed to start Express server:', err);
  }
  createWindow();
});

app.on('window-all-closed', () => {
  stopServer();
  app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

