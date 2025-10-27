# 🔧 Настройка GitHub CLI для автоматических релизов

## Установка GitHub CLI

### Windows
```powershell
# Через winget
winget install GitHub.cli

# Или скачайте с https://cli.github.com/
```

### Linux
```bash
# Ubuntu/Debian
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
sudo apt update
sudo apt install gh

# Или через snap
sudo snap install gh
```

### macOS
```bash
# Через Homebrew
brew install gh

# Или скачайте с https://cli.github.com/
```

## Авторизация

```bash
# Авторизация в GitHub
gh auth login

# Выберите:
# - GitHub.com
# - HTTPS
# - Yes (authenticate Git with your GitHub credentials)
# - Login with a web browser
```

## Создание репозитория

```bash
# Создать репозиторий (если еще не создан)
gh repo create hsgui --public --description "HSGUI - Helper Script GUI для управления Creality 3D-принтерами"

# Или подключить существующий
gh repo clone YOUR_USERNAME/hsgui
```

## Создание релизов

### Автоматический способ (рекомендуется)

```bash
# Все платформы
npm run github:release

# Или напрямую
scripts/github-release.sh
```

### Ручной способ

```bash
# 1. Создать тег
git tag v0.1.0-alpha
git push origin v0.1.0-alpha

# 2. GitHub Actions автоматически создаст релиз
```

## GitHub Actions

После настройки GitHub Actions будет автоматически:

1. **При создании тега** (`git tag v0.1.0-alpha && git push origin v0.1.0-alpha`)
2. **Собирать релизы** для всех платформ (Windows, Linux, macOS)
3. **Создавать GitHub Release** с артефактами
4. **Загружать файлы** в релиз

## Структура релиза

GitHub Actions создаст релиз с файлами:

- **Windows**: `HSGUI - Creality Helper Setup 0.1.0-alpha.exe`
- **Linux**: `hsgui-0.1.0-alpha.AppImage`  
- **macOS**: `HSGUI - Creality Helper-0.1.0-alpha.dmg`

## Проверка статуса

```bash
# Проверить статус GitHub Actions
gh run list

# Посмотреть логи последнего запуска
gh run view --log

# Проверить релизы
gh release list
```

## Устранение проблем

### Ошибка авторизации
```bash
gh auth login --web
```

### Ошибка прав доступа
```bash
# Проверить права
gh auth status

# Обновить токен
gh auth refresh
```

### Ошибка сборки
```bash
# Проверить логи GitHub Actions
gh run view --log

# Запустить локально
npm run dist:all
```

## Полезные команды

```bash
# Создать релиз вручную
gh release create v0.1.0-alpha --title "HSGUI v0.1.0-alpha" --notes "Описание релиза"

# Скачать релиз
gh release download v0.1.0-alpha

# Удалить тег
git tag -d v0.1.0-alpha
git push origin :refs/tags/v0.1.0-alpha
```
