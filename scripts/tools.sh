#!/bin/sh

# Creality Helper Script - Tools Functions
# Based on original Creality-Helper-Script by Guilouz
# Adapted for desktop application integration

set -e

# Paths (BusyBox compatible)
INITD_FOLDER="/etc/init.d"
KLIPPER_KLIPPY_FOLDER="/usr/data/printer_data/klippy"
MOONRAKER_CFG="/usr/data/printer_data/moonraker/moonraker.conf"
MOONRAKER_FOLDER="/usr/data/printer_data/moonraker"
NGINX_FOLDER="/usr/data/nginx"
ENTWARE_FILE="/opt/bin/opkg"
USR_DATA="/usr/data"
PRINTER_DATA_FOLDER="/usr/data/printer_data"
GUPPYFLO_FOLDER="/usr/data/guppyflo"

# Helper functions
ok_msg() {
    echo "✓ $1"
}

error_msg() {
    echo "✗ $1"
    exit 1
}

# Check if service exists
check_service() {
    local service_name=$1
    if [ ! -f "$INITD_FOLDER/$service_name" ]; then
        error_msg "$service_name service is not present!"
    fi
}

# Check if directory exists
check_directory() {
    local dir_path=$1
    local service_name=$2
    if [ ! -d "$dir_path" ]; then
        error_msg "$service_name is not installed!"
    fi
}

# Check if file exists
check_file() {
    local file_path=$1
    local service_name=$2
    if [ ! -f "$file_path" ]; then
        error_msg "$service_name is not installed!"
    fi
}

# Get IP address
get_ip_address() {
    local ip_address
    ip_address=$(ip -4 addr show eth0 2>/dev/null | grep -o -E '(inet\s)([0-9]+\.){3}[0-9]+' | cut -d ' ' -f 2 | head -n 1)
    if [ -z "$ip_address" ]; then
        ip_address=$(ip -4 addr show wlan0 2>/dev/null | grep -o -E '(inet\s)([0-9]+\.){3}[0-9]+' | cut -d ' ' -f 2 | head -n 1)
    fi
    if [ -z "$ip_address" ]; then
        ip_address="xxx.xxx.xxx.xxx"
    fi
    echo "$ip_address"
}

# Service management functions
start_service() {
    local service_name=$1
    /etc/init.d/$service_name start
    sleep 1
}

stop_service() {
    local service_name=$1
    /etc/init.d/$service_name stop
    sleep 1
}

restart_service() {
    local service_name=$1
    /etc/init.d/$service_name restart
    sleep 1
}

# Klipper Configuration Management
prevent_updating_klipper_files() {
    echo "Preventing Klipper configuration files from being updated..."
    
    if [ -f "$INITD_FOLDER/disabled.S55klipper_service" ]; then
        error_msg "Updating Klipper configuration files is already prevented!"
    fi
    
    # Backup original service file
    mv "$INITD_FOLDER/S55klipper_service" "$INITD_FOLDER/disabled.S55klipper_service"
    
    # Create new service file that prevents updates
    cat > "$INITD_FOLDER/S55klipper_service" << 'EOF'
#!/bin/sh
# Klipper service that prevents configuration updates
/etc/init.d/disabled.S55klipper_service "$@"
EOF
    
    chmod 755 "$INITD_FOLDER/S55klipper_service"
    restart_service "S55klipper_service"
    ok_msg "Klipper configuration files will no longer be updated when Klipper restarts!"
}

allow_updating_klipper_files() {
    echo "Allowing Klipper configuration files to be updated..."
    
    if [ ! -f "$INITD_FOLDER/disabled.S55klipper_service" ]; then
        error_msg "Updating Klipper configuration files is already allowed!"
    fi
    
    # Restore original service file
    rm -f "$INITD_FOLDER/S55klipper_service"
    mv "$INITD_FOLDER/disabled.S55klipper_service" "$INITD_FOLDER/S55klipper_service"
    
    restart_service "S55klipper_service"
    ok_msg "Klipper configuration files will be updated when Klipper restarts!"
}

