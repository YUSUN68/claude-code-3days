// 퀘스트 스케줄러 윈도우 프로그램: 메인 창(대시보드) + 바탕화면 위젯 + 트레이
const { app, BrowserWindow, Tray, Menu, ipcMain, protocol, net, screen, shell, nativeImage } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const { pathToFileURL } = require('node:url');

const DEV = process.argv.includes('--dev');
const DEV_URL = 'http://localhost:5173';
const APP_URL = 'app://quest';
const DIST = path.join(__dirname, '..', 'dist');
const START_HIDDEN = process.argv.includes('--hidden');

protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { standard: true, secure: true, supportFetchAPI: true, corsEnabled: true, stream: true } },
]);

if (!app.requestSingleInstanceLock()) {
  app.quit();
}
app.setAppUserModelId('com.quest.scheduler');

/* ---------- 설정 ---------- */
const settingsFile = () => path.join(app.getPath('userData'), 'settings.json');
let settings = { widgetOnTop: true, openAtLogin: false, widgetVisible: true, widgetBounds: null };
function loadSettings() {
  try {
    settings = { ...settings, ...JSON.parse(fs.readFileSync(settingsFile(), 'utf8')) };
  } catch {
    /* 첫 실행 */
  }
}
function saveSettings() {
  try {
    fs.writeFileSync(settingsFile(), JSON.stringify(settings, null, 2));
  } catch {
    /* 무시 */
  }
}

const base = () => (DEV ? DEV_URL : APP_URL);
const iconPath = path.join(__dirname, 'icon.png');

let mainWin = null;
let widgetWin = null;
let tray = null;
let quitting = false;

function hardenLinks(win) {
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:/.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });
}

function createMain(show) {
  mainWin = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 380,
    minHeight: 500,
    show: false,
    title: '퀘스트 스케줄러',
    icon: iconPath,
    backgroundColor: '#1e1b3a',
    autoHideMenuBar: true,
    webPreferences: { preload: path.join(__dirname, 'preload.cjs'), contextIsolation: true, sandbox: true },
  });
  hardenLinks(mainWin);
  mainWin.loadURL(`${base()}/`);
  if (show) mainWin.once('ready-to-show', () => mainWin.show());
  mainWin.on('close', (e) => {
    if (!quitting) {
      e.preventDefault();
      mainWin.hide();
    }
  });
}

function defaultWidgetBounds() {
  const { workArea } = screen.getPrimaryDisplay();
  const width = 340;
  const height = 560;
  return { width, height, x: workArea.x + workArea.width - width - 16, y: workArea.y + 16 };
}

function boundsOnScreen(b) {
  if (!b) return false;
  return screen.getAllDisplays().some(({ workArea: w }) => b.x < w.x + w.width - 40 && b.x + b.width > w.x + 40 && b.y >= w.y - 10 && b.y < w.y + w.height - 40);
}

function createWidget() {
  const b = boundsOnScreen(settings.widgetBounds) ? settings.widgetBounds : defaultWidgetBounds();
  widgetWin = new BrowserWindow({
    ...b,
    minWidth: 260,
    minHeight: 220,
    frame: false,
    resizable: true,
    skipTaskbar: true,
    alwaysOnTop: settings.widgetOnTop,
    show: false,
    title: '오늘의 퀘스트',
    icon: iconPath,
    backgroundColor: '#1e1b3a',
    webPreferences: { preload: path.join(__dirname, 'preload.cjs'), contextIsolation: true, sandbox: true },
  });
  hardenLinks(widgetWin);
  widgetWin.loadURL(`${base()}/widget`);
  widgetWin.once('ready-to-show', () => settings.widgetVisible && widgetWin.showInactive());
  let t = null;
  const remember = () => {
    clearTimeout(t);
    t = setTimeout(() => {
      if (!widgetWin || widgetWin.isDestroyed()) return;
      settings.widgetBounds = widgetWin.getBounds();
      saveSettings();
    }, 400);
  };
  widgetWin.on('move', remember);
  widgetWin.on('resize', remember);
  widgetWin.on('close', (e) => {
    if (!quitting) {
      e.preventDefault();
      setWidgetVisible(false);
    }
  });
}

