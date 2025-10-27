@echo off
REM Скрипт для настройки Git hooks (Windows)

echo 🔧 Настройка Git hooks для автоматического увеличения версии...

REM Проверяем, что мы в Git репозитории
if not exist ".git" (
    echo ❌ Ошибка: Не найден .git каталог. Запустите скрипт из корня Git репозитория.
    pause
    exit /b 1
)

REM Создаем папку hooks если её нет
if not exist ".git\hooks" mkdir .git\hooks

REM Копируем соответствующий hook
echo 🪟 Настройка для Windows...
copy ".git\hooks\pre-commit.bat" ".git\hooks\pre-commit" >nul

echo ✅ Git hooks настроены!
echo 📝 Теперь при каждом коммите версия будет автоматически увеличиваться на 0.01
echo.
echo Пример:
echo   v0.1.0-alpha → v0.1.01-alpha
echo   v0.1.01-alpha → v0.1.02-alpha
echo   v0.1.02-alpha → v0.1.03-alpha

pause
