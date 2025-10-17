import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui'
import { Badge } from '../components/ui'

const UsersPage: React.FC = () => {
  const mockUsers = [
    {
      id: '1',
      email: 'admin@buildflow.com',
      firstName: 'Admin',
      lastName: 'User',
      role: 'SUPER_ADMIN',
      plan: 'ENTERPRISE',
      status: 'ACTIVE',
      createdAt: new Date(),
    },
    {
      id: '2',
      email: 'user@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'USER',
      plan: 'PRO',
      status: 'ACTIVE',
      createdAt: new Date(),
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Users Management</h1>
        <p className="text-muted-foreground">Manage platform users and their subscriptions</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-medium">
                    {user.firstName[0]}{user.lastName[0]}
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">
                      {user.firstName} {user.lastName}
                    </h3>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">{user.role}</Badge>
                      <Badge variant="default">{user.plan}</Badge>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={user.status === 'ACTIVE' ? 'default' : 'secondary'}>
                    {user.status}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">
                    Joined {user.createdAt.toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default UsersPage
