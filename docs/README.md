# BuildFlow - Comprehensive Documentation

## 📚 Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Getting Started](#getting-started)
4. [Frontend Development](#frontend-development)
5. [Backend Development](#backend-development)
6. [Database Schema](#database-schema)
7. [API Documentation](#api-documentation)
8. [Deployment](#deployment)
9. [Contributing](#contributing)
10. [Troubleshooting](#troubleshooting)

## 🚀 Project Overview

BuildFlow is a comprehensive drag & drop website builder platform that empowers users to create professional websites without coding knowledge. It provides a complete ecosystem for website creation, management, and business operations.

### Key Features

- **Drag & Drop Builder**: Intuitive visual editor with real-time preview
- **Template System**: Professional templates for various industries
- **eCommerce Integration**: Complete online store functionality
- **Booking System**: Appointment and service scheduling
- **Analytics Dashboard**: Comprehensive website analytics
- **Multi-user Support**: Team collaboration features
- **Responsive Design**: Mobile-first approach
- **SEO Optimization**: Built-in SEO tools
- **Performance Optimization**: Fast loading and CDN integration

## 🏗️ Architecture

### System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   Database      │
│   (React)       │◄──►│   (Node.js)     │◄──►│   (PostgreSQL)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       
         │                       │                       
         ▼                       ▼                       
┌─────────────────┐    ┌─────────────────┐    
│   CDN           │    │   File Storage   │    
│   (Vercel)      │    │   (Vercel/Render)│    
└─────────────────┘    └─────────────────┘    
```

### Technology Stack

**Frontend:**
- React 18 with TypeScript
- @dnd-kit for drag & drop
- Tailwind CSS for styling
- Zustand for state management
- Socket.io for real-time features

**Backend:**
- Node.js with Express
- TypeScript
- Prisma ORM
- PostgreSQL database
- Socket.io for real-time communication

**Infrastructure:**
- Render (Backend + PostgreSQL)
- Vercel (Frontend + Admin)
- CDN integration
- CI/CD pipeline (GitHub Actions)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-org/buildflow.git
cd buildflow
```

2. **Install dependencies**
```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install
```

3. **Set up environment variables**
```bash
# Backend
cd backend
cp env.example .env
# Configure your database and API keys

# Frontend
cd frontend
cp .env.example .env
# Configure API endpoints
```

4. **Set up the database**
```bash
cd backend
npx prisma migrate dev
npx prisma generate
npx prisma db seed
```

5. **Start the development servers**
```bash
# Backend
cd backend
npm run dev

# Frontend
cd frontend
npm run dev
```

6. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Database: localhost:5432

## 🎨 Frontend Development

### Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/              # Basic UI components
│   │   ├── layouts/         # Layout components
│   │   ├── builder/         # Builder-specific components
│   │   └── drag-drop/       # Drag & drop components
│   ├── pages/               # Page components
│   ├── hooks/               # Custom React hooks
│   ├── store/               # State management (Zustand)
│   ├── types/               # TypeScript type definitions
│   ├── utils/               # Utility functions
│   └── App.tsx              # Main app component
├── public/                  # Static assets
└── package.json
```

### Key Components

#### Drag & Drop System

The drag & drop system is built using @dnd-kit and provides:

- **Element Templates**: Pre-built components for different use cases
- **Drop Zones**: Areas where elements can be dropped
- **Real-time Preview**: Live updates as users build
- **Responsive Design**: Mobile, tablet, and desktop views

```typescript
// Example: Adding a new element
const handleAddElement = (element: Element, parentId?: string) => {
  const newElement = {
    id: generateId(),
    type: element.type,
    name: element.name,
    props: element.props,
    styles: element.styles,
    order: 0,
    isVisible: true,
  }
  
  addElement(newElement, parentId)
}
```

#### State Management

Using Zustand for state management:

```typescript
// Example: Website store
const useWebsiteStore = create((set, get) => ({
  websites: [],
  currentWebsite: null,
  
  fetchWebsites: async () => {
    const response = await api.get('/websites')
    set({ websites: response.data })
  },
  
  setCurrentWebsite: (website) => {
    set({ currentWebsite: website })
  },
}))
```

### Styling

The project uses Tailwind CSS with custom design system:

```css
/* Custom CSS variables */
:root {
  --primary: 221.2 83.2% 53.3%;
  --secondary: 210 40% 96%;
  --accent: 210 40% 96%;
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
}
```

### Responsive Design

The builder supports three responsive modes:

- **Desktop**: Full-width layout
- **Tablet**: Medium-width layout
- **Mobile**: Narrow-width layout

## 🔧 Backend Development

### Project Structure

```
backend/
├── src/
│   ├── controllers/         # Route controllers
│   ├── middleware/          # Express middleware
│   ├── routes/              # API routes
│   ├── services/            # Business logic
│   ├── utils/               # Utility functions
│   └── index.ts             # Main server file
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── migrations/          # Database migrations
└── package.json
```

### API Structure

The API follows RESTful conventions:

```
GET    /api/websites          # List websites
POST   /api/websites          # Create website
GET    /api/websites/:id      # Get website
PUT    /api/websites/:id      # Update website
DELETE /api/websites/:id      # Delete website
```

### Authentication

JWT-based authentication with refresh tokens:

```typescript
// Middleware example
export const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '')
  
  if (!token) {
    return res.status(401).json({ error: 'Token required' })
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    })
    next()
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' })
  }
}
```

### Database Operations

Using Prisma ORM for database operations:

```typescript
// Example: Create website
const createWebsite = async (data: CreateWebsiteData) => {
  return await prisma.website.create({
    data: {
      name: data.name,
      subdomain: data.subdomain,
      userId: data.userId,
      status: 'DRAFT',
    },
    include: {
      pages: true,
      settings: true,
    },
  })
}
```

## 🗄️ Database Schema

### Core Entities

#### Users
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  avatar TEXT,
  role TEXT NOT NULL DEFAULT 'USER',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Websites
```sql
CREATE TABLE websites (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  name TEXT NOT NULL,
  domain TEXT,
  subdomain TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'DRAFT',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Pages
```sql
CREATE TABLE pages (
  id TEXT PRIMARY KEY,
  website_id TEXT REFERENCES websites(id),
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  is_home_page BOOLEAN DEFAULT FALSE,
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(website_id, slug)
);
```

#### Elements
```sql
CREATE TABLE elements (
  id TEXT PRIMARY KEY,
  page_id TEXT REFERENCES pages(id),
  type TEXT NOT NULL,
  name TEXT NOT NULL,
  props JSONB DEFAULT '{}',
  styles JSONB DEFAULT '{}',
  parent_id TEXT REFERENCES elements(id),
  order INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT TRUE,
  responsive JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Relationships

- **User** → **Website** (One-to-Many)
- **Website** → **Page** (One-to-Many)
- **Page** → **Element** (One-to-Many)
- **Element** → **Element** (Self-referencing for hierarchy)

## 📡 API Documentation

### Authentication Endpoints

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### Website Endpoints

#### List Websites
```http
GET /api/websites
Authorization: Bearer <token>
```

#### Create Website
```http
POST /api/websites
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "My Website",
  "subdomain": "my-website",
  "description": "A beautiful website"
}
```

#### Update Website
```http
PUT /api/websites/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Website Name"
}
```

### Page Endpoints

#### List Pages
```http
GET /api/websites/:websiteId/pages
Authorization: Bearer <token>
```

#### Create Page
```http
POST /api/websites/:websiteId/pages
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "About",
  "slug": "about",
  "title": "About Us",
  "description": "Learn more about us"
}
```

### Element Endpoints

#### Add Element
```http
POST /api/pages/:pageId/elements
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "HEADING",
  "name": "Main Heading",
  "props": {
    "text": "Welcome to our website",
    "level": 1
  },
  "styles": {
    "fontSize": "2rem",
    "color": "#333"
  }
}
```

#### Update Element
```http
PUT /api/elements/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "props": {
    "text": "Updated heading text"
  }
}
```

## 🚀 Deployment

### Production Environment

#### Environment Variables

```bash
# Production settings
NODE_ENV=production
PORT=5000

