// Core Types for BuildFlow Platform

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: UserRole;
  subscription: Subscription;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

export interface Subscription {
  id: string;
  userId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum SubscriptionPlan {
  FREE = 'FREE',
  BASIC = 'BASIC',
  PRO = 'PRO',
  ENTERPRISE = 'ENTERPRISE',
}

export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  CANCELED = 'CANCELED',
  PAST_DUE = 'PAST_DUE',
  UNPAID = 'UNPAID',
}

// Website and Page Types
export interface Website {
  id: string;
  userId: string;
  name: string;
  domain?: string;
  subdomain: string;
  status: WebsiteStatus;
  settings: WebsiteSettings;
  createdAt: Date;
  updatedAt: Date;
}

export enum WebsiteStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

export interface WebsiteSettings {
  seo: SEOSettings;
  analytics: AnalyticsSettings;
  customDomain?: string;
  favicon?: string;
  theme: ThemeSettings;
}

export interface SEOSettings {
  title: string;
  description: string;
  keywords: string[];
  ogImage?: string;
  twitterCard?: string;
}

export interface AnalyticsSettings {
  googleAnalyticsId?: string;
  facebookPixelId?: string;
  customTrackingCode?: string;
}

export interface ThemeSettings {
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  borderRadius: number;
}

export interface Page {
  id: string;
  websiteId: string;
  name: string;
  slug: string;
  title: string;
  description?: string;
  isHomePage: boolean;
  isPublished: boolean;
  elements: Element[];
  seo: SEOSettings;
  createdAt: Date;
  updatedAt: Date;
}

// Element System Types
export interface Element {
  id: string;
  type: ElementType;
  name: string;
  props: Record<string, any>;
  styles: ElementStyles;
  children?: Element[];
  parentId?: string;
  order: number;
  isVisible: boolean;
  responsive: ResponsiveSettings;
  // Phase 3: Data binding & CMS
  dataSource?: DataSource; // e.g., { type: 'products', filter: { category: 'electronics' } }
  dataBindings?: Record<string, string>; // e.g., { text: '{{product.name}}', image: '{{product.image}}' }
  condition?: ConditionalRule; // Show/hide based on data
  loop?: LoopConfig; // Repeat element for each item
  animations?: AnimationConfig;
  interactions?: InteractionConfig;
  customCSS?: string;
  customJS?: string;
}

export interface DataSource {
  type: 'products' | 'blog' | 'services' | 'custom';
  filter?: Record<string, any>;
  limit?: number;
  sort?: { field: string; order: 'asc' | 'desc' };
}

export interface ConditionalRule {
  field: string; // e.g., 'product.price'
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'exists';
  value: any;
}

export interface LoopConfig {
  dataSource: DataSource;
  template: string; // Element ID to repeat
}

export interface AnimationConfig {
  entrance?: 'fade' | 'slide' | 'zoom' | 'bounce' | 'none';
  exit?: 'fade' | 'slide' | 'zoom' | 'bounce' | 'none';
  delay?: number;
  duration?: number;
}

export interface InteractionConfig {
  onClick?: {
    type: 'navigate' | 'modal' | 'toggle' | 'custom';
    target?: string;
    action?: string;
  };
  onHover?: {
    type: 'tooltip' | 'preview' | 'highlight';
    content?: string;
  };
}

export enum ElementType {
  // Layout Elements
  SECTION = 'SECTION',
  CONTAINER = 'CONTAINER',
  ROW = 'ROW',
  COLUMN = 'COLUMN',
  SPACER = 'SPACER',
  DIVIDER = 'DIVIDER',
  
  // Content Elements
  TEXT = 'TEXT',
  HEADING = 'HEADING',
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  BUTTON = 'BUTTON',
  ICON = 'ICON',
  
  // Form Elements
  FORM = 'FORM',
  INPUT = 'INPUT',
  TEXTAREA = 'TEXTAREA',
  SELECT = 'SELECT',
  CHECKBOX = 'CHECKBOX',
  RADIO = 'RADIO',
  
  // Navigation
  NAVBAR = 'NAVBAR',
  MENU = 'MENU',
  BREADCRUMB = 'BREADCRUMB',
  
  // eCommerce Elements
  PRODUCT_GRID = 'PRODUCT_GRID',
  PRODUCT_CARD = 'PRODUCT_CARD',
  CART = 'CART',
  CHECKOUT = 'CHECKOUT',
  
  // Booking Elements
  CALENDAR = 'CALENDAR',
  SERVICE_LIST = 'SERVICE_LIST',
  BOOKING_FORM = 'BOOKING_FORM',
  
  // Blog Elements
  BLOG_GRID = 'BLOG_GRID',
  BLOG_POST = 'BLOG_POST',
  BLOG_CARD = 'BLOG_CARD',
  
  // Portfolio Elements
  PORTFOLIO_GRID = 'PORTFOLIO_GRID',
  PORTFOLIO_ITEM = 'PORTFOLIO_ITEM',
  
