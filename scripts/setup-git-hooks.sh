#!/bin/bash

# Скрипт для настройки Git hooks

echo "🔧 Настройка Git hooks для автоматического увеличения версии..."

# Проверяем, что мы в Git репозитории
if [ ! -d ".git" ]; then
    echo "❌ Ошибка: Не найден .git каталог. Запустите скрипт из корня Git репозитория."
    exit 1
fi

# Создаем папку hooks если её нет
mkdir -p .git/hooks

# Определяем операционную систему
if [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
    # Windows
    echo "🪟 Настройка для Windows..."
    cp .git/hooks/pre-commit.bat .git/hooks/pre-commit
elif [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    echo "🍎 Настройка для macOS..."
    cp .git/hooks/pre-commit .git/hooks/pre-commit
    chmod +x .git/hooks/pre-commit
else
    # Linux
    echo "🐧 Настройка для Linux..."
    cp .git/hooks/pre-commit .git/hooks/pre-commit
    chmod +x .git/hooks/pre-commit
fi

echo "✅ Git hooks настроены!"
echo "📝 Теперь при каждом коммите версия будет автоматически увеличиваться на 0.01"
echo ""
echo "Пример:"
echo "  v0.1.0-alpha → v0.1.01-alpha"
echo "  v0.1.01-alpha → v0.1.02-alpha"
echo "  v0.1.02-alpha → v0.1.03-alpha"
