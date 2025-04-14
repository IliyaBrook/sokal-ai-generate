#!/bin/bash

# Script for deploying the application to Hetzner Cloud

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting deployment...${NC}"

# Check if .env file exists
if [ ! -f .env ]; then
  echo -e "${RED}Error: .env file not found in the root directory${NC}"
  exit 1
fi

# Check if frontend/.env.production exists
if [ ! -f frontend/.env.production ]; then
  echo -e "${GREEN}Creating frontend/.env.production...${NC}"
  echo "NEXT_PUBLIC_API_URL=http://backend:4000/api" > frontend/.env.production
fi

# Check server connection
if [ -z "$SERVER_IP" ]; then
  echo -e "${RED}Error: server IP address not specified${NC}"
  echo -e "Enter your server IP: "
  read SERVER_IP
fi

echo -e "${GREEN}Copying files to the server...${NC}"

# Create project directory on the server (if it doesn't exist)
ssh root@$SERVER_IP "mkdir -p /root/sokal-ai-generate"

# Copy necessary files
scp docker-compose.yml .env .dockerignore root@$SERVER_IP:/root/sokal-ai-generate/
scp -r backend frontend shared-types configs root@$SERVER_IP:/root/sokal-ai-generate/

echo -e "${GREEN}Starting containers on the server...${NC}"

# Run docker-compose on the server
ssh root@$SERVER_IP "cd /root/sokal-ai-generate && docker-compose down && docker-compose up -d"

echo -e "${GREEN}Deployment successfully completed!${NC}"
echo -e "Application is available at: http://$SERVER_IP" 