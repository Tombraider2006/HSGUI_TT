#!/bin/sh

# Creality Helper Script - Component Installation
# Based on original Creality-Helper-Script by Guilouz
# Handles model-specific installation logic

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Paths (BusyBox compatible)
INITD_FOLDER="/etc/init.d"
KLIPPER_KLIPPY_FOLDER="/usr/data/printer_data/klippy"
MOONRAKER_CFG="/usr/data/printer_data/moonraker/moonraker.conf"
MOONRAKER_FOLDER="/usr/data/printer_data/moonraker"
NGINX_FOLDER="/usr/data/nginx"
ENTWARE_FILE="/opt/bin/opkg"
USR_DATA="/usr/data"
PRINTER_DATA_FOLDER="/usr/data/printer_data"
FLUIDD_FOLDER="/usr/data/fluidd"
MAINSAIL_FOLDER="/usr/data/mainsail"
KAMP_FOLDER="/usr/data/kamp"
IMP_SHAPERS_FOLDER="/usr/data/improved-shapers"
GUPPYFLO_FOLDER="/usr/data/guppyflo"
OCTOEVERYWHERE_FOLDER="/usr/data/octoeverywhere"
MOONRAKER_OBICO_FOLDER="/usr/data/moonraker-obico"
MOBILERAKER_COMPANION_FOLDER="/usr/data/mobileraker-companion"
OCTOAPP_COMPANION_FOLDER="/usr/data/octoapp-companion"

# File paths
KLIPPER_SHELL_FILE="/usr/data/printer_data/klippy/gcode_shell_command.py"
BUZZER_FILE="/usr/data/printer_data/klippy/buzzer-support.cfg"
FAN_CONTROLS_FILE="/usr/data/printer_data/klippy/fans-control.cfg"
USEFUL_MACROS_FILE="/usr/data/printer_data/klippy/useful-macros.cfg"
SAVE_ZOFFSET_FILE="/usr/data/printer_data/klippy/save-zoffset.cfg"
SCREWS_ADJUST_FILE="/usr/data/printer_data/klippy/screws-tilt-adjust.cfg"
M600_SUPPORT_FILE="/usr/data/printer_data/klippy/M600-support.cfg"
GIT_BACKUP_FILE="/usr/data/printer_data/klippy/git-backup.cfg"
TIMELAPSE_FILE="/usr/data/printer_data/klippy/timelapse.cfg"
CAMERA_SETTINGS_FILE="/usr/data/printer_data/klippy/camera-settings.cfg"
USB_CAMERA_FILE="/usr/data/printer_data/klippy/usb-camera.cfg"
NOZZLE_CLEANING_FOLDER="/usr/data/nozzle-cleaning-fan-control"
CREALITY_WEB_FILE="/usr/data/creality_web_interface"

# Helper functions
ok_msg() {
    echo "✓ $1"
}

error_msg() {
    echo "✗ $1"
    exit 1
}

info_msg() {
    echo "ℹ $1"
}

# Get printer model
get_printer_model() {
    local model
    model=$(/usr/bin/get_sn_mac.sh model 2>&1)
    if echo "$model" | grep -iq "K1"; then
        echo "K1"
    elif echo "$model" | grep -iq "F001\|F002"; then
        echo "3V3"
    elif echo "$model" | grep -iq "F005"; then
        echo "3KE"
    elif echo "$model" | grep -iq "F003"; then
        echo "10SE"
    elif echo "$model" | grep -iq "F004"; then
        echo "E5M"
    else
        echo "Unknown"
    fi
}

