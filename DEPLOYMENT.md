# BookMe.kz - Deployment Guide

## 📋 Overview

BookMe.kz is a wedding invitation platform built with React 19, TypeScript, Express, tRPC, and Firebase Authentication. This guide will help you deploy the application to production.

## 🛠 Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS 4, Wouter (routing)
- **Backend**: Express 4, tRPC 11
- **Database**: MySQL/TiDB (via Drizzle ORM)
- **Authentication**: Firebase Auth (Email/Password + Google OAuth)
- **File Storage**: S3-compatible storage
- **Payment**: FreedomPay integration

## 📦 Prerequisites

Before deployment, ensure you have:

1. **Node.js** 22.x or later
2. **pnpm** package manager
3. **MySQL/TiDB** database
4. **Firebase** project with Authentication enabled
5. **S3-compatible storage** (AWS S3, Cloudflare R2, etc.)
6. **FreedomPay** merchant account (for payments)

## 🔐 Environment Variables

Create a `.env` file in the project root with the following variables:

```bash
# Database
DATABASE_URL=mysql://user:password@host:port/database

# JWT Secret (generate a random string)
JWT_SECRET=your-secret-key-here

# Firebase Configuration
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"..."}

# S3 Storage
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name
AWS_S3_ENDPOINT=https://s3.amazonaws.com  # Optional: for S3-compatible services

# FreedomPay
FREEDOMPAY_MERCHANT_ID=your-merchant-id
FREEDOMPAY_SECRET_KEY=your-secret-key

# Frontend Environment Variables (VITE_*)
VITE_APP_TITLE=BookMe.kz
VITE_APP_LOGO=https://your-cdn.com/logo.png
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

## 🚀 Installation Steps

### 1. Clone and Install Dependencies

```bash
# Install dependencies
pnpm install
```

### 2. Database Setup

```bash
# Push database schema
pnpm db:push

# This will create all necessary tables in your database
```

### 3. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing one
3. Enable **Authentication** → **Email/Password** and **Google** sign-in methods
4. Add your production domain to **Authorized domains** in Authentication settings
5. Download service account key:
   - Go to Project Settings → Service Accounts
   - Click "Generate new private key"
   - Copy the JSON content to `FIREBASE_SERVICE_ACCOUNT_KEY` environment variable

### 4. Build for Production

```bash
# Build both client and server
pnpm build

# This creates:
# - client/dist/ - Static frontend files
# - server/dist/ - Compiled server code
```

### 5. Start Production Server

```bash
# Start the server
NODE_ENV=production node server/dist/index.js

# Or use PM2 for process management:
pm2 start server/dist/index.js --name bookme-kz
pm2 save
pm2 startup
```

## 🌐 Deployment Options

### Option 1: VPS/Dedicated Server

1. Set up reverse proxy (Nginx/Apache) to forward requests to your Node.js server
2. Configure SSL certificate (Let's Encrypt recommended)
3. Set up PM2 for process management
4. Configure firewall rules

**Example Nginx configuration:**

```nginx
server {
    listen 80;
    server_name bookme.kz www.bookme.kz;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name bookme.kz www.bookme.kz;

    ssl_certificate /path/to/fullchain.pem;
    ssl_certificate_key /path/to/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Option 2: Docker Deployment

```dockerfile
FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install pnpm and dependencies
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build application
RUN pnpm build

# Expose port
EXPOSE 3000

# Start server
CMD ["node", "server/dist/index.js"]
```

**Docker Compose:**

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
      # ... other environment variables
    restart: unless-stopped
```

### Option 3: Platform as a Service (Heroku, Railway, Render)

Most PaaS platforms automatically detect Node.js applications. Ensure:

1. `package.json` has correct `start` script:
   ```json
   {
     "scripts": {
       "start": "node server/dist/index.js",
       "build": "pnpm build"
     }
   }
   ```

2. Set all environment variables in platform dashboard

3. Deploy via Git push or platform CLI

## 🔧 Post-Deployment Checklist

- [ ] Verify database connection
- [ ] Test Firebase authentication (Email/Password and Google OAuth)
- [ ] Test file upload functionality
- [ ] Verify payment integration with FreedomPay
- [ ] Check all wedding pages load correctly
- [ ] Test RSVP and wishlist features
- [ ] Verify email notifications (if configured)
- [ ] Set up monitoring and logging
- [ ] Configure backups for database
- [ ] Set up CDN for static assets (optional but recommended)

## 📊 Monitoring

Consider setting up:

- **Application monitoring**: PM2, New Relic, or Datadog
- **Error tracking**: Sentry
- **Uptime monitoring**: UptimeRobot, Pingdom
- **Database monitoring**: Built-in MySQL/TiDB monitoring tools

## 🔄 Updates and Maintenance

```bash
# Pull latest changes
git pull origin main

# Install new dependencies
pnpm install

# Run database migrations (if any)
pnpm db:push

# Rebuild application
pnpm build

# Restart server
pm2 restart bookme-kz
```

## 🆘 Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` format: `mysql://user:password@host:port/database`
- Check firewall rules allow connection to database port
- Ensure database user has proper permissions

### Firebase Authentication Not Working
- Verify all Firebase config variables are set correctly
- Check authorized domains in Firebase Console
- Ensure service account key JSON is properly formatted

### File Upload Failures
- Verify S3 credentials and bucket permissions
- Check CORS configuration on S3 bucket
- Ensure bucket is publicly accessible (for public files)

### Payment Issues
- Verify FreedomPay credentials
- Check merchant account is active
- Review FreedomPay API logs for errors

## 📞 Support

For technical support or questions:
- Telegram: [@bookmekz](https://t.me/bookmekz)
- Email: support@bookme.kz

## 📄 License

Proprietary - All rights reserved © 2025 BookMe.kz

