#!/bin/sh

# Creality Helper Script - Main Installation Script
# Embedded in Creality Helper GUI
# Compatible with BusyBox on MIPS

# BusyBox compatible error handling
set -e

# Colors for output (simplified for BusyBox)
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
SCRIPT_DIR="/usr/data/helper-script"
LOG_FILE="$SCRIPT_DIR/install.log"
BACKUP_DIR="/usr/data/backup"

# Logging function (BusyBox compatible)
log() {
    echo "$(date) - $1" | tee -a "$LOG_FILE"
}

# Error handling
error_exit() {
    log "${RED}ERROR: $1${NC}"
    exit 1
}

# Success message
success() {
    log "${GREEN}SUCCESS: $1${NC}"
}

# Warning message
warning() {
    log "${YELLOW}WARNING: $1${NC}"
}

# Info message
info() {
    log "${BLUE}INFO: $1${NC}"
}

# Check if running as root
check_root() {
    if [ "$EUID" -ne 0 ]; then
        error_exit "This script must be run as root"
    fi
}

# Detect printer model (BusyBox compatible)
detect_model() {
    info "Detecting printer model..."
    
    DETECTED_MODEL="unknown"
    
    # Try different methods to detect model
    if [ -f "/proc/device-tree/model" ]; then
        MODEL=$(cat /proc/device-tree/model 2>/dev/null | tr 'A-Z' 'a-z')
    elif [ -f "/sys/firmware/devicetree/base/model" ]; then
        MODEL=$(cat /sys/firmware/devicetree/base/model 2>/dev/null | tr 'A-Z' 'a-z')
    else
        MODEL="unknown"
    fi
    
    # Determine specific model (BusyBox compatible)
    if echo "$MODEL" | grep "k1" >/dev/null 2>&1; then
        if echo "$MODEL" | grep "max" >/dev/null 2>&1; then
            DETECTED_MODEL="k1-max"
        elif echo "$MODEL" | grep "c" >/dev/null 2>&1; then
            DETECTED_MODEL="k1c"
        elif echo "$MODEL" | grep "se" >/dev/null 2>&1; then
            DETECTED_MODEL="k1se"
        elif echo "$MODEL" | grep "s" >/dev/null 2>&1; then
            DETECTED_MODEL="k1s"
        else
            DETECTED_MODEL="k1"
        fi
    elif echo "$MODEL" | grep "ender" >/dev/null 2>&1 && echo "$MODEL" | grep "v3" >/dev/null 2>&1; then
        if echo "$MODEL" | grep "se" >/dev/null 2>&1; then
            DETECTED_MODEL="ender3-v3-se"
        elif echo "$MODEL" | grep "ke" >/dev/null 2>&1; then
            DETECTED_MODEL="ender3-v3-ke"
        else
            DETECTED_MODEL="ender3-v3"
        fi
    fi
    
    info "Detected model: $DETECTED_MODEL"
    echo "$DETECTED_MODEL"
}

# Create backup (BusyBox compatible)
create_backup() {
    info "Creating backup..."
    
    mkdir -p "$BACKUP_DIR"
    BACKUP_FILE="$BACKUP_DIR/backup_$(date +%Y%m%d_%H%M%S).tar.gz"
    
    # Backup important directories (BusyBox tar)
    tar -czf "$BACKUP_FILE" /usr/data/klipper_config /usr/data/printer_data 2>/dev/null || true
    
    success "Backup created: $BACKUP_FILE"
}

# Install component
install_component() {
    local component="$1"
    local model="$2"
    
    info "Installing component: $component for model: $model"
    
    # Check if component script exists
    local script_path="$SCRIPT_DIR/components/$component/install.sh"
    if [ ! -f "$script_path" ]; then
        error_exit "Component script not found: $script_path"
    fi
    
    # Make script executable
    chmod +x "$script_path"
    
    # Run component installation
    if "$script_path" "$model"; then
        success "Component $component installed successfully"
    else
        error_exit "Failed to install component $component"
    fi
}

# Main installation function
main() {
    local components="$1"
    local model="$2"
    
    # Initialize
    check_root
    mkdir -p "$SCRIPT_DIR"
    
    # Detect model if not provided
    if [ -z "$model" ] || [ "$model" = "auto" ]; then
        model=$(detect_model)
    fi
    
    # Create backup
    create_backup
    
    # Install components
    if [ -n "$components" ]; then
        IFS=',' read -ra COMPONENT_ARRAY <<< "$components"
        for component in "${COMPONENT_ARRAY[@]}"; do
            install_component "$component" "$model"
        done
    fi
    
    success "Installation completed successfully"
}

# Run main function with arguments
main "$@"
