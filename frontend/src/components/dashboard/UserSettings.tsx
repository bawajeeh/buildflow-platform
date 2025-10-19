import React, { useState, useEffect } from 'react'
import { cn } from '@/utils'
import { API_CONFIG } from '@/config/api'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store'
import { 
  User, 
  Mail, 
  Phone, 
  Globe, 
  Save, 
  X, 
  Eye, 
  EyeOff,
  Shield,
  Bell,
  Palette,
  Database
} from 'lucide-react'

// Components
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Button } from '@/components/ui'
import { Input } from '@/components/ui'
import { Badge } from '@/components/ui'

interface UserSettingsProps {
  className?: string
}

interface UserProfile {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  timezone: string
  avatar?: string
  preferences: {
    theme: 'light' | 'dark' | 'system'
    notifications: boolean
    emailUpdates: boolean
    smsUpdates: boolean
  }
}

const UserSettings: React.FC<UserSettingsProps> = ({ className }) => {
  const [profile, setProfile] = useState<UserProfile>({
    id: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    timezone: 'UTC-8',
    preferences: {
      theme: 'system',
      notifications: true,
      emailUpdates: true,
      smsUpdates: false
    }
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const { token, user } = useAuthStore()

  useEffect(() => {
    fetchUserProfile()
  }, [])

  const fetchUserProfile = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch user profile')
      }

      const data = await response.json()
      setProfile(data.data || profile)
    } catch (error) {
      console.error('Error fetching user profile:', error)
      toast.error('Failed to load user profile')
      // Use auth store data as fallback
      if (user) {
        setProfile(prev => ({
          ...prev,
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email || ''
        }))
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true)
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(profile),
      })

      if (!response.ok) {
        throw new Error('Failed to update profile')
      }

      toast.success('Profile updated successfully!')
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile')
    } finally {
      setIsSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    if (passwordData.newPassword.length < 8) {
      toast.error('New password must be at least 8 characters')
      return
    }

    try {
      setIsSaving(true)
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(passwordData),
      })

      if (!response.ok) {
        throw new Error('Failed to change password')
      }

      toast.success('Password changed successfully!')
      setShowPasswordForm(false)
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error) {
      console.error('Error changing password:', error)
      toast.error('Failed to change password')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        const response = await fetch(`${API_CONFIG.BASE_URL}/api/auth/account`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error('Failed to delete account')
        }

        toast.success('Account deleted successfully')
        // Redirect to login or handle logout
        window.location.href = '/login'
      } catch (error) {
        console.error('Error deleting account:', error)
        toast.error('Failed to delete account')
      }
    }
  }
  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
          <p className="text-gray-600">Manage your account settings and preferences</p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          {/* Profile Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <Input
                    type="text"
                    value={profile.firstName}
                    onChange={(e) => setProfile(prev => ({ ...prev, firstName: e.target.value }))}
                    placeholder="Enter your first name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <Input
                    type="text"
                    value={profile.lastName}
                    onChange={(e) => setProfile(prev => ({ ...prev, lastName: e.target.value }))}
                    placeholder="Enter your last name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter your email"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <Input
                    type="tel"
                    value={profile.phone || ''}
                    onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Enter your phone number"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Timezone
                  </label>
                  <select 
                    value={profile.timezone}
                    onChange={(e) => setProfile(prev => ({ ...prev, timezone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="UTC-12">UTC-12 (Baker Island)</option>
                    <option value="UTC-11">UTC-11 (American Samoa)</option>
                    <option value="UTC-10">UTC-10 (Hawaii)</option>
                    <option value="UTC-9">UTC-9 (Alaska)</option>
                    <option value="UTC-8">UTC-8 (Pacific Time)</option>
                    <option value="UTC-7">UTC-7 (Mountain Time)</option>
                    <option value="UTC-6">UTC-6 (Central Time)</option>
                    <option value="UTC-5">UTC-5 (Eastern Time)</option>
                    <option value="UTC-4">UTC-4 (Atlantic Time)</option>
                    <option value="UTC-3">UTC-3 (Brazil)</option>
                    <option value="UTC-2">UTC-2 (Mid-Atlantic)</option>
                    <option value="UTC-1">UTC-1 (Azores)</option>
                    <option value="UTC+0">UTC+0 (GMT)</option>
                    <option value="UTC+1">UTC+1 (Central European)</option>
                    <option value="UTC+2">UTC+2 (Eastern European)</option>
                    <option value="UTC+3">UTC+3 (Moscow)</option>
                    <option value="UTC+4">UTC+4 (Gulf)</option>
                    <option value="UTC+5">UTC+5 (Pakistan)</option>
                    <option value="UTC+6">UTC+6 (Bangladesh)</option>
                    <option value="UTC+7">UTC+7 (Thailand)</option>
                    <option value="UTC+8">UTC+8 (China)</option>
                    <option value="UTC+9">UTC+9 (Japan)</option>
                    <option value="UTC+10">UTC+10 (Australia)</option>
                    <option value="UTC+11">UTC+11 (Solomon Islands)</option>
                    <option value="UTC+12">UTC+12 (New Zealand)</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button onClick={handleSaveProfile} disabled={isSaving}>
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {!showPasswordForm ? (
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Password</h4>
                    <p className="text-sm text-gray-500">Change your account password</p>
                  </div>
                  <Button variant="outline" onClick={() => setShowPasswordForm(true)}>
                    Change Password
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-900">Change Password</h4>
                    <Button variant="ghost" size="sm" onClick={() => setShowPasswordForm(false)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <Input
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                        placeholder="Enter current password"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      >
                        {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <Input
                        type={showNewPassword ? 'text' : 'password'}
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                        placeholder="Enter new password"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <Input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      placeholder="Confirm new password"
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-3">
                    <Button variant="outline" onClick={() => setShowPasswordForm(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleChangePassword} disabled={isSaving}>
                      {isSaving ? 'Changing...' : 'Change Password'}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Theme</h4>
                    <p className="text-sm text-gray-500">Choose your preferred theme</p>
                  </div>
                  <select 
                    value={profile.preferences.theme}
                    onChange={(e) => setProfile(prev => ({ 
                      ...prev, 
                      preferences: { ...prev.preferences, theme: e.target.value as any }
                    }))}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="system">System</option>
                  </select>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Push Notifications</h4>
                    <p className="text-sm text-gray-500">Receive browser notifications</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={profile.preferences.notifications}
                    onChange={(e) => setProfile(prev => ({ 
                      ...prev, 
                      preferences: { ...prev.preferences, notifications: e.target.checked }
                    }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Email Updates</h4>
                    <p className="text-sm text-gray-500">Receive updates via email</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={profile.preferences.emailUpdates}
                    onChange={(e) => setProfile(prev => ({ 
                      ...prev, 
                      preferences: { ...prev.preferences, emailUpdates: e.target.checked }
                    }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">SMS Updates</h4>
                    <p className="text-sm text-gray-500">Receive updates via SMS</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={profile.preferences.smsUpdates}
                    onChange={(e) => setProfile(prev => ({ 
                      ...prev, 
                      preferences: { ...prev.preferences, smsUpdates: e.target.checked }
                    }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button onClick={handleSaveProfile} disabled={isSaving}>
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Save Preferences'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <Database className="w-5 h-5" />
                Danger Zone
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Delete Account</h4>
                    <p className="text-sm text-gray-500">Permanently delete your account and all data</p>
                  </div>
                  <Button variant="destructive" onClick={handleDeleteAccount}>
                    Delete Account
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

export default UserSettings