# Gcode Fix
printing_gcode_from_folder() {
    echo "Fixing printing Gcode files from folder..."
    
    if [ ! -f "$KLIPPER_KLIPPY_FOLDER/gcode.py" ]; then
        error_msg "Gcode.py not found!"
    fi
    
    # Remove existing files
    rm -f "$KLIPPER_KLIPPY_FOLDER/gcode.py"
    rm -f "$KLIPPER_KLIPPY_FOLDER/gcode.pyc"
    
    # Link the fixed version based on model
    local model=$(/usr/bin/get_sn_mac.sh model 2>&1)
    if echo "$model" | grep -iq "K1"; then
        ln -sf "/usr/data/helper-script/files/fixes/gcode.py" "$KLIPPER_KLIPPY_FOLDER/gcode.py"
    elif echo "$model" | grep -iq "F001\|F002"; then
        ln -sf "/usr/data/helper-script/files/fixes/gcode_3v3.py" "$KLIPPER_KLIPPY_FOLDER/gcode.py"
    fi
    
    restart_service "S55klipper_service"
    ok_msg "Fix has been applied successfully!"
}

# Camera Settings
enable_camera_settings() {
    echo "Enabling camera settings in Moonraker..."
    
    if grep -q "^\[webcam Camera\]$" "$MOONRAKER_CFG"; then
        error_msg "Camera settings are already enabled in Moonraker!"
    fi
    
    # Enable camera settings
    if grep -q "#\[webcam Camera\]" "$MOONRAKER_CFG"; then
        sed -i -e 's/^\s*#[[:space:]]*\[webcam Camera\]/[webcam Camera]/' -e '/^\[webcam Camera\]/,/^\s*$/ s/^\(\s*\)#/\1/' "$MOONRAKER_CFG"
    fi
    
    # Replace IP addresses
    local ip_address=$(get_ip_address)
    if grep -q "stream_url: http://xxx.xxx.xxx.xxx:8080/?action=stream" "$MOONRAKER_CFG"; then
        sed -i "s|http://xxx.xxx.xxx.xxx:|http://$ip_address:|g" "$MOONRAKER_CFG"
    fi
    if grep -q "snapshot_url: http://xxx.xxx.xxx.xxx:8080/?action=snapshot" "$MOONRAKER_CFG"; then
        sed -i "s|http://xxx.xxx.xxx.xxx:|http://$ip_address:|g" "$MOONRAKER_CFG"
    fi
    
    stop_service "S56moonraker_service"
    start_service "S56moonraker_service"
    ok_msg "Camera settings have been enabled in Moonraker successfully!"
}

disable_camera_settings() {
    echo "Disabling camera settings in Moonraker..."
    
    if grep -q "^#\[webcam Camera\]" "$MOONRAKER_CFG"; then
        error_msg "Camera settings are already disabled in Moonraker!"
    fi
    
    # Disable camera settings
    if grep -q "\[webcam Camera\]" "$MOONRAKER_CFG"; then
        sed -i '/^\[webcam Camera\]/,/^\s*$/ s/^\(\s*\)\([^#]\)/#\1\2/' "$MOONRAKER_CFG"
    fi
    
    stop_service "S56moonraker_service"
    start_service "S56moonraker_service"
    ok_msg "Camera settings have been disabled in Moonraker successfully!"
}

# Service Restart Functions
restart_nginx() {
    echo "Restarting Nginx service..."
    check_directory "$NGINX_FOLDER" "Nginx"
    restart_service "S50nginx"
    ok_msg "Nginx service has been restarted successfully!"
}

restart_moonraker() {
    echo "Restarting Moonraker service..."
    check_directory "$MOONRAKER_FOLDER" "Moonraker"
    restart_service "S56moonraker_service"
    ok_msg "Moonraker service has been restarted successfully!"
}

