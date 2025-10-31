# Environment Examples

## Frontend (.env)
```
# Required in production
VITE_API_URL=https://api.ain90.online
```

## Admin Dashboard (.env)
```
# If the admin UI calls the same API
VITE_API_URL=https://api.ain90.online
```

## Backend (.env)
```
NODE_ENV=production
PORT=5001
DATABASE_URL=postgresql://user:pass@host:5432/buildflow
JWT_SECRET=replace-with-strong-secret
FRONTEND_URL=https://app.ain90.online
REDIS_URL=redis://host:6379
```
