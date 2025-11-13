#!/bin/sh

# Simple script to upload a single script to printer
# This can be used as an alternative to the desktop app upload
# Compatible with BusyBox and POSIX sh (like original Creality Helper Script)

set -e

SCRIPT_NAME="$1"
SOURCE="$2"        # can be inline content, base64, URL (http/https), or auto[:port[:path]]
TARGET_PATH="$3"

if [ -z "$SCRIPT_NAME" ] || [ -z "$SOURCE" ] || [ -z "$TARGET_PATH" ]; then
    echo "Usage: $0 <script_name> <script_content_or_url_or_auto> <target_path>"
    exit 1
fi

# Validate target path (prevent directory traversal and dangerous paths)
case "$TARGET_PATH" in
    /*) ;;
    *) echo "Error: TARGET_PATH must be an absolute path" >&2; exit 1 ;;
esac

# Ensure target directory exists (best-effort)
TARGET_DIR="$(dirname "$TARGET_PATH")"
mkdir -p "$TARGET_DIR" >/dev/null 2>&1 || true

# Auto-detect client IP (desktop app) via SSH env and construct URL
# SOURCE can be: auto | auto:PORT | auto:PORT:PATHPREFIX
case "$SOURCE" in
    auto|auto:*)
        # Extract client IP - POSIX compatible method using parameter expansion
        CLIENT_IP=""
        if [ -n "$SSH_CLIENT" ]; then
            # SSH_CLIENT="<ip> <client_port> <server_port>"
            # Extract first field using parameter expansion (POSIX compatible)
            CLIENT_IP="${SSH_CLIENT%% *}"
        elif [ -n "$SSH_CONNECTION" ]; then
            # SSH_CONNECTION="<client_ip> <client_port> <server_ip> <server_port>"
            # Extract first field using parameter expansion (POSIX compatible)
            CLIENT_IP="${SSH_CONNECTION%% *}"
        fi
        if [ -z "$CLIENT_IP" ]; then
            echo "Could not auto-detect client IP (no SSH_CLIENT/SSH_CONNECTION)." >&2
        else
            # Parse port and optional path prefix
            AUTO_SPEC=${SOURCE#auto}
            AUTO_SPEC=${AUTO_SPEC#:}
            AUTO_PORT="8080"
            AUTO_PATH=""
            if [ -n "$AUTO_SPEC" ]; then
                # Split by first ':' into port and path
                case "$AUTO_SPEC" in
                    *:*) AUTO_PORT="${AUTO_SPEC%%:*}"; AUTO_PATH="${AUTO_SPEC#*:}" ;;
                    *) AUTO_PORT="$AUTO_SPEC" ;;
                esac
            fi
            # Ensure no leading slash duplication
            [ -n "$AUTO_PATH" ] && AUTO_PATH="/${AUTO_PATH##/}"
            SOURCE="http://$CLIENT_IP:${AUTO_PORT}${AUTO_PATH}/${SCRIPT_NAME}"
            echo "Auto-detected source URL: $SOURCE"
        fi
    ;;
esac

# Method 0: Try wget (no SSL verification for https; plain http preferred)
case "$SOURCE" in
    http://*|https://*)
        echo "Trying wget method (no SSL verify for https)..."
        if command -v wget >/dev/null 2>&1; then
            # Fix: Properly escape arguments for wget
            case "$SOURCE" in
                https://*)
                    set +e  # Temporarily disable set -e for wget
                    wget --no-check-certificate -O "$TARGET_PATH" "$SOURCE" >/dev/null 2>&1
                    WGET_RESULT=$?
                    set -e  # Re-enable set -e
                    ;;
                *)
                    set +e  # Temporarily disable set -e for wget
                    wget -O "$TARGET_PATH" "$SOURCE" >/dev/null 2>&1
                    WGET_RESULT=$?
                    set -e  # Re-enable set -e
                    ;;
            esac
            if [ $WGET_RESULT -eq 0 ] && [ -f "$TARGET_PATH" ]; then
                echo "Wget method successful"
                chmod +x "$TARGET_PATH" >/dev/null 2>&1 || true
                exit 0
            else
                echo "Wget method failed"
            fi
        else
            echo "wget not found, skipping wget method"
        fi
    ;;
esac

# Method 1: Try printf (inline content) - safer than heredoc for remote execution
# Compatible with original script style (uses echo for file writing)
echo "Trying printf method (inline content)..."
set +e  # Temporarily disable set -e
printf '%s' "$SOURCE" > "$TARGET_PATH" 2>/dev/null
PRINTF_RESULT=$?
set -e  # Re-enable set -e
if [ $PRINTF_RESULT -eq 0 ] && [ -f "$TARGET_PATH" ] && [ -s "$TARGET_PATH" ]; then
    echo "Printf method successful"
    chmod +x "$TARGET_PATH" >/dev/null 2>&1 || true
    exit 0
fi

# Method 2: Try base64 (treat SOURCE as base64-encoded content)
echo "Trying base64 method..."
if command -v base64 >/dev/null 2>&1; then
    # Try both -d (GNU) and -D (BusyBox) options
    set +e  # Temporarily disable set -e
    echo "$SOURCE" | base64 -d > "$TARGET_PATH" 2>/dev/null
    BASE64_RESULT=$?
    set -e  # Re-enable set -e
    if [ $BASE64_RESULT -eq 0 ] && [ -f "$TARGET_PATH" ] && [ -s "$TARGET_PATH" ]; then
        echo "Base64 method successful"
        chmod +x "$TARGET_PATH" >/dev/null 2>&1 || true
        exit 0
    fi
    # Try BusyBox variant
    set +e  # Temporarily disable set -e
    echo "$SOURCE" | base64 -D > "$TARGET_PATH" 2>/dev/null
    BASE64_RESULT=$?
    set -e  # Re-enable set -e
    if [ $BASE64_RESULT -eq 0 ] && [ -f "$TARGET_PATH" ] && [ -s "$TARGET_PATH" ]; then
        echo "Base64 method successful"
        chmod +x "$TARGET_PATH" >/dev/null 2>&1 || true
        exit 0
    fi
    echo "Base64 decode failed"
else
    echo "base64 not found, skipping base64 method"
fi

# Method 3: Try echo as last resort (compatible with original script style)
# Original script uses echo for file writing (see git-backup.sh line 227)
echo "Trying echo method (last resort)..."
set +e  # Temporarily disable set -e
echo "$SOURCE" > "$TARGET_PATH" 2>/dev/null
ECHO_RESULT=$?
set -e  # Re-enable set -e
if [ $ECHO_RESULT -eq 0 ] && [ -f "$TARGET_PATH" ] && [ -s "$TARGET_PATH" ]; then
    echo "Echo method successful"
    chmod +x "$TARGET_PATH" >/dev/null 2>&1 || true
    exit 0
fi

echo "All methods failed" >&2
exit 1
