# 🐙 Настройка GitHub репозитория HSGUI

## Создание репозитория

1. **Создайте новый репозиторий** на GitHub:
   - Название: `HSGUI_TT`
   - Описание: `HSGUI - Helper Script GUI для управления Creality 3D-принтерами`
   - Публичный репозиторий
   - Не инициализируйте с README (у нас уже есть)

2. **Подключите локальный репозиторий**:
```bash
git init
git add .
git commit -m "Initial commit: HSGUI v0.1.0-alpha"
git branch -M main
git remote add origin https://github.com/Tombraider2006/HSGUI_TT.git
git push -u origin main
```

## Настройка релизов

### Автоматические релизы через GitHub Actions

Создайте файл `.github/workflows/release.yml`:

```yaml
name: Release

on:
  push:
    tags:
      - 'v*'
  workflow_dispatch:

jobs:
  release:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [windows-latest, ubuntu-latest, macos-latest]
        include:
          - os: windows-latest
            platform: win
          - os: ubuntu-latest
            platform: linux
          - os: macos-latest
            platform: mac

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build for ${{ matrix.platform }}
        run: npm run dist:${{ matrix.platform }}

      - name: Upload artifacts
        uses: actions/upload-artifact@v4
        with:
          name: hsgui-${{ matrix.platform }}-${{ github.ref_name }}
          path: dist/
```

### Ручные релизы

1. **Создайте тег**:
```bash
git tag v0.1.0-alpha
git push origin v0.1.0-alpha
```

2. **Создайте релиз**:
   - Перейдите в раздел "Releases" на GitHub
   - Нажмите "Create a new release"
   - Выберите тег `v0.1.0-alpha`
   - Добавьте описание изменений
   - Загрузите файлы из папки `dist/`

## Настройка репозитория

### Описание репозитория
```
HSGUI - Helper Script GUI для управления Creality 3D-принтерами. Основано на оригинальном Creality-Helper-Script.
```

### Топики (Topics)
- `creality`
- `3d-printer`
- `firmware`
- `gui`
- `electron`
- `klipper`
- `moonraker`

### README badges
Добавьте в README.md:

```markdown
[![Release](https://img.shields.io/github/v/release/YOUR_USERNAME/hsgui)](https://github.com/YOUR_USERNAME/hsgui/releases)
[![Downloads](https://img.shields.io/github/downloads/YOUR_USERNAME/hsgui/total)](https://github.com/YOUR_USERNAME/hsgui/releases)
[![License](https://img.shields.io/github/license/YOUR_USERNAME/hsgui)](LICENSE)
[![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20Linux%20%7C%20macOS-blue)](https://github.com/YOUR_USERNAME/hsgui/releases)
```

## Локальное создание релизов

### Windows
```cmd
scripts\release.bat all
```

### Linux/macOS
```bash
chmod +x scripts/release.sh
./scripts/release.sh all
```

### PowerShell
```powershell
scripts\release.ps1 -Platform all
```

## Структура релиза

После создания релиза в папке `dist/` будут файлы:

- **Windows**: `HSGUI - Creality Helper Setup 0.1.0-alpha.exe`
- **Linux**: `hsgui-0.1.0-alpha.AppImage`
- **macOS**: `HSGUI - Creality Helper-0.1.0-alpha.dmg`

## Обновление версии

1. Измените версию в `package.json`
2. Обновите `CHANGELOG.md`
3. Создайте коммит и тег
4. Запустите релиз
