const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('desktop', {
  isDesktop: true,
  openMain: (p) => ipcRenderer.send('open-main', p),
  toggleWidget: () => ipcRenderer.send('toggle-widget'),
  closeWidget: () => ipcRenderer.send('close-widget'),
  getSettings: () => ipcRenderer.invoke('get-settings'),
  setSetting: (key, value) => ipcRenderer.invoke('set-setting', key, value),
  onNavigate: (cb) => {
    const fn = (_e, p) => cb(p);
    ipcRenderer.on('navigate', fn);
    return () => ipcRenderer.removeListener('navigate', fn);
  },
});
