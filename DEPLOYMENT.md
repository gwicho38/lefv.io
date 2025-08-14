# Deployment Guide

## DigitalOcean Deployment Setup

This guide covers setting up automated deployment from GitHub to your DigitalOcean droplet.

### Prerequisites

- DigitalOcean droplet with Ubuntu
- GitHub repository with Actions enabled
- Domain name pointing to your droplet (optional but recommended)

### Step 1: Server Setup

SSH into your DigitalOcean droplet and run the following commands:

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install nginx
sudo apt install nginx -y
sudo systemctl enable nginx
sudo systemctl start nginx

# Allow nginx through firewall
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw --force enable

# Add the public key to authorized_keys
mkdir -p ~/.ssh
echo "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIHdT5maEyC5so5ZiGnB0KTM/CfjZpmcx2y8YOfrggaSS github-actions@lefv.io" >> ~/.ssh/authorized_keys
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

### Step 2: GitHub Secrets Configuration

Add the following secrets to your GitHub repository (Settings → Secrets and variables → Actions):

1. **DIGITALOCEAN_SSH_KEY_B64**: The private SSH key encoded in base64 (to avoid GitHub Secrets formatting issues)
   ```
   LS0tLS1CRUdJTiBPUEVOU1NIIFBSSVZBVEUgS0VZLS0tLS0KYjNCbGJuTnphQzFyWlhrdGRqRUFBQUFBQkc1dmJtVUFBQUFFYm05dVpRQUFBQUFBQUFBQkFBQUFNd0FBQUF0emMyZ3RaVwpReU5UVXhPUUFBQUNCM1UrWm1oTWd1YktPV1locHdkQ2t6UHduNDJhWm5NZHN2R0RuNjRJR2trZ0FBQUtCL1hOWHlmMXpWCjhnQUFBQXR6YzJndFpXUXlOVFV4T1FBQUFDQjNVK1ptaE1ndWJLT1dZaHB3ZENrelB3bjQyYVpuTWRzdkdEbjY0SUdra2cKQUFBRUJKU21EdTB4c0I3Mnh1M2lsdG9nc0JBR3Z1QXF1YUFUN2lFc1QvNWNDaUZIZFQ1bWFFeUM1c281WmlHbkIwS1RNLwpDZmpacG1jeDJ5OFlPZnJnZ2FTU0FBQUFGbWRwZEdoMVlpMWhZM1JwYjI1elFHeGxabll1YVc4QkFnTUVCUVlICi0tLS0tRU5EIE9QRU5TU0ggUFJJVkFURSBLRVktLS0tLQo=
   ```

2. **SUPABASE_POSTGRES_URL**: Your Supabase database connection string
3. **SUPABASE_URL**: Your Supabase project URL
4. **SUPABASE_ANON_KEY**: Your Supabase anonymous key
5. **SUPABASE_JWT_SECRET**: Your Supabase JWT secret (for server-side operations)
6. **OPENWEATHER_API_KEY**: Your OpenWeatherMap API key (optional)

### Step 3: Deploy

1. Push changes to the `release` branch
2. GitHub Actions will automatically:
   - Run tests
   - Build the application
   - Deploy to your DigitalOcean droplet
   - Configure nginx reverse proxy
   - Start the application with PM2

### Step 4: Domain Configuration (Optional)

If you have a domain name, update the nginx configuration:

```bash
sudo nano /etc/nginx/sites-available/lefv_io
```

Replace `lefv.io www.lefv.io` with your actual domain name.

### Deployment Process

The CI/CD pipeline will:

1. **Test**: Run all unit and integration tests
2. **Build**: Create production build artifacts
3. **Deploy**: 
   - Copy files to DigitalOcean droplet
   - Install dependencies
   - Configure environment variables
   - Start application with PM2
   - Configure nginx reverse proxy

### Monitoring

After deployment, you can monitor your application:

```bash
# Check PM2 status
pm2 status

# View application logs
pm2 logs lefv_io

# Check nginx status
sudo systemctl status nginx

# View nginx access logs
sudo tail -f /var/log/nginx/access.log
```

### Rollback

In case of issues, previous deployments are backed up:

```bash
# List backup directories
ls -la /var/www/lefv_io_backup_*

# Rollback to previous version
sudo systemctl stop nginx
pm2 stop lefv_io
rm -rf /var/www/lefv_io
mv /var/www/lefv_io_backup_YYYYMMDD_HHMMSS /var/www/lefv_io
cd /var/www/lefv_io
pm2 start index.js --name "lefv_io"
sudo systemctl start nginx
```

### Troubleshooting

Common issues and solutions:

1. **SSH Connection Failed**: Verify SSH key is correctly added to GitHub secrets
2. **Build Failed**: Check build logs in GitHub Actions
3. **Application Won't Start**: Check PM2 logs and environment variables
4. **502 Bad Gateway**: Verify application is running on port 3000

For support, check the GitHub Actions logs and server logs.# Deployment Test
# Testing deployment after SSH setup
