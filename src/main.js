const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const { NodeSSH } = require('node-ssh');
const path = require('path');
const fs = require('fs');

let mainWindow;
let ssh = new NodeSSH();

function createWindow() {
  // Создаем окно браузера
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 1000,
    minHeight: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, '../assets/icon.png'),
    titleBarStyle: 'default',
    show: false
  });

  // Загружаем HTML файл
  mainWindow.loadFile('src/index.html');

  // Показываем окно когда оно готово
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Открываем DevTools в dev режиме
  if (process.argv.includes('--dev')) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Создаем окно когда Electron готов
app.whenReady().then(createWindow);

// Выходим когда все окна закрыты
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

// App meta
ipcMain.handle('get-app-version', async () => app.getVersion());

// IPC обработчики для SSH
ipcMain.handle('ssh-connect', async (event, connection) => {
  try {
    await ssh.connect({
      host: connection.host,
      port: connection.port,
      username: connection.username,
      password: connection.password,
      readyTimeout: 20000,
      // Автоматически принимать SSH ключи хоста
      onKeyboardInteractive: (name, instructions, instructionsLang, prompts, finish) => {
        // Автоматически отвечаем на все промпты
        finish([]);
      },
      // Дополнительные опции для автоматического принятия ключей
      algorithms: {
        kex: [
          'diffie-hellman-group1-sha1',
          'ecdh-sha2-nistp256',
          'ecdh-sha2-nistp384',
          'ecdh-sha2-nistp521',
          'diffie-hellman-group14-sha1',
          'diffie-hellman-group14-sha256',
          'diffie-hellman-group16-sha512',
          'diffie-hellman-group18-sha512'
        ],
        cipher: [
          'aes128-ctr',
          'aes192-ctr',
          'aes256-ctr',
          'aes128-gcm',
          'aes256-gcm',
          'aes128-cbc',
          'aes192-cbc',
          'aes256-cbc'
        ],
        hmac: [
          'hmac-sha2-256',
          'hmac-sha2-512',
          'hmac-sha1'
        ],
        compress: [
          'none',
          'zlib@openssh.com',
          'zlib'
        ]
      },
      // Отключаем проверку хоста (для автоматического принятия ключей)
      hostVerifier: (keyHash) => {
        // Автоматически принимаем все ключи хоста
        return true;
      }
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('ssh-disconnect', async () => {
  try {
    ssh.dispose();
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Предварительная проверка SSH ключей хоста
ipcMain.handle('ssh-check-host', async (event, connection) => {
  try {
    const testSSH = new NodeSSH();
    await testSSH.connect({
      host: connection.host,
      port: connection.port,
      username: connection.username,
      password: connection.password,
      readyTimeout: 10000,
      // Автоматически принимать ключи хоста
      hostVerifier: () => true,
      onKeyboardInteractive: (name, instructions, instructionsLang, prompts, finish) => {
        finish([]);
      }
    });
    testSSH.dispose();
    return { success: true, message: 'SSH ключ хоста принят' };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Очистка SSH known_hosts для конкретного хоста (если нужно)
ipcMain.handle('ssh-clear-host', async (event, host) => {
  try {
    const { exec } = require('child_process');
    const os = require('os');
    const path = require('path');
    
    // Путь к known_hosts файлу
    const knownHostsPath = path.join(os.homedir(), '.ssh', 'known_hosts');
    
    // Удаляем запись о хосте из known_hosts
    exec(`ssh-keygen -R ${host}`, (error, stdout, stderr) => {
      if (error) {
        console.log('Ошибка очистки known_hosts:', error.message);
      } else {
        console.log('SSH ключ хоста удален из known_hosts');
      }
    });
    
    return { success: true, message: 'SSH ключ хоста очищен' };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('ssh-exec', async (event, command) => {
  try {
    if (!ssh.isConnected()) {
      return { success: false, error: 'SSH не подключен' };
    }
    
    const result = await ssh.execCommand(command);
    
    // Check if the command was successful
    if (result.code === 0) {
      return { success: true, stdout: result.stdout, stderr: result.stderr, code: result.code };
    } else {
      return { success: false, stdout: result.stdout, stderr: result.stderr, code: result.code, error: result.stderr || 'Command failed' };
    }
  } catch (error) {
    console.error('SSH exec error:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('detect-printer', async () => {
  try {
    if (!ssh.isConnected()) {
      return { success: false, error: 'SSH не подключен' };
    }
    const result = await ssh.execCommand('/usr/bin/get_sn_mac.sh model 2>&1');
    
    if (result.stdout.includes('K1')) {
      return { success: true, model: 'K1' };
    } else if (result.stdout.includes('F001') || result.stdout.includes('F002')) {
      return { success: true, model: '3V3' };
    } else if (result.stdout.includes('F005')) {
      return { success: true, model: '3KE' };
    } else if (result.stdout.includes('F003')) {
      return { success: true, model: '10SE' };
    } else if (result.stdout.includes('F004')) {
      return { success: true, model: 'E5M' };
    }
    
    return { success: true, model: 'Unknown' };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('check-connection', async () => {
  return { connected: ssh.isConnected() };
});

// Обработчик для показа диалогов
ipcMain.handle('show-message', async (event, options) => {
  const result = await dialog.showMessageBox(mainWindow, options);
  return result;
});

// Read file content from local filesystem
ipcMain.handle('read-file', async (event, filePath) => {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return { success: true, content };
  } catch (error) {
    console.error('Read file error:', error);
    return { success: false, error: error.message };
  }
});

// Note: upload-file handler removed - we now use SSH heredoc directly
