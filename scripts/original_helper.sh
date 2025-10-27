#!/bin/bash
# Creality Helper Script - Original functions integration
# This file contains functions from the original Creality-Helper-Script repository
# Source: https://github.com/Guilouz/Creality-Helper-Script.git

# System Information Functions
get_system_info() {
    echo "=== System Information ==="
    echo "Printer Model: $(cat /proc/device-tree/model 2>/dev/null || echo 'Unknown')"
    echo "Kernel Version: $(uname -r)"
    echo "OS Version: $(cat /etc/os-release | grep PRETTY_NAME | cut -d'=' -f2 | tr -d '"')"
    echo "Architecture: $(uname -m)"
    echo "Uptime: $(uptime -p)"
    echo "Memory: $(free -h | grep '^Mem:' | awk '{print $3 "/" $2}')"
    echo "Disk Usage: $(df -h / | tail -1 | awk '{print $3 "/" $2 " (" $5 ")"}')"
    echo "CPU Load: $(cat /proc/loadavg | awk '{print $1 ", " $2 ", " $3}')"
}

# Service Management Functions
manage_service() {
    local service_name=$1
    local action=$2
    
    case $action in
        "start")
            systemctl start $service_name
            echo "Service $service_name started"
            ;;
        "stop")
            systemctl stop $service_name
            echo "Service $service_name stopped"
            ;;
        "restart")
            systemctl restart $service_name
            echo "Service $service_name restarted"
            ;;
        "status")
            systemctl status $service_name --no-pager
            ;;
        "enable")
            systemctl enable $service_name
            echo "Service $service_name enabled"
            ;;
        "disable")
            systemctl disable $service_name
            echo "Service $service_name disabled"
            ;;
    esac
}

# Logs Functions
get_logs() {
    local log_type=$1
    local lines=${2:-50}
    
    case $log_type in
        "klipper")
            journalctl -u klipper -n $lines --no-pager
            ;;
        "moonraker")
            journalctl -u moonraker -n $lines --no-pager
            ;;
        "system")
            journalctl -n $lines --no-pager
            ;;
        "nginx")
            journalctl -u nginx -n $lines --no-pager
            ;;
        "fluidd")
            journalctl -u fluidd -n $lines --no-pager
            ;;
    esac
}

# Network Functions
network_diagnostics() {
    echo "=== Network Diagnostics ==="
    echo "--- Network Interfaces ---"
    ip addr show
    echo ""
    echo "--- Routing Table ---"
    ip route show
    echo ""
    echo "--- DNS Resolution Test ---"
    nslookup google.com
    echo ""
    echo "--- Connectivity Test ---"
    ping -c 3 8.8.8.8
}

# Performance Monitoring
get_performance_stats() {
    echo "=== Performance Statistics ==="
    echo "--- System Load ---"
    uptime
    echo ""
    echo "--- Memory Usage ---"
    free -h
    echo ""
    echo "--- Disk Usage ---"
    df -h
    echo ""
    echo "--- Top Processes ---"
    ps aux --sort=-%cpu | head -10
}

# File Management
list_config_files() {
    echo "=== Configuration Files ==="
    find /home -name "*.cfg" -type f 2>/dev/null | head -20
    echo ""
    echo "=== Log Files ==="
    find /var/log -name "*.log" -type f 2>/dev/null | head -20
}

# Update Functions
check_updates() {
    echo "=== Available Updates ==="
    apt list --upgradable 2>/dev/null | head -20
}

update_system() {
    echo "=== Updating System ==="
    apt update && apt upgrade -y
}

# Klipper Functions
get_klipper_version() {
    python3 -c "import klippy; print(klippy.__version__)" 2>/dev/null || echo "Not installed"
}

get_moonraker_version() {
    python3 -c "import moonraker; print(moonraker.__version__)" 2>/dev/null || echo "Not installed"
}

# Main menu function
show_tools_menu() {
    echo "=== Creality Helper Tools ==="
    echo "1. System Information"
    echo "2. Service Management"
    echo "3. View Logs"
    echo "4. Network Diagnostics"
    echo "5. Performance Monitor"
    echo "6. File Manager"
    echo "7. Check Updates"
    echo "8. Update System"
    echo "9. Klipper Info"
    echo "0. Exit"
}

# Klipper Configuration Management
prevent_updating_klipper_files() {
    echo "Preventing Klipper configuration files from being updated..."
    if [ -f "/etc/init.d/disabled.S55klipper_service" ]; then
        echo "Klipper configuration files are already prevented from updating!"
        return 1
    fi
    
    # Backup original service file
    mv /etc/init.d/S55klipper_service /etc/init.d/disabled.S55klipper_service
    
    # Create new service file that prevents updates
    cat > /etc/init.d/S55klipper_service << 'EOF'
#!/bin/sh
# Klipper service that prevents configuration updates
/etc/init.d/S55klipper_service.disabled "$@"
EOF
    
    chmod 755 /etc/init.d/S55klipper_service
    echo "Klipper configuration files will no longer be updated when Klipper restarts!"
}

allow_updating_klipper_files() {
    echo "Allowing Klipper configuration files to be updated..."
    if [ ! -f "/etc/init.d/disabled.S55klipper_service" ]; then
        echo "Klipper configuration files are already allowed to update!"
        return 1
    fi
    
    # Restore original service file
    rm -f /etc/init.d/S55klipper_service
    mv /etc/init.d/disabled.S55klipper_service /etc/init.d/S55klipper_service
    
    echo "Klipper configuration files will be updated when Klipper restarts!"
}

