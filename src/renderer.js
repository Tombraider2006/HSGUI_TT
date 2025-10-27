const { ipcRenderer } = require('electron');

// Check if ipcRenderer is available
if (!ipcRenderer) {
    console.error('ipcRenderer is not available');
}

let isConnected = false;
let currentLanguage = 'ru';
let translations = {};
let appVersion = '1.0.0'; // Default version
let selectedComponents = new Set();
let selectedForRemoval = new Set();

// Load translations
async function loadTranslations(lang) {
    try {
        // Load translations from the correct path
        const response = await fetch(`./src/locales/${lang}.json`);
                if (response.ok) {
                    translations[lang] = await response.json();
        } else {
            throw new Error(`Failed to load translations: ${response.status}`);
        }
    } catch (error) {
        console.error(`Error loading translations for ${lang}:`, error);
        // Fallback to embedded translations
        translations[lang] = getFallbackTranslations(lang);
    }
}

// Fallback translations if files can't be loaded
function getFallbackTranslations(lang) {
    if (lang === 'ru') {
        return {
            nav: { 
                main: "Главная", 
                install: "Установка", 
                remove: "Удаление", 
                customize: "Настройка", 
                backup: "Резервная копия", 
                tools: "Инструменты", 
                info: "Информация",
                components: "Компоненты",
                tools_group: "Инструменты"
            },
            main: { 
                title: "Добро пожаловать в Creality Helper", 
                description: "Простое и интуитивное управление вашим 3D-принтером Creality", 
                connection: "🔌 Подключение к принтеру", 
                ip: "IP адрес принтера:", 
                port: "Порт:", 
                username: "Имя пользователя:", 
                password: "Пароль:", 
                connect: "Подключиться", 
                clear_ssh: "🔑 Очистить SSH",
                auto_detect: "Автоопределение"
            },
            install: { title: "📦 Установка компонентов", description: "Выберите компоненты для установки на ваш принтер", model: "Модель принтера:", auto_detect: "Автоопределение", selected: "Выбрано:", select_all: "Выбрать все", select_none: "Снять выделение", install_selected: "Установить выбранные" },
            remove: { 
                title: "🗑️ Удаление компонентов", 
                description: "Удалите установленные компоненты с принтера",
                selected: "Выбрано для удаления:",
                select_all: "Выбрать все",
                select_none: "Снять выделение",
                remove_selected: "Удалить выбранные",
                no_installed: "Нет установленных компонентов",
                checking_components: "Проверка установленных компонентов...",
                remove_success: "Компонент успешно удален",
                remove_error: "Ошибка удаления компонента",
                confirm_remove: "Вы уверены, что хотите удалить выбранные компоненты?",
                removing: "Удаление компонентов..."
            },
            customize: { 
                title: "⚙️ Настройка компонентов", 
                description: "Настройте параметры установленных компонентов",
                system_info: "Информация о системе",
                system_info_desc: "Просмотр информации о принтере и системе",
                logs: "Просмотр логов",
                logs_desc: "Просмотр системных логов и логов Klipper",
                services: "Управление сервисами",
                services_desc: "Запуск, остановка и перезапуск сервисов",
                files: "Файловый менеджер",
                files_desc: "Управление файлами конфигурации",
                network: "Сетевые инструменты",
                network_desc: "Диагностика сети и подключений",
                performance: "Мониторинг производительности",
                performance_desc: "Отслеживание использования ресурсов",
            },
            backup: { title: "💾 Резервная копия", description: "Создайте резервную копию конфигурации принтера", create: "Создать резервную копию", restore: "Восстановить из резервной копии" },
            tools: { 
                title: "🔧 Инструменты", 
                description: "Дополнительные инструменты для работы с принтером",
                prevent_klipper: "🔒 Предотвратить обновление",
                prevent_klipper_desc: "Конфигурационных файлов Klipper",
                allow_klipper: "🔓 Разрешить обновление",
                allow_klipper_desc: "Конфигурационных файлов Klipper",
                fix_gcode: "🔧 Исправить печать",
                fix_gcode_desc: "Gcode файлов из папки",
                enable_camera: "📷 Включить камеру",
                enable_camera_desc: "Настройки камеры в Moonraker",
                disable_camera: "📷 Выключить камеру",
                disable_camera_desc: "Настройки камеры в Moonraker",
                restart_nginx: "🔄 Перезапустить Nginx",
                restart_nginx_desc: "Сервис Nginx",
                restart_moonraker: "🔄 Перезапустить Moonraker",
                restart_moonraker_desc: "Сервис Moonraker",
                restart_klipper: "🔄 Перезапустить Klipper",
                restart_klipper_desc: "Сервис Klipper",
                update_entware: "📦 Обновить Entware",
                update_entware_desc: "Пакеты Entware",
                clear_cache: "🗑️ Очистить кэш",
                clear_cache_desc: "Системный кэш",
                clear_logs: "🗑️ Очистить логи",
                clear_logs_desc: "Файлы логов",
                restore_firmware: "🔄 Восстановить прошивку",
                restore_firmware_desc: "Предыдущую версию",
                factory_reset: "🏭 Сброс к заводским",
                factory_reset_desc: "Настройкам"
            },
            info: { title: "ℹ️ Информация о приложении", version: "Версия", author: "Автор", license: "Лицензия", support: "Поддержка" },
            models: { k1: "K1", "k1-max": "K1 Max", k1c: "K1C", k1se: "K1SE", k1s: "K1S", "ender-3-v3": "Ender-3 V3", "ender-3-v3-se": "Ender-3 V3 SE", "ender-3-v3-ke": "Ender-3 V3 KE", e5m: "Ender 5 Max" },
            messages: { connection_success: "Успешно подключено к принтеру!", connection_error: "Ошибка подключения", model_detected: "Обнаружена модель:", model_undefined: "Модель принтера не определена", select_components: "Выберите компоненты для установки", connect_first: "Сначала подключитесь к принтеру", installation_complete: "Установка завершена!", backup_created: "Резервная копия создана успешно", backup_restored: "Резервная копия восстановлена успешно", connected: "Подключено", disconnected: "Отключен" },
            categories: { core: "Основные", remote: "Удаленное управление", tools: "Инструменты", customization: "Настройка" }
        };
    } else {
        return {
            nav: { main: "Main", install: "Install", remove: "Remove", customize: "Customize", backup: "Backup", tools: "Tools", info: "Info" },
            main: { title: "Welcome to Creality Helper", description: "Simple and intuitive control of your Creality 3D printer", connection: "🔌 Connect to printer", ip: "Printer IP address:", port: "Port:", username: "Username:", password: "Password:", connect: "Connect", clear_ssh: "🔑 Clear SSH" },
            install: { title: "📦 Install Components", description: "Select components to install on your printer", model: "Printer model:", auto_detect: "Auto-detect", selected: "Selected:", select_all: "Select All", select_none: "Deselect All", install_selected: "Install Selected" },
            remove: { title: "🗑️ Remove Components", description: "Remove installed components from printer" },
            customize: { title: "⚙️ Customize Components", description: "Configure installed component settings" },
            backup: { title: "💾 Backup", description: "Create a backup of printer configuration", create: "Create Backup", restore: "Restore from Backup" },
            tools: { title: "🔧 Tools", description: "Additional tools for working with printer", diagnostic: "🔍 Diagnostic", diagnostic_desc: "Check printer status", update: "🔄 Update", update_desc: "Update printer firmware", logs: "📋 Logs", logs_desc: "View system logs", info: "ℹ️ Info", info_desc: "System information" },
            info: { title: "ℹ️ Application Information", version: "Version", author: "Author", license: "License", support: "Support" },
            models: { k1: "K1", "k1-max": "K1 Max", k1c: "K1C", k1se: "K1SE", k1s: "K1S", "ender-3-v3": "Ender-3 V3", "ender-3-v3-se": "Ender-3 V3 SE", "ender-3-v3-ke": "Ender-3 V3 KE", e5m: "Ender 5 Max" },
            messages: { connection_success: "Successfully connected to printer!", connection_error: "Connection error", model_detected: "Detected model:", model_undefined: "Printer model not detected", select_components: "Select components to install", connect_first: "Connect to printer first", installation_complete: "Installation complete!", backup_created: "Backup created successfully", backup_restored: "Backup restored successfully", connected: "Connected", disconnected: "Disconnected" },
            categories: { core: "Core", remote: "Remote Control", tools: "Tools", customization: "Customization" }
        };
    }
}

// Translate text
function t(key, lang = currentLanguage) {
    const keys = key.split('.');
    let value = translations[lang];
    
    for (const k of keys) {
        if (value && value[k]) {
            value = value[k];
        } else {
            return key; // Return key if translation not found
        }
    }
    
    return value;
}

// Update all text elements
function updateLanguage() {
    // Update all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        const translation = t(key);
        
        // Check if element is input placeholder
        if (element.tagName === 'INPUT' && element.type !== 'submit' && element.type !== 'button') {
            element.placeholder = translation;
        } else {
            element.textContent = translation;
        }
    });
    
    // Update model selector options
    const modelSelector = document.getElementById('modelSelector');
    if (modelSelector) {
        Array.from(modelSelector.options).forEach(option => {
            if (option.value !== 'auto') {
                option.textContent = t(`models.${option.value}`);
            } else {
                option.textContent = t('install.auto_detect');
            }
        });
    }
    
    // Update header model selector options
    const headerModelSelector = document.getElementById('headerModelSelector');
    if (headerModelSelector) {
        Array.from(headerModelSelector.options).forEach(option => {
            if (option.value !== 'auto') {
                option.textContent = t(`models.${option.value}`);
            } else {
                option.textContent = t('install.auto_detect');
            }
        });
    }
    
    // Update status text
    const connectionText = document.getElementById('connectionText');
    if (connectionText) {
        if (isConnected) {
            connectionText.textContent = t('messages.connected') || 'Подключено';
        } else {
            connectionText.textContent = t('messages.disconnected') || 'Отключен';
        }
    }
    
    // Update document title
    document.title = t('app.title') || 'Creality Helper Simple';
}

