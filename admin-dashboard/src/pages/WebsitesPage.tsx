import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui'
import { Badge } from '../components/ui'
import { Globe } from 'lucide-react'

const WebsitesPage: React.FC = () => {
  const mockWebsites = [
    {
      id: '1',
      name: 'John\'s Portfolio',
      subdomain: 'john-portfolio',
      status: 'PUBLISHED',
      createdAt: new Date(),
    },
    {
      id: '2',
      name: 'Business Website',
      subdomain: 'business-site',
      status: 'DRAFT',
      createdAt: new Date(),
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Websites Management</h1>
        <p className="text-muted-foreground">Monitor and manage all websites on the platform</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Websites</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockWebsites.map((website) => (
              <div
                key={website.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                    <Globe className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">{website.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {website.subdomain}.buildflow.com
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={website.status === 'PUBLISHED' ? 'default' : 'secondary'}>
                        {website.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Created {website.createdAt.toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default WebsitesPage