  // Other Elements
  MAP = 'MAP',
  EMBED = 'EMBED',
  CODE = 'CODE',
}

export interface ElementStyles {
  // Layout
  width?: string;
  height?: string;
  minWidth?: string;
  minHeight?: string;
  maxWidth?: string;
  maxHeight?: string;
  
  // Positioning
  position?: 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky';
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
  zIndex?: number;
  
  // Display
  display?: 'block' | 'inline' | 'inline-block' | 'flex' | 'grid' | 'none';
  flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  justifyContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
  alignItems?: 'flex-start' | 'flex-end' | 'center' | 'baseline' | 'stretch';
  flexWrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
  gap?: string;
  
  // Grid
  gridTemplateColumns?: string;
  gridTemplateRows?: string;
  gridColumn?: string;
  gridRow?: string;
  
  // Spacing
  margin?: string;
  marginTop?: string;
  marginRight?: string;
  marginBottom?: string;
  marginLeft?: string;
  padding?: string;
  paddingTop?: string;
  paddingRight?: string;
  paddingBottom?: string;
  paddingLeft?: string;
  
  // Background
  backgroundColor?: string;
  backgroundImage?: string;
  backgroundSize?: 'cover' | 'contain' | 'auto' | string;
  backgroundPosition?: string;
  backgroundRepeat?: 'no-repeat' | 'repeat' | 'repeat-x' | 'repeat-y';
  
  // Border
  border?: string;
  borderTop?: string;
  borderRight?: string;
  borderBottom?: string;
  borderLeft?: string;
  borderRadius?: string;
  borderColor?: string;
  borderStyle?: 'solid' | 'dashed' | 'dotted' | 'none';
  borderWidth?: string;
  
  // Typography
  fontFamily?: string;
  fontSize?: string;
  fontWeight?: 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
  fontStyle?: 'normal' | 'italic' | 'oblique';
  lineHeight?: string;
  letterSpacing?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  textDecoration?: 'none' | 'underline' | 'line-through';
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  color?: string;
  
  // Effects
  opacity?: number;
  boxShadow?: string;
  textShadow?: string;
  transform?: string;
  transition?: string;
  filter?: string;
  
  // Overflow
  overflow?: 'visible' | 'hidden' | 'scroll' | 'auto';
  overflowX?: 'visible' | 'hidden' | 'scroll' | 'auto';
  overflowY?: 'visible' | 'hidden' | 'scroll' | 'auto';
}

export interface ResponsiveSettings {
  mobile: Partial<ElementStyles>;
  tablet: Partial<ElementStyles>;
  desktop: Partial<ElementStyles>;
}

// Template System
export interface Template {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  thumbnail: string;
  preview: string;
  pages: TemplatePage[];
  tags: string[];
  isPremium: boolean;
  isPublished: boolean;
  downloads: number;
  rating: number;
  createdAt: Date;
  updatedAt: Date;
}

export enum TemplateCategory {
  BUSINESS = 'BUSINESS',
  PORTFOLIO = 'PORTFOLIO',
  BLOG = 'BLOG',
  ECOMMERCE = 'ECOMMERCE',
  RESTAURANT = 'RESTAURANT',
  FITNESS = 'FITNESS',
  EDUCATION = 'EDUCATION',
  HEALTHCARE = 'HEALTHCARE',
  REAL_ESTATE = 'REAL_ESTATE',
  NON_PROFIT = 'NON_PROFIT',
}

export interface TemplatePage {
  id: string;
  name: string;
  slug: string;
  elements: Element[];
}

// eCommerce Types
export interface Product {
  id: string;
  websiteId: string;
  name: string;
  description: string;
  slug: string;
  sku: string;
  price: number;
  comparePrice?: number;
  costPrice?: number;
  trackQuantity: boolean;
  quantity: number;
  allowBackorder: boolean;
  weight?: number;
  dimensions?: ProductDimensions;
  images: ProductImage[];
  variants: ProductVariant[];
  categories: ProductCategory[];
  tags: string[];
  seo: SEOSettings;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductDimensions {
  length: number;
  width: number;
  height: number;
  unit: 'cm' | 'in';
}

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  isPrimary: boolean;
  order: number;
}

export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  price: number;
  comparePrice?: number;
  quantity: number;
  attributes: Record<string, string>;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  image?: string;
}

export interface Order {
  id: string;
  websiteId: string;
  customerId: string;
  orderNumber: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  currency: string;
  shippingAddress: Address;
  billingAddress: Address;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELED = 'CANCELED',
  REFUNDED = 'REFUNDED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED',
}

