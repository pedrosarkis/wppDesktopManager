import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import { exec } from 'child_process';
import Store from 'electron-store';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const store = new Store();

function createWindow () {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs')
    }
  });

  win.loadFile('index.html');
  win.webContents.openDevTools();
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.handle('select-directory', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory']
  });
  if (result.canceled) {
    return null;
  } else {
    return result.filePaths[0];
  }
});

ipcMain.handle('validate-node-project', async (event, dirPath) => {
  try {
    await fs.access(path.join(dirPath, 'package.json'));
    return true;
  } catch (error) {
    return false;
  }
});

ipcMain.handle('git-pull', async (event, dirPath) => {
  return new Promise((resolve, reject) => {
    exec('git pull', { cwd: dirPath }, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve(stdout);
      }
    });
  });
});

ipcMain.handle('get-store-value', (event, key) => {
  return store.get(key);
});

ipcMain.handle('set-store-value', (event, key, value) => {
  store.set(key, value);
  return true;
});

ipcMain.handle('saveFiles', async (event, dirPath, message, csvFile, mediaFiles) => {
  const contactsDir = path.join(dirPath, 'contacts');

  await fs.rm(contactsDir, { recursive: true, force: true });
  await fs.mkdir(contactsDir, { recursive: true });

  await fs.writeFile(path.join(contactsDir, 'message.txt'), message);

  await fs.writeFile(path.join(contactsDir, 'contacts.csv'), Buffer.from(csvFile));

  for (const file of mediaFiles) {
    await fs.writeFile(path.join(contactsDir, file.name), Buffer.from(file.data));
  }

  return true;
});

ipcMain.handle('runNpmStart', async (event, dirPath) => {
  return new Promise((resolve, reject) => {
    exec('npm start', { cwd: dirPath }, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve(stdout);
      }
    });
  });
});