# Database
DATABASE_URL=postgresql://user:pass@host:5432/buildflow

# JWT
JWT_SECRET=your-production-jwt-secret

# CDN
CDN_URL=https://cdn.yourdomain.com
```

#### Render + Vercel Deployment

1. **Set up Render PostgreSQL database**
2. **Deploy backend to Render Web Service**
3. **Deploy frontend to Vercel**
4. **Deploy admin dashboard to Vercel**
5. **Configure custom domains**

See [Deployment Guide](./DEPLOY_RENDER_VERCEL.md) for detailed instructions.

### CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to production
        run: |
          # Deploy to Render (backend) and Vercel (frontend)
          # See DEPLOY_RENDER_VERCEL.md for details
```

## 🤝 Contributing

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**
3. **Make your changes**
4. **Write tests**
5. **Submit a pull request**

### Code Standards

- **TypeScript**: Strict mode enabled
- **ESLint**: Airbnb configuration
- **Prettier**: Code formatting
- **Husky**: Pre-commit hooks
- **Jest**: Unit testing
- **Cypress**: E2E testing

### Testing

```bash
# Run unit tests
npm test

# Run E2E tests
npm run test:e2e

# Run all tests
npm run test:all
```

### Pull Request Guidelines

- **Clear description** of changes
- **Screenshots** for UI changes
- **Tests** for new features
- **Documentation** updates
- **Breaking changes** clearly marked

