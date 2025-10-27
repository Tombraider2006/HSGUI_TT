#!/bin/bash

# Creality Helper Script - Complete Installation
# This script installs all necessary files on the printer

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
mkdir -p /usr/data/helper-script/files/camera-settings
mkdir -p /usr/data/helper-script/files/moonraker
mkdir -p /usr/data/helper-script/files/fluidd-logos
mkdir -p /usr/data/helper-script/files/macros
mkdir -p /usr/data/helper-script/files/services

# Copy tools script
log_info "Installing tools script..."
cp tools.sh /usr/data/helper-script/scripts/tools.sh
chmod +x /usr/data/helper-script/scripts/tools.sh

# Copy install components script
log_info "Installing install components script..."
cp install_components.sh /usr/data/helper-script/scripts/install_components.sh
chmod +x /usr/data/helper-script/scripts/install_components.sh

# Copy check firmware script
log_info "Installing check firmware script..."
cp check_firmware.sh /usr/data/helper-script/scripts/check_firmware.sh
chmod +x /usr/data/helper-script/scripts/check_firmware.sh

# Copy check installed script
log_info "Installing check installed script..."
cp check_installed.sh /usr/data/helper-script/scripts/check_installed.sh
chmod +x /usr/data/helper-script/scripts/check_installed.sh

# Copy factory reset script
log_info "Installing factory reset script..."
cp factory_reset.sh /usr/data/helper-script/scripts/factory_reset.sh
chmod +x /usr/data/helper-script/scripts/factory_reset.sh

# Copy original helper script
log_info "Installing original helper script..."
cp original_helper.sh /usr/data/helper-script/scripts/original_helper.sh
chmod +x /usr/data/helper-script/scripts/original_helper.sh

# Copy gcode fixes
log_info "Installing gcode fixes..."
if [ -f "files/fixes/gcode.py" ]; then
    cp files/fixes/gcode.py /usr/data/helper-script/files/fixes/
    log_success "Installed gcode.py"
fi
if [ -f "files/fixes/gcode_3v3.py" ]; then
    cp files/fixes/gcode_3v3.py /usr/data/helper-script/files/fixes/
    log_success "Installed gcode_3v3.py"
fi

# Copy camera settings
log_info "Installing camera settings..."
if [ -f "files/camera-settings/camera-settings.cfg" ]; then
    cp files/camera-settings/camera-settings.cfg /usr/data/helper-script/files/camera-settings/
    log_success "Installed camera-settings.cfg"
fi
if [ -f "files/camera-settings/camera-settings-nebula.cfg" ]; then
    cp files/camera-settings/camera-settings-nebula.cfg /usr/data/helper-script/files/camera-settings/
    log_success "Installed camera-settings-nebula.cfg"
fi

# Copy moonraker files
log_info "Installing moonraker files..."
if [ -f "files/moonraker/moonraker.conf" ]; then
    cp files/moonraker/moonraker.conf /usr/data/helper-script/files/moonraker/
    log_success "Installed moonraker.conf"
fi
if [ -f "files/moonraker/nginx.conf" ]; then
    cp files/moonraker/nginx.conf /usr/data/helper-script/files/moonraker/
    log_success "Installed nginx.conf"
fi

# Copy fluidd logos
log_info "Installing fluidd logos..."
if [ -d "files/fluidd-logos" ]; then
    cp -r files/fluidd-logos/* /usr/data/helper-script/files/fluidd-logos/ 2>/dev/null || true
    log_success "Installed fluidd logos"
fi

# Copy macros
log_info "Installing macros..."
if [ -d "files/macros" ]; then
    cp -r files/macros/* /usr/data/helper-script/files/macros/ 2>/dev/null || true
    log_success "Installed macros"
fi

# Copy services
log_info "Installing services..."
if [ -d "files/services" ]; then
    cp -r files/services/* /usr/data/helper-script/files/services/ 2>/dev/null || true
    log_success "Installed services"
fi

# Create symlinks for easy access
log_info "Creating symlinks..."
ln -sf /usr/data/helper-script/scripts/tools.sh /usr/bin/helper-tools

# Set permissions
log_info "Setting permissions..."
chmod +x /usr/data/helper-script/scripts/tools.sh
chmod +x /usr/bin/helper-tools
chmod -R 755 /usr/data/helper-script/files/

log_success "Complete installation finished!"
log_info "You can now use: helper-tools <command>"
log_info "Available commands: prevent_klipper_updates, allow_klipper_updates, fix_gcode_printing, enable_camera_settings, disable_camera_settings, restart_nginx, restart_moonraker, restart_klipper, update_entware, clear_cache, clear_logs, restore_firmware, factory_reset"
