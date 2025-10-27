#!/bin/bash

# HSGUI GitHub Release Script
# Скрипт для создания релизов через GitHub CLI

set -e

echo "🚀 HSGUI GitHub Release Script"
echo "==============================="

# Проверяем, что мы в правильной директории
if [ ! -f "package.json" ]; then
    echo "❌ Ошибка: package.json не найден. Запустите скрипт из корня проекта."
    exit 1
fi

# Проверяем наличие GitHub CLI
if ! command -v gh &> /dev/null; then
    echo "❌ Ошибка: GitHub CLI не установлен."
    echo "Установите GitHub CLI: https://cli.github.com/"
    exit 1
fi

# Проверяем авторизацию в GitHub
if ! gh auth status &> /dev/null; then
    echo "❌ Ошибка: Не авторизованы в GitHub CLI."
    echo "Выполните: gh auth login"
    exit 1
fi

# Получаем версию из package.json
VERSION=$(node -p "require('./package.json').version")
TAG="v$VERSION"

echo "📦 Версия: $VERSION"
echo "🏷️ Тег: $TAG"

# Проверяем, существует ли тег
if git tag -l | grep -q "^$TAG$"; then
    echo "⚠️ Тег $TAG уже существует!"
    read -p "Продолжить? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Создаем релизы для всех платформ
echo "🔨 Создание релизов для всех платформ..."

# Создаем папку dist если её нет
mkdir -p dist

# Создаем релизы
echo "📦 Сборка Windows..."
npm run dist:win

echo "📦 Сборка Linux..."
npm run dist:linux

echo "📦 Сборка macOS..."
npm run dist:mac

echo "✅ Все релизы созданы!"

# Создаем коммит и тег
echo "📝 Создание коммита и тега..."

# Добавляем все изменения
git add .

# Создаем коммит
git commit -m "Release $TAG" || echo "Нет изменений для коммита"

# Создаем тег
git tag -a "$TAG" -m "Release $TAG"

# Отправляем тег
echo "📤 Отправка тега в GitHub..."
git push origin "$TAG"

echo "🎉 Тег $TAG отправлен в GitHub!"
echo "🔄 GitHub Actions автоматически создаст релиз с артефактами."

echo ""
echo "📋 Следующие шаги:"
echo "1. Дождитесь завершения GitHub Actions workflow"
echo "2. Проверьте релиз на GitHub: https://github.com/$(gh repo view --json owner,name -q '.owner.login + "/" + .name)/releases"
echo "3. Протестируйте релизы на соответствующих платформах"
