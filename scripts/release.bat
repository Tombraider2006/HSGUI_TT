@echo off
REM HSGUI Release Script for Windows
REM Автоматический скрипт для создания релизов

echo 🚀 HSGUI Release Script
echo ========================

REM Проверяем, что мы в правильной директории
if not exist "package.json" (
    echo ❌ Ошибка: package.json не найден. Запустите скрипт из корня проекта.
    pause
    exit /b 1
)

REM Получаем версию из package.json
for /f "tokens=2 delims=:" %%a in ('findstr "version" package.json') do set VERSION=%%a
set VERSION=%VERSION: =%
set VERSION=%VERSION:,=%
echo 📦 Версия: %VERSION%

REM Создаем папку dist если её нет
if not exist "dist" mkdir dist

REM Параметры командной строки
if "%1"=="win" goto :win
if "%1"=="windows" goto :win
if "%1"=="linux" goto :linux
if "%1"=="mac" goto :mac
if "%1"=="macos" goto :mac
if "%1"=="all" goto :all
if "%1"=="" goto :all

echo Использование: %0 [win^|linux^|mac^|all]
echo   win/linux/mac - создать релиз для конкретной платформы
echo   all (по умолчанию) - создать релизы для всех платформ
pause
exit /b 1

:win
echo 🔨 Создание релиза для Windows...
call npm run release:win
if %errorlevel% equ 0 (
    echo ✅ Windows релиз создан успешно!
) else (
    echo ❌ Ошибка при создании Windows релиза
    pause
    exit /b 1
)
goto :end

:linux
echo 🔨 Создание релиза для Linux...
call npm run release:linux
if %errorlevel% equ 0 (
    echo ✅ Linux релиз создан успешно!
) else (
    echo ❌ Ошибка при создании Linux релиза
    pause
    exit /b 1
)
goto :end

:mac
echo 🔨 Создание релиза для macOS...
call npm run release:mac
if %errorlevel% equ 0 (
    echo ✅ macOS релиз создан успешно!
) else (
    echo ❌ Ошибка при создании macOS релиза
    pause
    exit /b 1
)
goto :end

:all
echo 🌍 Создание релизов для всех платформ...
call npm run release:all
if %errorlevel% equ 0 (
    echo ✅ Все релизы созданы успешно!
) else (
    echo ❌ Ошибка при создании релизов
    pause
    exit /b 1
)
goto :end

:end
echo.
echo 🎉 Готово! Релизы находятся в папке dist/
echo 📁 Содержимое папки dist/:
dir dist

echo.
echo 📋 Следующие шаги:
echo 1. Проверьте файлы в папке dist/
echo 2. Протестируйте релизы на соответствующих платформах
echo 3. Загрузите релизы в GitHub Releases
echo 4. Обновите документацию

pause
