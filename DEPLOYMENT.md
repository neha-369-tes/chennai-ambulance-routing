# 🚀 Deployment Guide - Chennai Emergency Ambulance Routing System

This guide covers various deployment options for the Chennai Emergency Ambulance Routing System.

## 📋 Prerequisites

- Node.js 18+ installed
- Git configured
- Access to deployment platform of choice
- Environment variables configured

## 🔧 Environment Setup

Create a `.env` file in your project root:

```env
# Server Configuration
NODE_ENV=production
PORT=3000

# N8N Integration (Optional)
N8N_API_KEY=your-secure-api-key-here
N8N_WEBHOOK_SECRET=your-webhook-secret-here

# Database (if using external database)
DATABASE_URL=your-database-url

# Security
SESSION_SECRET=your-session-secret
```

## 🐳 Docker Deployment

### Build Docker Image

```bash
# Build the image
docker build -t chennai-ambulance-routing .

# Run the container
docker run -p 3000:3000 --env-file .env chennai-ambulance-routing
```

### Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'
services:
  chennai-ems:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
    restart: unless-stopped
    volumes:
      - ./data:/app/data
```

Run with:
```bash
docker-compose up -d
```

## ☁️ Cloud Platform Deployment

### Vercel Deployment

1. **Install Vercel CLI**
```bash
npm i -g vercel
```

2. **Deploy**
```bash
vercel --prod
```

3. **Configure Environment Variables**
```bash
vercel env add NODE_ENV production
vercel env add PORT 3000
```

### Netlify Deployment

1. **Build Command**
```bash
npm run build
```

2. **Publish Directory**
```
dist
```

3. **Environment Variables**
Add in Netlify dashboard:
- `NODE_ENV=production`
- `PORT=3000`

### Railway Deployment

1. **Connect Repository**
- Connect your GitHub repository to Railway
- Railway will auto-detect Node.js project

2. **Environment Variables**
Add in Railway dashboard:
- `NODE_ENV=production`
- `PORT=3000`

3. **Deploy**
Railway will automatically deploy on push to main branch.

### Heroku Deployment

1. **Install Heroku CLI**
```bash
curl https://cli-assets.heroku.com/install.sh | sh
```

2. **Login and Create App**
```bash
heroku login
heroku create chennai-ambulance-routing
```

3. **Set Environment Variables**
```bash
heroku config:set NODE_ENV=production
heroku config:set PORT=3000
```

4. **Deploy**
```bash
git push heroku main
```

## 🐙 GitHub Actions Deployment

### Automated Deployment

The included GitHub Actions workflow will:

1. **Test** on multiple Node.js versions
2. **Build** the project
3. **Security audit** dependencies
4. **Deploy** to preview environments

### Manual Deployment

```bash
# Build for production
npm run build

# Start production server
npm start
```

## 🔒 Security Considerations

### Production Security

1. **HTTPS Only**
```bash
# Force HTTPS redirect
app.use((req, res, next) => {
  if (req.header('x-forwarded-proto') !== 'https') {
    res.redirect(`https://${req.header('host')}${req.url}`);
  } else {
    next();
  }
});
```

2. **Rate Limiting**
```bash
npm install express-rate-limit
```

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use(limiter);
```

3. **CORS Configuration**
```javascript
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true
}));
```

4. **Helmet Security**
```bash
npm install helmet
```

```javascript
const helmet = require('helmet');
app.use(helmet());
```

## 📊 Monitoring & Logging

### Application Monitoring

1. **Health Check Endpoint**
```javascript
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});
```

2. **Error Logging**
```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

### Performance Monitoring

1. **Response Time Monitoring**
```javascript
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
  });
  next();
});
```

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

The included `.github/workflows/ci.yml` provides:

- **Multi-version testing** (Node.js 18.x, 20.x)
- **Type checking** with TypeScript
- **Build verification**
- **Security audits**
- **Automated deployment**

### Custom Deployment Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "deploy:staging": "NODE_ENV=staging npm run build && npm start",
    "deploy:production": "NODE_ENV=production npm run build && npm start",
    "health:check": "curl -f http://localhost:3000/health || exit 1"
  }
}
```

## 🚨 Emergency Deployment

### Quick Emergency Fix Deployment

```bash
# Emergency hotfix deployment
git checkout -b emergency-fix
# Make emergency changes
git commit -m "emergency: critical fix for emergency routing"
git push origin emergency-fix
# Create emergency PR and merge
```

### Rollback Procedure

```bash
# Rollback to previous version
git revert HEAD
git push origin main

# Or rollback to specific commit
git revert <commit-hash>
git push origin main
```

## 📱 Mobile Deployment

### Progressive Web App (PWA)

1. **Add PWA Manifest**
```json
{
  "name": "Chennai Emergency Dispatch",
  "short_name": "Chennai EMS",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#000000",
  "theme_color": "#dc2626"
}
```

2. **Service Worker**
```javascript
// Register service worker for offline functionality
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}
```

## 🔍 Troubleshooting

### Common Issues

1. **Port Already in Use**
```bash
# Find process using port
lsof -i :3000
# Kill process
kill -9 <PID>
```

2. **Memory Issues**
```bash
# Increase Node.js memory limit
node --max-old-space-size=4096 dist/index.js
```

3. **Database Connection Issues**
```bash
# Check database connectivity
npm run db:check
```

### Performance Optimization

1. **Enable Compression**
```bash
npm install compression
```

```javascript
const compression = require('compression');
app.use(compression());
```

2. **Caching Headers**
```javascript
app.use(express.static('public', {
  maxAge: '1h',
  etag: true
}));
```

## 📞 Support

For deployment issues:

1. **Check logs**: `docker logs <container-id>` or platform logs
2. **Verify environment**: Ensure all environment variables are set
3. **Test locally**: Run `npm run build && npm start` locally
4. **Check dependencies**: Ensure all dependencies are installed

---

**⚠️ Important**: This system is used for emergency medical dispatch. Ensure high availability and quick response times in production deployment.
