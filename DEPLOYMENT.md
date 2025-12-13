# Deployment Guide - Fly.io

This guide will help you deploy the RamSoft React Task Board to Fly.io.

## Prerequisites

1. **Install Fly CLI**
   ```bash
   # Windows (PowerShell)
   iwr https://fly.io/install.ps1 -useb | iex

   # macOS/Linux
   curl -L https://fly.io/install.sh | sh
   ```

2. **Sign up / Login to Fly.io**
   ```bash
   fly auth signup
   # or
   fly auth login
   ```

## Deployment Steps

### 1. Initialize Fly App (First Time Only)

```bash
# This will create/update fly.toml
fly launch --no-deploy
```

When prompted:
- **App name**: Press Enter to use `ramsoft-react-task-board` or choose your own
- **Region**: Choose the region closest to you (default: iad - Ashburn, Virginia)
- **Would you like to set up a Postgresql database?**: No
- **Would you like to set up an Upstash Redis database?**: No
- **Would you like to deploy now?**: No

### 2. Deploy the Application

```bash
fly deploy
```

This will:
- Build the Docker image
- Push it to Fly.io
- Deploy your application
- Provide you with a URL (e.g., https://ramsoft-react-task-board.fly.dev)

### 3. Open Your Application

```bash
fly open
```

## Useful Commands

### View Application Status
```bash
fly status
```

### View Logs
```bash
fly logs
```

### SSH into the Container
```bash
fly ssh console
```

### Scale the Application
```bash
# Scale to 1 machine with 512MB RAM
fly scale memory 512

# Scale to 2 machines
fly scale count 2
```

### Update Environment Variables
```bash
fly secrets set MY_SECRET=value
```

### View Deployed Apps
```bash
fly apps list
```

### Destroy the App
```bash
fly apps destroy ramsoft-react-task-board
```

## Configuration Files

- **fly.toml**: Fly.io configuration
- **Dockerfile**: Multi-stage Docker build (Node.js build + Nginx serve)
- **nginx.conf**: Nginx configuration for serving React SPA
- **.dockerignore**: Files to exclude from Docker build

## Architecture

The deployment uses a **multi-stage Docker build**:

1. **Build Stage**: Uses Node.js 18 Alpine to build the React app
2. **Production Stage**: Uses Nginx Alpine to serve the static files

This results in a small, efficient production image (~25MB).

## Features

- ✅ Auto-scaling (scales to 0 when not in use)
- ✅ HTTPS enabled by default
- ✅ Health checks configured
- ✅ Gzip compression
- ✅ Static asset caching
- ✅ React Router support (SPA routing)
- ✅ Security headers

## Troubleshooting

### Build Fails
```bash
# Check build logs
fly logs

# Try building locally first
docker build -t ramsoft-task-board .
docker run -p 8080:8080 ramsoft-task-board
```

### App Not Responding
```bash
# Check app status
fly status

# View logs
fly logs

# Restart the app
fly apps restart ramsoft-react-task-board
```

### Update App Name
Edit `fly.toml` and change the `app` value, then:
```bash
fly deploy
```

## Cost

Fly.io offers a **free tier** that includes:
- Up to 3 shared-cpu-1x 256MB VMs
- 160GB outbound data transfer

This app is configured to use minimal resources and auto-scale to 0 when not in use, keeping it within the free tier.

## Custom Domain (Optional)

To use a custom domain:

```bash
# Add certificate
fly certs add yourdomain.com

# Follow the instructions to add DNS records
fly certs show yourdomain.com
```

## CI/CD with GitHub Actions (Optional)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Fly.io

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: superfly/flyctl-actions/setup-flyctl@master
      - run: flyctl deploy --remote-only
        env:
          FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}
```

Get your API token: `fly auth token`
Add it to GitHub Secrets as `FLY_API_TOKEN`

## Support

- Fly.io Docs: https://fly.io/docs/
- Fly.io Community: https://community.fly.io/

