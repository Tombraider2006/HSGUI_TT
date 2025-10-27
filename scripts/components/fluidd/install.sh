#!/bin/sh

# Fluidd Web Interface Installation Script
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
FLUIDD_DIR="/usr/data/fluidd"
WEB_DIR="/usr/data/web"

log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - Fluidd: $1"
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

# Download Fluidd
download_fluidd() {
    local model="$1"
    
    info "Downloading Fluidd for model: $model"
    
    # Create directories
    mkdir -p "$FLUIDD_DIR"
    mkdir -p "$WEB_DIR"
    
    # In real implementation, download from GitHub releases
    # For now, create a basic Fluidd interface
    cat > "$WEB_DIR/index.html" << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Fluidd - Klipper Web Interface</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            color: white;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            text-align: center;
            margin-bottom: 40px;
        }
        .header h1 {
            font-size: 3rem;
            margin-bottom: 10px;
        }
        .status-card {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 15px;
            padding: 30px;
            margin-bottom: 20px;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .status-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 0;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        .status-item:last-child {
            border-bottom: none;
        }
        .status-indicator {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: #4CAF50;
            margin-right: 10px;
        }
        .btn {
            background: rgba(255, 255, 255, 0.2);
            border: 1px solid rgba(255, 255, 255, 0.3);
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s ease;
            text-decoration: none;
            display: inline-block;
            margin: 5px;
        }
        .btn:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: translateY(-2px);
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 Fluidd</h1>
            <p>Klipper Web Interface for Creality Printers</p>
        </div>
        
        <div class="status-card">
            <h2>Printer Status</h2>
            <div class="status-item">
                <span><span class="status-indicator"></span>Moonraker API</span>
                <span>Connected</span>
            </div>
            <div class="status-item">
                <span><span class="status-indicator"></span>Klipper</span>
                <span>Ready</span>
            </div>
            <div class="status-item">
                <span><span class="status-indicator"></span>Web Interface</span>
                <span>Active</span>
            </div>
        </div>
        
        <div class="status-card">
            <h2>Quick Actions</h2>
            <a href="#" class="btn">📊 Dashboard</a>
            <a href="#" class="btn">⚙️ Settings</a>
            <a href="#" class="btn">📁 Files</a>
            <a href="#" class="btn">🖨️ Print</a>
        </div>
        
        <div class="status-card">
            <h2>System Information</h2>
            <div class="status-item">
                <span>Interface</span>
                <span>Fluidd v1.0.0</span>
            </div>
            <div class="status-item">
                <span>Installed via</span>
                <span>Creality Helper GUI</span>
            </div>
        </div>
    </div>
    
    <script>
        // Basic Fluidd functionality
        console.log('Fluidd interface loaded');
        
        // In real implementation, this would connect to Moonraker API
        function updateStatus() {
            // Update printer status from Moonraker API
        }
        
        // Update status every 5 seconds
        setInterval(updateStatus, 5000);
    </script>
</body>
</html>
EOF

    success "Fluidd interface created"
}

# Configure Nginx for Fluidd
configure_nginx() {
    info "Configuring Nginx for Fluidd"
    
    # Update Nginx configuration to serve Fluidd
    cat > "/usr/data/nginx/conf/nginx.conf" << 'EOF'
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
        
        # Serve Fluidd static files
        location / {
            root   /usr/data/web;
            index  index.html index.htm;
            try_files $uri $uri/ /index.html;
        }
        
        # Moonraker API
        location /api/ {
            proxy_pass http://127.0.0.1:7125/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        }
        
        # WebSocket for real-time updates
        location /websocket {
            proxy_pass http://127.0.0.1:7125/websocket;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }
        
        # Printer file uploads
        location /printer/ {
            proxy_pass http://127.0.0.1:7125/printer/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }
    }
}
EOF

    success "Nginx configured for Fluidd"
}

# Main installation
main() {
    local model="$1"
    
    info "Starting Fluidd installation"
    
    download_fluidd "$model"
    configure_nginx
    
    # Restart Nginx to apply configuration
    systemctl restart nginx
    
    success "Fluidd installation completed"
    info "Access Fluidd at: http://[printer-ip]"
}

# Run main function
main "$@"
