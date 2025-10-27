@echo off
REM HSGUI GitHub Release Script for Windows
REM Скрипт для создания релизов через GitHub CLI

echo 🚀 HSGUI GitHub Release Script
echo ===============================

REM Проверяем, что мы в правильной директории
if not exist "package.json" (
    echo ❌ Ошибка: package.json не найден. Запустите скрипт из корня проекта.
    pause
    exit /b 1
)

REM Проверяем наличие GitHub CLI
gh --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Ошибка: GitHub CLI не установлен.
    echo Установите GitHub CLI: https://cli.github.com/
    pause
    exit /b 1
)

REM Проверяем авторизацию в GitHub
gh auth status >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Ошибка: Не авторизованы в GitHub CLI.
    echo Выполните: gh auth login
    pause
    exit /b 1
)

REM Получаем версию из package.json
for /f "tokens=2 delims=:" %%a in ('findstr "version" package.json') do set VERSION=%%a
set VERSION=%VERSION: =%
set VERSION=%VERSION:,=%
set TAG=v%VERSION%

echo 📦 Версия: %VERSION%
echo 🏷️ Тег: %TAG%

REM Проверяем, существует ли тег
git tag -l | findstr /x "%TAG%" >nul
if %errorlevel% equ 0 (
    echo ⚠️ Тег %TAG% уже существует!
    set /p CONTINUE="Продолжить? (y/N): "
    if /i not "%CONTINUE%"=="y" exit /b 1
)

REM Создаем релизы для всех платформ
echo 🔨 Создание релизов для всех платформ...

REM Создаем папку dist если её нет
if not exist "dist" mkdir dist

REM Создаем релизы
echo 📦 Сборка Windows...
call npm run dist:win
if %errorlevel% neq 0 (
    echo ❌ Ошибка при сборке Windows
    pause
    exit /b 1
)

echo 📦 Сборка Linux...
call npm run dist:linux
if %errorlevel% neq 0 (
    echo ❌ Ошибка при сборке Linux
    pause
    exit /b 1
)

echo 📦 Сборка macOS...
call npm run dist:mac
if %errorlevel% neq 0 (
    echo ❌ Ошибка при сборке macOS
    pause
    exit /b 1
)

echo ✅ Все релизы созданы!

REM Создаем коммит и тег
echo 📝 Создание коммита и тега...

REM Добавляем все изменения
git add .

REM Создаем коммит
git commit -m "Release %TAG%" 2>nul || echo Нет изменений для коммита

REM Создаем тег
git tag -a "%TAG%" -m "Release %TAG%"

REM Отправляем тег
echo 📤 Отправка тега в GitHub...
git push origin "%TAG%"

echo 🎉 Тег %TAG% отправлен в GitHub!
echo 🔄 GitHub Actions автоматически создаст релиз с артефактами.

echo.
echo 📋 Следующие шаги:
echo 1. Дождитесь завершения GitHub Actions workflow
echo 2. Проверьте релиз на GitHub
echo 3. Протестируйте релизы на соответствующих платформах

pause
