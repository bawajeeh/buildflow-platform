# BuildFlow Project Structure

## 📁 Directory Overview

```
buildflow-platform/
├── frontend/              # React + Vite frontend (Builder UI)
├── backend/               # Node.js + Express API server
├── admin-dashboard/       # Admin management dashboard
├── shared/                # Shared types and utilities
├── docs/                  # Project documentation
├── scripts/               # Utility scripts
└── .github/               # GitHub Actions workflows
```

## 🎯 Core Applications

### Frontend (`frontend/`)
- **Purpose**: Main drag & drop website builder interface
- **Tech**: React 18, TypeScript, Vite, Tailwind CSS
- **Deployment**: Vercel (`app.ain90.online`)
- **Key Features**:
  - Drag & drop builder
  - Real-time preview
  - Responsive design tools
  - Component library

### Backend (`backend/`)
- **Purpose**: REST API and business logic
- **Tech**: Node.js, Express, TypeScript, Prisma, PostgreSQL
- **Deployment**: Render (`api.ain90.online`)
- **Key Features**:
  - Authentication (JWT)
  - Website/page/element CRUD
  - Real-time collaboration (Socket.io)
  - File uploads
  - Analytics

### Admin Dashboard (`admin-dashboard/`)
- **Purpose**: Platform administration interface
- **Tech**: React 18, TypeScript, Vite
- **Deployment**: Vercel (optional, `admin.ain90.online`)
- **Key Features**:
  - User management
  - Website analytics
  - System settings

## 📚 Documentation (`docs/`)

- **README.md**: Comprehensive project documentation
- **DEPLOY_RENDER_VERCEL.md**: Deployment guide for Render + Vercel
- **GITHUB_SECRETS.md**: GitHub Actions secrets setup
- **ENV_EXAMPLES.md**: Environment variable examples
- **API.md**: API endpoint documentation
- **ARCHITECTURE.md**: System architecture details
- **COMPONENTS.md**: Component library documentation
- **ENDPOINTS.md**: API endpoints reference

## 🔧 Configuration Files

### Root Level
- `README.md`: Main project README
- `LICENSE`: MIT License
- `package.json`: Root package.json (if any workspace setup)
- `.editorconfig`: Code formatting standards

### Frontend
- `vercel.json`: Vercel deployment configuration
- `vite.config.ts`: Vite build configuration
- `tailwind.config.js`: Tailwind CSS configuration
- `tsconfig.json`: TypeScript configuration

### Backend
- `env.example`: Environment variable template
- `prisma/schema.prisma`: Database schema
- `tsconfig.json`: TypeScript configuration

## 🚀 Deployment

### Production URLs
- **Frontend**: `https://app.ain90.online`
- **Backend API**: `https://api.ain90.online`
- **Admin**: `https://admin.ain90.online` (if deployed)

### Deployment Platforms
- **Frontend & Admin**: Vercel
- **Backend**: Render (PostgreSQL + Web Service)
- **CI/CD**: GitHub Actions

## 📝 Scripts

- `scripts/deploy-check.sh`: Health check script for API

## 🔒 Security & Secrets

All sensitive configuration is managed via:
- **Render**: Environment variables in dashboard
- **Vercel**: Environment variables in project settings
- **GitHub**: Repository secrets for CI/CD

See `docs/GITHUB_SECRETS.md` for required secrets.

## 🧹 Cleanup Status

- ✅ Removed Docker files (using Render/Vercel)
- ✅ Removed Kubernetes manifests (using Render/Vercel)
- ✅ Removed temporary documentation files
- ✅ Removed legacy deployment scripts
- ✅ Organized documentation in `docs/` folder

## 🎯 Next Steps

1. **Development**: Use `npm run dev` in frontend/backend folders
2. **Deployment**: Follow `docs/DEPLOY_RENDER_VERCEL.md`
3. **Testing**: Run tests locally before pushing
4. **Documentation**: Keep docs/ folder updated

