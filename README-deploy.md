# Deployment Guide for Sokal AI Generate

This document provides instructions for deploying the Sokal AI Generate application to a cloud provider like Hetzner Cloud.

## Prerequisites

- A server running Ubuntu 22.04 or later (recommended)
- Docker and Docker Compose installed on the server
- Domain name (optional but recommended for production)

## Deployment Options

### Option 1: Automated Deployment

The easiest way to deploy is using the provided deployment script:

1. Set the server IP as an environment variable:
   ```bash
   export SERVER_IP=your_server_ip
   ```

2. Run the deployment script:
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```

### Option 2: Manual Deployment

If you prefer to deploy manually:

1. Copy the necessary files to your server:
   ```bash
   # Create project directory
   ssh root@your_server_ip "mkdir -p /root/sokal-ai-generate"
   
   # Copy files
   scp docker-compose.yml .env .dockerignore root@your_server_ip:/root/sokal-ai-generate/
   scp -r backend frontend shared-types configs root@your_server_ip:/root/sokal-ai-generate/
   ```

2. SSH into your server and start the application:
   ```bash
   ssh root@your_server_ip
   cd /root/sokal-ai-generate
   docker-compose up -d
   ```

## Environment Variables

Make sure your `.env` file contains the following variables:

```
MONGO_USERNAME=your_mongo_username
MONGO_PASSWORD=your_secure_password
SERVER_PORT=4000
PORT=4000
JWT_SECRET=your_jwt_secret_key
JWT_ACCESS_SECRET=your_jwt_access_secret
JWT_REFRESH_SECRET=your_jwt_refresh_secret
OPENAI_API_KEY=your_openai_api_key
DB_URL=mongodb://your_mongo_username:your_secure_password@localhost:27018/sokal-ai-db?authSource=admin
FRONTEND_URL=http://localhost:80,http://frontend:3000
NODE_ENV=production
```

Additionally, ensure `frontend/.env.production` contains:
```
NEXT_PUBLIC_API_URL=http://backend:4000/api
```

## CI/CD with GitHub Actions

A GitHub Actions workflow is provided to automatically deploy your application when you push to the main branch. To use it:

1. Add the following secrets to your GitHub repository:
   - `SERVER_IP`: Your server's IP address (currently hardcoded to 157.180.25.1 in workflow)
   - `SSH_PRIVATE_KEY`: Your SSH private key
   - `SSH_KNOWN_HOSTS`: Output of `ssh-keyscan -H your_server_ip`
   - `MONGO_USERNAME`: MongoDB username
   - `MONGO_PASSWORD`: MongoDB password
   - `SERVER_PORT`: Server port (4000)
   - `JWT_SECRET`: JWT secret key
   - `JWT_ACCESS_SECRET`: JWT access token secret
   - `JWT_REFRESH_SECRET`: JWT refresh token secret
   - `OPENAI_API_KEY`: Your OpenAI API key

2. Push to the main branch to trigger a deployment

Note: The CI/CD workflow currently has a hardcoded server IP (157.180.25.1). If you're using a different server, update the IP in `.github/workflows/deploy.yml`.

## Docker Compose Configuration

The Docker Compose setup includes:

- MongoDB (exposed on port 27018)
- Backend (exposed on port 4001)
- Frontend (exposed on port 80)

## Domain Setup (Optional)

To use a custom domain:

1. Point your domain's A record to your server's IP address
2. Update the NextJS configuration if needed

## Troubleshooting

- Check container logs:
  ```bash
  docker logs [container_name]
  ```

- View all running containers:
  ```bash
  docker-compose ps
  ```

- Restart containers:
  ```bash
  docker-compose restart
  ``` 