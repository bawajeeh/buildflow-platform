# ✅ Vercel Setup for ain90.online

## 🎯 Environment Variable

**Add this in Vercel:**

Key: `VITE_API_URL`
Value: `https://buildflow-platform.onrender.com`

**Steps:**
1. Go to: https://vercel.com/dashboard
2. Click your frontend project
3. Settings → Environment Variables
4. Add: `VITE_API_URL = https://buildflow-platform.onrender.com`
5. Click "Save"
6. Go to Deployments
7. Click "..." → "Redeploy"

---

## ✅ Already Done in Code

Files already updated:
- ✅ `frontend/src/config/api.ts` - API URL configured
- ✅ `frontend/src/services/realTimeService.ts` - Socket URL configured
- ✅ All use environment variable or fallback to Render

---

## 🚀 After Setting Environment Variable

1. Vercel redeploys (2 min)
2. Domain configured: ✅ ain90.online
3. SSL enabled: ✅
4. API connected: ✅

**Your site will be live!**

