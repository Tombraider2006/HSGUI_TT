# 🚀 Установка Creality Helper Simple

## 📋 Предварительные требования

- Windows 10/11, Linux (Ubuntu 18.04+), или macOS 10.14+
- Node.js 16+ (для разработки)
- SSH доступ к принтеру Creality

## 🔧 Установка на компьютер

### 1. Клонирование репозитория
```bash
git clone https://github.com/your-repo/creality-helper-simple.git
cd creality-helper-simple
```

### 2. Установка зависимостей
```bash
npm install
```

### 3. Запуск приложения
```bash
# Режим разработки
npm run dev

# Обычный запуск
npm start
```

### 4. Сборка дистрибутива
```bash
# Windows
npm run dist:win

# Linux
npm run dist:linux

# macOS
npm run dist:mac
```

## 🖨️ Установка на принтер

### Автоматическая установка (рекомендуется)

1. Подключитесь к принтеру через SSH
2. Скопируйте файлы на принтер:
```bash
# Создайте директорию на принтере
mkdir -p /usr/data/helper-script

# Скопируйте все файлы из папки scripts/
scp -r scripts/* root@PRINTER_IP:/usr/data/helper-script/

# Скопируйте файлы из папки files/
scp -r files/* root@PRINTER_IP:/usr/data/helper-script/files/
```

3. Установите скрипты на принтере:
```bash
# Подключитесь к принтеру
ssh root@PRINTER_IP

# Перейдите в директорию
cd /usr/data/helper-script

# Запустите установку
bash install_all.sh
```

### Ручная установка

1. Скопируйте `scripts/tools.sh` в `/usr/data/helper-script/scripts/`
2. Скопируйте все файлы из `files/` в `/usr/data/helper-script/files/`
3. Установите права доступа:
```bash
chmod +x /usr/data/helper-script/scripts/tools.sh
chmod -R 755 /usr/data/helper-script/files/
```

## 🔧 Настройка принтера

### 1. Подключение к принтеру

1. Запустите приложение
2. Введите данные подключения:
   - **IP адрес**: IP адрес вашего принтера (например, 192.168.1.100)
   - **Порт**: 22 (стандартный SSH порт)
   - **Имя пользователя**: root
   - **Пароль**: creality_2023 (по умолчанию)

3. Нажмите "Подключиться"

### 2. Автоопределение модели

Приложение автоматически определит модель вашего принтера:
- Creality K1 / K1 Max / K1C / K1SE / K1S
- Ender-3 V3 / Ender-3 V3 SE / Ender-3 V3 KE
- CR-10 SE
- Ender-5 MAX

### 3. Установка компонентов

1. Перейдите в раздел "Установка"
2. Выберите нужные компоненты
3. Нажмите "Установить выбранные"

## 🛠️ Использование Tools

### Доступные инструменты:

1. **Управление конфигурацией Klipper**
   - Предотвращение обновления конфигурации
   - Разрешение обновления конфигурации

2. **Исправления**
   - Исправление печати Gcode файлов из папки

3. **Настройки камеры**
   - Включение/выключение настроек камеры в Moonraker

4. **Управление сервисами**
   - Перезапуск Nginx, Moonraker, Klipper

5. **Обновления**
   - Обновление пакетов Entware

6. **Очистка системы**
   - Очистка кэша и логов

7. **Управление прошивкой**
   - Восстановление предыдущей прошивки
   - Сброс к заводским настройкам

## 🔍 Диагностика проблем

### Проблемы с подключением

1. **Проверьте IP адрес принтера**
   - Убедитесь, что принтер подключен к сети
   - Проверьте IP адрес в настройках принтера

2. **Проверьте SSH доступ**
   ```bash
   ssh root@PRINTER_IP
   ```

3. **Очистите SSH ключи**
   - Нажмите кнопку "🔑 Очистить SSH" в приложении

### Проблемы с Tools

1. **Проверьте установку скриптов**
   ```bash
   ls -la /usr/data/helper-script/scripts/
   ```

2. **Проверьте права доступа**
   ```bash
   chmod +x /usr/data/helper-script/scripts/tools.sh
   ```

3. **Проверьте логи**
   - Откройте консоль разработчика (F12)
   - Проверьте ошибки в разделе Console

## 📞 Поддержка

- **GitHub Issues**: [Создать issue](https://github.com/your-repo/creality-helper-simple/issues)
- **Документация**: [Wiki](https://github.com/your-repo/creality-helper-simple/wiki)
- **Оригинальный скрипт**: [Creality-Helper-Script](https://github.com/Guilouz/Creality-Helper-Script)

## 📄 Лицензия

MIT License - см. файл [LICENSE](LICENSE)

---

**Версия**: 1.0.0  
**Дата**: 2024-12-19  
**Статус**: Готов к использованию
