const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let panelWindow = null;
let gameWindow  = null;

function createPanelWindow() {
  panelWindow = new BrowserWindow({
    width: 700,
    height: 820,
    minWidth: 600,
    minHeight: 600,
    title: 'Batalha de Pipas – Painel',
    backgroundColor: '#0a0a12',
    resizable: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  panelWindow.loadFile('painel.html');
  panelWindow.setMenuBarVisibility(false);

  panelWindow.on('closed', () => {
    // Fecha o jogo junto se o painel fechar
    if (gameWindow && !gameWindow.isDestroyed()) gameWindow.close();
    panelWindow = null;
    app.quit();
  });
}

function createGameWindow() {
  if (gameWindow && !gameWindow.isDestroyed()) {
    gameWindow.focus();
    return;
  }

  // Posiciona o jogo ao lado direito do painel
  const pb = panelWindow ? panelWindow.getBounds() : { x: 100, y: 100, width: 420 };

  gameWindow = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 640,
    minHeight: 480,
    x: pb.x + pb.width + 8,
    y: pb.y,
    title: 'Batalha de Pipas – Jogo',
    backgroundColor: '#000000',
    resizable: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  gameWindow.loadFile('jogo.html');
  gameWindow.setMenuBarVisibility(false);

  gameWindow.on('closed', () => {
    gameWindow = null;
    // Avisa o painel que o jogo fechou
    if (panelWindow && !panelWindow.isDestroyed()) {
      panelWindow.webContents.send('game-closed');
    }
  });
}

// ── IPC: mensagens vindas do painel.html ───────────────────────────────────────

ipcMain.on('toggle-game-window', () => {
  if (gameWindow && !gameWindow.isDestroyed()) {
    gameWindow.close();
  } else {
    createGameWindow();
  }
});

// ── App lifecycle ──────────────────────────────────────────────────────────────

app.whenReady().then(() => {
  createPanelWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createPanelWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
