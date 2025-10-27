#!/bin/bash

# HSGUI Release Script
# Автоматический скрипт для создания релизов

set -e

echo "🚀 HSGUI Release Script"
echo "========================"

# Проверяем, что мы в правильной директории
if [ ! -f "package.json" ]; then
    echo "❌ Ошибка: package.json не найден. Запустите скрипт из корня проекта."
    exit 1
fi

# Получаем версию из package.json
VERSION=$(node -p "require('./package.json').version")
echo "📦 Версия: $VERSION"

# Создаем папку dist если её нет
mkdir -p dist

# Функция для создания релиза
create_release() {
    local platform=$1
    local script_name=$2
    
    echo "🔨 Создание релиза для $platform..."
    
    if npm run $script_name; then
        echo "✅ $platform релиз создан успешно!"
    else
        echo "❌ Ошибка при создании $platform релиза"
        return 1
    fi
}

# Параметры командной строки
case "${1:-all}" in
    "win"|"windows")
        create_release "Windows" "release:win"
        ;;
    "linux")
        create_release "Linux" "release:linux"
        ;;
    "mac"|"macos")
        create_release "macOS" "release:mac"
        ;;
    "all")
        echo "🌍 Создание релизов для всех платформ..."
        create_release "Windows" "release:win"
        create_release "Linux" "release:linux"
        create_release "macOS" "release:mac"
        ;;
    *)
        echo "Использование: $0 [win|linux|mac|all]"
        echo "  win/linux/mac - создать релиз для конкретной платформы"
        echo "  all (по умолчанию) - создать релизы для всех платформ"
        exit 1
        ;;
esac

echo ""
echo "🎉 Готово! Релизы находятся в папке dist/"
echo "📁 Содержимое папки dist/:"
ls -la dist/

echo ""
echo "📋 Следующие шаги:"
echo "1. Проверьте файлы в папке dist/"
echo "2. Протестируйте релизы на соответствующих платформах"
echo "3. Загрузите релизы в GitHub Releases"
echo "4. Обновите документацию"
