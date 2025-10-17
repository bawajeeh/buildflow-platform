# BuildFlow API Documentation

## Overview

BuildFlow is a comprehensive drag-and-drop website builder platform with a robust REST API. This documentation covers all available endpoints, request/response formats, and authentication methods.

## Base URL

- **Development**: `http://localhost:5001`
- **Production**: `https://api.buildflow.com`

## Authentication

BuildFlow uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## API Endpoints

### Authentication

#### Register User
```http
POST /api/auth/register
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user-id",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "USER",
    "subscription": {
      "plan": "FREE",
      "status": "ACTIVE"
    },
    "createdAt": "2023-01-01T00:00:00Z",
    "updatedAt": "2023-01-01T00:00:00Z"
  }
}
```

#### Login User
```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "jwt-token",
    "user": {
      "id": "user-id",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "USER"
    }
  }
}
```

### Websites

#### Get All Websites
```http
GET /api/websites
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "website-id",
      "name": "My Website",
      "subdomain": "my-website",
      "status": "PUBLISHED",
      "settings": {
        "seo": {
          "title": "My Website",
          "description": "A beautiful website",
          "keywords": ["website", "portfolio"]
        },
        "theme": {
          "primaryColor": "#3b82f6",
          "secondaryColor": "#64748b",
          "fontFamily": "Inter",
          "borderRadius": 8
        }
      },
      "createdAt": "2023-01-01T00:00:00Z",
      "updatedAt": "2023-01-01T00:00:00Z"
    }
  ]
}
```

#### Create Website
```http
POST /api/websites
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "New Website",
  "subdomain": "new-website"
}
```

#### Update Website
```http
PUT /api/websites/:id
Authorization: Bearer <token>
```

#### Delete Website
```http
DELETE /api/websites/:id
Authorization: Bearer <token>
```

### Pages

#### Get Pages for Website
```http
GET /api/websites/:websiteId/pages
Authorization: Bearer <token>
```

#### Create Page
```http
POST /api/websites/:websiteId/pages
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Home Page",
  "slug": "home"
}
```

### Elements

#### Get Elements for Page
```http
GET /api/websites/:websiteId/pages/:pageId/elements
Authorization: Bearer <token>
```

#### Create Element
```http
POST /api/websites/:websiteId/pages/:pageId/elements
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "type": "HEADING",
  "content": {
    "text": "Welcome to My Website",
    "level": 1
  },
  "styles": {
    "fontSize": "2rem",
    "color": "#333333",
    "textAlign": "center"
  },
  "position": {
    "x": 0,
    "y": 0,
    "width": 100,
    "height": 50
  }
}
```

### Products (eCommerce)

#### Get Products
```http
GET /api/websites/:websiteId/products
Authorization: Bearer <token>
```

#### Create Product
```http
POST /api/websites/:websiteId/products
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Premium Template",
  "description": "A beautiful website template",
  "slug": "premium-template",
  "sku": "TMP-001",
  "price": 99.99,
  "comparePrice": 149.99,
  "quantity": 100,
  "isPublished": true
}
```

### Orders

#### Get Orders
```http
GET /api/websites/:websiteId/orders
Authorization: Bearer <token>
```

#### Create Order
```http
POST /api/websites/:websiteId/orders
Authorization: Bearer <token>
```

### Services & Bookings

#### Get Services
```http
GET /api/websites/:websiteId/services
Authorization: Bearer <token>
```

#### Create Service
```http
POST /api/websites/:websiteId/services
Authorization: Bearer <token>
```

#### Get Bookings
```http
GET /api/websites/:websiteId/bookings
Authorization: Bearer <token>
```

#### Create Booking
```http
POST /api/websites/:websiteId/bookings
Authorization: Bearer <token>
```

### Analytics

#### Get Analytics Report
```http
GET /api/websites/:websiteId/analytics?period=7d
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "period": "7d",
    "visitors": 1250,
    "pageViews": 3200,
    "sessions": 850,
    "bounceRate": 45.2,
    "avgSessionDuration": 180,
    "conversions": 25,
    "chartData": [
      {
        "date": "2023-01-01",
        "visitors": 150,
        "pageViews": 400
      }
    ]
  }
}
```

### Media

#### Get Media Files
```http
GET /api/websites/:websiteId/media
Authorization: Bearer <token>
```

#### Upload Media
```http
POST /api/websites/:websiteId/media/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

### Templates

#### Get Templates
```http
GET /api/templates
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "template-id",
      "name": "Business Template",
      "description": "Professional business website template",
      "previewImage": "https://example.com/preview.jpg",
      "category": "BUSINESS",
      "isActive": true,
      "createdAt": "2023-01-01T00:00:00Z"
    }
  ]
}
```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message",
  "message": "Detailed error description"
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `500` - Internal Server Error

## Rate Limiting

API requests are rate limited to prevent abuse:

- **Authenticated users**: 1000 requests per hour
- **Unauthenticated users**: 100 requests per hour

Rate limit headers are included in responses:
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Remaining requests in current window
- `X-RateLimit-Reset`: Time when the rate limit resets

## WebSocket Events

BuildFlow supports real-time collaboration through WebSocket connections:

### Connection
```javascript
const socket = io('ws://localhost:5001', {
  auth: { token: 'your-jwt-token' },
  query: { websiteId: 'website-id', pageId: 'page-id' }
})
```

### Events

#### Join Room
```javascript
socket.emit('JOIN_ROOM', { websiteId: 'website-id', pageId: 'page-id' })
```

#### Element Updates
```javascript
socket.emit('ELEMENT_UPDATE', {
  elementId: 'element-id',
  content: { text: 'Updated text' },
  styles: { color: '#ff0000' }
})
```

#### Cursor Position
```javascript
socket.emit('CURSOR_UPDATE', {
  x: 100,
  y: 200,
  elementId: 'element-id'
})
```

## SDKs and Libraries

### JavaScript/TypeScript
```bash
npm install @buildflow/sdk
```

```javascript
import { BuildFlowClient } from '@buildflow/sdk'

const client = new BuildFlowClient({
  apiUrl: 'https://api.buildflow.com',
  token: 'your-jwt-token'
})

const websites = await client.websites.list()
const website = await client.websites.create({
  name: 'My Website',
  subdomain: 'my-website'
})
```

## Support

For API support and questions:

- **Email**: api-support@buildflow.com
- **Documentation**: https://docs.buildflow.com
- **Status Page**: https://status.buildflow.com
