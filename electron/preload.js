const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Add any IPC methods here if needed in the future
  platform: process.platform,
  
  // Example: openExternal
  openExternal: (url) => {
    ipcRenderer.invoke('open-external', url);
  }
});

// Log when preload script loads
console.log('AgentHub preload script loaded');