# Check if component is installed
is_installed() {
    local component="$1"
    local model="$2"
    
    case "$component" in
        "moonraker-nginx")
            if [ "$model" = "3V3" ]; then
                [ -d "$MOONRAKER_FOLDER" ]
            else
                [ -d "$MOONRAKER_FOLDER" ] && [ -d "$NGINX_FOLDER" ]
            fi
            ;;
        "fluidd")
            [ -d "$FLUIDD_FOLDER" ]
            ;;
        "mainsail")
            [ -d "$MAINSAIL_FOLDER" ]
            ;;
        "entware")
            [ -f "$ENTWARE_FILE" ]
            ;;
        "gcode-shell-command")
            [ -f "$KLIPPER_SHELL_FILE" ]
            ;;
        "kamp")
            [ -d "$KAMP_FOLDER" ]
            ;;
        "buzzer")
            [ -f "$BUZZER_FILE" ]
            ;;
        "nozzle-cleaning")
            [ -d "$NOZZLE_CLEANING_FOLDER" ]
            ;;
        "fans-control")
            [ -f "$FAN_CONTROLS_FILE" ]
            ;;
        "improved-shapers")
            [ -d "$IMP_SHAPERS_FOLDER" ]
            ;;
        "useful-macros")
            [ -f "$USEFUL_MACROS_FILE" ]
            ;;
        "save-zoffset")
            [ -f "$SAVE_ZOFFSET_FILE" ]
            ;;
        "screws-tilt-adjust")
            [ -f "$SCREWS_ADJUST_FILE" ]
            ;;
        "m600-support")
            [ -f "$M600_SUPPORT_FILE" ]
            ;;
        "git-backup")
            [ -f "$GIT_BACKUP_FILE" ]
            ;;
        "moonraker-timelapse")
            [ -f "$TIMELAPSE_FILE" ]
            ;;
        "camera-settings")
            [ -f "$CAMERA_SETTINGS_FILE" ]
            ;;
        "usb-camera")
            [ -f "$USB_CAMERA_FILE" ]
            ;;
        "octoeverywhere")
            [ -d "$OCTOEVERYWHERE_FOLDER" ]
            ;;
        "moonraker-obico")
            [ -d "$MOONRAKER_OBICO_FOLDER" ]
            ;;
        "guppyflo")
            [ -d "$GUPPYFLO_FOLDER" ]
            ;;
        "mobileraker")
            [ -d "$MOBILERAKER_COMPANION_FOLDER" ]
            ;;
        "octoapp")
            [ -d "$OCTOAPP_COMPANION_FOLDER" ]
            ;;
        "simplyprint")
            grep -q "\[simplyprint\]" "$MOONRAKER_CFG" 2>/dev/null
            ;;
        *)
            false
            ;;
    esac
}

# Check dependencies
check_dependencies() {
    local component="$1"
    local model="$2"
    
    case "$component" in
        "fluidd"|"mainsail")
            if [ "$model" = "3V3" ]; then
                [ -d "$MOONRAKER_FOLDER" ] || error_msg "Updated Moonraker is needed, please install it first!"
            else
                ([ -d "$MOONRAKER_FOLDER" ] && [ -d "$NGINX_FOLDER" ]) || error_msg "Moonraker and Nginx are needed, please install them first!"
            fi
            ;;
        "buzzer"|"improved-shapers"|"useful-macros"|"git-backup"|"camera-settings")
            [ -f "$KLIPPER_SHELL_FILE" ] || error_msg "Klipper Gcode Shell Command is needed, please install it first!"
            ;;
        "git-backup"|"moonraker-timelapse"|"usb-camera"|"octoeverywhere"|"moonraker-obico"|"mobileraker"|"octoapp")
            [ -f "$ENTWARE_FILE" ] || error_msg "Entware is needed, please install it first!"
            ;;
        "octoeverywhere"|"moonraker-obico"|"mobileraker"|"octoapp"|"simplyprint")
            if [ "$model" = "3V3" ]; then
                [ -d "$MOONRAKER_FOLDER" ] || error_msg "Updated Moonraker is needed, please install it first!"
            else
                [ -d "$MOONRAKER_FOLDER" ] || error_msg "Moonraker and Nginx are needed, please install them first!"
            fi
            ;;
        "octoeverywhere"|"moonraker-obico"|"mobileraker"|"octoapp")
            ([ -d "$FLUIDD_FOLDER" ] || [ -d "$MAINSAIL_FOLDER" ]) || error_msg "Fluidd or Mainsail is needed, please install one of them first!"
            ;;
    esac
}

