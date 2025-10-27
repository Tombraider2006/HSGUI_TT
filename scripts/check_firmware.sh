#!/bin/bash

# Check firmware version based on original script
function check_fw_version() {
    local file="/usr/data/creality/userdata/config/system_version.json"
    if [ -e "$file" ]; then
        cat "$file" | jq -r '.sys_version'
    else
        echo "N/A"
    fi
}

# Check Klipper version
function check_klipper_version() {
    if systemctl is-active --quiet klipper; then
        # Try to get version from klipper log or process
        local version=$(ps aux | grep klipper | grep -o 'version=[0-9.]*' | head -1 | cut -d'=' -f2)
        if [ -n "$version" ]; then
            echo "$version"
        else
            echo "Unknown"
        fi
    else
        echo "Not running"
    fi
}

# Check Moonraker version
function check_moonraker_version() {
    if systemctl is-active --quiet moonraker; then
        # Try to get version from moonraker log or process
        local version=$(ps aux | grep moonraker | grep -o 'version=[0-9.]*' | head -1 | cut -d'=' -f2)
        if [ -n "$version" ]; then
            echo "$version"
        else
            echo "Unknown"
        fi
    else
        echo "Not running"
    fi
}

# Main function
case "$1" in
    "firmware")
        check_fw_version
        ;;
    "klipper")
        check_klipper_version
        ;;
    "moonraker")
        check_moonraker_version
        ;;
    "all")
        echo "Firmware: $(check_fw_version)"
        echo "Klipper: $(check_klipper_version)"
        echo "Moonraker: $(check_moonraker_version)"
        ;;
    *)
        echo "Usage: $0 {firmware|klipper|moonraker|all}"
        exit 1
        ;;
esac
