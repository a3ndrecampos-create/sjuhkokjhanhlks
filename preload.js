const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Abre/fecha a janela do jogo
  toggleGameWindow: () => ipcRenderer.send('toggle-game-window'),

  // Recebe aviso quando o jogo for fechado pelo X
  onGameClosed: (callback) => ipcRenderer.on('game-closed', callback),
});