// Language switching
async function setLanguage(lang) {
    currentLanguage = lang;
    
    // Update active button
    document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[onclick="setLanguage('${lang}')"]`).classList.add('active');
    
    // Save language preference
    localStorage.setItem('selectedLanguage', lang);
    
    // Load translations if not already loaded
    if (!translations[lang]) {
        await loadTranslations(lang);
    }
    
    // Update all text elements
    updateLanguage();
    
    console.log('Switched to language:', lang);
}

// Page navigation
function showPage(pageId) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    
    // Show selected page
    document.getElementById(pageId + 'Page').classList.add('active');
    
    // Update navigation
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    const activeNavItem = document.querySelector(`[onclick*="showPage('${pageId}')"]`);
    if (activeNavItem) {
        activeNavItem.classList.add('active');
    }
    
    // Load page-specific content
    if (pageId === 'install') {
        loadComponents();
    } else if (pageId === 'remove') {
        loadInstalledComponents();
    } else if (pageId === 'customize') {
        loadCustomizeOptions();
    }
    
    // Update language for all pages
    updateLanguage();
}

// Connection functions
async function connectToPrinter() {
    const host = document.getElementById('printerIP').value;
    const port = parseInt(document.getElementById('printerPort').value);
    const username = document.getElementById('printerUser').value;
    const password = document.getElementById('printerPass').value;
    
    // Validate connection data
    if (!host || !username || !password) {
        showMessage('Пожалуйста, заполните все поля подключения', 'error');
        return;
    }
    
    // Validate IP address format
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    if (!ipRegex.test(host)) {
        showMessage('Неверный формат IP адреса', 'error');
        return;
    }
    
    // Validate port number
    if (!port || port <= 0 || port > 65535) {
        showMessage('Порт должен быть от 1 до 65535', 'error');
        return;
    }
    
    // Validate username (no special characters)
    const usernameRegex = /^[a-zA-Z0-9_-]+$/;
    if (!usernameRegex.test(username)) {
        showMessage('Имя пользователя содержит недопустимые символы', 'error');
        return;
    }
    
    // Validate password (not empty, no XSS attempts)
    const xssRegex = /<script|javascript:|onerror|onload|onclick|onmouseover|iframe.*src.*javascript/i;
    if (xssRegex.test(password)) {
        showMessage('Пароль содержит недопустимые символы', 'error');
        return;
    }
    
    // Save connection data
    saveData();

    const connectBtn = document.querySelector('.btn-primary');
    const statusIndicator = document.getElementById('connectionStatus');
    const statusText = document.getElementById('connectionText');

    // Show loading
    connectBtn.innerHTML = '<span class="loading"></span> Подключение...';
    connectBtn.disabled = true;

    try {
        // Сначала проверяем и принимаем SSH ключ хоста
        showMessage('Проверка SSH ключа хоста...', 'info');
        const hostCheck = await safeInvoke('ssh-check-host', {
            host, port, username, password
        });
        
        if (!hostCheck.success) {
            showMessage('Предупреждение: ' + hostCheck.error, 'warning');
        } else {
            showMessage('SSH ключ хоста принят', 'success');
        }
        
        // Теперь подключаемся
        showMessage('Подключение к принтеру...', 'info');
        const result = await safeInvoke('ssh-connect', {
            host, port, username, password
        });
        
        if (result.success) {
            isConnected = true;
            statusIndicator.classList.remove('disconnected');
            statusIndicator.classList.add('connected');
            statusText.textContent = 'Подключено';
            
            showMessage('Успешно подключено к принтеру!', 'success');
            
            // Detect printer model
            showMessage('Определение модели принтера...', 'info');
            await detectPrinterModel();
            
            if (currentPrinterModel) {
                showMessage(`Обнаружена модель: ${printerConfigs[currentPrinterModel]?.name}`, 'success');
            } else {
                showMessage('Модель принтера не определена. Выберите модель вручную в верхней панели.', 'warning');
            }
            
            // Check if helper scripts exist on printer
            showMessage('Проверка наличия скриптов на принтере...', 'info');
            try {
                const checkScriptsResult = await safeInvoke('ssh-exec', 'test -f /usr/data/helper-script/scripts/original_helper.sh && echo "exists" || echo "missing"');
                
                if (checkScriptsResult.stdout.includes('exists')) {
                    showMessage('Скрипты helper-script найдены на принтере', 'success');
                } else {
                    showMessage('Скрипты helper-script не найдены. Они будут загружены при первой установке компонента.', 'info');
                }
            } catch (error) {
                showMessage('Предупреждение: Не удалось проверить наличие скриптов: ' + error.message, 'warning');
            }
            
            // Restore connect button after successful connection
            connectBtn.innerHTML = '🔌 Подключиться';
            connectBtn.disabled = false;
        } else {
            throw new Error(result.error);
        }
        
    } catch (error) {
        console.error('Connection failed:', error);
        
        // Специальная обработка ошибок SSH
        let errorMessage = 'Ошибка подключения: ' + error.message;
        
        if (error.message.includes('Host key verification failed')) {
            errorMessage = 'Ошибка проверки SSH ключа хоста. Попробуйте еще раз.';
        } else if (error.message.includes('Connection refused')) {
            errorMessage = 'Подключение отклонено. Проверьте IP адрес и порт.';
        } else if (error.message.includes('Authentication failed')) {
            errorMessage = 'Ошибка аутентификации. Проверьте имя пользователя и пароль.';
        } else if (error.message.includes('timeout')) {
            errorMessage = 'Таймаут подключения. Проверьте сетевое соединение.';
        }
        
        showMessage(errorMessage, 'error');
        
        connectBtn.innerHTML = '🔌 Подключиться';
        connectBtn.disabled = false;
    }
}

// Очистка SSH ключей хоста
async function clearSSHKeys() {
    const host = document.getElementById('printerIP').value;
    if (!host) {
        showMessage('Сначала введите IP адрес принтера', 'warning');
        return;
    }

    const clearBtn = document.querySelector('.btn-warning');
    const originalText = clearBtn.innerHTML;
    
    try {
        clearBtn.innerHTML = '<span class="loading"></span> Очистка...';
        clearBtn.disabled = true;

        const result = await safeInvoke('ssh-clear-host', host);
        
        if (result.success) {
            showMessage('SSH ключи хоста очищены. Теперь можно подключаться заново.', 'success');
        } else {
            showMessage('Предупреждение: ' + result.error, 'warning');
        }
    } catch (error) {
        console.error('Clear SSH keys failed:', error);
        showMessage('Ошибка очистки SSH ключей: ' + error.message, 'error');
    } finally {
        clearBtn.innerHTML = originalText;
        clearBtn.disabled = false;
    }
}

// Show message function
function showMessage(message, type) {
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.success-message, .error-message, .info-message, .warning-message');
    existingMessages.forEach(msg => msg.remove());
    
    const messageDiv = document.createElement('div');
    messageDiv.className = type + '-message';
    messageDiv.textContent = message;
    
    const connectionForm = document.querySelector('.connection-form');
    if (connectionForm) {
        connectionForm.appendChild(messageDiv);
    } else {
        document.body.appendChild(messageDiv);
    }
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.remove();
        }
    }, 5000);
}

// Show loading state
function showLoading(containerId, message) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = `
        <div class="loading-container">
            <span class="loading"></span>
            <p>${message}</p>
        </div>
    `;
}

// Get localized text (alias for t function)
function getLocalizedText(key) {
    const translation = t(key);
    // If translation is the same as key, it means translation not found
    if (translation === key) {
        // Return fallback values for common keys
        const fallbacks = {
            'customize.system.printer_model': 'Модель принтера',
            'customize.system.kernel_version': 'Версия ядра',
            'customize.system.klipper_version': 'Версия Klipper',
            'customize.system.moonraker_version': 'Версия Moonraker',
            'customize.system.fluidd_version': 'Версия Fluidd',
            'customize.system.mainsail_version': 'Версия Mainsail',
            'customize.system.os_version': 'Версия системы',
            'customize.system.architecture': 'Архитектура',
            'customize.system.uptime': 'Время работы',
            'customize.system.memory': 'Память',
            'customize.system.disk': 'Диск',
            'customize.system.cpu_load': 'Нагрузка CPU',
            'customize.system.unknown': 'Неизвестно',
            'customize.system.not_installed': 'Не установлен',
            'customize.system.active': 'Активен',
            'customize.system.inactive': 'Неактивен',
            'customize.system_info': 'Информация о системе',
            'tools.back': 'Назад',
            'tools.factory_reset': 'Сброс к заводским настройкам',
            'models.e5m': 'Ender 5 Max'
        };
        return fallbacks[key] || key;
    }
    return translation;
}

// Safe ipcRenderer invoke wrapper
async function safeInvoke(channel, ...args) {
    if (!ipcRenderer || !ipcRenderer.invoke) {
        console.error('ipcRenderer is not available');
        throw new Error('IPC не доступен');
    }
    return await ipcRenderer.invoke(channel, ...args);
}

// Current printer model
let currentPrinterModel = null;

// Load saved connection data
function loadSavedData() {
    const savedData = localStorage.getItem('crealityHelperData');
    if (savedData) {
        try {
            const data = JSON.parse(savedData);
            
            // Validate and sanitize loaded data
            if (data.ipAddress && /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(data.ipAddress)) {
                document.getElementById('printerIP').value = data.ipAddress;
            }
            
            if (data.username && /^[a-zA-Z0-9_-]+$/.test(data.username)) {
                document.getElementById('printerUser').value = data.username;
            }
            
            if (data.password && typeof data.password === 'string') {
                // Check for XSS attempts
                const xssRegex = /<script|javascript:|onerror|onload|onclick|onmouseover|iframe.*src.*javascript/i;
                if (!xssRegex.test(data.password)) {
                    document.getElementById('printerPass').value = data.password;
                } else {
                    console.warn('Potentially malicious password detected in saved data, not loading');
                }
            }
            
            if (data.lastModel && typeof data.lastModel === 'string' && printerConfigs[data.lastModel]) {
                currentPrinterModel = data.lastModel;
                updatePrinterModelDisplay();
            }
        } catch (error) {
            console.error('Error loading saved data:', error);
            // Clear corrupted data
            localStorage.removeItem('crealityHelperData');
        }
    }
}

// Save connection data
function saveData() {
    try {
        const data = {
            ipAddress: document.getElementById('printerIP').value,
            username: document.getElementById('printerUser').value,
            password: document.getElementById('printerPass').value,
            lastModel: currentPrinterModel
        };
        
        // Validate data before saving
        if (data.ipAddress && !/^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(data.ipAddress)) {
            console.warn('Invalid IP address format, not saving');
            return;
        }
        
        if (data.username && !/^[a-zA-Z0-9_-]+$/.test(data.username)) {
            console.warn('Invalid username format, not saving');
            return;
        }
        
        // Check for XSS attempts in password
        const xssRegex = /<script|javascript:|onerror|onload|onclick|onmouseover|iframe.*src.*javascript/i;
        if (data.password && xssRegex.test(data.password)) {
            console.warn('Potentially malicious password detected, not saving');
            return;
        }
        
        localStorage.setItem('crealityHelperData', JSON.stringify(data));
    } catch (error) {
        console.error('Error saving data:', error);
    }
}

// Printer model configurations
const printerConfigs = {
    'k1': {
        name: 'K1 Series',
        minFirmware: '1.3.3.5',
        components: [
            'moonraker-nginx', 'fluidd', 'mainsail', 'entware',
            'klipper-shell', 'kamp', 'buzzer', 'nozzle-cleaning',
            'fans-control', 'improved-shapers', 'useful-macros',
            'save-z-offset', 'screws-tilt', 'm600-support',
            'git-backup', 'timelapse', 'camera-settings', 'usb-camera',
            'octoeverywhere', 'moonraker-obico', 'guppyflo',
            'mobileraker', 'octoapp', 'simplyprint'
        ],
        defaultComponents: [
            'moonraker-nginx', 'fluidd', 'entware', 'klipper-shell',
            'kamp', 'buzzer', 'useful-macros', 'save-z-offset'
        ]
    },
    'k1-max': {
        name: 'K1 Max',
        minFirmware: '1.3.3.5',
        components: [
            'moonraker-nginx', 'fluidd', 'mainsail', 'entware',
            'klipper-shell', 'kamp', 'buzzer', 'nozzle-cleaning',
            'fans-control', 'improved-shapers', 'useful-macros',
            'save-z-offset', 'screws-tilt', 'm600-support',
            'git-backup', 'timelapse', 'camera-settings', 'usb-camera',
            'octoeverywhere', 'moonraker-obico', 'guppyflo',
            'mobileraker', 'octoapp', 'simplyprint'
        ],
        defaultComponents: [
            'moonraker-nginx', 'fluidd', 'entware', 'klipper-shell',
            'kamp', 'buzzer', 'useful-macros', 'save-z-offset',
            'timelapse', 'camera-settings'
        ]
    },
    'k1c': {
        name: 'K1C',
        minFirmware: '1.3.3.5',
        components: [
            'moonraker-nginx', 'fluidd', 'mainsail', 'entware',
            'klipper-shell', 'kamp', 'buzzer', 'nozzle-cleaning',
            'fans-control', 'improved-shapers', 'useful-macros',
            'save-z-offset', 'screws-tilt', 'm600-support',
            'git-backup', 'timelapse', 'camera-settings', 'usb-camera',
            'octoeverywhere', 'moonraker-obico', 'guppyflo',
            'mobileraker', 'octoapp', 'simplyprint'
        ],
        defaultComponents: [
            'moonraker-nginx', 'fluidd', 'entware', 'klipper-shell',
            'kamp', 'buzzer', 'useful-macros', 'save-z-offset',
            'timelapse', 'camera-settings'
        ]
    },
    'ender-3-v3': {
        name: 'Ender-3 V3',
        minFirmware: '1.2.1.3',
        components: [
            'moonraker-nginx', 'fluidd', 'mainsail', 'entware',
            'klipper-shell', 'kamp', 'buzzer', 'fans-control',
            'improved-shapers', 'useful-macros', 'save-z-offset',
            'screws-tilt', 'm600-support', 'git-backup',
            'timelapse', 'camera-settings', 'usb-camera',
            'octoeverywhere', 'moonraker-obico', 'guppyflo',
            'mobileraker', 'octoapp', 'simplyprint'
        ],
        defaultComponents: [
            'moonraker-nginx', 'fluidd', 'entware', 'klipper-shell',
            'kamp', 'useful-macros', 'save-z-offset'
        ]
    },
    'ender-3-v3-se': {
        name: 'Ender-3 V3 SE',
        minFirmware: '1.2.1.3',
        components: [
            'moonraker-nginx', 'fluidd', 'mainsail', 'entware',
            'klipper-shell', 'kamp', 'buzzer', 'fans-control',
            'improved-shapers', 'useful-macros', 'save-z-offset',
            'screws-tilt', 'm600-support', 'git-backup',
            'timelapse', 'camera-settings', 'usb-camera',
            'octoeverywhere', 'moonraker-obico', 'guppyflo',
            'mobileraker', 'octoapp', 'simplyprint'
        ],
        defaultComponents: [
            'moonraker-nginx', 'fluidd', 'entware', 'klipper-shell',
            'kamp', 'useful-macros', 'save-z-offset'
        ]
    },
    'ender-3-v3-ke': {
        name: 'Ender-3 V3 KE',
        minFirmware: '1.2.1.3',
        components: [
            'moonraker-nginx', 'fluidd', 'mainsail', 'entware',
            'klipper-shell', 'kamp', 'buzzer', 'fans-control',
            'improved-shapers', 'useful-macros', 'save-z-offset',
            'screws-tilt', 'm600-support', 'git-backup',
            'timelapse', 'camera-settings', 'usb-camera',
            'octoeverywhere', 'moonraker-obico', 'guppyflo',
            'mobileraker', 'octoapp', 'simplyprint'
        ],
        defaultComponents: [
            'moonraker-nginx', 'fluidd', 'entware', 'klipper-shell',
            'kamp', 'useful-macros', 'save-z-offset'
        ]
    },
    'k1s': {
        name: 'K1S',
        minFirmware: '1.3.3.5',
        components: [
            'moonraker-nginx', 'fluidd', 'mainsail', 'entware',
            'klipper-shell', 'kamp', 'buzzer', 'nozzle-cleaning',
            'fans-control', 'improved-shapers', 'useful-macros',
            'save-z-offset', 'screws-tilt', 'm600-support',
            'git-backup', 'timelapse', 'camera-settings', 'usb-camera',
            'octoeverywhere', 'moonraker-obico', 'guppyflo',
            'mobileraker', 'octoapp', 'simplyprint'
        ],
        // Исключаем пункты 8 (nozzle-cleaning) и 9 (fans-control)
        excludedComponents: ['nozzle-cleaning', 'fans-control'],
        // Не отмечаем по умолчанию пункт 16 (camera-settings)
        defaultComponents: [
            'moonraker-nginx', 'fluidd', 'entware', 'klipper-shell',
            'kamp', 'buzzer', 'useful-macros', 'save-z-offset',
            'timelapse' // camera-settings не включаем по умолчанию
        ]
    },
    'k1se': {
        name: 'K1SE',
        minFirmware: '1.3.3.5',
        components: [
            'moonraker-nginx', 'fluidd', 'mainsail', 'entware',
            'klipper-shell', 'kamp', 'buzzer', 'nozzle-cleaning',
            'fans-control', 'improved-shapers', 'useful-macros',
            'save-z-offset', 'screws-tilt', 'm600-support',
            'git-backup', 'timelapse', 'camera-settings', 'usb-camera',
            'octoeverywhere', 'moonraker-obico', 'guppyflo',
            'mobileraker', 'octoapp', 'simplyprint'
        ],
        // Исключаем пункты 8 (nozzle-cleaning) и 9 (fans-control)
        excludedComponents: ['nozzle-cleaning', 'fans-control'],
        // Не отмечаем по умолчанию пункт 16 (camera-settings)
        defaultComponents: [
            'moonraker-nginx', 'fluidd', 'entware', 'klipper-shell',
            'kamp', 'buzzer', 'useful-macros', 'save-z-offset',
            'timelapse' // camera-settings не включаем по умолчанию
        ]
    },
    'e5m': {
        name: 'Ender 5 Max',
        minFirmware: '1.2.1.3',
        components: [
            'moonraker-nginx', 'fluidd', 'mainsail', 'entware',
            'klipper-shell', 'kamp', 'buzzer', 'fans-control',
            'improved-shapers', 'useful-macros', 'save-z-offset',
            'screws-tilt', 'm600-support', 'git-backup',
            'timelapse', 'camera-settings', 'usb-camera',
            'octoeverywhere', 'moonraker-obico', 'guppyflo',
            'mobileraker', 'octoapp', 'simplyprint'
        ],
        defaultComponents: [
            'moonraker-nginx', 'fluidd', 'entware', 'klipper-shell',
            'kamp', 'useful-macros', 'save-z-offset'
        ]
    }
};

// Components data - полный список из Creality Helper Script
const components = [
    // Основные компоненты
    {
        id: 'moonraker-nginx',
        name: 'Moonraker и Nginx',
        description: 'Веб-сервер для управления принтером через браузер',
        category: 'core',
        installed: false
    },
    {
        id: 'fluidd',
        name: 'Fluidd',
        description: 'Современный веб-интерфейс для управления принтером (порт 4408)',
        category: 'ui',
        installed: false
    },
    {
        id: 'mainsail',
        name: 'Mainsail',
        description: 'Альтернативный веб-интерфейс (порт 4409)',
        category: 'ui',
        installed: false
    },
    {
        id: 'entware',
        name: 'Entware',
        description: 'Пакетный менеджер для установки дополнительного ПО',
        category: 'tools',
        installed: false
    },
    
    // Klipper компоненты
    {
        id: 'klipper-shell',
        name: 'Klipper Gcode Shell Command',
        description: 'Выполнение команд оболочки из G-кода',
        category: 'klipper',
        installed: false
    },
    {
        id: 'kamp',
        name: 'Klipper Adaptive Meshing & Purging',
        description: 'Улучшенная калибровка стола и очистка сопла',
        category: 'klipper',
        installed: false
    },
    {
        id: 'buzzer',
        name: 'Buzzer Support',
        description: 'Звуковые оповещения для принтера',
        category: 'hardware',
        installed: false
    },
    {
        id: 'nozzle-cleaning',
        name: 'Nozzle Cleaning Fan Control',
        description: 'Управление вентилятором для очистки сопла',
        category: 'hardware',
        installed: false
    },
    {
        id: 'fans-control',
        name: 'Fans Control Macros',
        description: 'Макросы для управления вентиляторами',
        category: 'klipper',
        installed: false
    },
    {
        id: 'improved-shapers',
        name: 'Improved Shapers Calibrations',
        description: 'Улучшенная калибровка шейперов',
        category: 'klipper',
        installed: false
    },
    {
        id: 'useful-macros',
        name: 'Useful Macros',
        description: 'Полезные макросы для печати',
        category: 'klipper',
        installed: false
    },
    {
        id: 'save-z-offset',
        name: 'Save Z-Offset Macros',
        description: 'Макросы для сохранения Z-смещения',
        category: 'klipper',
        installed: false
    },
    {
        id: 'screws-tilt',
        name: 'Screws Tilt Adjust Support',
        description: 'Поддержка настройки винтов стола',
        category: 'klipper',
        installed: false
    },
    {
        id: 'm600-support',
        name: 'M600 Support',
        description: 'Поддержка смены нити во время печати',
        category: 'klipper',
        installed: false
    },
    
    // Резервное копирование
    {
        id: 'git-backup',
        name: 'Git Backup',
        description: 'Автоматическое резервное копирование в Git',
        category: 'backup',
        installed: false
    },
    
    // Камера и таймлапс
    {
        id: 'timelapse',
        name: 'Moonraker Timelapse',
        description: 'Создание таймлапс видео печати',
        category: 'camera',
        installed: false
    },
    {
        id: 'camera-settings',
        name: 'Camera Settings Control',
        description: 'Управление настройками камеры',
        category: 'camera',
        installed: false
    },
    {
        id: 'usb-camera',
        name: 'USB Camera Support',
        description: 'Поддержка USB камеры',
        category: 'camera',
        installed: false
    },
    
    // Удаленный доступ
    {
        id: 'octoeverywhere',
        name: 'OctoEverywhere',
        description: 'Удаленный доступ к принтеру через облако',
        category: 'remote',
        installed: false
    },
    {
        id: 'moonraker-obico',
        name: 'Moonraker Obico',
        description: 'Альтернативный облачный сервис',
        category: 'remote',
        installed: false
    },
    
    // Дополнительные инструменты
    {
        id: 'guppyflo',
        name: 'GuppyFLO',
        description: 'Расширенное управление и мониторинг',
        category: 'tools',
        installed: false
    },
    {
        id: 'mobileraker',
        name: 'Mobileraker Companion',
        description: 'Мобильное приложение для управления',
        category: 'mobile',
        installed: false
    },
    {
        id: 'octoapp',
        name: 'OctoApp Companion',
        description: 'Мобильное приложение OctoApp',
        category: 'mobile',
        installed: false
    },
    {
        id: 'simplyprint',
        name: 'SimplyPrint',
        description: 'Облачный сервис для управления принтерами',
        category: 'remote',
        installed: false
    }
];

// Update version display
function updateVersionDisplay() {
    const versionElement = document.getElementById('appVersion');
    if (versionElement) {
        versionElement.textContent = appVersion;
    }
}

// Fallback help content
function getFallbackHelpContent() {
    return {
        ru: {
            'moonraker-nginx': {
                title: 'Moonraker + Nginx',
                description: 'Веб-интерфейс для управления принтером',
                details: 'Moonraker предоставляет API для управления принтером, а Nginx служит веб-сервером для интерфейса.',
                features: ['Веб-интерфейс', 'API для управления', 'Поддержка камеры', 'Удаленное управление'],
                requirements: ['Стабильное интернет-соединение', 'Порты 80, 443', 'Достаточно места на диске'],
                warnings: ['Требует настройки портов', 'Может конфликтовать с другими сервисами'],
                troubleshooting: [
                    { problem: 'Не открывается веб-интерфейс', solution: 'Проверьте настройки портов и файрвола' },
                    { problem: 'Ошибка 502', solution: 'Перезапустите Nginx и Moonraker' }
                ]
            }
        },
        en: {
            'moonraker-nginx': {
                title: 'Moonraker + Nginx',
                description: 'Web interface for printer management',
                details: 'Moonraker provides API for printer control, Nginx serves as web server for the interface.',
                features: ['Web interface', 'Control API', 'Camera support', 'Remote control'],
                requirements: ['Stable internet connection', 'Ports 80, 443', 'Sufficient disk space'],
                warnings: ['Requires port configuration', 'May conflict with other services'],
                troubleshooting: [
                    { problem: 'Web interface not opening', solution: 'Check port and firewall settings' },
                    { problem: 'Error 502', solution: 'Restart Nginx and Moonraker' }
                ]
            }
        }
    };
}

// Load app version from package.json
async function loadAppVersion() {
    try {
        const response = await fetch('./package.json');
        if (response.ok) {
            const packageData = await response.json();
            appVersion = packageData.version || '1.0.0';
        }
    } catch (error) {
        console.error('Error loading app version:', error);
        appVersion = '1.0.0';
    }
}

// Initialize app
document.addEventListener('DOMContentLoaded', async function() {
    console.log('Creality Helper Simple loaded');
    
    // Load app version
    await loadAppVersion();
    
    // Load translations
    await loadTranslations('ru');
    await loadTranslations('en');
    
    // Load saved language preference
    const savedLanguage = localStorage.getItem('selectedLanguage') || 'ru';
    currentLanguage = savedLanguage;
    
    // Update language
    updateLanguage();
    
    // Update active language button
    document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.querySelector(`[onclick="setLanguage('${savedLanguage}')"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
    
    // Update version display
    updateVersionDisplay();
    
    // Load saved data
    loadSavedData();
    
    // Initialize header model selector
    updatePrinterModelDisplay();
    
    // Check connection status on startup
    checkConnectionStatus();
});

