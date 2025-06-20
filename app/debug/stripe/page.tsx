'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

export default function StripeDebugPage() {
  const [debugResult, setDebugResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const testStripeConfig = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/stripe/debug')
      const data = await response.json()
      
      console.log('🔍 Debug Response:', data)
      setDebugResult(data)
    } catch (error) {
      console.error('🔴 Debug Error:', error)
      setDebugResult({ error: error instanceof Error ? error.message : 'Unknown error' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Stripe Debug Page</h1>
      
      <div className="space-y-6">
        <div>
          <Button onClick={testStripeConfig} disabled={isLoading}>
            {isLoading ? 'Testing...' : 'Test Stripe Configuration'}
          </Button>
        </div>

        {debugResult && (
          <div className="bg-gray-100 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Debug Results:</h2>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(debugResult, null, 2)}
            </pre>
          </div>
        )}

        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Environment Variables to Check:</h3>
          <ul className="text-sm space-y-1">
            <li>✅ <code>STRIPE_SECRET_KEY</code> - Should start with sk_test_ or sk_live_</li>
            <li>✅ <code>NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code> - Should start with pk_test_ or pk_live_</li>
            <li>✅ <code>STRIPE_WEBHOOK_SECRET</code> - Should start with whsec_</li>
          </ul>
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Next Steps:</h3>
          <ol className="text-sm space-y-1 list-decimal list-inside">
            <li>Make sure all environment variables are set in .env.local</li>
            <li>Restart your development server after adding env vars</li>
            <li>Check the browser console for detailed error logs</li>
            <li>Try creating a Stripe account on the plan page</li>
          </ol>
        </div>
      </div>
    </div>
  )
} 