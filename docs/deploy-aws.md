# AWS EC2 Deployment Guide (Free Tier)

This guide provides a step-by-step process to deploy the AI Agent with MCP project on a single **AWS EC2 t2.micro** (Free Tier) instance using Ubuntu 22.04.

![AWS EC2 Badge](file:///C:/Users/marti/.gemini/antigravity/brain/24307690-1931-4500-8dea-8272b93e93f5/uploaded_image_1767324120977.png)

## 1. Launch EC2 Instance

1.  Log in to AWS Console and navigate to **EC2**.
2.  Click **Launch Instance**.
3.  **Name**: `AI-Agent-Host`.
4.  **AMI**: `Ubuntu 22.04 LTS (HVM), SSD Volume Type`.
5.  **Instance Type**: `t2.micro` (Free Tier eligible).
6.  **Key Pair**: Create or select an existing `.pem` or `.ppk` key.
7.  **Network Settings (Security Group)**:
    - Allow SSH (Port 22) from your IP.
    - Allow HTTP (Port 80) from anywhere.
    - Allow Custom TCP (Port 3000) for Orchestrator.
    - Allow Custom TCP (Port 3001) for Org Tooling.
    - Allow Custom TCP (Port 3002) for RAG.

## 2. Server Environment Setup

Connect to your instance via SSH:

```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
```

Update and install Node.js (v18+):

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify versions
node -v
npm -v
```

## 3. Clone and Install Dependencies

```bash
# Clone the repository
git clone https://github.com/martin-ram2010/AI-Agent.git
cd AI-Agent

# Install main project dev dependencies
npm install

# Install dependencies for all packages
cd packages/conversation-orchestrator && npm install
cd ../rag-service && npm install
cd ../org-tooling-service && npm install
```

## 4. Configuration (.env files)

You must create `.env` files for each service. Use `nano`:

### Conversation Orchestrator (`packages/conversation-orchestrator/.env`)

```bash
PORT=3000
LLM_PROVIDER=openai
LLM_API_KEY=your_key_here
LLM_MODEL=gpt-4-turbo
RAG_SERVICE_URL=http://localhost:3002
ORG_SERVICE_URL=http://localhost:3001
```

### RAG Service (`packages/rag-service/.env`)

```bash
PORT=3002
LLM_API_KEY=your_key_here
```

### Org Tooling Service (`packages/org-tooling-service/.env`)

```bash
PORT=3001
SF_LOGIN_URL=https://login.salesforce.com
SF_CLIENT_ID=your_client_id
SF_USERNAME=your_username
SF_PRIVATE_KEY_PATH=./server.key
```

## 5. Process Management (PM2)

Use PM2 to keep your services running in the background:

```bash
sudo npm install -g pm2

# Start all services
cd packages/conversation-orchestrator && pm2 start src/server.ts --name orchestrator --interpreter ts-node
cd ../rag-service && pm2 start src/server.ts --name rag --interpreter ts-node
cd ../org-tooling-service && pm2 start src/server.ts --name org-tooling --interpreter ts-node

# Save PM2 state for reboots
pm2 save
pm2 startup
```

## 6. Frontend Deployment (Nginx)

The `agent-ui` is a static web app. Use Nginx to serve it:

```bash
sudo apt install nginx -y

# Copy UI files to Nginx web root
sudo cp -r packages/agent-ui/* /var/www/html/

# Update UI config
# IMPORTANT: In your js files (index.js, admin.js),
# change 127.0.0.1:3000 to YOUR_EC2_PUBLIC_IP:3000
```

## 7. Verification

1.  Open your browser to `http://your-ec2-public-ip`.
2.  Click **"Admin Logs"** to verify the backend connection.

> [!IMPORTANT]
> This setup uses HTTP. For a production environment, you should use **Certbot** for SSL (HTTPS) and configure Nginx as a reverse proxy for ports 3000-3002.