function setWidgetVisible(v) {
  settings.widgetVisible = v;
  saveSettings();
  if (!widgetWin || widgetWin.isDestroyed()) createWidget();
  if (v) widgetWin.show();
  else widgetWin.hide();
  refreshTray();
}

function showMain(p) {
  if (!mainWin || mainWin.isDestroyed()) createMain(true);
  if (mainWin.isMinimized()) mainWin.restore();
  mainWin.show();
  mainWin.focus();
  if (p) mainWin.webContents.send('navigate', p);
}

function applySetting(key, value) {
  settings[key] = value;
  saveSettings();
  if (key === 'widgetOnTop' && widgetWin && !widgetWin.isDestroyed()) widgetWin.setAlwaysOnTop(value);
  if (key === 'openAtLogin' && app.isPackaged) app.setLoginItemSettings({ openAtLogin: value, args: ['--hidden'] });
  refreshTray();
}

function refreshTray() {
  if (!tray) return;
  tray.setContextMenu(
    Menu.buildFromTemplate([
      { label: '대시보드 열기', click: () => showMain('/') },
      { label: '캘린더 열기', click: () => showMain('/calendar') },
      { type: 'separator' },
      { label: '위젯 보이기', type: 'checkbox', checked: settings.widgetVisible, click: (i) => setWidgetVisible(i.checked) },
      { label: '위젯 항상 위', type: 'checkbox', checked: settings.widgetOnTop, click: (i) => applySetting('widgetOnTop', i.checked) },
      { label: '윈도우 시작 시 실행', type: 'checkbox', checked: settings.openAtLogin, enabled: app.isPackaged, click: (i) => applySetting('openAtLogin', i.checked) },
      { type: 'separator' },
      { label: '종료', click: () => { quitting = true; app.quit(); } },
    ]),
  );
}

function createTray() {
  const img = nativeImage.createFromPath(path.join(__dirname, 'tray.png')).resize({ width: 16, height: 16 });
  tray = new Tray(img);
  tray.setToolTip('퀘스트 스케줄러');
  tray.on('click', () => showMain());
  refreshTray();
}

/* ---------- IPC ---------- */
ipcMain.on('open-main', (_e, p) => showMain(typeof p === 'string' && p.startsWith('/') ? p : '/'));
ipcMain.on('toggle-widget', () => setWidgetVisible(!(widgetWin && !widgetWin.isDestroyed() && widgetWin.isVisible())));
ipcMain.on('close-widget', () => setWidgetVisible(false));
ipcMain.handle('get-settings', () => ({ widgetOnTop: settings.widgetOnTop, openAtLogin: settings.openAtLogin }));
ipcMain.handle('set-setting', (_e, key, value) => {
  if ((key === 'widgetOnTop' || key === 'openAtLogin') && typeof value === 'boolean') applySetting(key, value);
});

app.on('second-instance', () => showMain());
app.on('before-quit', () => {
  quitting = true;
});
app.on('window-all-closed', () => {
  /* 트레이에 남아 있는다 */
});

app.whenReady().then(() => {
  loadSettings();
  if (!DEV) {
    // dist 폴더를 app://quest/ 로 서비스. 파일이 없으면 index.html (SPA 라우팅)
    protocol.handle('app', (req) => {
      const { pathname } = new URL(req.url);
      const rel = decodeURIComponent(pathname).replace(/^\/+/, '');
      let file = path.normalize(path.join(DIST, rel));
      if (!file.startsWith(DIST) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) file = path.join(DIST, 'index.html');
      return net.fetch(pathToFileURL(file).toString());
    });
  }
  createTray();
  createMain(!START_HIDDEN);
  createWidget();
});