async function checkConnectionStatus() {
    try {
        const result = await safeInvoke('check-connection');
        if (result.connected) {
            // Update UI to show connected state
            const statusIndicator = document.getElementById('connectionStatus');
            const statusText = document.getElementById('connectionText');
            
            statusIndicator.classList.remove('disconnected');
            statusIndicator.classList.add('connected');
            statusText.textContent = 'Подключено';
            
            isConnected = true;
        }
    } catch (error) {
        console.error('Error checking connection:', error);
    }
}

// Detect printer model via SSH
async function detectPrinterModel() {
    if (!isConnected) {
        currentPrinterModel = null;
        return null;
    }

    try {
        // Try to get printer model from various sources
        const commands = [
            'cat /proc/device-tree/model 2>/dev/null || echo "unknown"',
            'cat /sys/firmware/devicetree/base/model 2>/dev/null || echo "unknown"',
            'uname -m 2>/dev/null || echo "unknown"',
            'cat /etc/os-release | grep PRETTY_NAME 2>/dev/null || echo "unknown"'
        ];

        for (const cmd of commands) {
            try {
                const result = await safeInvoke('ssh-exec', cmd);
                const output = result.stdout.toLowerCase();
                
               // Detect K1 series first (more specific)
               if (output.includes('k1')) {
                   if (output.includes('max')) {
                       currentPrinterModel = 'k1-max';
                   } else if (output.includes('se')) {
                       currentPrinterModel = 'k1se';
                   } else if (output.includes('s') && !output.includes('se')) {
                       currentPrinterModel = 'k1s';
                   } else if (output.includes('c')) {
                       currentPrinterModel = 'k1c';
                   } else {
                       currentPrinterModel = 'k1';
                   }
                   break;
               }
                
                // Detect Ender-3 V3 series
                if (output.includes('ender') || output.includes('v3')) {
                    if (output.includes('se')) {
                        currentPrinterModel = 'ender-3-v3-se';
                    } else if (output.includes('ke')) {
                        currentPrinterModel = 'ender-3-v3-ke';
                    } else {
                        currentPrinterModel = 'ender-3-v3';
                    }
                    break;
                }
                
                // Detect Ender 5 Max
                if (output.includes('e5m') || output.includes('ender 5 max') || output.includes('ender5max')) {
                    currentPrinterModel = 'e5m';
                    break;
                }
                
                // Fallback for other Creality printers
                if (output.includes('creality') && !currentPrinterModel) {
                    currentPrinterModel = 'k1'; // Default to K1 for unknown Creality
                    break;
                }
            } catch (error) {
                console.log(`Command failed: ${cmd}`, error);
            }
        }

        // If no specific model detected, try to detect by available features
        if (!currentPrinterModel) {
            try {
                const buzzerCheck = await safeInvoke('ssh-exec', 'ls /dev/input/by-path/ | grep buzzer 2>/dev/null || echo "none"');
                if (buzzerCheck.stdout.includes('buzzer')) {
                    currentPrinterModel = 'k1'; // Default to K1 if buzzer found
                } else {
                    currentPrinterModel = 'ender-3-v3'; // Default to Ender-3 V3
                }
            } catch (error) {
                currentPrinterModel = 'ender-3-v3'; // Safe default
            }
        }

        updatePrinterModelDisplay();
        return currentPrinterModel;
    } catch (error) {
        console.error('Error detecting printer model:', error);
        currentPrinterModel = null;
        return null;
    }
}

