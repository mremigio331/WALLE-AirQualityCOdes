#!/bin/bash

# Variables
LOG_DIR="/var/log/wall-e"
LOGROTATE_CONFIG="/etc/logrotate.d/wall-e_api"
USER=${USER}

echo "Starting WALL-E API setup..."

# Update and upgrade system packages
echo "Updating system packages..."
sudo apt update
sudo apt upgrade -y

# Install required tools and dependencies
echo "Installing required tools and dependencies..."
sudo apt install -y python3-flask python3-flasgger python3-pip screen default-jdk wget curl unzip

# Install AWS CLI
echo "Checking if AWS CLI is installed..."
if ! command -v aws &> /dev/null; then
    echo "AWS CLI not found. Installing AWS CLI..."
    curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
    unzip awscliv2.zip
    sudo ./aws/install
    rm -rf awscliv2.zip aws/
else
    echo "AWS CLI is already installed."
fi

# Create the log directory
echo "Creating log directory at $LOG_DIR..."
sudo mkdir -p $LOG_DIR

# Set permissions for the current user
echo "Setting permissions for user $USER..."
sudo chown $USER:$USER $LOG_DIR
sudo chmod 750 $LOG_DIR

# Create logrotate configuration for API logs
echo "Creating logrotate configuration for API logs at $LOGROTATE_CONFIG..."
sudo bash -c "cat > $LOGROTATE_CONFIG" <<EOL
$LOG_DIR/wall-e_api.log {
    daily
    missingok
    rotate 7
    compress
    delaycompress
    notifempty
    create 640 $USER $USER
}
EOL

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

# Verify AWS CLI installation
if command -v aws &> /dev/null; then
    echo "AWS CLI installed successfully."
else
    echo "AWS CLI installation failed. Please check manually."
fi

echo "Setup complete for WALL-E API!"
echo "Logs will be saved in $LOG_DIR/wall-e_api.log."
