# 🚀 HSGUI Release Guide

## Создание релизов

### Быстрый старт

```bash
# Все платформы
npm run release:all

# Конкретная платформа
npm run release:win      # Windows
npm run release:linux    # Linux
npm run release:mac      # macOS
```

### Скрипты для релизов

#### Windows
```cmd
# Batch файл
scripts\release.bat all

# PowerShell
scripts\release.ps1 -Platform all
```

#### Linux/macOS
```bash
# Bash скрипт
chmod +x scripts/release.sh
./scripts/release.sh all
```

### Параметры

- `win` / `windows` - только Windows
- `linux` - только Linux  
- `mac` / `macos` - только macOS
- `all` - все платформы (по умолчанию)

### Результат

Релизы создаются в папке `dist/`:
- **Windows**: `.exe` установщик (NSIS)
- **Linux**: `.AppImage` файл
- **macOS**: `.dmg` образ

### Требования

- Node.js 16+
- npm
- electron-builder

### Иконки

Иконки находятся в папке `assets/`:
- `icon.png` - основная иконка (1024x1024)
- `icon.ico` - для Windows (создается автоматически)
- `icon.icns` - для macOS (создается автоматически)

### Версионирование

Версия указывается в `package.json`:
```json
{
  "version": "0.1.0-alpha"
}
```

### GitHub Releases

После создания релизов:

1. Создайте новый релиз в GitHub
2. Загрузите файлы из папки `dist/`
3. Добавьте описание изменений
4. Опубликуйте релиз

### Автоматизация

Для автоматических релизов можно использовать GitHub Actions:

```yaml
name: Release
on:
  push:
    tags:
      - 'v*'
jobs:
  release:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [windows-latest, ubuntu-latest, macos-latest]
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run release:${{ matrix.os == 'windows-latest' && 'win' || matrix.os == 'ubuntu-latest' && 'linux' || 'mac' }}
```
