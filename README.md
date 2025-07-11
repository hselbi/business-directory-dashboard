# Business Intelligence Platform - Deployment Guide

## 🚀 Quick Deploy to Vercel

### Prerequisites
- GitHub account
- Vercel account (free tier works fine)
- Node.js 18+ installed locally

## 📋 Step-by-Step Deployment

### 1. **Setup Repository**
```bash
# Clone your repository
git clone https://github.com/your-username/business-intelligence-platform.git
cd business-intelligence-platform

# Install dependencies
npm install
```

### 2. **Create Vercel Project**

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository
4. Configure project settings:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next` (default)

### 3. **Setup Environment Variables**

#### In Vercel Dashboard:
1. Go to your project → Settings → Environment Variables
2. Add these variables:

| Name | Value | Environment |
|------|-------|-------------|
| `JWT_SECRET` | `your-generated-secret` | Production, Preview, Development |
| `NODE_ENV` | `production` | Production |

#### Generate JWT Secret:
```bash
# Run this command to generate a secure JWT secret
npm run generate-jwt-secret
```

### 4. **Setup GitHub Secrets**

Go to your GitHub repository → Settings → Secrets and variables → Actions

Add these secrets:

| Secret Name | How to Get |
|-------------|------------|
| `VERCEL_TOKEN` | Vercel Dashboard → Settings → Tokens → Create |
| `VERCEL_ORG_ID` | Vercel Dashboard → Settings → General → Copy Team ID |
| `VERCEL_PROJECT_ID` | Project Settings → General → Copy Project ID |
| `JWT_SECRET` | Same as Vercel environment variable |

### 5. **Deploy**

#### Option A: Automatic (Recommended)
```bash
# Push to main branch - GitHub Actions will deploy automatically
git add .
git commit -m "Initial deployment setup"
git push origin main
```

#### Option B: Manual Deploy
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to production
npm run deploy

# Or deploy preview
npm run deploy:preview
```

## 🔧 Configuration Files

### Required Files (already created):
- `vercel.json` - Vercel configuration
- `.github/workflows/deploy.yml` - GitHub Actions workflow
- `.env.example` - Environment variables template

## 🚦 Deployment Features

### ✅ **Automatic Deployments**
- **Production**: Deploys on push to `main` branch
- **Preview**: Deploys on pull requests
- **Comments**: Adds deployment URLs to PR comments

### ✅ **Quality Checks**
- ESLint code linting
- TypeScript type checking
- Build verification
- Automated testing

### ✅ **Environment Management**
- Separate preview and production environments
- Secure environment variable handling
- Production-optimized builds

## 🌐 Access Your Deployed App

After deployment, your app will be available at:
- **Production**: `https://your-project-name.vercel.app`
- **Custom Domain**: Configure in Vercel Dashboard → Domains

## 🔒 Production Security

### Environment Variables:
```bash
# Production JWT Secret (generate new one)
JWT_SECRET=<your-super-secure-64-character-secret>

# Ensure production mode
NODE_ENV=production
```

### Default Test Accounts:
- **Admin**: `admin@businessintel.com` / `admin123`
- **Developer**: `developer@example.com` / `developer123`
- **Test**: `test@test.com` / `test123`

## 🐛 Troubleshooting

### Common Issues:

#### Build Failures:
```bash
# Check build locally
npm run build
npm run type-check
```

#### Environment Variables:
- Verify all required secrets are set in GitHub
- Check Vercel environment variables
- Ensure JWT_SECRET is set

#### API Routes:
- Check Vercel function logs in dashboard
- Verify API routes work locally: `npm run dev`

### Vercel Logs:
1. Go to Vercel Dashboard
2. Select your project
3. Click "Functions" tab
4. View real-time logs

## 📊 Monitoring

### Vercel Analytics (Optional):
1. Go to project settings
2. Enable Analytics
3. Monitor performance and usage

### GitHub Actions Status:
- Check workflow status in repository Actions tab
- View deployment history and logs

## 🔄 Updates

### Deploy Updates:
```bash
# Make changes
git add .
git commit -m "Your update message"
git push origin main
# GitHub Actions automatically deploys
```

### Rollback:
- Use Vercel Dashboard → Deployments → Promote previous deployment
- Or revert Git commits and push

## 🎯 Production Checklist

- [ ] JWT_SECRET set and secure
- [ ] All GitHub secrets configured
- [ ] Build passes locally
- [ ] Environment variables set in Vercel
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active (automatic)
- [ ] Analytics enabled (optional)

## 📞 Support

If you encounter issues:
1. Check Vercel deployment logs
2. Review GitHub Actions workflow results
3. Test build locally with `npm run build`
4. Verify all environment variables are set