# Gcode Fix
printing_gcode_from_folder() {
    echo "Fixing printing Gcode files from folder..."
    if [ ! -f "/usr/data/printer_data/klippy/gcode.py" ]; then
        echo "Gcode.py not found!"
        return 1
    fi
    
    # Remove existing files
    rm -f /usr/data/printer_data/klippy/gcode.py
    rm -f /usr/data/printer_data/klippy/gcode.pyc
    
    # Link the fixed version
    ln -sf "/usr/data/helper-script/files/fixes/gcode.py" /usr/data/printer_data/klippy/gcode.py
    
    echo "Fix has been applied successfully!"
}

# Camera Settings
enable_camera_settings() {
    echo "Enabling camera settings in Moonraker..."
    local moonraker_cfg="/usr/data/printer_data/moonraker/moonraker.conf"
    
    if grep -q "^\[webcam Camera\]$" "$moonraker_cfg"; then
        echo "Camera settings are already enabled!"
        return 1
    fi
    
    # Enable camera settings
    sed -i -e 's/^\s*#[[:space:]]*\[webcam Camera\]/[webcam Camera]/' -e '/^\[webcam Camera\]/,/^\s*$/ s/^\(\s*\)#/\1/' "$moonraker_cfg"
    
    # Replace IP addresses
    local ip_address=$(hostname -I | awk '{print $1}')
    sed -i "s|http://xxx.xxx.xxx.xxx:|http://$ip_address:|g" "$moonraker_cfg"
    
    echo "Camera settings enabled in Moonraker!"
}

disable_camera_settings() {
    echo "Disabling camera settings in Moonraker..."
    local moonraker_cfg="/usr/data/printer_data/moonraker/moonraker.conf"
    
    if grep -q "^#\[webcam Camera\]" "$moonraker_cfg"; then
        echo "Camera settings are already disabled!"
        return 1
    fi
    
    # Disable camera settings
    sed -i -e 's/^\[webcam Camera\]/#[webcam Camera]/' -e '/^#\[webcam Camera\]/,/^\s*$/ s/^\(\s*\)/\1#/' "$moonraker_cfg"
    
    echo "Camera settings disabled in Moonraker!"
}

# Service Restart Functions
restart_nginx() {
    echo "Restarting Nginx service..."
    if [ ! -d "/usr/data/nginx" ]; then
        echo "Nginx is not installed!"
        return 1
    fi
    
    systemctl restart nginx
    echo "Nginx service restarted!"
}

restart_moonraker() {
    echo "Restarting Moonraker service..."
    if [ ! -d "/usr/data/printer_data/moonraker" ]; then
        echo "Moonraker is not installed!"
        return 1
    fi
    
    systemctl restart moonraker
    echo "Moonraker service restarted!"
}

restart_klipper() {
    echo "Restarting Klipper service..."
    if [ ! -f "/etc/init.d/S55klipper_service" ]; then
        echo "Klipper service is not present!"
        return 1
    fi
    
    systemctl restart klipper
    echo "Klipper service restarted!"
}

# Entware Update
update_entware_packages() {
    echo "Updating Entware packages..."
    if [ ! -f "/opt/bin/opkg" ]; then
        echo "Entware is not installed!"
        return 1
    fi
    
    /opt/bin/opkg update
    /opt/bin/opkg upgrade
    echo "Entware packages updated!"
}

# Cache and Logs
clear_cache() {
    echo "Clearing system cache..."
    rm -rf /root/.cache
    rm -rf /tmp/*
    echo "System cache cleared!"
}

clear_logs() {
    echo "Clearing log files..."
    journalctl --vacuum-time=1d
    find /var/log -name "*.log" -type f -delete
    echo "Log files cleared!"
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
    
    # Create factory reset script
    cat > /tmp/factory_reset.sh << 'EOF'
#!/bin/bash
# Factory reset script
echo "Performing factory reset..."
/etc/init.d/S58factoryreset start
EOF
    
    chmod +x /tmp/factory_reset.sh
    /tmp/factory_reset.sh
    echo "Factory reset initiated!"
}

# Main execution
case "$1" in
    "system_info")
        get_system_info
        ;;
    "manage_service")
        manage_service "$2" "$3"
        ;;
    "get_logs")
        get_logs "$2" "$3"
        ;;
    "network_diagnostics")
        network_diagnostics
        ;;
    "performance_stats")
        get_performance_stats
        ;;
    "list_files")
        list_config_files
        ;;
    "check_updates")
        check_updates
        ;;
    "update_system")
        update_system
        ;;
    "klipper_version")
        get_klipper_version
        ;;
    "moonraker_version")
        get_moonraker_version
        ;;
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
    "menu")
        show_tools_menu
        ;;
    *)
        echo "Usage: $0 {system_info|manage_service|get_logs|network_diagnostics|performance_stats|list_files|check_updates|update_system|klipper_version|moonraker_version|prevent_klipper_updates|allow_klipper_updates|fix_gcode_printing|enable_camera_settings|disable_camera_settings|restart_nginx|restart_moonraker|restart_klipper|update_entware|clear_cache|clear_logs|restore_firmware|factory_reset|menu}"
        echo "Example: $0 system_info"
        echo "Example: $0 manage_service klipper restart"
        echo "Example: $0 get_logs klipper 100"
        ;;
esac
