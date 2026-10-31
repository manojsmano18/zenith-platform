#!/usr/bin/env bash
set -e

PUBLIC_IP=$(curl -s http://checkip.amazonaws.com || echo "YOUR-SERVER-IP")

echo "=========================================================="
echo " Starting ZENITH Platform + Jenkins CI/CD on AWS Cloud"
echo " Detected Server IP: ${PUBLIC_IP}"
echo "=========================================================="

# 1. Start Zenith Application (Spring Boot + React + NGINX)
echo "--> 1. Building and starting Zenith Application containers..."
docker compose up --build -d

# 2. Start Jenkins CI/CD Server
echo "--> 2. Starting Jenkins CI/CD container..."
docker compose -f docker-compose.jenkins.yml up --build -d

# 3. Wait for services to initialize
echo "--> 3. Verifying health..."
sleep 5

echo "=========================================================="
echo " ZENITH PLATFORM IS LIVE ON AWS CLOUD!"
echo "=========================================================="
echo " 🌐 Storefront URL:      http://${PUBLIC_IP}"
echo " 🛡️ Admin Portal:        http://${PUBLIC_IP}/admin"
echo " ⚙️ Jenkins CI/CD:       http://${PUBLIC_IP}:8082"
echo " 🔌 Spring Boot API:     http://${PUBLIC_IP}:8085/api/products"
echo "=========================================================="
echo "To get your Jenkins Admin Password, run:"
echo "docker exec zenith-jenkins cat /var/jenkins_home/secrets/initialAdminPassword"
echo "=========================================================="
