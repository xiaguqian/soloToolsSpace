
const { app, BrowserWindow, Tray, Menu, ipcMain, shell } = require('electron');
const path = require('path');
const Store = require('electron-store');

const store = new Store();

let mainWindow;
let tray = null;
let isQuiting = false;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 900,
        height: 600,
        minWidth: 800,
        minHeight: 500,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true
        },
        icon: path.join(__dirname, 'assets', 'icon.png'),
        show: false
    });

    mainWindow.loadURL('http://localhost:3000');

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    mainWindow.on('close', (event) => {
        if (!isQuiting && store.get('trayEnabled', true)) {
            event.preventDefault();
            mainWindow.hide();
        }
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

function createTray() {
    tray = new Tray(path.join(__dirname, 'assets', 'tray.png'));
    const contextMenu = Menu.buildFromTemplate([
        {
            label: '显示窗口',
            click: () => {
                mainWindow.show();
            }
        },
        {
            label: '退出',
            click: () => {
                isQuiting = true;
                app.quit();
            }
        }
    ]);
    tray.setContextMenu(contextMenu);
    tray.setToolTip('IM Client');
    tray.on('click', () => {
        mainWindow.show();
    });
}

app.on('ready', () => {
    createWindow();
    createTray();
    
    if (store.get('autoStart', false)) {
        app.setLoginItemSettings({
            openAtLogin: true
        });
    }
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});

ipcMain.on('show-window', () => {
    mainWindow.show();
});

ipcMain.on('hide-window', () => {
    mainWindow.hide();
});

ipcMain.on('minimize-window', () => {
    mainWindow.minimize();
});

ipcMain.on('maximize-window', () => {
    if (mainWindow.isMaximized()) {
        mainWindow.unmaximize();
    } else {
        mainWindow.maximize();
    }
});

ipcMain.on('close-window', () => {
    mainWindow.close();
});

ipcMain.on('set-auto-start', (event, value) => {
    store.set('autoStart', value);
    app.setLoginItemSettings({
        openAtLogin: value
    });
});

ipcMain.on('set-tray-enabled', (event, value) => {
    store.set('trayEnabled', value);
});

ipcMain.on('get-settings', (event) => {
    event.reply('settings', {
        autoStart: store.get('autoStart', false),
        trayEnabled: store.get('trayEnabled', true)
    });
});

ipcMain.on('create-new-window', () => {
    const newWindow = new BrowserWindow({
        width: 900,
        height: 600,
        minWidth: 800,
        minHeight: 500,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
        icon: path.join(__dirname, 'assets', 'icon.png')
    });
    newWindow.loadURL('http://localhost:3000');
});