// Auto-detect printer function for header button
async function autoDetectPrinter() {
    const detectBtn = document.getElementById('detectBtn');
    const originalText = detectBtn.innerHTML;
    
    // Show loading state
    detectBtn.innerHTML = '🔍 <span class="loading"></span> Определение...';
    detectBtn.disabled = true;
    
    try {
        // First try to connect if not connected
        if (!isConnected) {
            const host = document.getElementById('printerIP').value;
            const port = parseInt(document.getElementById('printerPort').value);
            const username = document.getElementById('printerUser').value;
            const password = document.getElementById('printerPass').value;
            
            if (!host || !username || !password) {
                showMessage('Сначала заполните данные подключения', 'warning');
                return;
            }
            
            // Try to connect
            await connectToPrinter();
            
            // Wait a bit for connection to establish
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        // Now try to detect model
        const detectedModel = await detectPrinterModel();
        
        if (detectedModel) {
            const modelName = printerConfigs[detectedModel]?.name || detectedModel;
            showMessage(`Автоопределение: ${modelName}`, 'success');
            
            // Update header selector
            const headerSelector = document.getElementById('headerModelSelector');
            if (headerSelector) {
                headerSelector.value = detectedModel;
            }
        } else {
            showMessage('Не удалось определить модель принтера', 'warning');
        }
        
    } catch (error) {
        console.error('Auto-detect error:', error);
        showMessage('Ошибка автоопределения: ' + error.message, 'error');
    } finally {
        // Restore button state
        detectBtn.innerHTML = originalText;
        detectBtn.disabled = false;
    }
}

// Change model from header selector
function changeHeaderModel() {
    const headerSelector = document.getElementById('headerModelSelector');
    const selectedModel = headerSelector.value;
    
    if (selectedModel === 'auto') {
        // Trigger auto-detection
        autoDetectPrinter();
    } else if (selectedModel && printerConfigs[selectedModel]) {
        currentPrinterModel = selectedModel;
        updatePrinterModelDisplay();
        loadComponents();
        
        const modelName = printerConfigs[selectedModel].name;
        showMessage(`Модель изменена на: ${modelName}`, 'success');
    }
}

// Update printer model display
function updatePrinterModelDisplay() {
    const modelElement = document.getElementById('printerModel');
    const modelSelector = document.getElementById('modelSelector');
    const headerSelector = document.getElementById('headerModelSelector');
    
    if (currentPrinterModel && printerConfigs[currentPrinterModel]) {
        const modelName = printerConfigs[currentPrinterModel].name;
        
        // Update main model display
        if (modelElement) {
            modelElement.textContent = modelName;
        }
        
        // Update selectors
        if (modelSelector) {
            modelSelector.value = currentPrinterModel;
        }
        if (headerSelector) {
            headerSelector.value = currentPrinterModel;
        }
    } else {
        // Update main model display
        if (modelElement) {
        modelElement.textContent = 'Не определена';
        }
        
        // Update selectors to auto
        if (modelSelector) {
            modelSelector.value = 'auto';
        }
        if (headerSelector) {
            headerSelector.value = 'auto';
        }
    }
}

// Change model manually
function changeModel() {
    const modelSelector = document.getElementById('modelSelector');
    const headerSelector = document.getElementById('headerModelSelector');
    const selectedModel = modelSelector.value;
    
    if (selectedModel && selectedModel !== 'auto') {
        currentPrinterModel = selectedModel;
        updatePrinterModelDisplay();
        saveData();
        
        // Sync header selector
        if (headerSelector) {
            headerSelector.value = selectedModel;
        }
        
        // Load components for the selected model
        loadComponents();
        
        showMessage(`Модель изменена на: ${printerConfigs[selectedModel]?.name || selectedModel}`, 'success');
    } else if (selectedModel === 'auto') {
        currentPrinterModel = null;
        updatePrinterModelDisplay();
        
        // Sync header selector
        if (headerSelector) {
            headerSelector.value = 'auto';
        }
        
        // Load all components for auto-detect
        loadComponents();
        
        showMessage('Режим автоопределения модели', 'info');
    }
}

// Get available components for current printer model
function getAvailableComponents() {
    if (!currentPrinterModel || !printerConfigs[currentPrinterModel]) {
        return components; // Return all components if model not detected
    }
    
    const config = printerConfigs[currentPrinterModel];
    return components.filter(component => {
        // Check if component is in the supported list
        const isSupported = config.components.includes(component.id);
        
        // Check if component is excluded for this model
        const isExcluded = config.excludedComponents && config.excludedComponents.includes(component.id);
        
        return isSupported && !isExcluded;
    });
}

// Load components for install page
function loadComponents() {
    const componentsGrid = document.getElementById('componentsGrid');
    if (!componentsGrid) {
        console.log('Components grid not found, skipping load');
        return;
    }
    
    const availableComponents = getAvailableComponents();
    console.log(`Loading ${availableComponents.length} components for model: ${currentPrinterModel || 'auto'}`);
    
    componentsGrid.innerHTML = '';
    
    availableComponents.forEach(component => {
        const componentCard = createComponentCard(component);
        componentsGrid.appendChild(componentCard);
    });
    
    updateBatchStats();
}

// Create component card
function createComponentCard(component) {
    const card = document.createElement('div');
    card.className = 'component-card';
    card.id = `component-${component.id}`;
    
    const config = printerConfigs[currentPrinterModel];
    const isExcluded = config && config.excludedComponents && config.excludedComponents.includes(component.id);
    const isDefault = config && config.defaultComponents && config.defaultComponents.includes(component.id);
    
    if (isExcluded) {
        card.classList.add('excluded');
    }
    
    if (isDefault) {
        card.classList.add('default-selected');
        selectedComponents.add(component.id);
    }
    
    card.innerHTML = `
        <div class="component-checkbox ${isDefault ? 'checked' : ''}" onclick="toggleComponent('${component.id}')"></div>
        <div class="component-info">
            <div class="component-name">${component.name}</div>
            <div class="component-description">${component.description}</div>
            <div class="component-features">
                <span class="feature-tag">${t(`categories.${component.category}`)}</span>
                ${isExcluded ? '<span class="exclusion-warning">Исключено для данной модели</span>' : ''}
                ${component.id === 'buzzer' && (currentPrinterModel === 'k1s' || currentPrinterModel === 'k1se') ? '<span class="buzzer-warning"><strong>Внимание:</strong> Зуммер не припаян на плате в K1S/K1SE</span>' : ''}
            </div>
        </div>
        <div class="component-actions">
            <button class="help-btn" onclick="showHelp('${component.id}')" title="Справка">❓</button>
        </div>
    `;
    
    return card;
}

// Toggle component selection
function toggleComponent(componentId) {
    const checkbox = document.querySelector(`#component-${componentId} .component-checkbox`);
    const card = document.getElementById(`component-${componentId}`);
    
    if (selectedComponents.has(componentId)) {
        selectedComponents.delete(componentId);
        checkbox.classList.remove('checked');
        card.classList.remove('selected');
    } else {
        selectedComponents.add(componentId);
        checkbox.classList.add('checked');
        card.classList.add('selected');
    }
    
    updateBatchStats();
}

// Update batch install stats
function updateBatchStats() {
    const selectedCount = document.getElementById('selectedCount');
    const totalCount = document.getElementById('totalCount');
    
    if (selectedCount) {
        selectedCount.textContent = selectedComponents.size;
    }
    
    if (totalCount) {
        const availableComponents = getAvailableComponents();
        totalCount.textContent = availableComponents.length;
    }
}

// Select all components
function selectAllComponents() {
    const availableComponents = getAvailableComponents();
    availableComponents.forEach(component => {
        if (!printerConfigs[currentPrinterModel]?.excludedComponents?.includes(component.id)) {
            selectedComponents.add(component.id);
            const checkbox = document.querySelector(`#component-${component.id} .component-checkbox`);
            const card = document.getElementById(`component-${component.id}`);
            if (checkbox) checkbox.classList.add('checked');
            if (card) card.classList.add('selected');
        }
    });
    updateBatchStats();
}

// Select none components
function selectNoneComponents() {
    selectedComponents.clear();
    document.querySelectorAll('.component-checkbox').forEach(checkbox => {
        checkbox.classList.remove('checked');
    });
    document.querySelectorAll('.component-card').forEach(card => {
        card.classList.remove('selected');
    });
    updateBatchStats();
}

// Log functions
function addLogEntry(logContainer, message, type = 'info') {
    const logContent = document.getElementById(logContainer);
    if (!logContent) return;
    
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = document.createElement('div');
    logEntry.className = `log-entry ${type}`;
    logEntry.innerHTML = `
        <span class="log-timestamp">[${timestamp}]</span>
        <span class="log-message">${message}</span>
    `;
    
    logContent.appendChild(logEntry);
    logContent.scrollTop = logContent.scrollHeight;
}

function showInstallLog() {
    const installLog = document.getElementById('installLog');
    if (installLog) {
        installLog.style.display = 'block';
    }
}

function showRemoveLog() {
    const removeLog = document.getElementById('removeLog');
    if (removeLog) {
        removeLog.style.display = 'block';
    }
}

function clearInstallLog() {
    const logContent = document.getElementById('installLogContent');
    if (logContent) {
        logContent.innerHTML = '';
    }
}

function clearRemoveLog() {
    const logContent = document.getElementById('removeLogContent');
    if (logContent) {
        logContent.innerHTML = '';
    }
}

// Install selected components
async function installSelectedComponents() {
    if (selectedComponents.size === 0) {
        showMessage('Выберите компоненты для установки', 'warning');
        return;
    }
    
    if (!isConnected) {
        showMessage('Сначала подключитесь к принтеру', 'error');
        return;
    }
    
    showMessage(`Установка ${selectedComponents.size} компонентов...`, 'info');
    showInstallLog();
    addLogEntry('installLogContent', `Начинаем установку ${selectedComponents.size} компонентов...`, 'info');
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const componentId of selectedComponents) {
        try {
            const component = components.find(c => c.id === componentId);
            const componentName = component ? component.name : componentId;
            
            addLogEntry('installLogContent', `Установка ${componentName}...`, 'info');
            await installComponent(componentId);
            addLogEntry('installLogContent', `✅ ${componentName} установлен успешно`, 'success');
            successCount++;
        } catch (error) {
            console.error(`Error installing ${componentId}:`, error);
            addLogEntry('installLogContent', `❌ Ошибка установки ${componentId}: ${error.message}`, 'error');
            showMessage(`Ошибка установки ${componentId}: ${error.message}`, 'error');
            errorCount++;
        }
    }
    
    addLogEntry('installLogContent', `Установка завершена! Успешно: ${successCount}, Ошибок: ${errorCount}`, successCount > 0 ? 'success' : 'error');
    showMessage(`Установка завершена! Успешно: ${successCount}, Ошибок: ${errorCount}`, successCount > 0 ? 'success' : 'error');
}

// Check SSH connection
async function checkSSHConnection() {
    try {
        const result = await safeInvoke('ssh-exec', 'echo "connection_test"');
        return result.success;
    } catch (error) {
        console.warn('SSH connection check failed:', error);
        return false;
    }
}

// Retry SSH command with exponential backoff
async function retrySSHCommand(command, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            const result = await safeInvoke('ssh-exec', command);
            if (result.success) {
                return result;
            }
        } catch (error) {
            console.warn(`SSH command attempt ${i + 1} failed:`, error);
            if (i === maxRetries - 1) {
                throw error;
            }
            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        }
    }
}

// Ensure helper scripts are available on printer
async function ensureHelperScripts() {
    try {
        // Check if we're connected first
        if (!isConnected) {
            throw new Error('Not connected to printer');
        }
        
        // Verify SSH connection is actually working
        const connectionOk = await checkSSHConnection();
        if (!connectionOk) {
            throw new Error('SSH connection is not working properly');
        }
        
        // Check if scripts exist in /usr/data/helper-script/
        const checkResult = await safeInvoke('ssh-exec', 'test -f /usr/data/helper-script/scripts/original_helper.sh && echo "exists" || echo "missing"');
        
        if (checkResult.success && checkResult.stdout.includes('exists')) {
            return true; // Scripts already exist
        }
        
        // Scripts don't exist, need to upload them
        showMessage('Загрузка скриптов helper-script на принтер...', 'info');
        
        // First, create directory structure
        const mkdirResult = await safeInvoke('ssh-exec', 'mkdir -p /usr/data/helper-script/scripts /usr/data/helper-script/files/fixes /usr/data/helper-script/files/camera-settings /usr/data/helper-script/files/moonraker /usr/data/helper-script/files/fluidd-logos /usr/data/helper-script/files/macros /usr/data/helper-script/files/services');
        
        if (!mkdirResult.success) {
            throw new Error('Failed to create directory structure: ' + mkdirResult.stderr);
        }
        
        // Upload essential scripts to /tmp/ first
        const tempScripts = [
            'original_helper.sh',
            'tools.sh',
            'check_firmware.sh',
            'check_installed.sh',
            'install_components.sh',
            'factory_reset.sh'
        ];
        
        let uploadedCount = 0;
        
        for (const script of tempScripts) {
            try {
                // Read file content from local filesystem
                const fileContent = await safeInvoke('read-file', `scripts/${script}`);
                
                if (fileContent.success) {
                    // Try SSH heredoc first
                    let uploadResult = await safeInvoke('ssh-exec', `cat > /usr/data/helper-script/scripts/${script} << 'EOF'
${fileContent.content}
EOF`);
                    
                    // If heredoc fails, try base64 method
                    if (!uploadResult.success) {
                        console.log(`Heredoc failed for ${script}, trying base64 method...`);
                        const base64Content = btoa(unescape(encodeURIComponent(fileContent.content)));
                        uploadResult = await safeInvoke('ssh-exec', `echo '${base64Content}' | base64 -d > /usr/data/helper-script/scripts/${script}`);
                    }
                    
                    if (uploadResult.success) {
                        // Make it executable
                        const chmodResult = await safeInvoke('ssh-exec', `chmod +x /usr/data/helper-script/scripts/${script}`);
                        
                        if (chmodResult.success) {
                            uploadedCount++;
                        } else {
                            console.warn(`Failed to make ${script} executable:`, chmodResult.stderr);
                            uploadedCount++; // Still count as uploaded
                        }
                    } else {
                        console.warn(`Failed to upload ${script}:`, uploadResult.stderr);
                    }
                } else {
                    console.warn(`Failed to read ${script}:`, fileContent.error);
                }
            } catch (error) {
                console.warn(`Error processing ${script}:`, error);
            }
        }
        
        if (uploadedCount > 0) {
            showMessage(`Скрипты helper-script загружены на принтер! (${uploadedCount}/${tempScripts.length})`, 'success');
            return true;
        } else {
            throw new Error('Failed to upload any scripts');
        }
        
    } catch (error) {
        console.error('Error ensuring helper scripts:', error);
        showMessage('Предупреждение: Не удалось загрузить скрипты: ' + error.message, 'warning');
        return false; // Return false instead of throwing
    }
}

