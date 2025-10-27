#!/bin/bash

# Copy original files from the cloned repository to our project

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

# Check if original-script directory exists
if [ ! -d "original-script" ]; then
    log_error "original-script directory not found. Please run 'git clone https://github.com/Guilouz/Creality-Helper-Script.git original-script' first"
    exit 1
fi

# Create files directory structure
log_info "Creating files directory structure..."
mkdir -p files/fixes
mkdir -p files/camera-settings
mkdir -p files/moonraker
mkdir -p files/fluidd-logos
mkdir -p files/macros
mkdir -p files/services

# Copy gcode fixes
log_info "Copying gcode fixes..."
if [ -f "original-script/files/fixes/gcode.py" ]; then
    cp original-script/files/fixes/gcode.py files/fixes/
    log_success "Copied gcode.py"
fi
if [ -f "original-script/files/fixes/gcode_3v3.py" ]; then
    cp original-script/files/fixes/gcode_3v3.py files/fixes/
    log_success "Copied gcode_3v3.py"
fi

# Copy camera settings
log_info "Copying camera settings..."
if [ -f "original-script/files/camera-settings/camera-settings.cfg" ]; then
    cp original-script/files/camera-settings/camera-settings.cfg files/camera-settings/
    log_success "Copied camera-settings.cfg"
fi
if [ -f "original-script/files/camera-settings/camera-settings-nebula.cfg" ]; then
    cp original-script/files/camera-settings/camera-settings-nebula.cfg files/camera-settings/
    log_success "Copied camera-settings-nebula.cfg"
fi

# Copy moonraker files
log_info "Copying moonraker files..."
if [ -f "original-script/files/moonraker/moonraker.conf" ]; then
    cp original-script/files/moonraker/moonraker.conf files/moonraker/
    log_success "Copied moonraker.conf"
fi
if [ -f "original-script/files/moonraker/nginx.conf" ]; then
    cp original-script/files/moonraker/nginx.conf files/moonraker/
    log_success "Copied nginx.conf"
fi

# Copy fluidd logos
log_info "Copying fluidd logos..."
if [ -d "original-script/files/fluidd-logos" ]; then
    cp -r original-script/files/fluidd-logos/* files/fluidd-logos/ 2>/dev/null || true
    log_success "Copied fluidd logos"
fi

# Copy macros
log_info "Copying macros..."
if [ -d "original-script/files/macros" ]; then
    cp -r original-script/files/macros/* files/macros/ 2>/dev/null || true
    log_success "Copied macros"
fi

# Copy services
log_info "Copying services..."
if [ -d "original-script/files/services" ]; then
    cp -r original-script/files/services/* files/services/ 2>/dev/null || true
    log_success "Copied services"
fi

log_success "All original files copied successfully!"
log_info "Files are now available in the 'files' directory"
