#!/usr/bin/env bash
set -e

TAG=${1:-latest}
DOCKER_USER=${2:-zenithadmin}

echo "=========================================================="
echo " Starting Zero-Downtime Deployment for ZENITH Platform"
echo " Deploying Image Tag: ${TAG}"
echo "=========================================================="

export BACKEND_IMAGE="${DOCKER_USER}/zenith-backend:${TAG}"
export FRONTEND_IMAGE="${DOCKER_USER}/zenith-frontend:${TAG}"

# Ensure upload storage directory exists on host
sudo mkdir -p /opt/zenith/uploads
sudo chmod -R 777 /opt/zenith/uploads

echo "--> 1. Pulling latest tagged images from Container Registry..."
docker compose -f docker-compose.prod.yml pull

echo "--> 2. Restarting production services with zero downtime..."
docker compose -f docker-compose.prod.yml up -d --remove-orphans

echo "--> 3. Waiting for Backend Health Check to pass..."
MAX_RETRIES=20
COUNT=0
until wget -q -O - http://localhost:8085/actuator/health | grep -q "UP" || [ $COUNT -eq $MAX_RETRIES ]; do
  echo "Waiting for Spring Boot to be healthy... ($((COUNT+1))/$MAX_RETRIES)"
  sleep 3
  COUNT=$((COUNT+1))
done

if [ $COUNT -eq $MAX_RETRIES ]; then
  echo "ERROR: Health check failed after deployment! Inspecting logs..."
  docker compose -f docker-compose.prod.yml logs --tail 50 backend
  exit 1
fi

echo "--> 4. Pruning dangling/old images to save cloud disk space..."
docker image prune -f

echo "=========================================================="
echo " SUCCESS: ZENITH Cloud Deployment complete with Tag ${TAG}!"
echo " Public Storefront is Live on port 80!"
echo "=========================================================="
