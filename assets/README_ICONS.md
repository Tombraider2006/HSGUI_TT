# Иконки для HSGUI

## Требуемые форматы:
- `icon.png` - для Linux (1024x1024)
- `icon.ico` - для Windows (256x256)
- `icon.icns` - для macOS (1024x1024)

## Создание иконок:

### Windows (.ico):
```bash
# Используйте онлайн конвертер или ImageMagick
magick icon.png -resize 256x256 icon.ico
```

### macOS (.icns):
```bash
# Создайте папку icon.iconset
mkdir icon.iconset

# Создайте разные размеры
sips -z 16 16     icon.png --out icon.iconset/icon_16x16.png
sips -z 32 32     icon.png --out icon.iconset/icon_16x16@2x.png
sips -z 32 32     icon.png --out icon.iconset/icon_32x32.png
sips -z 64 64     icon.png --out icon.iconset/icon_32x32@2x.png
sips -z 128 128   icon.png --out icon.iconset/icon_128x128.png
sips -z 256 256   icon.png --out icon.iconset/icon_128x128@2x.png
sips -z 256 256   icon.png --out icon.iconset/icon_256x256.png
sips -z 512 512   icon.png --out icon.iconset/icon_256x256@2x.png
sips -z 512 512   icon.png --out icon.iconset/icon_512x512.png
sips -z 1024 1024 icon.png --out icon.iconset/icon_512x512@2x.png

# Создайте .icns файл
iconutil -c icns icon.iconset
```

## Текущее состояние:
- ✅ **Windows**: `icon.png` (автоматически конвертируется в .ico)
- ✅ **Linux**: `icon.png` 
- ✅ **macOS**: `icon.icns` (создан из PNG)

## Создание правильной иконки для macOS:

Для production рекомендуется создать правильную иконку:

```bash
# На macOS
mkdir icon.iconset
sips -z 16 16     icon.png --out icon.iconset/icon_16x16.png
sips -z 32 32     icon.png --out icon.iconset/icon_16x16@2x.png
sips -z 32 32     icon.png --out icon.iconset/icon_32x32.png
sips -z 64 64     icon.png --out icon.iconset/icon_32x32@2x.png
sips -z 128 128   icon.png --out icon.iconset/icon_128x128.png
sips -z 256 256   icon.png --out icon.iconset/icon_128x128@2x.png
sips -z 256 256   icon.png --out icon.iconset/icon_256x256.png
sips -z 512 512   icon.png --out icon.iconset/icon_256x256@2x.png
sips -z 512 512   icon.png --out icon.iconset/icon_512x512.png
sips -z 1024 1024 icon.png --out icon.iconset/icon_512x512@2x.png
iconutil -c icns icon.iconset
```