export interface OrderItem {
  id: string;
  productId: string;
  variantId?: string;
  name: string;
  sku: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Address {
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone?: string;
}

// Booking System Types
export interface Service {
  id: string;
  websiteId: string;
  name: string;
  description: string;
  type: ServiceType;
  duration: number; // in minutes
  price: number;
  capacity: number;
  staff: ServiceStaff[];
  availability: ServiceAvailability;
  bookingRules: BookingRules;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum ServiceType {
  APPOINTMENT = 'APPOINTMENT',
  CLASS = 'CLASS',
  COURSE = 'COURSE',
  MEMBERSHIP = 'MEMBERSHIP',
}

export interface ServiceStaff {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  specialties: string[];
}

export interface ServiceAvailability {
  days: DayAvailability[];
  exceptions: DateException[];
}

export interface DayAvailability {
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  isAvailable: boolean;
}

export interface DateException {
  date: Date;
  isAvailable: boolean;
  startTime?: string;
  endTime?: string;
}

export interface BookingRules {
  advanceBookingDays: number;
  cancellationHours: number;
  bufferTime: number; // in minutes
  allowRescheduling: boolean;
  requireDeposit: boolean;
  depositAmount?: number;
}

export interface Booking {
  id: string;
  websiteId: string;
  serviceId: string;
  staffId?: string;
  customerId: string;
  startTime: Date;
  endTime: Date;
  status: BookingStatus;
  notes?: string;
  totalPrice: number;
  depositPaid: number;
  paymentStatus: PaymentStatus;
  createdAt: Date;
  updatedAt: Date;
}

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  COMPLETED = 'COMPLETED',
  CANCELED = 'CANCELED',
  NO_SHOW = 'NO_SHOW',
}

// Customer Management
export interface Customer {
  id: string;
  websiteId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  address?: Address;
  tags: string[];
  notes?: string;
  totalSpent: number;
  totalOrders: number;
  lastOrderDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Analytics Types
export interface Analytics {
  id: string;
  websiteId: string;
  date: Date;
  visitors: number;
  pageViews: number;
  sessions: number;
  bounceRate: number;
  avgSessionDuration: number;
  conversions: number;
  revenue: number;
  topPages: PageAnalytics[];
  trafficSources: TrafficSource[];
  deviceTypes: DeviceAnalytics[];
  locations: LocationAnalytics[];
}

export interface PageAnalytics {
  pageId: string;
  pageName: string;
  views: number;
  uniqueViews: number;
  avgTimeOnPage: number;
  bounceRate: number;
}

export interface TrafficSource {
  source: string;
  medium: string;
  visitors: number;
  sessions: number;
  conversions: number;
}

export interface DeviceAnalytics {
  deviceType: 'desktop' | 'mobile' | 'tablet';
  visitors: number;
  sessions: number;
  conversions: number;
}

export interface LocationAnalytics {
  country: string;
  city?: string;
  visitors: number;
  sessions: number;
  conversions: number;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form Types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface WebsiteForm {
  name: string;
  subdomain: string;
  description?: string;
}

export interface PageForm {
  name: string;
  slug: string;
  title: string;
  description?: string;
  isHomePage: boolean;
}

// Drag & Drop Types
export interface DragItem {
  id: string;
  type: ElementType;
  name: string;
  icon: string;
  category: ElementCategory;
}

export enum ElementCategory {
  LAYOUT = 'LAYOUT',
  CONTENT = 'CONTENT',
  FORM = 'FORM',
  NAVIGATION = 'NAVIGATION',
  ECOMMERCE = 'ECOMMERCE',
  BOOKING = 'BOOKING',
  BLOG = 'BLOG',
  PORTFOLIO = 'PORTFOLIO',
  OTHER = 'OTHER',
}

export interface DropZone {
  id: string;
  parentId?: string;
  accepts: ElementType[];
  maxChildren?: number;
}

// Real-time Types
export interface SocketEvent {
  type: string;
  data: any;
  timestamp: Date;
}

export interface CollaborationEvent {
  userId: string;
  userName: string;
  action: 'join' | 'leave' | 'edit' | 'select';
  elementId?: string;
  timestamp: Date;
}

// Service Types
export interface Service {
  id: string;
  websiteId: string;
  name: string;
  description: string;
  type: ServiceType;
  duration: number; // in minutes
  price: number;
  capacity: number;
  advanceBookingDays: number;
  cancellationHours: number;
  bufferTime: number; // in minutes
  allowRescheduling: boolean;
  requireDeposit: boolean;
  depositAmount: number;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum ServiceType {
  CONSULTATION = 'CONSULTATION',
  WORKSHOP = 'WORKSHOP',
  COURSE = 'COURSE',
  EVENT = 'EVENT',
  OTHER = 'OTHER',
}

export interface Booking {
  id: string;
  websiteId?: string;
  serviceId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  date: Date;
  time: string;
  startTime?: Date;
  endTime?: Date;
  duration: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  totalAmount: number;
  totalPrice?: number;
  depositAmount: number;
  depositPaid?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  PARTIAL = 'PARTIAL',
  REFUNDED = 'REFUNDED',
}

export interface ServiceStaff {
  id: string;
  serviceId: string;
  staffId: string;
  staffName: string;
  staffEmail: string;
  isPrimary: boolean;
}

// Export all types
export * from './api';
export * from './forms';
export * from './drag-drop';
export * from './realtime';
