import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore, useWebsiteStore } from '@/store'

// Layout Components
import AuthLayout from '@/components/layouts/AuthLayout'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import BuilderLayout from '@/components/layouts/BuilderLayout'

// Auth Pages
import LoginPage from '@/pages/auth/LoginPage'
import RegisterPage from '@/pages/auth/RegisterPage'
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage'
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage'

// Dashboard Pages
import DashboardHomePage from '@/pages/dashboard/DashboardHomePage'
import WebsitesPage from '@/pages/dashboard/WebsitesPage'
import WebsiteSettingsPage from '@/pages/dashboard/WebsiteSettingsPage'
import AnalyticsPage from '@/pages/dashboard/AnalyticsPage'
import ProductsPage from '@/pages/dashboard/ProductsPage'
import OrdersPage from '@/pages/dashboard/OrdersPage'
import ServicesPage from '@/pages/dashboard/ServicesPage'
import BookingsPage from '@/pages/dashboard/BookingsPage'
import CustomersPage from '@/pages/dashboard/CustomersPage'
import TemplatesPage from '@/pages/dashboard/TemplatesPage'
import MediaPage from '@/pages/dashboard/MediaPage'
import SettingsPage from '@/pages/dashboard/SettingsPage'

// Builder Pages
import BuilderPage from '@/pages/builder/BuilderPage'
import PreviewPage from '@/pages/builder/PreviewPage'

// Public Pages
import LandingPage from '@/pages/public/LandingPage'
import PricingPage from '@/pages/public/PricingPage'
import FeaturesPage from '@/pages/public/FeaturesPage'
import AboutPage from '@/pages/public/AboutPage'
import ContactPage from '@/pages/public/ContactPage'

// Loading Component
import LoadingSpinner from '@/components/ui/LoadingSpinner'

const App: React.FC = () => {
  const { user, isLoading: authLoading } = useAuthStore()
  const { currentWebsite, isLoading: websiteLoading } = useWebsiteStore()

  // Show loading spinner while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />

        {/* Auth Routes */}
        <Route
          path="/auth/*"
          element={
            user ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <AuthLayout>
                <Routes>
                  <Route path="login" element={<LoginPage />} />
                  <Route path="register" element={<RegisterPage />} />
                  <Route path="forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="reset-password" element={<ResetPasswordPage />} />
                  <Route path="*" element={<Navigate to="/auth/login" replace />} />
                </Routes>
              </AuthLayout>
            )
          }
        />

        {/* Dashboard Routes */}
        <Route
          path="/dashboard/*"
          element={
            user ? (
              <DashboardLayout>
                <Routes>
                  <Route path="" element={<DashboardHomePage />} />
                  <Route path="websites" element={<WebsitesPage />} />
                  <Route path="websites/:id/settings" element={<WebsiteSettingsPage />} />
                  <Route path="analytics" element={<AnalyticsPage />} />
                  <Route path="products" element={<ProductsPage />} />
                  <Route path="orders" element={<OrdersPage />} />
                  <Route path="services" element={<ServicesPage />} />
                  <Route path="bookings" element={<BookingsPage />} />
                  <Route path="customers" element={<CustomersPage />} />
                  <Route path="templates" element={<TemplatesPage />} />
                  <Route path="media" element={<MediaPage />} />
                  <Route path="settings" element={<SettingsPage />} />
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </DashboardLayout>
            ) : (
              <Navigate to="/auth/login" replace />
            )
          }
        />

        {/* Builder Routes */}
        <Route
          path="/builder/:websiteId"
          element={
            user ? (
              websiteLoading ? (
                <div className="min-h-screen flex items-center justify-center bg-background">
                  <LoadingSpinner size="lg" />
                </div>
              ) : (
                <BuilderLayout>
                  <BuilderPage />
                </BuilderLayout>
              )
            ) : (
              <Navigate to="/auth/login" replace />
            )
          }
        />

        {/* Preview Routes */}
        <Route
          path="/preview/:websiteId"
          element={
            user ? (
              <PreviewPage />
            ) : (
              <Navigate to="/auth/login" replace />
            )
          }
        />

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default App
