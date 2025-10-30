import React from 'react'
import { API_CONFIG } from '@/config/api'

const DeploymentCheckPage: React.FC = () => {
  const [apiBase] = React.useState(API_CONFIG.BASE_URL)
  const [health, setHealth] = React.useState<any>(null)
  const [apiDocsOk, setApiDocsOk] = React.useState<boolean | null>(null)
  const [error, setError] = React.useState<string>('')

  React.useEffect(() => {
    const run = async () => {
      try {
        const h = await fetch(`${apiBase}/health`).then(r => r.json()).catch(() => null)
        setHealth(h)
      } catch (e: any) {
        setError(e?.message || 'Health check failed')
      }
      try {
        const r = await fetch(`${apiBase}/api-docs`).catch(() => null)
        setApiDocsOk(!!r && r.status === 200)
      } catch {
        setApiDocsOk(false)
      }
    }
    run()
  }, [apiBase])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="max-w-2xl w-full bg-white rounded-xl shadow p-6 space-y-4">
        <h1 className="text-xl font-semibold">Deployment Check</h1>
        <div className="text-sm text-gray-600">API Base: <span className="font-mono">{apiBase}</span></div>
        {error && <div className="text-sm text-red-600">{error}</div>}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="border rounded p-3">
            <div className="font-medium">/health</div>
            <pre className="text-xs whitespace-pre-wrap mt-2">{health ? JSON.stringify(health, null, 2) : 'Loading...'}</pre>
          </div>
          <div className="border rounded p-3">
            <div className="font-medium">/api-docs</div>
            <div className="mt-2">{apiDocsOk === null ? 'Loading...' : apiDocsOk ? 'OK' : 'Unavailable'}</div>
          </div>
        </div>
        <div className="text-xs text-gray-500">Tip: set VITE_API_URL in Vercel to point the frontend to your backend API.</div>
      </div>
    </div>
  )
}

export default DeploymentCheckPage


