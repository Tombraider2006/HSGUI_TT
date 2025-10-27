#!/bin/bash

# Creality Helper Script - Tools Installation
# This script installs the tools functionality on the printer

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    log_error "Please run as root"
    exit 1
fi

# Create helper-script directory structure
log_info "Creating helper-script directory structure..."
mkdir -p /usr/data/helper-script/scripts
mkdir -p /usr/data/helper-script/files/fixes

# Copy tools script
log_info "Installing tools script..."
cp tools.sh /usr/data/helper-script/scripts/tools.sh
chmod +x /usr/data/helper-script/scripts/tools.sh

# Copy gcode fixes
log_info "Installing gcode fixes..."
if [ -f "../original-script/files/fixes/gcode.py" ]; then
    cp ../original-script/files/fixes/gcode.py /usr/data/helper-script/files/fixes/
fi
if [ -f "../original-script/files/fixes/gcode_3v3.py" ]; then
    cp ../original-script/files/fixes/gcode_3v3.py /usr/data/helper-script/files/fixes/
fi

# Create symlink for easy access
log_info "Creating symlink..."
ln -sf /usr/data/helper-script/scripts/tools.sh /usr/bin/helper-tools

# Set permissions
log_info "Setting permissions..."
chmod +x /usr/data/helper-script/scripts/tools.sh
chmod +x /usr/bin/helper-tools

log_success "Tools installation completed!"
log_info "You can now use: helper-tools <command>"
log_info "Available commands: prevent_klipper_updates, allow_klipper_updates, fix_gcode_printing, enable_camera_settings, disable_camera_settings, restart_nginx, restart_moonraker, restart_klipper, update_entware, clear_cache, clear_logs, restore_firmware, factory_reset"
