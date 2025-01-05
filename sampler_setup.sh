#!/bin/bash

# Variables
LOG_DIR="/var/log/wall-e"
LOGROTATE_CONFIG="/etc/logrotate.d/wall-e_sampler"
CONFIG_FILE="wall-e_sampler_config.json"
USER=${USER}

echo "Starting WALL-E Sampler setup..."

# Update and upgrade system packages
echo "Updating system packages..."
sudo apt update
sudo apt upgrade -y

# Install required tools and dependencies
echo "Installing required tools and dependencies..."
sudo apt install -y python3-serial python3-requests python3-pip screen

# Create the log directory
echo "Creating log directory at $LOG_DIR..."
sudo mkdir -p $LOG_DIR

# Set permissions for the current user
echo "Setting permissions for user $USER..."
sudo chown $USER:$USER $LOG_DIR
sudo chmod 750 $LOG_DIR

# Create logrotate configuration for Sampler logs
echo "Creating logrotate configuration for Sampler logs at $LOGROTATE_CONFIG..."
sudo bash -c "cat > $LOGROTATE_CONFIG" <<EOL
$LOG_DIR/wall-e_sampler.log {
    daily
    missingok
    rotate 7
    compress
    delaycompress
    notifempty
    create 640 $USER $USER
}
EOL

# Create configuration file if it doesn't already exist
if [ ! -f "$CONFIG_FILE" ]; then
    echo "Creating default configuration file at $CONFIG_FILE..."
    cat > $CONFIG_FILE <<EOL
{
    "device_id": "default_device",
    "server_url": "http://air.local:5000"
}
EOL
    echo "Default configuration file created."
else
    echo "Configuration file '$CONFIG_FILE' already exists. Skipping creation."
fi

# Verify setup
echo "Verifying setup..."
if [ -d "$LOG_DIR" ]; then
    echo "Log directory created successfully: $LOG_DIR"
else
    echo "Failed to create log directory: $LOG_DIR"
fi

if [ -f "$LOGROTATE_CONFIG" ]; then
    echo "Logrotate configuration created successfully: $LOGROTATE_CONFIG"
else
    echo "Failed to create logrotate configuration: $LOGROTATE_CONFIG"
fi

if [ -f "$CONFIG_FILE" ]; then
    echo "Configuration file exists: $CONFIG_FILE"
else
    echo "Failed to create configuration file: $CONFIG_FILE"
fi

echo "Setup complete for WALL-E Sampler!"
echo "Logs will be saved in $LOG_DIR/wall-e_sampler.log."
echo "Configuration file: $CONFIG_FILE"