// Install single component
async function installComponent(componentId) {
    if (!componentId || typeof componentId !== 'string') {
        throw new Error('Invalid component ID');
    }
    
    // Validate component ID to prevent XSS
    const validIdRegex = /^[a-zA-Z0-9_-]+$/;
    if (!validIdRegex.test(componentId)) {
        throw new Error('Invalid component ID format');
    }
    
    // Ensure helper scripts are available
    const scriptsAvailable = await ensureHelperScripts();
    if (!scriptsAvailable) {
        throw new Error('Helper scripts are not available. Please check your connection and try again.');
    }
    
    // Map component IDs to script names
    const componentMap = {
        'moonraker-nginx': 'moonraker-nginx',
        'fluidd': 'fluidd',
        'mainsail': 'mainsail',
        'entware': 'entware',
        'gcode-shell-command': 'gcode-shell-command',
        'kamp': 'kamp',
        'buzzer': 'buzzer',
        'nozzle-cleaning': 'nozzle-cleaning',
        'fans-control': 'fans-control',
        'improved-shapers': 'improved-shapers',
        'useful-macros': 'useful-macros',
        'save-zoffset': 'save-zoffset',
        'screws-tilt-adjust': 'screws-tilt-adjust',
        'm600-support': 'm600-support',
        'git-backup': 'git-backup',
        'moonraker-timelapse': 'moonraker-timelapse',
        'camera-settings': 'camera-settings',
        'usb-camera': 'usb-camera',
        'octoeverywhere': 'octoeverywhere',
        'moonraker-obico': 'moonraker-obico',
        'guppyflo': 'guppyflo',
        'mobileraker': 'mobileraker',
        'octoapp': 'octoapp',
        'simplyprint': 'simplyprint'
    };
    
    const scriptName = componentMap[componentId];
    if (!scriptName) {
        throw new Error(`Unknown component: ${componentId}`);
    }
    
    // Use the new install_components.sh script
    const result = await safeInvoke('ssh-exec', `bash /usr/data/helper-script/scripts/install_components.sh install ${scriptName}`);
    
    if (!result.success) {
        throw new Error(result.stderr || result.stdout || 'Installation failed');
    }
    
    return result;
}

// Load installed components for remove page
// Load installed components for removal
async function loadInstalledComponents() {
    const installedContainer = document.getElementById('installedComponents');
    if (!installedContainer) return;
    
    if (!isConnected) {
        installedContainer.innerHTML = '<p>Сначала подключитесь к принтеру</p>';
        return;
    }
    
    // Show loading state
    installedContainer.innerHTML = '<p>Проверка установленных компонентов...</p>';
    
    try {
        // Get list of installed components
        const installedComponents = await getInstalledComponents();
        
        if (installedComponents.length === 0) {
            installedContainer.innerHTML = '<p>Нет установленных компонентов</p>';
            updateRemoveStats();
            return;
        }
        
        // Clear container
        installedContainer.innerHTML = '';
        
        // Create cards for each installed component
        installedComponents.forEach(component => {
            const componentCard = createInstalledComponentCard(component);
            installedContainer.appendChild(componentCard);
        });
        
        updateRemoveStats();
        
    } catch (error) {
        console.error('Error loading installed components:', error);
        installedContainer.innerHTML = '<p>Ошибка загрузки установленных компонентов</p>';
    }
}

// Get list of installed components via SSH
async function getInstalledComponents() {
    try {
        // Ensure helper scripts are available
        await ensureHelperScripts();
        
        // Use the new check_installed.sh script to get all components at once
        const result = await safeInvoke('ssh-exec', 'bash /usr/data/helper-script/scripts/check_installed.sh all');
        
        if (!result.success) {
            throw new Error(result.stderr || 'Failed to check installed components');
        }
        
        // Parse JSON response
        const installedStatus = JSON.parse(result.stdout);
        const installedComponents = [];
        
        // Map the results to our component objects
        for (const component of components) {
            const componentId = component.id;
            if (installedStatus[componentId] === 'installed') {
                installedComponents.push(component);
            }
        }
        
        return installedComponents;
        
    } catch (error) {
        console.error('Error getting installed components:', error);
        
        // Fallback to individual checks
    const installedComponents = [];
    
    // Check for each component if it's installed
    for (const component of components) {
        try {
            const isInstalled = await checkComponentInstalled(component);
            if (isInstalled) {
                installedComponents.push(component);
            }
        } catch (error) {
            console.error(`Error checking component ${component.id}:`, error);
        }
    }
    
    return installedComponents;
    }
}

// Check if a specific component is installed
async function checkComponentInstalled(component) {
    try {
        // Map component IDs to script names
        const componentMap = {
            'moonraker-nginx': 'moonraker-nginx',
            'fluidd': 'fluidd',
            'mainsail': 'mainsail',
            'entware': 'entware',
            'gcode-shell-command': 'gcode-shell-command',
            'kamp': 'kamp',
            'buzzer': 'buzzer',
            'nozzle-cleaning': 'nozzle-cleaning',
            'fans-control': 'fans-control',
            'improved-shapers': 'improved-shapers',
            'useful-macros': 'useful-macros',
            'save-zoffset': 'save-zoffset',
            'screws-tilt-adjust': 'screws-tilt-adjust',
            'm600-support': 'm600-support',
            'git-backup': 'git-backup',
            'moonraker-timelapse': 'moonraker-timelapse',
            'camera-settings': 'camera-settings',
            'usb-camera': 'usb-camera',
            'octoeverywhere': 'octoeverywhere',
            'moonraker-obico': 'moonraker-obico',
            'guppyflo': 'guppyflo',
            'mobileraker': 'mobileraker',
            'octoapp': 'octoapp',
            'simplyprint': 'simplyprint'
        };
        
        const scriptName = componentMap[component.id];
        if (!scriptName) {
            return false;
        }
        
        // Use the new check_installed.sh script to check installation status
        const result = await safeInvoke('ssh-exec', `bash /usr/data/helper-script/scripts/check_installed.sh ${scriptName}`);
        
        return result.stdout.includes('installed');
        
    } catch (error) {
        console.error(`Error checking component ${component.id}:`, error);
        return false;
    }
}

// Create card for installed component
function createInstalledComponentCard(component) {
    const card = document.createElement('div');
    card.className = 'component-card';
    card.id = `installed-${component.id}`;
    
    card.innerHTML = `
        <div class="component-checkbox" onclick="toggleInstalledComponent('${component.id}')"></div>
        <div class="component-info">
            <div class="component-name">${component.name}</div>
            <div class="component-description">${component.description}</div>
            <div class="component-features">
                <span class="feature-tag">${t(`categories.${component.category}`)}</span>
                <span class="installed-tag">Установлен</span>
            </div>
        </div>
        <div class="component-actions">
            <button class="help-btn" onclick="showHelp('${component.id}')" title="Справка">❓</button>
        </div>
    `;
    
    return card;
}

// Toggle installed component selection
function toggleInstalledComponent(componentId) {
    const checkbox = document.querySelector(`#installed-${componentId} .component-checkbox`);
    const card = document.getElementById(`installed-${componentId}`);
    
    if (selectedForRemoval.has(componentId)) {
        selectedForRemoval.delete(componentId);
        checkbox.classList.remove('checked');
        card.classList.remove('selected');
    } else {
        selectedForRemoval.add(componentId);
        checkbox.classList.add('checked');
        card.classList.add('selected');
    }
    
    updateRemoveStats();
}

// Update remove statistics
function updateRemoveStats() {
    const selectedCount = document.getElementById('removeSelectedCount');
    const totalCount = document.getElementById('removeTotalCount');
    
    if (selectedCount) {
        selectedCount.textContent = selectedForRemoval.size;
    }
    
    if (totalCount) {
        const installedCards = document.querySelectorAll('#installedComponents .component-card');
        totalCount.textContent = installedCards.length;
    }
}

// Select all installed components
function selectAllInstalled() {
    const installedCards = document.querySelectorAll('#installedComponents .component-card');
    installedCards.forEach(card => {
        const componentId = card.id.replace('installed-', '');
        selectedForRemoval.add(componentId);
        const checkbox = card.querySelector('.component-checkbox');
        checkbox.classList.add('checked');
        card.classList.add('selected');
    });
    updateRemoveStats();
}

// Deselect all installed components
function selectNoneInstalled() {
    selectedForRemoval.clear();
    document.querySelectorAll('#installedComponents .component-checkbox').forEach(checkbox => {
        checkbox.classList.remove('checked');
    });
    document.querySelectorAll('#installedComponents .component-card').forEach(card => {
        card.classList.remove('selected');
    });
    updateRemoveStats();
}

// Remove selected components
async function removeSelectedComponents() {
    if (selectedForRemoval.size === 0) {
        showMessage('Выберите компоненты для удаления', 'warning');
        return;
    }
    
    if (!confirm(t('remove.confirm_remove'))) {
        return;
    }
    
    const removeBtn = document.querySelector('button[onclick="removeSelectedComponents()"]');
    const originalText = removeBtn.innerHTML;
    
    // Show loading state
    removeBtn.innerHTML = '🗑️ <span class="loading"></span> Удаление...';
    removeBtn.disabled = true;
    
    try {
        showRemoveLog();
        addLogEntry('removeLogContent', `Начинаем удаление ${selectedForRemoval.size} компонентов...`, 'info');
        
        let successCount = 0;
        let errorCount = 0;
        
        for (const componentId of selectedForRemoval) {
            try {
                const component = components.find(c => c.id === componentId);
                const componentName = component ? component.name : componentId;
                
                addLogEntry('removeLogContent', `Удаление ${componentName}...`, 'info');
                await removeComponent(componentId);
                addLogEntry('removeLogContent', `✅ ${componentName} удален успешно`, 'success');
                successCount++;
                
                // Remove from UI
                const card = document.getElementById(`installed-${componentId}`);
                if (card) {
                    card.remove();
                }
                
            } catch (error) {
                console.error(`Error removing ${componentId}:`, error);
                addLogEntry('removeLogContent', `❌ Ошибка удаления ${componentId}: ${error.message}`, 'error');
                errorCount++;
            }
        }
        
        addLogEntry('removeLogContent', `Удаление завершено! Успешно: ${successCount}, Ошибок: ${errorCount}`, successCount > 0 ? 'success' : 'error');
        
        // Clear selection
        selectedForRemoval.clear();
        updateRemoveStats();
        
        if (successCount > 0) {
            showMessage(`Успешно удалено: ${successCount} компонентов`, 'success');
        }
        
        if (errorCount > 0) {
            showMessage(`Ошибок при удалении: ${errorCount} компонентов`, 'warning');
        }
        
    } catch (error) {
        console.error('Error removing components:', error);
        showMessage('Ошибка удаления компонентов: ' + error.message, 'error');
    } finally {
        // Restore button state
        removeBtn.innerHTML = originalText;
        removeBtn.disabled = false;
    }
}

// Remove specific component
async function removeComponent(componentId) {
    if (!componentId || typeof componentId !== 'string') {
        throw new Error('Invalid component ID');
    }
    
    // Validate component ID to prevent XSS
    const validIdRegex = /^[a-zA-Z0-9_-]+$/;
    if (!validIdRegex.test(componentId)) {
        throw new Error('Invalid component ID format');
    }
    
    // Ensure helper scripts are available
    const scriptsAvailable = await ensureHelperScripts();
    if (!scriptsAvailable) {
        throw new Error('Helper scripts are not available. Please check your connection and try again.');
    }
    
    // Map component IDs to script names
    const componentMap = {
        'moonraker-nginx': 'moonraker-nginx',
        'fluidd': 'fluidd',
        'mainsail': 'mainsail',
        'entware': 'entware',
        'gcode-shell-command': 'gcode-shell-command',
        'kamp': 'kamp',
        'buzzer': 'buzzer',
        'nozzle-cleaning': 'nozzle-cleaning',
        'fans-control': 'fans-control',
        'improved-shapers': 'improved-shapers',
        'useful-macros': 'useful-macros',
        'save-zoffset': 'save-zoffset',
        'screws-tilt-adjust': 'screws-tilt-adjust',
        'm600-support': 'm600-support',
        'git-backup': 'git-backup',
        'moonraker-timelapse': 'moonraker-timelapse',
        'camera-settings': 'camera-settings',
        'usb-camera': 'usb-camera',
        'octoeverywhere': 'octoeverywhere',
        'moonraker-obico': 'moonraker-obico',
        'guppyflo': 'guppyflo',
        'mobileraker': 'mobileraker',
        'octoapp': 'octoapp',
        'simplyprint': 'simplyprint'
    };
    
    const scriptName = componentMap[componentId];
    if (!scriptName) {
        throw new Error(`Unknown component: ${componentId}`);
    }
    
    // Use the new install_components.sh script for removal
    const result = await safeInvoke('ssh-exec', `bash /usr/data/helper-script/scripts/install_components.sh remove ${scriptName}`);
    
    if (!result.success) {
        throw new Error(result.stderr || result.stdout || 'Removal failed');
    }
    
    return result;
}

// Load customize options
function loadCustomizeOptions() {
    const customizeContainer = document.getElementById('customizeOptions');
    if (!customizeContainer) return;
    
    // Clear any existing content
    customizeContainer.innerHTML = '';
    
    // Update language for any existing content
    updateLanguage();
}

