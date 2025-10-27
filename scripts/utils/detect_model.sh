#!/bin/sh

# Printer Model Detection Utility
# Part of Creality Helper Script
# Compatible with BusyBox on MIPS

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - Detect: $1"
}

error_exit() {
    log "${RED}ERROR: $1${NC}"
    exit 1
}

success() {
    log "${GREEN}SUCCESS: $1${NC}"
}

info() {
    log "${BLUE}INFO: $1${NC}"
}

# Detect printer model using multiple methods (BusyBox compatible)
detect_model() {
    detected_model="unknown"
    
    info "Starting model detection..."
    
    # Method 1: Check device tree
    if [ -f "/proc/device-tree/model" ]; then
        model=$(cat /proc/device-tree/model 2>/dev/null | tr 'A-Z' 'a-z')
        info "Device tree model: $model"
        
        if echo "$model" | grep "k1" >/dev/null 2>&1; then
            if echo "$model" | grep "max" >/dev/null 2>&1; then
                detected_model="k1-max"
            elif echo "$model" | grep "c" >/dev/null 2>&1; then
                detected_model="k1c"
            elif echo "$model" | grep "se" >/dev/null 2>&1; then
                detected_model="k1se"
            elif echo "$model" | grep "s" >/dev/null 2>&1; then
                detected_model="k1s"
            else
                detected_model="k1"
            fi
        elif echo "$model" | grep "ender" >/dev/null 2>&1 && echo "$model" | grep "v3" >/dev/null 2>&1; then
            if echo "$model" | grep "se" >/dev/null 2>&1; then
                detected_model="ender3-v3-se"
            elif echo "$model" | grep "ke" >/dev/null 2>&1; then
                detected_model="ender3-v3-ke"
            else
                detected_model="ender3-v3"
            fi
        fi
    fi
    
    # Method 2: Check sysfs
    if [ "$detected_model" = "unknown" ] && [ -f "/sys/firmware/devicetree/base/model" ]; then
        local model=$(cat /sys/firmware/devicetree/base/model 2>/dev/null | tr '[:upper:]' '[:lower:]')
        info "Sysfs model: $model"
        
        if echo "$model" | grep -q "k1"; then
            if echo "$model" | grep -q "max"; then
                detected_model="k1-max"
            elif echo "$model" | grep -q "c"; then
                detected_model="k1c"
            elif echo "$model" | grep -q "se"; then
                detected_model="k1se"
            elif echo "$model" | grep -q "s"; then
                detected_model="k1s"
            else
                detected_model="k1"
            fi
        elif echo "$model" | grep -q "ender.*v3"; then
            if echo "$model" | grep -q "se"; then
                detected_model="ender3-v3-se"
            elif echo "$model" | grep -q "ke"; then
                detected_model="ender3-v3-ke"
            else
                detected_model="ender3-v3"
            fi
        fi
    fi
    
    # Method 3: Check architecture
    if [ "$detected_model" = "unknown" ]; then
        local arch=$(uname -m 2>/dev/null)
        info "Architecture: $arch"
        
        # MIPS architecture is common for Creality printers
        if echo "$arch" | grep -q "mips"; then
            detected_model="k1"  # Default to K1 for MIPS
        fi
    fi
    
    # Method 4: Check OS release
    if [ "$detected_model" = "unknown" ] && [ -f "/etc/os-release" ]; then
        local os_info=$(cat /etc/os-release | grep PRETTY_NAME 2>/dev/null | tr '[:upper:]' '[:lower:]')
        info "OS info: $os_info"
        
        if echo "$os_info" | grep -q "creality"; then
            detected_model="k1"  # Default to K1 for Creality
        fi
    fi
    
    # Method 5: Check hardware features
    if [ "$detected_model" = "unknown" ]; then
        info "Checking hardware features..."
        
        # Check for specific hardware indicators
        if [ -d "/sys/class/gpio" ]; then
            # GPIO available - likely K1 series
            detected_model="k1"
        elif [ -f "/dev/ttyS0" ]; then
            # Serial port available - likely Ender-3 V3 series
            detected_model="ender3-v3"
        fi
    fi
    
    echo "$detected_model"
}

# Get model information
get_model_info() {
    local model="$1"
    
    case "$model" in
        "k1")
            echo "K1 Series - Standard model"
            ;;
        "k1-max")
            echo "K1 Max - Large format printer"
            ;;
        "k1c")
            echo "K1C - Compact model"
            ;;
        "k1s")
            echo "K1S - Special edition"
            ;;
        "k1se")
            echo "K1SE - Special edition"
            ;;
        "ender3-v3")
            echo "Ender-3 V3 - Standard model"
            ;;
        "ender3-v3-se")
            echo "Ender-3 V3 SE - Special edition"
            ;;
        "ender3-v3-ke")
            echo "Ender-3 V3 KE - Klipper edition"
            ;;
        *)
            echo "Unknown model - $model"
            ;;
    esac
}

# Main function
main() {
    local model=$(detect_model)
    local model_info=$(get_model_info "$model")
    
    success "Detected model: $model"
    info "Model info: $model_info"
    
    # Output model for use by other scripts
    echo "$model"
}

# Run main function
main "$@"
