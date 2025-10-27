#!/bin/bash

# Simple script to upload a single script to printer
# This can be used as an alternative to the desktop app upload

SCRIPT_NAME="$1"
SCRIPT_CONTENT="$2"
TARGET_PATH="$3"

if [ -z "$SCRIPT_NAME" ] || [ -z "$SCRIPT_CONTENT" ] || [ -z "$TARGET_PATH" ]; then
    echo "Usage: $0 <script_name> <script_content> <target_path>"
    exit 1
fi

# Method 1: Try heredoc
echo "Trying heredoc method..."
cat > "$TARGET_PATH" << 'EOF'
$SCRIPT_CONTENT
EOF

if [ $? -eq 0 ]; then
    echo "Heredoc method successful"
    chmod +x "$TARGET_PATH"
    exit 0
fi

# Method 2: Try base64
echo "Trying base64 method..."
echo "$SCRIPT_CONTENT" | base64 -d > "$TARGET_PATH"

if [ $? -eq 0 ]; then
    echo "Base64 method successful"
    chmod +x "$TARGET_PATH"
    exit 0
fi

# Method 3: Try echo with proper escaping
echo "Trying echo method..."
echo "$SCRIPT_CONTENT" > "$TARGET_PATH"

if [ $? -eq 0 ]; then
    echo "Echo method successful"
    chmod +x "$TARGET_PATH"
    exit 0
fi

echo "All methods failed"
exit 1