// System Information Tool
async function showSystemInfo() {
    const container = document.getElementById('customizeOptions');
    if (!container) return;
    
    if (!isConnected) {
        container.innerHTML = '<p>Сначала подключитесь к принтеру</p>';
        return;
    }
    
    container.innerHTML = '<div class="loading-container"><span class="loading"></span> Загрузка информации о системе...</div>';
    
    try {
        const systemInfo = await getSystemInfo();
        container.innerHTML = `
            <div class="info-section">
                <h3>📊 ${getLocalizedText('customize.system_info')}</h3>
                <div class="info-grid">
                    <div class="info-card">
                        <h4>${getLocalizedText('customize.system.printer_model')}</h4>
                        <p><strong>${systemInfo.printerModel || getLocalizedText('customize.system.unknown')}</strong></p>
                    </div>
                    <div class="info-card">
                        <h4>${getLocalizedText('customize.system.kernel_version')}</h4>
                        <p><strong>${systemInfo.firmwareVersion || getLocalizedText('customize.system.unknown')}</strong></p>
                    </div>
                    <div class="info-card">
                        <h4>${getLocalizedText('customize.system.klipper_version')}</h4>
                        <p><strong>${systemInfo.klipperVersion || getLocalizedText('customize.system.not_installed')}</strong></p>
                    </div>
                    <div class="info-card">
                        <h4>${getLocalizedText('customize.system.moonraker_version')}</h4>
                        <p><strong>${systemInfo.moonrakerVersion || getLocalizedText('customize.system.not_installed')}</strong></p>
                    </div>
                    <div class="info-card">
                        <h4>${getLocalizedText('customize.system.fluidd_version')}</h4>
                        <p><strong>${systemInfo.fluiddVersion || getLocalizedText('customize.system.not_installed')}</strong></p>
                    </div>
                    <div class="info-card">
                        <h4>${getLocalizedText('customize.system.mainsail_version')}</h4>
                        <p><strong>${systemInfo.mainsailVersion || getLocalizedText('customize.system.not_installed')}</strong></p>
                    </div>
                    <div class="info-card">
                        <h4>${getLocalizedText('customize.system.os_version')}</h4>
                        <p><strong>${systemInfo.osVersion || getLocalizedText('customize.system.unknown')}</strong></p>
                    </div>
                    <div class="info-card">
                        <h4>${getLocalizedText('customize.system.architecture')}</h4>
                        <p><strong>${systemInfo.architecture || getLocalizedText('customize.system.unknown')}</strong></p>
                    </div>
                    <div class="info-card">
                        <h4>${getLocalizedText('customize.system.uptime')}</h4>
                        <p><strong>${systemInfo.uptime || getLocalizedText('customize.system.unknown')}</strong></p>
                    </div>
                    <div class="info-card">
                        <h4>${getLocalizedText('customize.system.memory')}</h4>
                        <p><strong>${systemInfo.memory || getLocalizedText('customize.system.unknown')}</strong></p>
                    </div>
                    <div class="info-card">
                        <h4>${getLocalizedText('customize.system.disk')}</h4>
                        <p><strong>${systemInfo.diskUsage || getLocalizedText('customize.system.unknown')}</strong></p>
                    </div>
                    <div class="info-card">
                        <h4>${getLocalizedText('customize.system.cpu_load')}</h4>
                        <p><strong>${systemInfo.cpuLoad || getLocalizedText('customize.system.unknown')}</strong></p>
                    </div>
                </div>
                ${systemInfo.rawOutput ? `
                <div class="raw-output">
                    <h4>Полная информация о системе:</h4>
                    <pre>${systemInfo.rawOutput}</pre>
                </div>
                ` : ''}
            </div>
        `;
        updateLanguage();
    } catch (error) {
        console.error('Error loading system info:', error);
        container.innerHTML = '<p>Ошибка загрузки информации о системе</p>';
    }
}

// Get system information using original script
async function getSystemInfo() {
    const info = {};
    
    try {
        // Check connection first
        if (!isConnected) {
            throw new Error('Not connected to printer');
        }
        
        // Get basic system info one by one to avoid connection issues
        let modelResult, kernelResult, uptimeResult, memoryResult, diskResult, loadResult;
        
        try {
            modelResult = await retrySSHCommand('cat /proc/device-tree/model 2>/dev/null || echo "Unknown"');
        } catch (e) {
            console.warn('Model detection failed:', e);
            modelResult = { stdout: 'Unknown' };
        }
        
        try {
            kernelResult = await retrySSHCommand('uname -r');
        } catch (e) {
            console.warn('Kernel detection failed:', e);
            kernelResult = { stdout: 'Unknown' };
        }
        
        try {
            uptimeResult = await retrySSHCommand('uptime');
        } catch (e) {
            console.warn('Uptime detection failed:', e);
            uptimeResult = { stdout: 'Unknown' };
        }
        
        try {
            memoryResult = await retrySSHCommand('free -h');
        } catch (e) {
            console.warn('Memory detection failed:', e);
            memoryResult = { stdout: 'Unknown' };
        }
        
        try {
            diskResult = await retrySSHCommand('df -h');
        } catch (e) {
            console.warn('Disk detection failed:', e);
            diskResult = { stdout: 'Unknown' };
        }
        
        try {
            loadResult = await retrySSHCommand('cat /proc/loadavg');
        } catch (e) {
            console.warn('Load detection failed:', e);
            loadResult = { stdout: 'Unknown' };
        }
        
        // Parse results
        info.printerModel = modelResult.stdout?.trim() || (currentPrinterModel ? printerConfigs[currentPrinterModel]?.name : 'Не определена');
        info.firmwareVersion = kernelResult.stdout?.trim() || 'Неизвестно';
        info.uptime = uptimeResult.stdout?.trim() || 'Неизвестно';
        
        // Parse memory info
        if (memoryResult.stdout) {
            const memLines = memoryResult.stdout.split('\n');
            const memLine = memLines.find(line => line.includes('Mem:'));
            if (memLine) {
                const parts = memLine.split(/\s+/);
                info.memory = `${parts[2]}/${parts[1]}`;
            } else {
                info.memory = memoryResult.stdout.trim();
            }
        } else {
            info.memory = 'Неизвестно';
        }
        
        // Parse disk info
        if (diskResult.stdout) {
            const diskLines = diskResult.stdout.split('\n');
            const rootLine = diskLines.find(line => line.includes('/'));
            if (rootLine) {
                const parts = rootLine.split(/\s+/);
                info.diskUsage = `${parts[2]}/${parts[1]} (${parts[4]})`;
            } else {
                info.diskUsage = diskResult.stdout.trim();
            }
        } else {
            info.diskUsage = 'Неизвестно';
        }
        
        // Parse CPU load
        if (loadResult.stdout) {
            const loadParts = loadResult.stdout.trim().split(' ');
            info.cpuLoad = `${loadParts[0]}, ${loadParts[1]}, ${loadParts[2]}`;
        } else {
            info.cpuLoad = 'Неизвестно';
        }
        
        info.osVersion = 'BusyBox Linux';
        info.architecture = 'ARM';
        
        // Ensure helper scripts are available
        try {
            await ensureHelperScripts();
        } catch (e) {
            console.warn('Could not ensure helper scripts:', e);
        }
        
        // Get firmware version using new script
        try {
            const firmwareResult = await safeInvoke('ssh-exec', 'bash /usr/data/helper-script/scripts/check_firmware.sh firmware');
            info.firmwareVersion = firmwareResult.stdout.trim() || 'Неизвестно';
        } catch (e) {
            info.firmwareVersion = 'Неизвестно';
        }
        
        // Get Klipper and Moonraker versions using new script
        try {
            const klipperResult = await safeInvoke('ssh-exec', 'bash /usr/data/helper-script/scripts/check_firmware.sh klipper');
            info.klipperVersion = klipperResult.stdout.trim() || 'Не установлен';
        } catch (e) {
            info.klipperVersion = 'Не установлен';
        }
        
        try {
            const moonrakerResult = await safeInvoke('ssh-exec', 'bash /usr/data/helper-script/scripts/check_firmware.sh moonraker');
            info.moonrakerVersion = moonrakerResult.stdout.trim() || 'Не установлен';
        } catch (e) {
            info.moonrakerVersion = 'Не установлен';
        }
        
        // Get Fluidd and Mainsail versions
        try {
            const fluiddResult = await safeInvoke('ssh-exec', 'cat /usr/share/nginx/html/fluidd/version 2>/dev/null || echo "Не установлен"');
            info.fluiddVersion = fluiddResult.stdout.trim();
        } catch (e) {
            info.fluiddVersion = 'Не установлен';
        }
        
        try {
            const mainsailResult = await safeInvoke('ssh-exec', 'cat /usr/share/nginx/html/mainsail/version 2>/dev/null || echo "Не установлен"');
            info.mainsailVersion = mainsailResult.stdout.trim();
        } catch (e) {
            info.mainsailVersion = 'Не установлен';
        }
        
    } catch (error) {
        console.error('Error getting system info:', error);
        // Fallback to basic info
        info.printerModel = currentPrinterModel ? printerConfigs[currentPrinterModel]?.name : 'Не определена';
        info.firmwareVersion = 'Неизвестно';
        info.osVersion = 'Неизвестно';
        info.architecture = 'Неизвестно';
        info.klipperVersion = 'Не установлен';
        info.moonrakerVersion = 'Не установлен';
        info.fluiddVersion = 'Не установлен';
        info.mainsailVersion = 'Не установлен';
    }
    
    return info;
}

// Logs Viewer Tool
async function showLogsViewer() {
    const container = document.getElementById('customizeOptions');
    if (!container) return;
    
    if (!isConnected) {
        container.innerHTML = '<p>Сначала подключитесь к принтеру</p>';
        return;
    }
    
    container.innerHTML = `
        <div class="logs-section">
            <h3>📋 Просмотр логов</h3>
            <div class="logs-controls">
                <button class="btn btn-primary" onclick="loadLogs('klipper')">Логи Klipper</button>
                <button class="btn btn-primary" onclick="loadLogs('moonraker')">Логи Moonraker</button>
                <button class="btn btn-primary" onclick="loadLogs('system')">Системные логи</button>
                <button class="btn btn-warning" onclick="clearLogs()">Очистить</button>
            </div>
            <div class="logs-content">
                <pre id="logsOutput">Выберите тип логов для просмотра</pre>
            </div>
        </div>
    `;
    updateLanguage();
}

// Load specific logs using simple SSH commands
async function loadLogs(logType) {
    const output = document.getElementById('logsOutput');
    if (!output) return;
    
    output.textContent = 'Загрузка логов...';
    
    try {
        let command = '';
        
        switch (logType) {
            case 'klipper':
                command = 'journalctl -u klipper --no-pager -n 100';
                break;
            case 'moonraker':
                command = 'journalctl -u moonraker --no-pager -n 100';
                break;
            case 'system':
                command = 'journalctl --no-pager -n 100';
                break;
            default:
                command = 'echo "Неизвестный тип логов"';
        }
        
        const result = await safeInvoke('ssh-exec', command);
        output.textContent = result.stdout || result.stderr || 'Логи не найдены';
        
    } catch (error) {
        console.error('Error loading logs:', error);
        output.textContent = 'Ошибка загрузки логов: ' + error.message;
    }
}

// Clear logs display
function clearLogs() {
    const output = document.getElementById('logsOutput');
    if (output) {
        output.textContent = 'Логи очищены';
    }
}

