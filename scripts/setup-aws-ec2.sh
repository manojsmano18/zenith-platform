#!/usr/bin/env bash
set -e

echo "=========================================================="
echo " ZENITH Platform - AWS EC2 Automated Provisioning Script"
echo "=========================================================="

# 1. Update OS packages
echo "--> 1. Updating Ubuntu packages..."
sudo apt-get update -y
sudo apt-get upgrade -y

# 2. Setup 3GB Swap Memory (ensures smooth builds and prevents OOM on t2.micro Free Tier)
if [ ! -f /swapfile ]; then
    echo "--> 2. Configuring 3GB Swap Space for Free Tier t2.micro / t3.micro..."
    sudo fallocate -l 3G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
fi

# 3. Install Docker & Docker Compose
echo "--> 3. Installing Docker Engine and Docker Compose..."
sudo apt-get install -y ca-certificates curl gnupg lsb-release git

sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg --yes

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update -y
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin docker-compose

# 4. Enable Docker for current user
echo "--> 4. Configuring Docker permissions..."
sudo usermod -aG docker $USER
sudo systemctl enable docker
sudo systemctl start docker

# 5. Create persistent uploads directory
echo "--> 5. Preparing persistent uploads directory (/opt/zenith/uploads)..."
sudo mkdir -p /opt/zenith/uploads
sudo chmod -R 777 /opt/zenith/uploads

echo "=========================================================="
echo " AWS EC2 Provisioning Complete!"
echo " Docker Version: $(docker --version)"
echo "=========================================================="