## 🔧 Troubleshooting

### Common Issues

#### Database Connection Issues

```bash
# Check database connection
# Verify DATABASE_URL is correct in Render dashboard
# Run migrations manually if needed:
cd backend
npx prisma migrate deploy
```

#### Frontend Build Issues

```bash
# Clear node_modules
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf .vite
npm run dev
```

#### Backend API Issues

```bash
# Check API logs in Render dashboard
# Verify environment variables in Render settings
# Check API health endpoint: https://api.ain90.online/health
```

### Performance Issues

#### Database Optimization

```sql
-- Add indexes for frequently queried columns
CREATE INDEX idx_websites_user_id ON websites(user_id);
CREATE INDEX idx_pages_website_id ON pages(website_id);
CREATE INDEX idx_elements_page_id ON elements(page_id);
```

#### Frontend Optimization

```typescript
// Use React.memo for expensive components
const ExpensiveComponent = React.memo(({ data }) => {
  return <div>{data}</div>
})

// Use useMemo for expensive calculations
const expensiveValue = useMemo(() => {
  return heavyCalculation(data)
}, [data])
```

#### Backend Optimization

```typescript
// Use database indexes
const websites = await prisma.website.findMany({
  where: { userId: user.id },
  include: { pages: true },
  orderBy: { createdAt: 'desc' },
  take: 10,
})
```

### Security Considerations

- **Input validation** on all endpoints
- **Rate limiting** to prevent abuse
- **CORS** configuration
- **SQL injection** prevention with Prisma
- **XSS protection** with proper sanitization
- **CSRF protection** for state-changing operations

### Monitoring

- **Application logs** with structured logging
- **Error tracking** with Sentry
- **Performance monitoring** with New Relic
- **Uptime monitoring** with Pingdom
- **Database monitoring** with pgAdmin

## 📞 Support

For support and questions:

- **Documentation**: [docs.buildflow.com](https://docs.buildflow.com)
- **Issues**: [GitHub Issues](https://github.com/your-org/buildflow/issues)
- **Discord**: [BuildFlow Community](https://discord.gg/buildflow)
- **Email**: support@buildflow.com

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**BuildFlow** - Empowering creators to build amazing websites without code.