# Install component
install_component() {
    local component="$1"
    local model="$2"
    
    info_msg "Installing $component for model $model..."
    
    # Check if already installed
    if is_installed "$component" "$model"; then
        error_msg "$component is already installed!"
    fi
    
    # Check dependencies
    check_dependencies "$component" "$model"
    
    # Model-specific installation
    case "$component" in
        "moonraker-nginx")
            if [ "$model" = "3V3" ]; then
                install_moonraker_3v3
            else
                install_moonraker_nginx
            fi
            ;;
        "fluidd")
            if [ "$model" = "3V3" ]; then
                install_fluidd_3v3
            else
                install_fluidd
            fi
            ;;
        "mainsail")
            install_mainsail
            ;;
        "entware")
            install_entware
            ;;
        "gcode-shell-command")
            install_gcode_shell_command
            ;;
        "kamp")
            install_kamp
            ;;
        "buzzer")
            install_buzzer_support
            ;;
        "nozzle-cleaning")
            install_nozzle_cleaning_fan_control
            ;;
        "fans-control")
            install_fans_control_macros
            ;;
        "improved-shapers")
            install_improved_shapers
            ;;
        "useful-macros")
            install_useful_macros
            ;;
        "save-zoffset")
            install_save_zoffset_macros
            ;;
        "screws-tilt-adjust")
            install_screws_tilt_adjust
            ;;
        "m600-support")
            install_m600_support
            ;;
        "git-backup")
            install_git_backup
            ;;
        "moonraker-timelapse")
            install_moonraker_timelapse
            ;;
        "camera-settings")
            install_camera_settings_control
            ;;
        "usb-camera")
            install_usb_camera
            ;;
        "octoeverywhere")
            install_octoeverywhere
            ;;
        "moonraker-obico")
            install_moonraker_obico
            ;;
        "guppyflo")
            install_guppyflo
            ;;
        "mobileraker")
            install_mobileraker_companion
            ;;
        "octoapp")
            install_octoapp_companion
            ;;
        "simplyprint")
            install_simplyprint
            ;;
        *)
            error_msg "Unknown component: $component"
            ;;
    esac
    
    ok_msg "$component installed successfully!"
}

