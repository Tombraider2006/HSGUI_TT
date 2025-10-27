#!/bin/bash

# Check installed components based on original script logic
# This script checks if components are installed and returns JSON format

# Define paths (based on original script)
MOONRAKER_FOLDER="/usr/data/moonraker"
FLUIDD_FOLDER="/usr/share/nginx/html/fluidd"
MAINSAIL_FOLDER="/usr/share/nginx/html/mainsail"
ENTWARE_FILE="/opt/bin/opkg"
KLIPPER_SHELL_FILE="/usr/data/printer_data/config/gcode_shell_command.py"
KAMP_FOLDER="/usr/data/printer_data/config/KAMP"
BUZZER_FILE="/usr/data/printer_data/config/buzzer.cfg"
NOZZLE_CLEANING_FOLDER="/usr/data/printer_data/config/nozzle_cleaning"
FANS_CONTROL_FOLDER="/usr/data/printer_data/config/fans_control"
IMPROVED_SHAPERS_FOLDER="/usr/data/printer_data/config/improved_shapers"
USEFUL_MACROS_FOLDER="/usr/data/printer_data/config/useful_macros"
SAVE_ZOFFSET_FOLDER="/usr/data/printer_data/config/save_zoffset"
SCREWS_TILT_FOLDER="/usr/data/printer_data/config/screws_tilt_adjust"
M600_SUPPORT_FOLDER="/usr/data/printer_data/config/m600_support"
GIT_BACKUP_FOLDER="/usr/data/git-backup"
TIMELAPSE_FOLDER="/usr/data/printer_data/config/timelapse"
CAMERA_SETTINGS_FOLDER="/usr/data/printer_data/config/camera_settings"
USB_CAMERA_FOLDER="/usr/data/printer_data/config/usb_camera"
OCTOEVERYWHERE_FOLDER="/usr/data/printer_data/config/octoeverywhere"
MOONRAKER_OBICO_FOLDER="/usr/data/printer_data/config/moonraker_obico"
GUPPYFLO_FOLDER="/usr/data/printer_data/config/guppyflo"
MOBILERAKER_FOLDER="/usr/data/printer_data/config/mobileraker"
OCTOAPP_FOLDER="/usr/data/printer_data/config/octoapp"
SIMPLYPRINT_FOLDER="/usr/data/printer_data/config/simplyprint"

# Check if folder exists
check_folder() {
    local folder_path="$1"
    if [ -d "$folder_path" ]; then
        echo "true"
    else
        echo "false"
    fi
}

# Check if file exists
check_file() {
    local file_path="$1"
    if [ -f "$file_path" ]; then
        echo "true"
    else
        echo "false"
    fi
}

# Check if service is running
check_service() {
    local service_name="$1"
    if systemctl is-active --quiet "$service_name"; then
        echo "true"
    else
        echo "false"
    fi
}

# Check SimplyPrint (special case - check moonraker config)
check_simplyprint() {
    local moonraker_cfg="/usr/data/printer_data/config/moonraker.conf"
    if [ ! -f "$moonraker_cfg" ]; then
        echo "false"
    elif grep -q "\[simplyprint\]" "$moonraker_cfg"; then
        echo "true"
    else
        echo "false"
    fi
}