// Service Management Tool
async function showServiceManager() {
    const container = document.getElementById('customizeOptions');
    if (!container) return;
    
    if (!isConnected) {
        container.innerHTML = '<p>Сначала подключитесь к принтеру</p>';
        return;
    }
    
    container.innerHTML = `
        <div class="services-section">
            <h3>🔧 Управление сервисами</h3>
            <div class="services-grid">
                <div class="service-card">
                    <h4>Klipper</h4>
                    <div class="service-actions">
                        <button class="btn btn-success" onclick="manageService('klipper', 'start')">Запустить</button>
                        <button class="btn btn-warning" onclick="manageService('klipper', 'stop')">Остановить</button>
                        <button class="btn btn-primary" onclick="manageService('klipper', 'restart')">Перезапустить</button>
                    </div>
                </div>
                <div class="service-card">
                    <h4>Moonraker</h4>
                    <div class="service-actions">
                        <button class="btn btn-success" onclick="manageService('moonraker', 'start')">Запустить</button>
                        <button class="btn btn-warning" onclick="manageService('moonraker', 'stop')">Остановить</button>
                        <button class="btn btn-primary" onclick="manageService('moonraker', 'restart')">Перезапустить</button>
                    </div>
                </div>
                <div class="service-card">
                    <h4>Nginx</h4>
                    <div class="service-actions">
                        <button class="btn btn-success" onclick="manageService('nginx', 'start')">Запустить</button>
                        <button class="btn btn-warning" onclick="manageService('nginx', 'stop')">Остановить</button>
                        <button class="btn btn-primary" onclick="manageService('nginx', 'restart')">Перезапустить</button>
                    </div>
                </div>
                <div class="service-card">
                    <h4>Fluidd</h4>
                    <div class="service-actions">
                        <button class="btn btn-success" onclick="manageService('fluidd', 'start')">Запустить</button>
                        <button class="btn btn-warning" onclick="manageService('fluidd', 'stop')">Остановить</button>
                        <button class="btn btn-primary" onclick="manageService('fluidd', 'restart')">Перезапустить</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    updateLanguage();
}

// Manage service using simple SSH commands
async function manageService(serviceName, action) {
    try {
        // Use simple systemctl commands
        const result = await safeInvoke('ssh-exec', `systemctl ${action} ${serviceName}`);
        
        if (result.success) {
            showMessage(`Сервис ${serviceName} ${action === 'start' ? 'запущен' : action === 'stop' ? 'остановлен' : 'перезапущен'}`, 'success');
        } else {
            showMessage(`Ошибка: ${result.stderr || result.error}`, 'error');
        }
        
    } catch (error) {
        console.error(`Error managing service ${serviceName}:`, error);
        showMessage(`Ошибка управления сервисом ${serviceName}: ${error.message}`, 'error');
    }
}

// File Manager Tool
async function showFileManager() {
    const container = document.getElementById('customizeOptions');
    if (!container) return;
    
    if (!isConnected) {
        container.innerHTML = '<p>Сначала подключитесь к принтеру</p>';
        return;
    }
    
    container.innerHTML = `
        <div class="file-manager-section">
            <h3>📁 Файловый менеджер</h3>
            <div class="file-manager-controls">
                <button class="btn btn-primary" onclick="listConfigFiles()">Показать файлы конфигурации</button>
                <button class="btn btn-primary" onclick="listLogFiles()">Показать файлы логов</button>
                <button class="btn btn-warning" onclick="clearFileManager()">Очистить</button>
            </div>
            <div class="file-manager-content">
                <pre id="fileManagerOutput">Выберите действие для просмотра файлов</pre>
            </div>
        </div>
    `;
    updateLanguage();
}

// List config files using simple SSH commands
async function listConfigFiles() {
    const output = document.getElementById('fileManagerOutput');
    if (!output) return;
    
    output.textContent = 'Загрузка файлов конфигурации...';
    
    try {
        // List common config directories
        const result = await safeInvoke('ssh-exec', 'find /usr/data/printer_data -name "*.cfg" -o -name "*.conf" 2>/dev/null | head -20');
        output.textContent = result.stdout || 'Файлы конфигурации не найдены';
        
    } catch (error) {
        console.error('Error listing config files:', error);
        output.textContent = 'Ошибка загрузки файлов: ' + error.message;
    }
}

// List log files using original script
async function listLogFiles() {
    const output = document.getElementById('fileManagerOutput');
    if (!output) return;
    
    output.textContent = 'Загрузка файлов логов...';
    
    try {
        // List common log directories
        const result = await safeInvoke('ssh-exec', 'find /var/log -name "*.log" 2>/dev/null | head -20');
        output.textContent = result.stdout || 'Файлы логов не найдены';
        
    } catch (error) {
        console.error('Error listing log files:', error);
        output.textContent = 'Ошибка загрузки файлов: ' + error.message;
    }
}

// Clear file manager
function clearFileManager() {
    const output = document.getElementById('fileManagerOutput');
    if (output) {
        output.textContent = 'Файловый менеджер очищен';
    }
}

// Network Tools Tool
async function showNetworkTools() {
    const container = document.getElementById('customizeOptions');
    if (!container) return;
    
    if (!isConnected) {
        container.innerHTML = '<p>Сначала подключитесь к принтеру</p>';
        return;
    }
    
    container.innerHTML = `
        <div class="network-section">
            <h3>🌐 Сетевые инструменты</h3>
            <div class="network-controls">
                <button class="btn btn-primary" onclick="runNetworkDiagnostics()">Диагностика сети</button>
                <button class="btn btn-primary" onclick="showNetworkInfo()">Информация о сети</button>
                <button class="btn btn-primary" onclick="testConnectivity()">Тест подключения</button>
            </div>
            <div class="network-content">
                <pre id="networkOutput">Выберите действие для диагностики сети</pre>
            </div>
        </div>
    `;
    updateLanguage();
}

// Run network diagnostics using simple SSH commands
async function runNetworkDiagnostics() {
    const output = document.getElementById('networkOutput');
    if (!output) return;
    
    output.textContent = 'Запуск диагностики сети...';
    
    try {
        // Run basic network diagnostics
        const result = await safeInvoke('ssh-exec', 'ip addr show && echo "---" && ip route show && echo "---" && ping -c 3 8.8.8.8');
        output.textContent = result.stdout || result.stderr || 'Диагностика сети завершена';
        
    } catch (error) {
        console.error('Error running network diagnostics:', error);
        output.textContent = 'Ошибка диагностики сети: ' + error.message;
    }
}

// Show network info using original script
async function showNetworkInfo() {
    const output = document.getElementById('networkOutput');
    if (!output) return;
    
    output.textContent = 'Загрузка информации о сети...';
    
    try {
        // Get basic network information
        const result = await safeInvoke('ssh-exec', 'ifconfig && echo "---" && netstat -rn');
        output.textContent = result.stdout || 'Информация о сети недоступна';
        
    } catch (error) {
        console.error('Error getting network info:', error);
        output.textContent = 'Ошибка загрузки информации о сети: ' + error.message;
    }
}

// Test connectivity using original script
async function testConnectivity() {
    const output = document.getElementById('networkOutput');
    if (!output) return;
    
    output.textContent = 'Тестирование подключения...';
    
    try {
        // Use original helper script for connectivity test
        const result = await safeInvoke('ssh-exec', 'bash /usr/data/helper-script/scripts/original_helper.sh network_diagnostics');
        output.textContent = result.stdout || result.stderr || 'Тест подключения завершен';
        
    } catch (error) {
        console.error('Error testing connectivity:', error);
        output.textContent = 'Ошибка теста подключения: ' + error.message;
    }
}

// Performance Monitor Tool
async function showPerformanceMonitor() {
    const container = document.getElementById('customizeOptions');
    if (!container) return;
    
    if (!isConnected) {
        container.innerHTML = '<p>Сначала подключитесь к принтеру</p>';
        return;
    }
    
    container.innerHTML = `
        <div class="performance-section">
            <h3>📈 Мониторинг производительности</h3>
            <div class="performance-controls">
                <button class="btn btn-primary" onclick="getSystemStats()">Статистика системы</button>
                <button class="btn btn-primary" onclick="getMemoryUsage()">Использование памяти</button>
                <button class="btn btn-primary" onclick="getDiskUsage()">Использование диска</button>
                <button class="btn btn-primary" onclick="getProcessList()">Список процессов</button>
            </div>
            <div class="performance-content">
                <pre id="performanceOutput">Выберите действие для мониторинга</pre>
            </div>
        </div>
    `;
    updateLanguage();
}

// Get system stats using simple SSH commands
async function getSystemStats() {
    const output = document.getElementById('performanceOutput');
    if (!output) return;
    
    output.textContent = 'Загрузка статистики системы...';
    
    try {
        // Get basic system statistics
        const result = await safeInvoke('ssh-exec', 'uptime && echo "---" && free -h && echo "---" && df -h');
        output.textContent = result.stdout || 'Статистика недоступна';
        
    } catch (error) {
        console.error('Error getting system stats:', error);
        output.textContent = 'Ошибка загрузки статистики: ' + error.message;
    }
}

// Get memory usage using original script
async function getMemoryUsage() {
    const output = document.getElementById('performanceOutput');
    if (!output) return;
    
    output.textContent = 'Загрузка информации о памяти...';
    
    try {
        // Get memory information
        const result = await safeInvoke('ssh-exec', 'free -h && echo "---" && cat /proc/meminfo | head -10');
        output.textContent = result.stdout || 'Информация о памяти недоступна';
        
    } catch (error) {
        console.error('Error getting memory usage:', error);
        output.textContent = 'Ошибка загрузки информации о памяти: ' + error.message;
    }
}

// Get disk usage using original script
async function getDiskUsage() {
    const output = document.getElementById('performanceOutput');
    if (!output) return;
    
    output.textContent = 'Загрузка информации о диске...';
    
    try {
        // Get disk usage information
        const result = await safeInvoke('ssh-exec', 'df -h && echo "---" && du -sh /usr/data/* 2>/dev/null | head -10');
        output.textContent = result.stdout || 'Информация о диске недоступна';
        
    } catch (error) {
        console.error('Error getting disk usage:', error);
        output.textContent = 'Ошибка загрузки информации о диске: ' + error.message;
    }
}

// Get process list using original script
async function getProcessList() {
    const output = document.getElementById('performanceOutput');
    if (!output) return;
    
    output.textContent = 'Загрузка списка процессов...';
    
    try {
        // Get process list
        const result = await safeInvoke('ssh-exec', 'ps aux | head -20');
        output.textContent = result.stdout || 'Список процессов недоступен';
        
    } catch (error) {
        console.error('Error getting process list:', error);
        output.textContent = 'Ошибка загрузки списка процессов: ' + error.message;
    }
}







// Create backup
async function createBackup() {
    if (!isConnected) {
        showMessage('Сначала подключитесь к принтеру', 'error');
        return;
    }
    
    try {
        const result = await safeInvoke('create-backup');
        if (result.success) {
            showMessage('Резервная копия создана успешно', 'success');
        } else {
            showMessage('Ошибка создания резервной копии: ' + result.error, 'error');
        }
    } catch (error) {
        showMessage('Ошибка создания резервной копии: ' + error.message, 'error');
    }
}

// Restore backup
async function restoreBackup() {
    if (!isConnected) {
        showMessage('Сначала подключитесь к принтеру', 'error');
        return;
    }
    
    try {
        const result = await safeInvoke('restore-backup');
        if (result.success) {
            showMessage('Резервная копия восстановлена успешно', 'success');
        } else {
            showMessage('Ошибка восстановления резервной копии: ' + result.error, 'error');
        }
    } catch (error) {
        showMessage('Ошибка восстановления резервной копии: ' + error.message, 'error');
    }
}

// Tool functions
async function runDiagnostic() {
    showMessage('Функция диагностики будет добавлена в следующих версиях', 'info');
}

async function updateFirmware() {
    showMessage('Функция обновления прошивки будет добавлена в следующих версиях', 'info');
}

async function viewLogs() {
    showMessage('Функция просмотра логов будет добавлена в следующих версиях', 'info');
}

async function systemInfo() {
    showMessage('Функция информации о системе будет добавлена в следующих версиях', 'info');
}

// Help modal functions
async function showHelp(componentId) {
    const helpModal = document.getElementById('helpModal');
    const helpContent = document.getElementById('helpContent');
    
    if (!helpModal || !helpContent) return;
    
    // Show modal immediately with loading state
    helpModal.classList.add('show');
    helpContent.innerHTML = '<div class="loading-container"><span class="loading"></span> Загрузка справки...</div>';
    
    try {
        // Load help content using IPC
        let helpData = null;
        try {
            const result = await safeInvoke('read-file', 'src/help/help-content.json');
            if (result.success) {
                helpData = JSON.parse(result.content);
                console.log('Help content loaded from file');
                }
            } catch (e) {
            console.log('Failed to load help from file:', e.message);
        }
        
        if (!helpData) {
            // Fallback help content
            helpData = getFallbackHelpContent();
        }
        
        const componentHelp = helpData[currentLanguage]?.[componentId];
        
        if (componentHelp) {
            helpContent.innerHTML = `
                <div class="help-section">
                    <h3>${componentHelp.title}</h3>
                    <p><strong>${t('help.description')}:</strong> ${componentHelp.description}</p>
                    <p>${componentHelp.details}</p>
                    
                    <h4>${t('help.features')}:</h4>
                    <ul>
                        ${componentHelp.features.map(feature => `<li>${feature}</li>`).join('')}
                    </ul>
                    
                    <h4>${t('help.requirements')}:</h4>
                    <ul>
                        ${componentHelp.requirements.map(req => `<li>${req}</li>`).join('')}
                    </ul>
                    
                    ${componentHelp.warnings ? `
                        <div class="help-warning">
                            <h4>${t('help.warnings')}:</h4>
                            <ul>
                                ${componentHelp.warnings.map(warning => `<li>${warning}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                    
                    <h4>${t('help.troubleshooting')}:</h4>
                    <ul>
                        ${componentHelp.troubleshooting.map(item => 
                            `<li><strong>${item.problem}:</strong> ${item.solution}</li>`
                        ).join('')}
                    </ul>
                </div>
            `;
        } else {
            helpContent.innerHTML = `
                <div class="help-section">
                    <h3>${t('help.component')}: ${componentId}</h3>
                    <p>${t('help.no_info')}</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading help content:', error);
        helpContent.innerHTML = `
            <div class="help-section">
                <h3>${t('help.error')}</h3>
                <p>${t('help.load_error')}</p>
            </div>
        `;
    }
}

function closeHelp() {
    const helpModal = document.getElementById('helpModal');
    if (helpModal) {
        helpModal.classList.remove('show');
    }
}

// ===== TOOLS FUNCTIONS =====

// Klipper Configuration Management
async function preventKlipperUpdates() {
    try {
        showLoading('toolsOptions', 'Предотвращение обновления конфигурации Klipper...');
        
        const result = await safeInvoke('ssh-exec', 'bash /usr/data/helper-script/scripts/tools.sh prevent_klipper_updates');
        
        document.getElementById('toolsOptions').innerHTML = `
            <div class="info-section">
                <h3>🔒 Предотвращение обновления конфигурации Klipper</h3>
                <div class="raw-output">
                    <h4>Результат:</h4>
                    <pre>${result?.stdout || result?.stderr || 'Команда выполнена'}</pre>
                </div>
                <div class="button-group">
                    <button class="btn btn-primary" onclick="clearToolsOptions()">Назад</button>
                </div>
            </div>
        `;
    } catch (error) {
        document.getElementById('toolsOptions').innerHTML = `
            <div class="info-section">
                <h3>❌ Ошибка</h3>
                <p>Ошибка: ${error.message}</p>
                <div class="button-group">
                    <button class="btn btn-primary" onclick="clearToolsOptions()">Назад</button>
                </div>
            </div>
        `;
    }
}

async function allowKlipperUpdates() {
    try {
        showLoading('toolsOptions', 'Разрешение обновления конфигурации Klipper...');
        
        const result = await safeInvoke('ssh-exec', 'bash /usr/data/helper-script/scripts/tools.sh allow_klipper_updates');
        
        document.getElementById('toolsOptions').innerHTML = `
            <div class="info-section">
                <h3>🔓 Разрешение обновления конфигурации Klipper</h3>
                <div class="raw-output">
                    <h4>Результат:</h4>
                    <pre>${result?.stdout || result?.stderr || 'Команда выполнена'}</pre>
                </div>
                <div class="button-group">
                    <button class="btn btn-primary" onclick="clearToolsOptions()">Назад</button>
                </div>
            </div>
        `;
    } catch (error) {
        document.getElementById('toolsOptions').innerHTML = `
            <div class="info-section">
                <h3>❌ Ошибка</h3>
                <p>Ошибка: ${error.message}</p>
                <div class="button-group">
                    <button class="btn btn-primary" onclick="clearToolsOptions()">Назад</button>
                </div>
            </div>
        `;
    }
}

