#!/bin/bash

# Creality Helper Script - Installation on Printer
# This script runs on the printer to set up the helper scripts

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

# Set permissions
log_info "Setting permissions..."
chmod -R 755 /usr/data/helper-script/files/

log_success "Helper script directory structure created!"
log_info "Ready to receive scripts from desktop application"
