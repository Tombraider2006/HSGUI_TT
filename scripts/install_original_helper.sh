#!/bin/bash
# Install original Creality Helper Script
# This script downloads and installs the original helper script from the official repository

echo "Installing original Creality Helper Script..."

# Create scripts directory if it doesn't exist
mkdir -p /home/printer_data/scripts

# Download the original helper script
echo "Downloading original helper script..."
curl -o /home/printer_data/scripts/original_helper.sh https://raw.githubusercontent.com/Guilouz/Creality-Helper-Script/main/helper.sh

# Make it executable
chmod +x /home/printer_data/scripts/original_helper.sh

# Also download the main helper script for reference
echo "Downloading main helper script..."
curl -o /home/printer_data/scripts/helper.sh https://raw.githubusercontent.com/Guilouz/Creality-Helper-Script/main/helper.sh

# Make it executable
chmod +x /home/printer_data/scripts/helper.sh

echo "Original Creality Helper Script installed successfully!"
echo "Location: /home/printer_data/scripts/original_helper.sh"
echo "You can now use the tools in the web interface."
