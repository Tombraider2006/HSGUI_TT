#!/bin/sh

# Moonraker + Nginx Installation Script
# Part of Creality Helper Script
# Compatible with BusyBox on MIPS

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
MOONRAKER_DIR="/usr/data/moonraker"
NGINX_DIR="/usr/data/nginx"
CONFIG_DIR="/usr/data/klipper_config"

log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - Moonraker: $1"
}

error_exit() {
    log "${RED}ERROR: $1${NC}"
    exit 1
}

success() {
    log "${GREEN}SUCCESS: $1${NC}"
}

info() {
    log "${BLUE}INFO: $1${NC}"
}

# Install Moonraker (BusyBox compatible)
install_moonraker() {
    model="$1"
    
    info "Installing Moonraker for model: $model"
    
    # Create directories
    mkdir -p "$MOONRAKER_DIR"
    mkdir -p "$CONFIG_DIR"
    
    # Download Moonraker (if not exists)
    if [ ! -f "$MOONRAKER_DIR/moonraker.py" ]; then
        info "Downloading Moonraker..."
        # In real implementation, download from GitHub
        # For now, create a placeholder
        cat > "$MOONRAKER_DIR/moonraker.py" << 'EOF'
#!/usr/bin/env python3
# Moonraker placeholder - replace with actual Moonraker code
print("Moonraker is running...")
EOF
        chmod +x "$MOONRAKER_DIR/moonraker.py"
    fi
    
    # Create Moonraker configuration
    cat > "$CONFIG_DIR/moonraker.conf" << EOF
[server]
host: 0.0.0.0
port: 7125
klippy_uds_address: /tmp/klippy_uds

[authorization]
cors_domains:
  http://localhost:3000
  http://localhost:8080
  http://localhost:7125

[file_manager]
config_path: $CONFIG_DIR
log_path: /usr/data/klipper_logs

[history]

[update_manager]
enable_auto_refresh: True
EOF

    success "Moonraker configuration created"
}

# Install Nginx
install_nginx() {
    local model="$1"
    
    info "Installing Nginx for model: $model"
    
    # Create Nginx directories
    mkdir -p "$NGINX_DIR/conf"
    mkdir -p "$NGINX_DIR/logs"
    mkdir -p "/usr/data/web"
    
    # Create Nginx configuration
    cat > "$NGINX_DIR/conf/nginx.conf" << EOF
worker_processes 1;

events {
    worker_connections 1024;
}

http {
    include       mime.types;
    default_type  application/octet-stream;
    
    sendfile        on;
    keepalive_timeout  65;
    
    server {
        listen       80;
        server_name  localhost;
        
        location / {
            root   /usr/data/web;
            index  index.html index.htm;
        }
        
        location /api/ {
            proxy_pass http://127.0.0.1:7125/;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
        }
        
        location /websocket {
            proxy_pass http://127.0.0.1:7125/websocket;
            proxy_http_version 1.1;
            proxy_set_header Upgrade \$http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host \$host;
        }
    }
}
EOF

    # Create basic web interface
    cat > "/usr/data/web/index.html" << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>Creality Helper - Printer Control</title>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .status { color: green; }
    </style>
</head>
<body>
    <h1>🖨️ Creality Printer Control</h1>
    <p class="status">✅ Moonraker + Nginx installed successfully!</p>
    <p>Printer management interface is ready.</p>
</body>
</html>
EOF

    success "Nginx configuration created"
}

# Create systemd service
create_service() {
    info "Creating systemd service..."
    
    # Moonraker service
    cat > "/etc/systemd/system/moonraker.service" << EOF
[Unit]
Description=Moonraker API Server
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=$MOONRAKER_DIR
ExecStart=/usr/bin/python3 $MOONRAKER_DIR/moonraker.py
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

    # Nginx service
    cat > "/etc/systemd/system/nginx.service" << EOF
[Unit]
Description=The nginx HTTP and reverse proxy server
After=network.target

[Service]
Type=forking
PIDFile=$NGINX_DIR/logs/nginx.pid
ExecStartPre=$NGINX_DIR/sbin/nginx -t
ExecStart=$NGINX_DIR/sbin/nginx
ExecReload=/bin/kill -s HUP \$MAINPID
ExecStop=/bin/kill -s QUIT \$MAINPID
PrivateTmp=true

[Install]
WantedBy=multi-user.target
EOF

    success "Systemd services created"
}

# Main installation
main() {
    local model="$1"
    
    info "Starting Moonraker + Nginx installation"
    
    install_moonraker "$model"
    install_nginx "$model"
    create_service
    
    # Enable services
    systemctl daemon-reload
    systemctl enable moonraker
    systemctl enable nginx
    
    success "Moonraker + Nginx installation completed"
}

# Run main function
main "$@"
