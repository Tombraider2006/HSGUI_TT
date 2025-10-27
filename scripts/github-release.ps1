# HSGUI GitHub Release Script for PowerShell
# Скрипт для создания релизов через GitHub CLI

param(
    [Parameter(Position=0)]
    [string]$Version = ""
)

Write-Host "🚀 HSGUI GitHub Release Script" -ForegroundColor Green
Write-Host "===============================" -ForegroundColor Green

# Проверяем, что мы в правильной директории
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Ошибка: package.json не найден. Запустите скрипт из корня проекта." -ForegroundColor Red
    exit 1
}

# Проверяем наличие GitHub CLI
try {
    $null = gh --version
} catch {
    Write-Host "❌ Ошибка: GitHub CLI не установлен." -ForegroundColor Red
    Write-Host "Установите GitHub CLI: https://cli.github.com/" -ForegroundColor Yellow
    exit 1
}

# Проверяем авторизацию в GitHub
try {
    $null = gh auth status
} catch {
    Write-Host "❌ Ошибка: Не авторизованы в GitHub CLI." -ForegroundColor Red
    Write-Host "Выполните: gh auth login" -ForegroundColor Yellow
    exit 1
}

# Получаем версию
if ($Version) {
    $VERSION = $Version
} else {
    try {
        $packageJson = Get-Content "package.json" | ConvertFrom-Json
        $VERSION = $packageJson.version
    } catch {
        Write-Host "❌ Ошибка при чтении package.json" -ForegroundColor Red
        exit 1
    }
}

$TAG = "v$VERSION"

Write-Host "📦 Версия: $VERSION" -ForegroundColor Cyan
Write-Host "🏷️ Тег: $TAG" -ForegroundColor Cyan

# Проверяем, существует ли тег
$existingTags = git tag -l
if ($existingTags -contains $TAG) {
    Write-Host "⚠️ Тег $TAG уже существует!" -ForegroundColor Yellow
    $continue = Read-Host "Продолжить? (y/N)"
    if ($continue -ne "y" -and $continue -ne "Y") {
        exit 1
    }
}

# Создаем релизы для всех платформ
Write-Host "🔨 Создание релизов для всех платформ..." -ForegroundColor Yellow

# Создаем папку dist если её нет
if (-not (Test-Path "dist")) {
    New-Item -ItemType Directory -Path "dist" | Out-Null
}

# Функция для выполнения команды с проверкой
function Invoke-CommandWithCheck {
    param(
        [string]$Command,
        [string]$Description
    )
    
    Write-Host "📦 $Description..." -ForegroundColor Yellow
    
    try {
        Invoke-Expression $Command
        if ($LASTEXITCODE -ne 0) {
            throw "Command failed with exit code $LASTEXITCODE"
        }
        Write-Host "✅ $Description завершено" -ForegroundColor Green
    } catch {
        Write-Host "❌ Ошибка при $Description`: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
}

# Создаем релизы
Invoke-CommandWithCheck "npm run dist:win" "Сборка Windows"
Invoke-CommandWithCheck "npm run dist:linux" "Сборка Linux"
Invoke-CommandWithCheck "npm run dist:mac" "Сборка macOS"

Write-Host "✅ Все релизы созданы!" -ForegroundColor Green

# Создаем коммит и тег
Write-Host "📝 Создание коммита и тега..." -ForegroundColor Yellow

# Добавляем все изменения
git add .

# Создаем коммит
try {
    git commit -m "Release $TAG"
    Write-Host "✅ Коммит создан" -ForegroundColor Green
} catch {
    Write-Host "ℹ️ Нет изменений для коммита" -ForegroundColor Blue
}

# Создаем тег
git tag -a $TAG -m "Release $TAG"

# Отправляем тег
Write-Host "📤 Отправка тега в GitHub..." -ForegroundColor Yellow
git push origin $TAG

Write-Host "🎉 Тег $TAG отправлен в GitHub!" -ForegroundColor Green
Write-Host "🔄 GitHub Actions автоматически создаст релиз с артефактами." -ForegroundColor Cyan

# Получаем URL репозитория
try {
    $repoUrl = gh repo view --json owner,name -q '.owner.login + "/" + .name'
    Write-Host ""
    Write-Host "📋 Следующие шаги:" -ForegroundColor Yellow
    Write-Host "1. Дождитесь завершения GitHub Actions workflow" -ForegroundColor White
    Write-Host "2. Проверьте релиз на GitHub: https://github.com/$repoUrl/releases" -ForegroundColor White
    Write-Host "3. Протестируйте релизы на соответствующих платформах" -ForegroundColor White
} catch {
    Write-Host ""
    Write-Host "📋 Следующие шаги:" -ForegroundColor Yellow
    Write-Host "1. Дождитесь завершения GitHub Actions workflow" -ForegroundColor White
    Write-Host "2. Проверьте релиз на GitHub" -ForegroundColor White
    Write-Host "3. Протестируйте релизы на соответствующих платформах" -ForegroundColor White
}