// Gcode Fix
async function fixGcodePrinting() {
    try {
        showLoading('toolsOptions', 'Исправление печати Gcode файлов из папки...');
        
        const result = await safeInvoke('ssh-exec', 'bash /usr/data/helper-script/scripts/tools.sh fix_gcode_printing');
        
        document.getElementById('toolsOptions').innerHTML = `
            <div class="info-section">
                <h3>🔧 Исправление печати Gcode файлов из папки</h3>
                <div class="raw-output">
                    <h4>Результат:</h4>
                    <pre>${result?.stdout || result?.stderr || 'Команда выполнена'}</pre>
                </div>
                <div class="button-group">
                    <button class="btn btn-primary" onclick="clearToolsOptions()">Назад</button>
                </div>
            </div>
        `;
    } catch (error) {
        document.getElementById('toolsOptions').innerHTML = `
            <div class="info-section">
                <h3>❌ Ошибка</h3>
                <p>Ошибка: ${error.message}</p>
                <div class="button-group">
                    <button class="btn btn-primary" onclick="clearToolsOptions()">Назад</button>
                </div>
            </div>
        `;
    }
}

// Camera Settings
async function enableCameraSettings() {
    try {
        showLoading('toolsOptions', 'Включение настроек камеры в Moonraker...');
        
        const result = await safeInvoke('ssh-exec', 'bash /usr/data/helper-script/scripts/tools.sh enable_camera_settings');
        
        document.getElementById('toolsOptions').innerHTML = `
            <div class="info-section">
                <h3>📷 Включение настроек камеры в Moonraker</h3>
                <div class="raw-output">
                    <h4>Результат:</h4>
                    <pre>${result?.stdout || result?.stderr || 'Команда выполнена'}</pre>
                </div>
                <div class="button-group">
                    <button class="btn btn-primary" onclick="clearToolsOptions()">Назад</button>
                </div>
            </div>
        `;
    } catch (error) {
        document.getElementById('toolsOptions').innerHTML = `
            <div class="info-section">
                <h3>❌ Ошибка</h3>
                <p>Ошибка: ${error.message}</p>
                <div class="button-group">
                    <button class="btn btn-primary" onclick="clearToolsOptions()">Назад</button>
                </div>
            </div>
        `;
    }
}

async function disableCameraSettings() {
    try {
        showLoading('toolsOptions', 'Выключение настроек камеры в Moonraker...');
        
        const result = await safeInvoke('ssh-exec', 'bash /usr/data/helper-script/scripts/tools.sh disable_camera_settings');
        
        document.getElementById('toolsOptions').innerHTML = `
            <div class="info-section">
                <h3>📷 Выключение настроек камеры в Moonraker</h3>
                <div class="raw-output">
                    <h4>Результат:</h4>
                    <pre>${result?.stdout || result?.stderr || 'Команда выполнена'}</pre>
                </div>
                <div class="button-group">
                    <button class="btn btn-primary" onclick="clearToolsOptions()">Назад</button>
                </div>
            </div>
        `;
    } catch (error) {
        document.getElementById('toolsOptions').innerHTML = `
            <div class="info-section">
                <h3>❌ Ошибка</h3>
                <p>Ошибка: ${error.message}</p>
                <div class="button-group">
                    <button class="btn btn-primary" onclick="clearToolsOptions()">Назад</button>
                </div>
            </div>
        `;
    }
}

// Service Restart Functions
async function restartNginx() {
    try {
        showLoading('toolsOptions', 'Перезапуск сервиса Nginx...');
        
        const result = await safeInvoke('ssh-exec', 'bash /usr/data/helper-script/scripts/tools.sh restart_nginx');
        
        document.getElementById('toolsOptions').innerHTML = `
            <div class="info-section">
                <h3>🔄 Перезапуск сервиса Nginx</h3>
                <div class="raw-output">
                    <h4>Результат:</h4>
                    <pre>${result?.stdout || result?.stderr || 'Команда выполнена'}</pre>
                </div>
                <div class="button-group">
                    <button class="btn btn-primary" onclick="clearToolsOptions()">Назад</button>
                </div>
            </div>
        `;
    } catch (error) {
        document.getElementById('toolsOptions').innerHTML = `
            <div class="info-section">
                <h3>❌ Ошибка</h3>
                <p>Ошибка: ${error.message}</p>
                <div class="button-group">
                    <button class="btn btn-primary" onclick="clearToolsOptions()">Назад</button>
                </div>
            </div>
        `;
    }
}

async function restartMoonraker() {
    try {
        showLoading('toolsOptions', 'Перезапуск сервиса Moonraker...');
        
        const result = await safeInvoke('ssh-exec', 'bash /usr/data/helper-script/scripts/tools.sh restart_moonraker');
        
        document.getElementById('toolsOptions').innerHTML = `
            <div class="info-section">
                <h3>🔄 Перезапуск сервиса Moonraker</h3>
                <div class="raw-output">
                    <h4>Результат:</h4>
                    <pre>${result?.stdout || result?.stderr || 'Команда выполнена'}</pre>
                </div>
                <div class="button-group">
                    <button class="btn btn-primary" onclick="clearToolsOptions()">Назад</button>
                </div>
            </div>
        `;
    } catch (error) {
        document.getElementById('toolsOptions').innerHTML = `
            <div class="info-section">
                <h3>❌ Ошибка</h3>
                <p>Ошибка: ${error.message}</p>
                <div class="button-group">
                    <button class="btn btn-primary" onclick="clearToolsOptions()">Назад</button>
                </div>
            </div>
        `;
    }
}

async function restartKlipper() {
    try {
        showLoading('toolsOptions', 'Перезапуск сервиса Klipper...');
        
        const result = await safeInvoke('ssh-exec', 'bash /usr/data/helper-script/scripts/tools.sh restart_klipper');
        
        document.getElementById('toolsOptions').innerHTML = `
            <div class="info-section">
                <h3>🔄 Перезапуск сервиса Klipper</h3>
                <div class="raw-output">
                    <h4>Результат:</h4>
                    <pre>${result?.stdout || result?.stderr || 'Команда выполнена'}</pre>
                </div>
                <div class="button-group">
                    <button class="btn btn-primary" onclick="clearToolsOptions()">Назад</button>
                </div>
            </div>
        `;
    } catch (error) {
        document.getElementById('toolsOptions').innerHTML = `
            <div class="info-section">
                <h3>❌ Ошибка</h3>
                <p>Ошибка: ${error.message}</p>
                <div class="button-group">
                    <button class="btn btn-primary" onclick="clearToolsOptions()">Назад</button>
                </div>
            </div>
        `;
    }
}

// Entware Update
async function updateEntware() {
    try {
        showLoading('toolsOptions', 'Обновление пакетов Entware...');
        
        const result = await safeInvoke('ssh-exec', 'bash /usr/data/helper-script/scripts/tools.sh update_entware');
        
        document.getElementById('toolsOptions').innerHTML = `
            <div class="info-section">
                <h3>📦 Обновление пакетов Entware</h3>
                <div class="raw-output">
                    <h4>Результат:</h4>
                    <pre>${result?.stdout || result?.stderr || 'Команда выполнена'}</pre>
                </div>
                <div class="button-group">
                    <button class="btn btn-primary" onclick="clearToolsOptions()">Назад</button>
                </div>
            </div>
        `;
    } catch (error) {
        document.getElementById('toolsOptions').innerHTML = `
            <div class="info-section">
                <h3>❌ Ошибка</h3>
                <p>Ошибка: ${error.message}</p>
                <div class="button-group">
                    <button class="btn btn-primary" onclick="clearToolsOptions()">Назад</button>
                </div>
            </div>
        `;
    }
}

// Cache and Logs
async function clearCache() {
    try {
        showLoading('toolsOptions', 'Очистка системного кэша...');
        
        const result = await safeInvoke('ssh-exec', 'bash /usr/data/helper-script/scripts/tools.sh clear_cache');
        
        // Debug: log the result to see what we're getting
        console.log('Clear cache result:', result);
        
        const output = result?.stdout || result?.stderr || 'Команда выполнена';
        
        document.getElementById('toolsOptions').innerHTML = `
            <div class="info-section">
                <h3>🗑️ Очистка системного кэша</h3>
                <div class="raw-output">
                    <h4>Результат:</h4>
                    <pre>${output}</pre>
                </div>
                <div class="button-group">
                    <button class="btn btn-primary" onclick="clearToolsOptions()">Назад</button>
                </div>
            </div>
        `;
    } catch (error) {
        document.getElementById('toolsOptions').innerHTML = `
            <div class="info-section">
                <h3>❌ Ошибка</h3>
                <p>Ошибка: ${error.message}</p>
                <div class="button-group">
                    <button class="btn btn-primary" onclick="clearToolsOptions()">Назад</button>
                </div>
            </div>
        `;
    }
}

async function clearLogs() {
    try {
        showLoading('toolsOptions', 'Очистка файлов логов...');
        
        const result = await safeInvoke('ssh-exec', 'bash /usr/data/helper-script/scripts/tools.sh clear_logs');
        
        document.getElementById('toolsOptions').innerHTML = `
            <div class="info-section">
                <h3>🗑️ Очистка файлов логов</h3>
                <div class="raw-output">
                    <h4>Результат:</h4>
                    <pre>${result?.stdout || result?.stderr || 'Команда выполнена'}</pre>
                </div>
                <div class="button-group">
                    <button class="btn btn-primary" onclick="clearToolsOptions()">Назад</button>
                </div>
            </div>
        `;
    } catch (error) {
        document.getElementById('toolsOptions').innerHTML = `
            <div class="info-section">
                <h3>❌ Ошибка</h3>
                <p>Ошибка: ${error.message}</p>
                <div class="button-group">
                    <button class="btn btn-primary" onclick="clearToolsOptions()">Назад</button>
                </div>
            </div>
        `;
    }
}

// Firmware Management
async function restoreFirmware() {
    try {
        showLoading('toolsOptions', 'Получение инструкций по восстановлению прошивки...');
        
        const result = await safeInvoke('ssh-exec', 'bash /usr/data/helper-script/scripts/tools.sh restore_firmware');
        
        document.getElementById('toolsOptions').innerHTML = `
            <div class="info-section">
                <h3>🔄 Восстановление предыдущей прошивки</h3>
                <div class="raw-output">
                    <h4>Инструкции:</h4>
                    <pre>${result?.stdout || result?.stderr || 'Команда выполнена'}</pre>
                </div>
                <div class="button-group">
                    <button class="btn btn-primary" onclick="clearToolsOptions()">Назад</button>
                </div>
            </div>
        `;
    } catch (error) {
        document.getElementById('toolsOptions').innerHTML = `
            <div class="info-section">
                <h3>❌ Ошибка</h3>
                <p>Ошибка: ${error.message}</p>
                <div class="button-group">
                    <button class="btn btn-primary" onclick="clearToolsOptions()">Назад</button>
                </div>
            </div>
        `;
    }
}

// Factory Reset
async function factoryReset() {
    if (!confirm(getLocalizedText('tools.factory_reset_warning'))) {
        return;
    }
    
    try {
        showLoading('toolsOptions', 'Сброс к заводским настройкам...');
        
        // Try to use the standalone factory reset script first
        let result;
        try {
            result = await safeInvoke('ssh-exec', 'bash /usr/data/helper-script/scripts/factory_reset.sh reset');
            if (!result.success) {
                throw new Error('Factory reset script failed');
            }
        } catch (error) {
            // If the script is not available, use the direct command
            console.log('Factory reset script not found, using direct command...');
            
            // Step 1: Download the factory reset script
            const downloadResult = await safeInvoke('ssh-exec', 'wget --no-check-certificate https://raw.githubusercontent.com/pellcorp/creality/main/k1/services/S58factoryreset -O /tmp/S58factoryreset');
            if (!downloadResult.success) {
                throw new Error(`Failed to download factory reset script: ${downloadResult.stderr || downloadResult.error}`);
            }
            
            // Step 2: Make it executable
            const chmodResult = await safeInvoke('ssh-exec', 'chmod +x /tmp/S58factoryreset');
            if (!chmodResult.success) {
                throw new Error(`Failed to make script executable: ${chmodResult.stderr || chmodResult.error}`);
            }
            
            // Step 3: Execute the factory reset
            result = await safeInvoke('ssh-exec', '/tmp/S58factoryreset reset');
            if (!result.success) {
                throw new Error(`Factory reset failed: ${result.stderr || result.error || 'Unknown error'}`);
            }
        }
        
        document.getElementById('toolsOptions').innerHTML = `
            <div class="info-section">
                <h3>🏭 ${getLocalizedText('tools.factory_reset')}</h3>
                <div class="raw-output">
                    <h4>Результат:</h4>
                    <pre>${result?.stdout || result?.stderr || 'Команда выполнена'}</pre>
                </div>
                <div class="button-group">
                    <button class="btn btn-primary" onclick="clearToolsOptions()">${getLocalizedText('tools.back')}</button>
                </div>
            </div>
        `;
    } catch (error) {
        document.getElementById('toolsOptions').innerHTML = `
            <div class="info-section">
                <h3>❌ Ошибка</h3>
                <p>Ошибка: ${error.message}</p>
                <div class="button-group">
                    <button class="btn btn-primary" onclick="clearToolsOptions()">Назад</button>
                </div>
            </div>
        `;
    }
}

// Clear tools options
function clearToolsOptions() {
    document.getElementById('toolsOptions').innerHTML = '';
}
