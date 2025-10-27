#!/usr/bin/env node

/**
 * Скрипт для автоматического увеличения версии
 * Увеличивает patch версию на 0.01 при каждом коммите
 */

const fs = require('fs');
const path = require('path');

const packageJsonPath = path.join(__dirname, '..', 'package.json');

try {
    // Читаем package.json
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Парсим текущую версию
    const versionParts = packageJson.version.split('.');
    const major = parseInt(versionParts[0]) || 0;
    const minor = parseInt(versionParts[1]) || 0;
    const patch = parseFloat(versionParts[2]) || 0;
    
    // Увеличиваем patch версию на 0.01
    const newPatch = (patch + 0.01).toFixed(2);
    const newVersion = `${major}.${minor}.${newPatch}`;
    
    // Обновляем версию
    packageJson.version = newVersion;
    
    // Записываем обратно в package.json
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
    
    console.log(`✅ Версия увеличена: ${packageJson.version}`);
    
    // Добавляем package.json в staging area для коммита
    const { execSync } = require('child_process');
    try {
        execSync('git add package.json', { stdio: 'inherit' });
        console.log('📝 package.json добавлен в staging area');
    } catch (error) {
        console.log('⚠️ Не удалось добавить package.json в staging area (возможно, не Git репозиторий)');
    }
    
} catch (error) {
    console.error('❌ Ошибка при увеличении версии:', error.message);
    process.exit(1);
}
