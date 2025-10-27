# HSGUI Release Script for PowerShell
# Автоматический скрипт для создания релизов

param(
    [Parameter(Position=0)]
    [ValidateSet("win", "windows", "linux", "mac", "macos", "all")]
    [string]$Platform = "all"
)

Write-Host "🚀 HSGUI Release Script" -ForegroundColor Green
Write-Host "========================" -ForegroundColor Green

# Проверяем, что мы в правильной директории
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Ошибка: package.json не найден. Запустите скрипт из корня проекта." -ForegroundColor Red
    exit 1
}

# Получаем версию из package.json
try {
    $packageJson = Get-Content "package.json" | ConvertFrom-Json
    $version = $packageJson.version
    Write-Host "📦 Версия: $version" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Ошибка при чтении package.json" -ForegroundColor Red
    exit 1
}

# Создаем папку dist если её нет
if (-not (Test-Path "dist")) {
    New-Item -ItemType Directory -Path "dist" | Out-Null
}

# Функция для создания релиза
function Create-Release {
    param(
        [string]$PlatformName,
        [string]$ScriptName
    )
    
    Write-Host "🔨 Создание релиза для $PlatformName..." -ForegroundColor Yellow
    
    try {
        npm run $ScriptName
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ $PlatformName релиз создан успешно!" -ForegroundColor Green
            return $true
        } else {
            Write-Host "❌ Ошибка при создании $PlatformName релиза" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "❌ Ошибка при создании $PlatformName релиза: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Создаем релизы в зависимости от параметра
switch ($Platform) {
    { $_ -in @("win", "windows") } {
        if (-not (Create-Release "Windows" "release:win")) { exit 1 }
    }
    "linux" {
        if (-not (Create-Release "Linux" "release:linux")) { exit 1 }
    }
    { $_ -in @("mac", "macos") } {
        if (-not (Create-Release "macOS" "release:mac")) { exit 1 }
    }
    "all" {
        Write-Host "🌍 Создание релизов для всех платформ..." -ForegroundColor Cyan
        $success = $true
        $success = $success -and (Create-Release "Windows" "release:win")
        $success = $success -and (Create-Release "Linux" "release:linux")
        $success = $success -and (Create-Release "macOS" "release:mac")
        
        if (-not $success) {
            Write-Host "❌ Некоторые релизы не удалось создать" -ForegroundColor Red
            exit 1
        }
    }
}

Write-Host ""
Write-Host "🎉 Готово! Релизы находятся в папке dist/" -ForegroundColor Green
Write-Host "📁 Содержимое папки dist/:" -ForegroundColor Cyan
Get-ChildItem "dist" | Format-Table Name, Length, LastWriteTime

Write-Host ""
Write-Host "📋 Следующие шаги:" -ForegroundColor Yellow
Write-Host "1. Проверьте файлы в папке dist/" -ForegroundColor White
Write-Host "2. Протестируйте релизы на соответствующих платформах" -ForegroundColor White
Write-Host "3. Загрузите релизы в GitHub Releases" -ForegroundColor White
Write-Host "4. Обновите документацию" -ForegroundColor White