restart_klipper() {
    echo "Restarting Klipper service..."
    check_service "S55klipper_service"
    restart_service "S55klipper_service"
    ok_msg "Klipper service has been restarted successfully!"
}

# Entware Update
update_entware_packages() {
    echo "Updating Entware packages..."
    check_file "$ENTWARE_FILE" "Entware"
    
    echo "Updating packages list..."
    "$ENTWARE_FILE" update
    echo "Updating packages..."
    "$ENTWARE_FILE" upgrade
    ok_msg "Entware packages have been updated!"
}

# Cache and Logs
clear_cache() {
    echo "Clearing system cache..."
    rm -rf /root/.cache
    echo "Clearing git cache..."
    cd /usr/data/helper-script
    git gc --aggressive --prune=all 2>/dev/null || true
    pip cache purge 2>/dev/null || true
    ok_msg "Cache has been cleared!"
}

clear_logs() {
    echo "Clearing log files..."
    rm -f "$USR_DATA/creality/userdata/log/*.log"
    rm -f "$USR_DATA/creality/userdata/log/*.gz"
    rm -f "$USR_DATA/creality/userdata/fault_code/*"
    rm -f "$PRINTER_DATA_FOLDER/logs/*"
    if [ -d "$GUPPYFLO_FOLDER" ]; then
        rm -f "$GUPPYFLO_FOLDER/guppyflo.log"
    fi
    ok_msg "Logs files have been cleared!"
}

# Firmware Management
restore_previous_firmware() {
    echo "=== Firmware Restore Instructions ==="
    echo "To restore a previous firmware:"
    echo "1. Copy the firmware (.img) file to the root of a USB drive"
    echo "2. Make sure there is only this file on the USB drive"
    echo "3. Insert the USB drive into the printer"
    echo "4. The printer will automatically detect and install the firmware"
    echo "====================================="
}

# Factory Reset
reset_factory_settings() {
    echo "Resetting to factory settings..."
    echo "WARNING: This will reset the printer to factory settings!"
    echo "All installed components will be removed and require reinstallation."
    
    # Download and run the official factory reset script
    echo "Downloading factory reset script..."
    wget --no-check-certificate https://raw.githubusercontent.com/pellcorp/creality/main/k1/services/S58factoryreset -O /tmp/S58factoryreset
    
    if [ $? -eq 0 ]; then
        chmod +x /tmp/S58factoryreset
        echo "Running factory reset..."
        /tmp/S58factoryreset reset
        ok_msg "Factory reset initiated!"
    else
        error_msg "Failed to download factory reset script!"
    fi
}

# Main execution
case "$1" in
    "prevent_klipper_updates")
        prevent_updating_klipper_files
        ;;
    "allow_klipper_updates")
        allow_updating_klipper_files
        ;;
    "fix_gcode_printing")
        printing_gcode_from_folder
        ;;
    "enable_camera_settings")
        enable_camera_settings
        ;;
    "disable_camera_settings")
        disable_camera_settings
        ;;
    "restart_nginx")
        restart_nginx
        ;;
    "restart_moonraker")
        restart_moonraker
        ;;
    "restart_klipper")
        restart_klipper
        ;;
    "update_entware")
        update_entware_packages
        ;;
    "clear_cache")
        clear_cache
        ;;
    "clear_logs")
        clear_logs
        ;;
    "restore_firmware")
        restore_previous_firmware
        ;;
    "factory_reset")
        reset_factory_settings
        ;;
    *)
        echo "Usage: $0 {prevent_klipper_updates|allow_klipper_updates|fix_gcode_printing|enable_camera_settings|disable_camera_settings|restart_nginx|restart_moonraker|restart_klipper|update_entware|clear_cache|clear_logs|restore_firmware|factory_reset}"
        exit 1
        ;;
esac
