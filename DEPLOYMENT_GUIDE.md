# GitLab Clone - Deployment Guide

## 🚀 Quick Start

### Development Environment

1. **Clone and Setup**
   ```bash
   git clone <your-repo>
   cd gitlab-clone
   npm install
   cd client && npm install && cd ..
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```
   This starts both backend (port 5000) and frontend (port 3000)

3. **Access Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/api

### Production Deployment

#### Option 1: Single Server Deployment

1. **Build the Application**
   ```bash
   npm run build
   ```

2. **Start Production Server**
   ```bash
   NODE_ENV=production npm start
   ```

#### Option 2: Heroku Deployment

1. **Prepare for Heroku**
   ```bash
   heroku create your-gitlab-clone
   heroku config:set JWT_SECRET=your-super-secret-key
   heroku config:set NODE_ENV=production
   ```

2. **Deploy**
   ```bash
   git push heroku main
   ```

#### Option 3: Docker Deployment

1. **Create Dockerfile**
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm install
   COPY . .
   RUN npm run build
   EXPOSE 5000
   CMD ["npm", "start"]
   ```

2. **Build and Run**
   ```bash
   docker build -t gitlab-clone .
   docker run -p 5000:5000 -e JWT_SECRET=your-secret gitlab-clone
   ```

## 📱 Progressive Web App Installation

### For Users (Android)

1. **Chrome Browser Installation**
   - Open the app in Chrome on Android
   - Tap the menu (three dots)
   - Select "Add to Home Screen" or "Install App"
   - Follow the prompts

2. **Manual Installation Prompt**
   - The app will show an installation banner
   - Tap "Install" when prompted
   - App will be added to home screen

### Features Available Offline
- View cached projects
- Browse repository files (cached)
- View issues (cached)
- Basic navigation

## 🔧 Configuration

### Environment Variables

Create `.env` file in root directory:

```env
NODE_ENV=production
PORT=5000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

### Frontend Configuration

For production, update `client/src/utils/api.js`:

```javascript
const API_URL = process.env.REACT_APP_API_URL || 'https://your-domain.com/api';
```

### SSL/HTTPS Configuration

For PWA functionality, HTTPS is required in production:

```javascript
// server.js - Add HTTPS support
const https = require('https');
const fs = require('fs');

const options = {
  key: fs.readFileSync('path/to/private-key.pem'),
  cert: fs.readFileSync('path/to/certificate.pem')
};

https.createServer(options, app).listen(443, () => {
  console.log('HTTPS server running on port 443');
});
```

## 🎯 First-Time Setup

### Admin User Creation

1. **First User Registration**
   - The first user to register becomes an admin automatically
   - Access registration at `/register`
   - Fill in user details and create account

2. **Initial Project Setup**
   - Create your first project from the dashboard
   - Set up repository structure
   - Add team members if needed

### Default Credentials

- **No default credentials** - you must register the first user
- First registered user gets admin privileges
- Subsequent users are regular users

## 🔄 Data Management

### Data Storage

- **User Data**: `data/users.json`
- **Projects**: `data/projects.json`
- **Issues**: `data/issues.json`
- **Repositories**: `data/repositories/`

### Backup Strategy

```bash
# Backup data directory
tar -czf backup-$(date +%Y%m%d).tar.gz data/

# Restore from backup
tar -xzf backup-20240101.tar.gz
```

### Migration to Database

For production use, consider migrating to a database:

1. **PostgreSQL Setup**
   ```bash
   npm install pg sequelize
   ```

2. **Update data layer**
   Replace JSON file operations with database queries

## 🚨 Security Considerations

### Production Security

1. **Change JWT Secret**
   ```bash
   export JWT_SECRET=$(openssl rand -base64 32)
   ```

2. **Enable HTTPS**
   - Required for PWA functionality
   - Use Let's Encrypt for free SSL certificates

3. **Set Up Firewall**
   ```bash
   # Allow only necessary ports
   ufw allow 22    # SSH
   ufw allow 80    # HTTP
   ufw allow 443   # HTTPS
   ufw enable
   ```

4. **Regular Updates**
   ```bash
   npm audit fix
   npm update
   ```

## 📊 Monitoring

### Application Monitoring

1. **Logs**
   ```bash
   # View application logs
   tail -f logs/app.log
   
   # Monitor with PM2
   npm install -g pm2
   pm2 start server.js --name gitlab-clone
   pm2 logs gitlab-clone
   ```

2. **Health Checks**
   ```bash
   # Simple health check endpoint
   curl http://localhost:5000/api/health
   ```

### Performance Optimization

1. **Enable Compression**
   ```javascript
   const compression = require('compression');
   app.use(compression());
   ```

2. **Static File Caching**
   ```javascript
   app.use(express.static('client/build', {
     maxAge: '1y',
     etag: false
   }));
   ```

## 🔧 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   lsof -ti:5000 | xargs kill -9
   ```

2. **Build Failures**
   ```bash
   rm -rf node_modules client/node_modules
   npm install
   cd client && npm install
   ```

3. **PWA Not Installing**
   - Ensure HTTPS is enabled
   - Check service worker registration
   - Verify manifest.json is accessible

4. **File Upload Issues**
   ```bash
   # Check permissions
   chmod 755 data/uploads
   ```

### Logs and Debugging

```bash
# Enable debug mode
DEBUG=* npm start

# Check specific logs
tail -f ~/.pm2/logs/gitlab-clone-out.log
tail -f ~/.pm2/logs/gitlab-clone-error.log
```

## 🆙 Updates and Maintenance

### Updating the Application

```bash
# Pull latest changes
git pull origin main

# Update dependencies
npm update
cd client && npm update && cd ..

# Rebuild frontend
npm run build

# Restart application
pm2 restart gitlab-clone
```

### Database Maintenance

```bash
# Clean up old data (if needed)
find data/uploads -mtime +30 -delete

# Backup before updates
./scripts/backup.sh
```

---

**Need Help?** Check the main README.md for detailed feature documentation or create an issue in the repository.