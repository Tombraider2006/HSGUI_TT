#!/bin/bash

# Creality Helper Script - Factory Reset
# Standalone script for factory reset without loading all helper scripts
# Uses official Creality factory reset script

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

# Factory Reset Function
factory_reset() {
    log_warning "====================================="
    log_warning "FACTORY RESET WARNING"
    log_warning "====================================="
    log_warning "This will reset the printer to factory settings!"
    log_warning "All installed components will be removed."
    log_warning "All custom configurations will be lost."
    log_warning "The printer will restart after reset."
    log_warning "====================================="
    
    # Check if wget is available
    if ! command -v wget >/dev/null 2>&1; then
        log_error "wget is not available on this system!"
        exit 1
    fi
    
    # Download the official factory reset script
    log_info "Downloading official factory reset script..."
    wget --no-check-certificate https://raw.githubusercontent.com/pellcorp/creality/main/k1/services/S58factoryreset -O /tmp/S58factoryreset
    
    if [ $? -eq 0 ]; then
        log_success "Factory reset script downloaded successfully!"
        
        # Make it executable
        chmod +x /tmp/S58factoryreset
        
        # Run the factory reset
        log_info "Running factory reset..."
        log_warning "The printer will restart after this operation!"
        /tmp/S58factoryreset reset
        
        if [ $? -eq 0 ]; then
            log_success "Factory reset completed successfully!"
            log_info "The printer should restart automatically."
        else
            log_error "Factory reset failed!"
            exit 1
        fi
    else
        log_error "Failed to download factory reset script!"
        log_error "Please check your internet connection and try again."
        exit 1
    fi
}

# Main execution
case "$1" in
    "reset")
        factory_reset
        ;;
    *)
        echo "Usage: $0 {reset}"
        echo ""
        echo "Commands:"
        echo "  reset    - Reset printer to factory settings"
        echo ""
        echo "WARNING: Factory reset will remove all installed components!"
        exit 1
        ;;
esac
