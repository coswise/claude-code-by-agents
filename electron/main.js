const { app, BrowserWindow, Menu, shell, ipcMain } = require('electron');
const path = require('path');

// Keep a global reference of the window object
let mainWindow;

// Set a consistent user data path for localStorage persistence
app.setPath('userData', path.join(app.getPath('appData'), 'CodeByAgents'));

const isDev = process.env.NODE_ENV === 'development';

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    titleBarStyle: 'hiddenInset', // macOS style
    trafficLightPosition: { x: 20, y: 20 },
    titleBarOverlay: {
      color: '#1a1d1a',
      symbolColor: '#ffffff'
    },
    backgroundColor: '#1a1d1a', // Match Claude Desktop dark theme
    show: false // Don't show until ready
  });

  // Load the app
  if (isDev) {
    // Try to load from dev server, fallback to built files
    mainWindow.loadURL('http://localhost:3000').catch(() => {
      console.log('Frontend dev server not running, loading built files...');
      mainWindow.loadFile(path.join(__dirname, '../frontend/dist/index.html'));
    });
    // Open DevTools in development
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../frontend/dist/index.html'));
  }

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

function startBackend() {
  // Frontend-only app - no backend process needed
  // The app will connect to the remote API endpoint
  return;
}

function stopBackend() {
  // No backend process to stop in frontend-only app
  return;
}

// App event handlers
app.whenReady().then(() => {
  startBackend();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  stopBackend();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  stopBackend();
});

// macOS Menu
if (process.platform === 'darwin') {
  const template = [
    {
      label: 'Code By Agents',
      submenu: [
        {
          label: 'About Code By Agents',
          role: 'about'
        },
        { type: 'separator' },
        {
          label: 'Hide Code By Agents',
          accelerator: 'Command+H',
          role: 'hide'
        },
        {
          label: 'Hide Others',
          accelerator: 'Command+Alt+H',
          role: 'hideothers'
        },
        {
          label: 'Show All',
          role: 'unhide'
        },
        { type: 'separator' },
        {
          label: 'Quit',
          accelerator: 'Command+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectall' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'close' },
        { type: 'separator' },
        { role: 'front' }
      ]
    }
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}