# Remove component
remove_component() {
    local component="$1"
    local model="$2"
    
    info_msg "Removing $component for model $model..."
    
    # Check if installed
    if ! is_installed "$component" "$model"; then
        error_msg "$component is not installed!"
    fi
    
    # Check dependencies for removal
    case "$component" in
        "entware")
            if [ -f "$TIMELAPSE_FILE" ] || [ -f "$GIT_BACKUP_FILE" ] || [ -d "$OCTOEVERYWHERE_FOLDER" ] || [ -d "$MOONRAKER_OBICO_FOLDER" ] || [ -f "$USB_CAMERA_FILE" ]; then
                error_msg "Entware is needed by other components, please uninstall them first!"
            fi
            ;;
        "gcode-shell-command")
            if [ -f "$BUZZER_FILE" ] || [ -f "$CAMERA_SETTINGS_FILE" ] || [ -d "$IMP_SHAPERS_FOLDER" ] || [ -f "$GIT_BACKUP_FILE" ] || [ -f "$USEFUL_MACROS_FILE" ]; then
                error_msg "Klipper Gcode Shell Command is needed by other components, please uninstall them first!"
            fi
            ;;
        "moonraker-nginx")
            if [ -d "$GUPPYFLO_FOLDER" ]; then
                error_msg "Moonraker is needed by GuppyFLO, please uninstall it first!"
            fi
            ;;
        "fluidd"|"mainsail")
            if [ ! -f "$CREALITY_WEB_FILE" ] && ([ -d "$FLUIDD_FOLDER" ] || [ -d "$MAINSAIL_FOLDER" ]); then
                error_msg "Creality Web Interface is removed! Please restore it first if you want to remove $component."
            fi
            ;;
    esac
    
    # Model-specific removal
    case "$component" in
        "moonraker-nginx")
            if [ "$model" = "3V3" ]; then
                remove_moonraker_3v3
            else
                remove_moonraker_nginx
            fi
            ;;
        "fluidd")
            if [ "$model" = "3V3" ]; then
                remove_fluidd_3v3
            else
                remove_fluidd
            fi
            ;;
        "mainsail")
            remove_mainsail
            ;;
        "entware")
            remove_entware
            ;;
        "gcode-shell-command")
            remove_gcode_shell_command
            ;;
        "kamp")
            remove_kamp
            ;;
        "buzzer")
            remove_buzzer_support
            ;;
        "nozzle-cleaning")
            remove_nozzle_cleaning_fan_control
            ;;
        "fans-control")
            remove_fans_control_macros
            ;;
        "improved-shapers")
            remove_improved_shapers
            ;;
        "useful-macros")
            remove_useful_macros
            ;;
        "save-zoffset")
            remove_save_zoffset_macros
            ;;
        "screws-tilt-adjust")
            remove_screws_tilt_adjust
            ;;
        "m600-support")
            remove_m600_support
            ;;
        "git-backup")
            remove_git_backup
            ;;
        "moonraker-timelapse")
            remove_moonraker_timelapse
            ;;
        "camera-settings")
            remove_camera_settings_control
            ;;
        "usb-camera")
            remove_usb_camera
            ;;
        "octoeverywhere")
            remove_octoeverywhere
            ;;
        "moonraker-obico")
            remove_moonraker_obico
            ;;
        "guppyflo")
            remove_guppyflo
            ;;
        "mobileraker")
            remove_mobileraker_companion
            ;;
        "octoapp")
            remove_octoapp_companion
            ;;
        "simplyprint")
            remove_simplyprint
            ;;
        *)
            error_msg "Unknown component: $component"
            ;;
    esac
    
    ok_msg "$component removed successfully!"
}

# Placeholder functions (to be implemented based on original scripts)
install_moonraker_nginx() {
    info_msg "Installing Moonraker and Nginx (K1/3KE/10SE/E5M)..."
    # Implementation based on original install_moonraker_nginx function
}

install_moonraker_3v3() {
    info_msg "Installing Updated Moonraker (3V3)..."
    # Implementation based on original install_moonraker_3v3 function
}

install_fluidd() {
    info_msg "Installing Fluidd (K1/3KE/10SE/E5M)..."
    # Implementation based on original install_fluidd function
}

install_fluidd_3v3() {
    info_msg "Installing Updated Fluidd (3V3)..."
    # Implementation based on original install_fluidd_3v3 function
}

# ... (other placeholder functions)

# Main execution
case "$1" in
    "install")
        local model=$(get_printer_model)
        install_component "$2" "$model"
        ;;
    "remove")
        local model=$(get_printer_model)
        remove_component "$2" "$model"
        ;;
    "check")
        local model=$(get_printer_model)
        if is_installed "$2" "$model"; then
            echo "installed"
        else
            echo "not_installed"
        fi
        ;;
    *)
        echo "Usage: $0 {install|remove|check} <component>"
        echo "Available components: moonraker-nginx, fluidd, mainsail, entware, gcode-shell-command, kamp, buzzer, nozzle-cleaning, fans-control, improved-shapers, useful-macros, save-zoffset, screws-tilt-adjust, m600-support, git-backup, moonraker-timelapse, camera-settings, usb-camera, octoeverywhere, moonraker-obico, guppyflo, mobileraker, octoapp, simplyprint"
        exit 1
        ;;
esac
