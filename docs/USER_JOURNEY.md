# Complete User Journey: Building a Page from Creation to Publication

This document explains the complete flow of what happens when a user creates a new page, builds it with drag & drop elements, and publishes it.

## 📋 Table of Contents
1. [User Authentication & Website Selection](#1-user-authentication--website-selection)
2. [Entering the Builder](#2-entering-the-builder)
3. [Creating a New Page](#3-creating-a-new-page)
4. [Building the Page](#4-building-the-page)
5. [Adding Elements](#5-adding-elements)
6. [Editing Elements](#6-editing-elements)
7. [Saving Changes](#7-saving-changes)
8. [Publishing the Website](#8-publishing-the-website)

---

## 1. User Authentication & Website Selection

### Frontend Flow (`frontend/src/store/index.ts`)

**Step 1: User Login**
```typescript
useAuthStore.login(email, password)
```
- **API Call**: `POST /api/auth/login`
- **Backend**: Validates credentials, generates JWT token
- **Storage**: Token saved in Zustand store (persisted to localStorage)
- **State**: `isAuthenticated: true`, `token: <jwt>`, `user: <user object>`

**Step 2: Fetch User's Websites**
```typescript
useWebsiteStore.fetchWebsites()
```
- **API Call**: `GET /api/websites` (with `Authorization: Bearer <token>`)
- **Backend**: Queries database for all websites belonging to authenticated user
- **Response**: Array of websites with status (DRAFT, PUBLISHED, SUSPENDED)
- **State**: `websites: [Website[]]` stored in Zustand

**Step 3: Select Website**
```typescript
useWebsiteStore.setCurrentWebsite(website)
```
- **State Update**: Sets `currentWebsite` in store
- **Navigation**: User clicks on website → navigates to `/builder/:websiteId`

---

## 2. Entering the Builder

### Route: `/builder/:websiteId`

**Component**: `frontend/src/components/layouts/BuilderLayout.tsx`

**Initialization Sequence:**

1. **Extract websiteId from URL**
   ```typescript
   const { websiteId } = useParams<{ websiteId: string }>()
   ```

2. **Fetch Website Details**
   ```typescript
   useWebsiteStore.fetchWebsites() // Already done, but ensures fresh data
   ```

3. **Fetch All Pages for Website**
   ```typescript
   useBuilderStore.fetchPages(websiteId)
   ```
   - **API Call**: `GET /api/websites/:websiteId/pages`
   - **Backend**: Returns all pages with their elements (parsed from JSON)
   - **State**: `pages: Page[]` - Array of all pages for this website
   - **Note**: Elements are hydrated from `props.__p3` (Phase 3 features)

4. **Load Theme Tokens**
   ```typescript
   useBuilderStore.loadThemeTokens(websiteId)
   ```
   - **API Call**: `GET /api/websites/:websiteId/theme`
   - **Backend**: Returns theme configuration (colors, typography, spacing)
   - **State**: `themeTokens: { colors, typography, spacing }`

5. **Load Components Library**
   ```typescript
   useBuilderStore.loadComponents(websiteId)
   ```
   - **API Call**: `GET /api/components/website/:websiteId`
   - **State**: `components: Record<string, Component>`

6. **Connect Real-Time Service**
   ```typescript
   realTimeService.joinWebsite(websiteId)
   ```
   - **Socket.IO**: Connects to WebSocket server
   - **Purpose**: Real-time collaboration, cursor tracking, element locking

**Builder UI Loaded:**
- **BuilderSidebar**: Shows pages list, element library, media library
- **BuilderCanvas**: Main editing area (currently empty if no page selected)
- **BuilderProperties**: Properties panel (hidden until element selected)
- **BuilderToolbar**: Save, Preview, Publish buttons

---

## 3. Creating a New Page

### User Action: Click "Create Page" in BuilderSidebar

**Component**: `frontend/src/components/layouts/BuilderSidebar.tsx`

**Function**: `handleCreatePage()`

### Frontend Flow:

```typescript
useBuilderStore.createPage({
  name: "Home Page",
  slug: "home",
  title: "Welcome",
  description: "Home page description",
  isHomePage: false
})
```

### What Happens:

**Step 1: Frontend Store (`frontend/src/store/index.ts:870-920`)**
- Creates temporary page object in local state
- Immediately adds to `pages` array (optimistic update)
- Sets as `currentPage`

**Step 2: API Call to Backend**
- **Endpoint**: `POST /api/websites/:websiteId/pages`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "name": "Home Page",
    "slug": "home",
    "isHomePage": false
  }
  ```

**Step 3: Backend Processing (`backend/src/routes/pages.ts:42-63`)**
- Validates request (authentication via middleware)
- Creates page in database:
  ```sql
  INSERT INTO pages (websiteId, name, slug, isHome, isPublished)
  VALUES (?, ?, ?, false, false)
  ```
- **Initial State**: `isPublished: false` (always starts as DRAFT)
- Logs activity: `pushActivity(websiteId, 'page.created', {...})`

**Step 4: Frontend Receives Response**
- Backend returns created page object with database ID
- Frontend updates local state with real ID (replaces temporary ID)
- `currentPage` is now set and BuilderCanvas renders empty canvas

**Step 5: UI Updates**
- Page appears in sidebar pages list
- BuilderCanvas shows empty page ready for elements
- User can now drag & drop elements

---

## 4. Building the Page

### User Drags Element from Sidebar

**Component**: `frontend/src/components/layouts/BuilderSidebar.tsx` → `ElementDraggable`

**What Happens:**

1. **User starts drag**: `onDragStart`
   - Creates drag data with element template
   - Sets drag type: `application/x-buildflow-element`

2. **User drops on canvas**: `frontend/src/components/builder/DropZone.tsx`
   - Detects drop event
   - Calls `addElement()` from store

---

## 5. Adding Elements

### Function: `useBuilderStore.addElement()`

**Location**: `frontend/src/store/index.ts:1030-1113`

### Complete Flow:

**Step 1: Immediate UI Update (Optimistic)**
```typescript
const tempId = `temp-${Date.now()}`
const newElement = { ...element, id: tempId, pageId: currentPage.id }

// Add to local state immediately
set((state) => ({
  currentPage: {
    ...state.currentPage,
    elements: [...state.currentPage.elements, newElement]
  },
  pages: state.pages.map(page => 
    page.id === currentPage.id 
      ? { ...page, elements: [...page.elements, newElement] }
      : page
  )
}))
```
- **Result**: Element appears on canvas instantly (no waiting for API)

**Step 2: Serialize Phase 3 Features**
```typescript
const p3 = {
  dataSource: element.dataSource,
  dataBindings: element.dataBindings,
  condition: element.condition,
  animations: element.animations,
  interactions: element.interactions,
  customCSS: element.customCSS,
  customJS: element.customJS
}
```
- **Why**: Advanced features stored in `props.__p3` for database persistence

**Step 3: API Call to Backend**
- **Endpoint**: `POST /api/elements`
- **Headers**: `Authorization: Bearer <token>`, `Content-Type: application/json`
- **Body**:
  ```json
  {
    "pageId": "page-id",
    "type": "HEADING",
    "name": "Heading",
    "props": { "text": "Hello", "level": 1, "__p3": {...} },
    "styles": {},
    "parentId": null,
    "order": 0
  }
  ```

**Step 4: Backend Processing (`backend/src/routes/elements.ts:30-70`)**
- Creates element in database:
  ```sql
  INSERT INTO elements (pageId, type, name, props, styles, order)
  VALUES (?, ?, ?, JSON.stringify(props), JSON.stringify(styles), ?)
  ```
- **Storage**: Props and styles stored as JSON strings in PostgreSQL
- Returns created element with database ID

**Step 5: Update Frontend with Real ID**
```typescript
// Replace temporary ID with database ID
set((state) => ({
  currentPage: {
    ...state.currentPage,
    elements: currentPage.elements.map(el => 
      el.id === tempId ? { ...el, id: savedElement.id } : el
    )
  }
}))
```

**Step 6: Real-Time Broadcast**
- Emits Socket.IO event: `element:created` to all users in website room
- Other collaborators see new element appear in real-time
- Console log: `"Element saved to backend: {id, pageId, type, ...}"`

---

## 6. Editing Elements

### User Modifies Element (Text, Position, Styles, etc.)

**Functions Involved:**
- `updateElement()` - For property/style changes
- `moveElement()` - For drag & drop repositioning
- `deleteElement()` - For removal

### Example: User Changes Text in Heading

**Step 1: User Interaction**
- User clicks heading element → `selectElement(element)`
- Properties panel shows element props
- User types new text → `onChange` handler

**Step 2: Update Element (`frontend/src/store/index.ts:1115-1179`)**
```typescript
updateElement(elementId, {
  props: { text: "New Heading Text" }
})
```

**Step 3: Serialize Phase 3**
- Combines updates with existing `props.__p3` data
- Prepares payload with all advanced features

**Step 4: API Call**
- **Endpoint**: `PUT /api/elements/:id`
- **Body**: `{ props: {...updatedProps}, styles: {...} }`

**Step 5: Backend Updates Database**
```sql
UPDATE elements 
SET props = JSON.stringify(updatedProps),
    styles = JSON.stringify(updatedStyles)
WHERE id = ?
```

**Step 6: Frontend State Update**
- Updates element in `currentPage.elements` array
- Updates element in `pages[].elements` array
- If element is selected, updates `selectedElement`

**Step 7: History Snapshot (Undo/Redo)**
```typescript
const elementsSnapshot = currentPage.elements.map(e => ({ ...e }))
const trimmed = history.slice(0, historyIndex + 1)
set({
  history: [...trimmed, elementsSnapshot],
  historyIndex: trimmed.length
})
```
- **Purpose**: Enables undo/redo functionality
- **Storage**: Array of element snapshots in memory (not persisted)

**Step 8: Real-Time Broadcast**
- Socket.IO: `element:updated` event
- Other users see changes in real-time

---

## 7. Saving Changes

### Two Types of Saves:

#### A. Auto-Save (During Editing)

**Trigger**: Every time `updateElement()` is called
- Elements are saved immediately to backend
- No manual save required for individual changes
- **Exception**: Bulk layout saves use manual save

#### B. Manual Save (`saveLayout()`)

**Trigger**: User clicks "Save" button in toolbar

**Function**: `useBuilderStore.saveLayout()`

**Location**: `frontend/src/store/index.ts:1279-1339`

### Save Flow:

**Step 1: Serialize All Elements**
```typescript
const serializedElements = currentPage.elements.map(el => ({
  ...el,
  props: {
    ...el.props,
    __p3: {
      dataSource: el.dataSource,
      dataBindings: el.dataBindings,
      condition: el.condition,
      animations: el.animations,
      interactions: el.interactions,
      customCSS: el.customCSS,
      customJS: el.customJS
    }
  }
}))
```

**Step 2: API Call**
- **Endpoint**: `POST /api/pages/:pageId/save`
- **Body**: `{ elements: serializedElements }`

**Step 3: Backend Processing**
- **If endpoint exists**: Saves all elements in batch
- **If endpoint missing**: Silently skips (non-breaking)
- **Note**: Individual elements already saved via `updateElement()`

**Step 4: Save Theme Tokens**
```typescript
await saveThemeTokens(websiteId)
```
- **Endpoint**: `PUT /api/websites/:websiteId/theme`
- **Body**: Theme tokens JSON (colors, typography, spacing)
- **Storage**: Saved in `websiteSettings.customTrackingCode` (JSON string)

**Step 5: UI Feedback**
- Toast notification: "Saved successfully"
- Loading state cleared

**Important Notes:**
- **Optimistic Updates**: UI updates immediately, backend save is async
- **Error Handling**: If save fails, UI remains responsive (doesn't throw)
- **No Data Loss**: Even if save endpoint missing, individual element saves work

---

## 8. Publishing the Website

### User Action: Click "Publish" Button

**Component**: `frontend/src/components/layouts/BuilderToolbar.tsx`

### Frontend Flow:

**Step 1: User Clicks Publish**
```typescript
useWebsiteStore.publishWebsite(websiteId)
```

**Location**: `frontend/src/store/index.ts:367-395`

**Step 2: API Call**
- **Endpoint**: `POST /api/websites/:websiteId/publish`
- **Headers**: `Authorization: Bearer <token>`
- **Note**: This is different from `/api/publish/website/:websiteId`

**Step 3: Backend Processing (`backend/src/routes/publish.ts:98-144`)**

This is the **critical publishing workflow**:

#### 3a. Fetch Website Data
```typescript
const website = await prisma.website.findUnique({ 
  where: { id: websiteId } 
})
const settings = await prisma.websiteSettings.findUnique({ 
  where: { websiteId } 
})
```

#### 3b. Fetch All Pages
```typescript
const pages = await prisma.page.findMany({ 
  where: { websiteId },
  orderBy: { createdAt: 'asc' }
})
```

#### 3c. Load Elements for Each Page
```typescript
const pageWithElements = await Promise.all(
  pages.map(async (page) => {
    const elements = await prisma.element.findMany({
      where: { pageId: page.id },
      orderBy: { order: 'asc' }
    })
    
    // Parse JSON fields (props, styles, responsive)
    const parsed = elements.map(el => ({
      ...el,
      props: JSON.parse(el.props),
      styles: JSON.parse(el.styles),
      responsive: JSON.parse(el.responsive)
    }))
    
    return { ...page, elements: parsed }
  })
)
```

#### 3d. Generate Static HTML for Each Page

**Function**: `renderPageHtml(page, options)`

For each page, the system:
1. **Builds HTML structure** from elements:
   - Converts element types to HTML tags (SECTION → `<section>`, HEADING → `<h1>`, etc.)
   - Escapes HTML content for security
   - Adds lazy loading for images
   - Recursively renders nested children

2. **Generates SEO Metadata**:
   - Page title (from SEO settings or page name)
   - Meta description
   - Open Graph tags (og:title, og:description, og:image)
   - Canonical URL
   - JSON-LD structured data (Schema.org WebPage)

3. **Creates Complete HTML Document**:
   ```html
   <!doctype html>
   <html lang="en">
     <head>
       <meta charset="utf-8"/>
       <title>Page Title</title>
       <meta name="description" content="..."/>
       <meta property="og:title" content="..."/>
       <!-- ... more meta tags ... -->
       <script type="application/ld+json">{...}</script>
     </head>
     <body>
       <!-- Rendered element HTML -->
     </body>
   </html>
   ```

#### 3e. Mark Pages as Published
```typescript
await prisma.page.updateMany({
  where: { websiteId },
  data: { isPublished: true }
})
```
- **Database Update**: All pages now have `isPublished: true`

#### 3f. Log Activity
```typescript
pushActivity(websiteId, 'website.published', {
  pages: output.length
})
```
- **Activity Feed**: Records publishing event

#### 3g. Emit Webhook (if configured)
```typescript
await emitWebhook(websiteId, 'website.published', {
  pages: output.map(p => ({ id: p.id, slug: p.slug }))
})
```
- **External Integration**: Notifies third-party services (Vercel, CDN, etc.)

#### 3h. Return Published HTML
```json
{
  "websiteId": "...",
  "pages": [
    {
      "id": "page-id",
      "slug": "home",
      "isHome": true,
      "html": "<!doctype html>..."
    },
    // ... more pages
  ]
}
```

**Step 4: Frontend Receives Response**
```typescript
set((state) => ({
  websites: state.websites.map(website =>
    website.id === id 
      ? { ...website, status: WebsiteStatus.PUBLISHED }
      : website
  ),
  currentWebsite: {
    ...state.currentWebsite,
    status: WebsiteStatus.PUBLISHED
  }
}))
```

**Step 5: UI Updates**
- Website status changes from "DRAFT" to "PUBLISHED"
- Publish button may change to "Unpublish"
- Success toast notification

---

## 📊 Data Flow Diagram

```
┌─────────────┐
│   USER      │
└──────┬──────┘
       │
       ▼
┌─────────────────┐     ┌──────────────────┐
│  Frontend Store │────▶│  API Endpoints   │
│  (Zustand)      │     │  (Express)       │
└────────┬────────┘     └────────┬─────────┘
         │                        │
         │                        ▼
         │              ┌──────────────────┐
         │              │   PostgreSQL     │
         │              │   (Prisma ORM)   │
         │              └──────────────────┘
         │                        │
         │                        ▼
         │              ┌──────────────────┐
         │              │  Socket.IO       │
         │              │  (Real-time)     │
         └──────────────▶└──────────────────┘
```

---

## 🔄 State Management Summary

### Zustand Stores Used:

1. **useAuthStore** (`frontend/src/store/index.ts:26-215`)
   - `user`: Current logged-in user
   - `token`: JWT authentication token
   - `isAuthenticated`: Boolean flag
   - **Persistence**: localStorage (via Zustand persist)

2. **useWebsiteStore** (`frontend/src/store/index.ts:235-426`)
   - `websites`: Array of user's websites
   - `currentWebsite`: Currently selected website
   - `fetchWebsites()`: Load all websites
   - `createWebsite()`: Create new website
   - `publishWebsite()`: Publish website
   - `unpublishWebsite()`: Unpublish website

3. **useBuilderStore** (`frontend/src/store/index.ts:494-1425`)
   - `pages`: Array of pages for current website
   - `currentPage`: Currently editing page
   - `selectedElement`: Currently selected element
   - `elements`: Elements array (on current page)
   - `history`: Undo/redo history snapshots
   - `themeTokens`: Theme configuration
   - `components`: Reusable component library
   - **Functions**:
     - `fetchPages(websiteId)`: Load all pages
     - `createPage(pageData)`: Create new page
     - `addElement(element)`: Add element to page
     - `updateElement(id, updates)`: Update element
     - `deleteElement(id)`: Remove element
     - `saveLayout()`: Save all changes
     - `loadThemeTokens(websiteId)`: Load theme
     - `saveThemeTokens(websiteId)`: Save theme

---

## 🗄️ Database Schema

### Key Tables:

**websites**
- `id`: Unique identifier
- `userId`: Owner
- `name`: Website name
- `subdomain`: URL subdomain
- `domain`: Custom domain (optional)
- `status`: DRAFT, PUBLISHED, SUSPENDED

**pages**
- `id`: Unique identifier
- `websiteId`: Parent website
- `name`: Page name
- `slug`: URL slug (e.g., "home", "about")
- `isHome`: Boolean (homepage flag)
- `isPublished`: Boolean (published flag)

**elements**
- `id`: Unique identifier
- `pageId`: Parent page
- `type`: Element type (HEADING, TEXT, IMAGE, etc.)
- `name`: Element name
- `props`: JSON string (element properties)
- `styles`: JSON string (CSS styles)
- `responsive`: JSON string (responsive breakpoints)
- `parentId`: For nested elements
- `order`: Display order

**websiteSettings**
- `websiteId`: Foreign key
- `primaryColor`: Theme color
- `secondaryColor`: Theme color
- `fontFamily`: Typography
- `customTrackingCode`: JSON string (stores theme tokens + custom code)

---

## 🚀 Publishing Output

When published, each page generates:

1. **Static HTML file** (ready for CDN hosting)
2. **SEO metadata** (title, description, Open Graph)
3. **JSON-LD structured data** (for search engines)
4. **Optimized markup** (lazy loading, semantic HTML)

**Example Published HTML Structure:**
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1"/>
    <title>Welcome to My Website</title>
    <link rel="canonical" href="https://mysite.com/home"/>
    <meta name="description" content="Page description"/>
    <meta property="og:title" content="Welcome to My Website"/>
    <meta property="og:description" content="..."/>
    <script type="application/ld+json">
      {"@context":"https://schema.org","@type":"WebPage",...}
    </script>
  </head>
  <body>
    <section>
      <h1>Welcome</h1>
      <p>This is my website...</p>
      <img src="/uploads/media/image.jpg" alt="..." loading="lazy"/>
    </section>
  </body>
</html>
```

---

## 📝 Summary Timeline

1. **Login** → JWT token stored
2. **Select Website** → Pages loaded, theme loaded
3. **Create Page** → Database entry created (`isPublished: false`)
4. **Add Elements** → Elements saved to database immediately
5. **Edit Elements** → Updates saved to database + history snapshot
6. **Save Layout** → Batch save + theme tokens save
7. **Publish** → Generate HTML for all pages → Mark `isPublished: true` → Return HTML files

**Key Points:**
- ✅ **Optimistic Updates**: UI updates instantly, backend syncs async
- ✅ **No Data Loss**: Multiple save mechanisms (individual + batch)
- ✅ **Real-Time Collaboration**: Socket.IO broadcasts all changes
- ✅ **Undo/Redo**: History snapshots stored in memory
- ✅ **SEO Ready**: Published pages include full metadata
- ✅ **Production Ready**: Generated HTML is static and CDN-friendly

---

## 🔍 Debugging Tips

To see what's happening:
1. **Console Logs**: Check browser console for:
   - `"Element saved to backend: {...}"`
   - `"Fetching websites with token: Token exists"`
   - `"Fetched websites data: [...]"`

2. **Network Tab**: Monitor API calls:
   - `POST /api/elements` - Adding elements
   - `PUT /api/elements/:id` - Updating elements
   - `POST /api/pages/:id/save` - Saving layout
   - `POST /api/publish/website/:id` - Publishing

3. **Database**: Check PostgreSQL:
   - `SELECT * FROM pages WHERE websiteId = ?`
   - `SELECT * FROM elements WHERE pageId = ?`
   - `SELECT * FROM websites WHERE userId = ?`

---

**Last Updated**: 2024-11-01
**Version**: 1.0.0

