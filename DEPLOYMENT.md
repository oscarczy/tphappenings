# TPHappenings - Deployment & GitOps

## Architecture

```
┌──────────────────┐     ┌──────────────────┐     ┌─────────────┐
│  GitHub Repo     │────▶│  Render Services │────▶│  MongoDB    │
│  (Main Branch)   │     │  (Frontend+API)  │     │  Atlas      │
└──────────────────┘     └──────────────────┘     └─────────────┘
         │
         │ Push to main
         │
    ┌────▼────────────┐
    │ GitHub Actions  │
    │ (CI/CD)         │
    └─────────────────┘
```

## Technologies Used

- **Frontend**: React + Vite → Render Static Site
- **Backend**: Express.js → Render Web Service
- **Database**: MongoDB Atlas (cloud)
- **CI/CD**: GitHub Actions
- **Hosting**: Render (all-in-one)

## Deployment URLs

- **Frontend**: https://tphappenings-frontend.onrender.com
- **Backend**: https://tphappenings.onrender.com
- **GitHub**: https://github.com/oscarczy/tphappenings

## How It Works

### 1. Local Development
```bash
npm install
npm run dev        # Frontend on http://localhost:5173
node server.js     # Backend on http://localhost:5050
```

### 2. Push to GitHub
```bash
git add .
git commit -m "Your message"
git push origin main
```

### 3. GitHub Actions Runs
- Checks backend syntax (server.js)
- Builds frontend (npm run build)
- Generates `dist/` folder

### 4. Render Auto-Deploys
- **tphappenings-frontend** (Static Site): Serves `dist/` folder
- **tphappenings** (Web Service): Runs `node server.js`

### 5. Result
- New code live within 2-3 minutes
- Previous version stays active if deployment fails
- Zero downtime as a result

## Environment Variables

### Render - Frontend (Static Site)
```
VITE_API_URL=https://tphappenings.onrender.com
```

### Render - Backend (Web Service)
```
MONGODB_URI=mongodb+srv://...
NODE_ENV=production
PORT=5050
```

## Monitoring Deployments

### Check Status
1. **GitHub**: Actions tab shows workflow status (green/red)
2. **Render**: Dashboard shows deployment logs
3. **Email**: GitHub notifies on workflow failures

### If Deployment Fails

**Frontend Build Failed**:
- Check Render logs for build errors
- Previous version stays live
- Fix code locally, push to main

**Backend Deploy Failed**:
- Render keeps previous deployment active
- Check error logs
- Fix code, push to main

### Rollback

```bash
# Via Git (reverses to previous commit)
git revert HEAD
git push origin main
```

Render automatically redeploys with the reverted code.

## Performance Notes

- **Cold starts**: First request after 15 min inactivity may take 5-10s on free tier
- **Builds**: Frontend builds take 1-2 minutes
- **Database**: MongoDB Atlas free tier has limits (512MB storage)

## Future Improvements

- Add automated testing (Jest, Supertest)
- Deploy to production and staging environments
- Set up database backups

---