# Main function
case "$1" in
    "moonraker-nginx")
        if [ "$(check_folder "$MOONRAKER_FOLDER")" = "true" ] && [ "$(check_service "nginx")" = "true" ]; then
            echo "installed"
        else
            echo "not_installed"
        fi
        ;;
    "fluidd")
        if [ "$(check_folder "$FLUIDD_FOLDER")" = "true" ]; then
            echo "installed"
        else
            echo "not_installed"
        fi
        ;;
    "mainsail")
        if [ "$(check_folder "$MAINSAIL_FOLDER")" = "true" ]; then
            echo "installed"
        else
            echo "not_installed"
        fi
        ;;
    "entware")
        if [ "$(check_file "$ENTWARE_FILE")" = "true" ]; then
            echo "installed"
        else
            echo "not_installed"
        fi
        ;;
    "gcode-shell-command")
        if [ "$(check_file "$KLIPPER_SHELL_FILE")" = "true" ]; then
            echo "installed"
        else
            echo "not_installed"
        fi
        ;;
    "kamp")
        if [ "$(check_folder "$KAMP_FOLDER")" = "true" ]; then
            echo "installed"
        else
            echo "not_installed"
        fi
        ;;
    "buzzer")
        if [ "$(check_file "$BUZZER_FILE")" = "true" ]; then
            echo "installed"
        else
            echo "not_installed"
        fi
        ;;
    "nozzle-cleaning")
        if [ "$(check_folder "$NOZZLE_CLEANING_FOLDER")" = "true" ]; then
            echo "installed"
        else
            echo "not_installed"
        fi
        ;;
    "fans-control")
        if [ "$(check_folder "$FANS_CONTROL_FOLDER")" = "true" ]; then
            echo "installed"
        else
            echo "not_installed"
        fi
        ;;
    "improved-shapers")
        if [ "$(check_folder "$IMPROVED_SHAPERS_FOLDER")" = "true" ]; then
            echo "installed"
        else
            echo "not_installed"
        fi
        ;;
    "useful-macros")
        if [ "$(check_folder "$USEFUL_MACROS_FOLDER")" = "true" ]; then
            echo "installed"
        else
            echo "not_installed"
        fi
        ;;
    "save-zoffset")
        if [ "$(check_folder "$SAVE_ZOFFSET_FOLDER")" = "true" ]; then
            echo "installed"
        else
            echo "not_installed"
        fi
        ;;
    "screws-tilt-adjust")
        if [ "$(check_folder "$SCREWS_TILT_FOLDER")" = "true" ]; then
            echo "installed"
        else
            echo "not_installed"
        fi
        ;;
    "m600-support")
        if [ "$(check_folder "$M600_SUPPORT_FOLDER")" = "true" ]; then
            echo "installed"
        else
            echo "not_installed"
        fi
        ;;
    "git-backup")
        if [ "$(check_folder "$GIT_BACKUP_FOLDER")" = "true" ]; then
            echo "installed"
        else
            echo "not_installed"
        fi
        ;;
    "moonraker-timelapse")
        if [ "$(check_folder "$TIMELAPSE_FOLDER")" = "true" ]; then
            echo "installed"
        else
            echo "not_installed"
        fi
        ;;
    "camera-settings")
        if [ "$(check_folder "$CAMERA_SETTINGS_FOLDER")" = "true" ]; then
            echo "installed"
        else
            echo "not_installed"
        fi
        ;;
    "usb-camera")
        if [ "$(check_folder "$USB_CAMERA_FOLDER")" = "true" ]; then
            echo "installed"
        else
            echo "not_installed"
        fi
        ;;
    "octoeverywhere")
        if [ "$(check_folder "$OCTOEVERYWHERE_FOLDER")" = "true" ]; then
            echo "installed"
        else
            echo "not_installed"
        fi
        ;;
    "moonraker-obico")
        if [ "$(check_folder "$MOONRAKER_OBICO_FOLDER")" = "true" ]; then
            echo "installed"
        else
            echo "not_installed"
        fi
        ;;
    "guppyflo")
        if [ "$(check_folder "$GUPPYFLO_FOLDER")" = "true" ]; then
            echo "installed"
        else
            echo "not_installed"
        fi
        ;;
    "mobileraker")
        if [ "$(check_folder "$MOBILERAKER_FOLDER")" = "true" ]; then
            echo "installed"
        else
            echo "not_installed"
        fi
        ;;
    "octoapp")
        if [ "$(check_folder "$OCTOAPP_FOLDER")" = "true" ]; then
            echo "installed"
        else
            echo "not_installed"
        fi
        ;;
    "simplyprint")
        if [ "$(check_simplyprint)" = "true" ]; then
            echo "installed"
        else
            echo "not_installed"
        fi
        ;;
    "all")
        # Return JSON with all components
        echo "{"
        echo "  \"moonraker-nginx\": \"$(bash $0 moonraker-nginx)\","
        echo "  \"fluidd\": \"$(bash $0 fluidd)\","
        echo "  \"mainsail\": \"$(bash $0 mainsail)\","
        echo "  \"entware\": \"$(bash $0 entware)\","
        echo "  \"gcode-shell-command\": \"$(bash $0 gcode-shell-command)\","
        echo "  \"kamp\": \"$(bash $0 kamp)\","
        echo "  \"buzzer\": \"$(bash $0 buzzer)\","
        echo "  \"nozzle-cleaning\": \"$(bash $0 nozzle-cleaning)\","
        echo "  \"fans-control\": \"$(bash $0 fans-control)\","
        echo "  \"improved-shapers\": \"$(bash $0 improved-shapers)\","
        echo "  \"useful-macros\": \"$(bash $0 useful-macros)\","
        echo "  \"save-zoffset\": \"$(bash $0 save-zoffset)\","
        echo "  \"screws-tilt-adjust\": \"$(bash $0 screws-tilt-adjust)\","
        echo "  \"m600-support\": \"$(bash $0 m600-support)\","
        echo "  \"git-backup\": \"$(bash $0 git-backup)\","
        echo "  \"moonraker-timelapse\": \"$(bash $0 moonraker-timelapse)\","
        echo "  \"camera-settings\": \"$(bash $0 camera-settings)\","
        echo "  \"usb-camera\": \"$(bash $0 usb-camera)\","
        echo "  \"octoeverywhere\": \"$(bash $0 octoeverywhere)\","
        echo "  \"moonraker-obico\": \"$(bash $0 moonraker-obico)\","
        echo "  \"guppyflo\": \"$(bash $0 guppyflo)\","
        echo "  \"mobileraker\": \"$(bash $0 mobileraker)\","
        echo "  \"octoapp\": \"$(bash $0 octoapp)\","
        echo "  \"simplyprint\": \"$(bash $0 simplyprint)\""
        echo "}"
        ;;
    *)
        echo "Usage: $0 {component_name|all}"
        echo "Available components: moonraker-nginx, fluidd, mainsail, entware, gcode-shell-command, kamp, buzzer, nozzle-cleaning, fans-control, improved-shapers, useful-macros, save-zoffset, screws-tilt-adjust, m600-support, git-backup, moonraker-timelapse, camera-settings, usb-camera, octoeverywhere, moonraker-obico, guppyflo, mobileraker, octoapp, simplyprint"
        exit 1
        ;;
esac
