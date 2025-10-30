Frontend State Map (Zustand)

Auth Store
- user, token, isAuthenticated, isLoading
- actions: login, register, logout, forgotPassword, resetPassword, updateProfile, refreshToken

Website Store
- websites[], currentWebsite, isLoading
- actions: fetchWebsites, createWebsite, updateWebsite, deleteWebsite, setCurrentWebsite, publishWebsite, unpublishWebsite

Builder Store
- pages[], currentPage, selectedElement, hoveredElement
- isPreviewMode, isLoading
- history[], historyIndex, clipboard, lastPointerPosition
- themeTokens { colors, typography, spacing } + load/save
- components registry: load/create/update/delete/rename; edit modal
- cmsData { products, blog, services } via loadCMSData
- responsive, tokens, presets handled in properties
- Phase 3 persistence via props.__p3 (dataSource, dataBindings, condition, animations, interactions, customCSS/JS)
- actions: fetch/create/update/delete pages/elements, moveElement
- clipboard ops: duplicate/copy/paste; undo/redo; searchElements
- saveLayout: serializes props.__p3 per element

Other Stores
- modal store: global modal open/close/content
- comments store: commentsByPage, add/resolve/delete
- plugins store: registry of { type, render }


