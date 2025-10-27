# PowerShell script to create .icns file for macOS
# This is a simplified version - for production use proper icon tools

param(
    [string]$SourceIcon = "assets/icon.png",
    [string]$OutputFile = "assets/icon.icns"
)

Write-Host "🎨 Создание иконки для macOS..." -ForegroundColor Green

# Check if source icon exists
if (-not (Test-Path $SourceIcon)) {
    Write-Host "❌ Исходная иконка не найдена: $SourceIcon" -ForegroundColor Red
    exit 1
}

# Create iconset directory
$iconsetDir = "icon.iconset"
if (Test-Path $iconsetDir) {
    Remove-Item -Recurse -Force $iconsetDir
}
New-Item -ItemType Directory -Path $iconsetDir | Out-Null

Write-Host "📁 Создание папки icon.iconset..." -ForegroundColor Yellow

# For now, we'll just copy the same icon to all sizes
# In production, you would resize the icon to proper dimensions
$sizes = @(
    "16x16", "16x16@2x", "32x32", "32x32@2x", 
    "128x128", "128x128@2x", "256x256", "256x256@2x", 
    "512x512", "512x512@2x"
)

foreach ($size in $sizes) {
    $targetFile = "$iconsetDir/icon_$size.png"
    Copy-Item $SourceIcon $targetFile
    Write-Host "✅ Создан icon_$size.png" -ForegroundColor Green
}

Write-Host "🔧 Создание .icns файла..." -ForegroundColor Yellow

# For Windows, we'll create a simple .icns file
# In production, you would use iconutil on macOS or other tools
$icnsContent = @"
# This is a placeholder .icns file
# For production, use proper icon creation tools
# The actual .icns file should be created on macOS using:
# iconutil -c icns icon.iconset
"@

# Copy the largest icon as a temporary solution
Copy-Item "$iconsetDir/icon_512x512@2x.png" $OutputFile

Write-Host "✅ Иконка создана: $OutputFile" -ForegroundColor Green
Write-Host "ℹ️ Для production используйте proper icon tools на macOS" -ForegroundColor Blue

# Clean up
Remove-Item -Recurse -Force $iconsetDir
