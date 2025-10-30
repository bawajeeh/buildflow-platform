Components & Pages (Index)

Layouts
- BuilderLayout: orchestrates builder UI and state; loads tokens/components/CMS
- BuilderSidebar, BuilderProperties, BuilderToolbar, BuilderLayersPanel
- ComponentEditorModal, SnapshotsModal, AccessibilityReportModal, CommentsModal, GlobalModal

Builder (Canvas)
- BuilderCanvas: freeform layout, selection, guides, drop zones, remote cursors
- ElementRenderer: responsive merge, tokens, data binding, conditionals, animations, interactions, custom CSS/JS, plugin hook
- elements/*: specific element renderers (grids, cards, forms, etc.)

Dashboard
- DashboardLayout + sections (WebsiteList, Stats, RecentActivity, QuickActions, Settings, Media, Products, Orders, Services, Bookings, Customers, Templates)

Pages
- Public: Landing, Pricing, Features, About, Contact
- Auth: Login, Register, Forgot, Reset
- Builder: BuilderPage, PreviewPage

UI
- LoadingSpinner, ResponsiveIndicator, various UI utilities


