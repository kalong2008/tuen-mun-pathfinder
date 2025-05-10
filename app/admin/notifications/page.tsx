'use client'

import { useState } from 'react'
import { useAuth, useUser } from '@clerk/nextjs'
// Removed unused sendNotification import
// import { sendNotification } from '@/app/actions'

export default function AdminNotifications() {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [screenPath, setScreenPath] = useState('')
  const [statusMessage, setStatusMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const { isLoaded, userId, isSignedIn } = useAuth()
  const { user } = useUser()

  if (!isLoaded || !isSignedIn) {
    return <div>Loading...</div>
  }

  const isAdmin = user?.publicMetadata?.role === 'admin'
  if (!isAdmin) {
    return <div className="w-4/5 m-auto pb-14 pt-[64px]">Access denied. Admin only.</div>
  }

  async function handleSendNotification() {
    setStatusMessage('')
    setIsLoading(true)

    if (!title.trim() || !body.trim()) {
      setStatusMessage('Error: Title and body are required.')
      setIsLoading(false)
      return
    }

    let finalScreenPath = screenPath.trim();
    if (finalScreenPath && !finalScreenPath.startsWith('/')) {
        finalScreenPath = '/' + finalScreenPath;
    }

    const notificationData = finalScreenPath ? { screen: finalScreenPath } : {}

    try {
      const response = await fetch('/api/send-push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          body: body.trim(),
          data: notificationData,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || `HTTP error! status: ${response.status}`)
      }

      setStatusMessage(`Success: ${result.message}`)
      setTitle('')
      setBody('')
      setScreenPath('')
    } catch (error: any) {
      console.error('Failed to send notification:', error)
      setStatusMessage(`Error sending notification: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-4/5 m-auto pb-14 pt-[64px]">
      <h1 className="text-2xl font-bold mb-6">Send Expo Push Notification</h1>
      <div className="max-w-xl space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Message title
          </label>
          <input
            type="text"
            id="title"
            className="w-full p-2 border rounded shadow-sm focus:ring-blue-500 focus:border-blue-500"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter notification title"
            disabled={isLoading}
          />
        </div>

        <div>
          <label htmlFor="body" className="block text-sm font-medium text-gray-700 mb-1">
            Message body
          </label>
          <textarea
            id="body"
            className="w-full p-2 border rounded shadow-sm focus:ring-blue-500 focus:border-blue-500"
            rows={4}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Enter notification body"
            disabled={isLoading}
          />
        </div>

        <div>
          <label htmlFor="screenPath" className="block text-sm font-medium text-gray-700 mb-1">
            Target Screen Path (Optional)
          </label>
          <input
            type="text"
            id="screenPath"
            className="w-full p-2 border rounded shadow-sm focus:ring-blue-500 focus:border-blue-500"
            value={screenPath}
            onChange={(e) => setScreenPath(e.target.value)}
            placeholder="e.g., notice or contact"
            disabled={isLoading}
          />
          <p className="mt-1 text-xs text-gray-500">Enter the app path to navigate to when the notification is tapped.</p>
        </div>

        <button
          className={`w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed`}
          onClick={handleSendNotification}
          disabled={isLoading}
        >
          {isLoading ? 'Sending...' : 'Send Notification'}
        </button>

        {statusMessage && (
          <p className={`mt-4 text-sm ${statusMessage.startsWith('Error:') ? 'text-red-600' : 'text-green-600'}`}>
            {statusMessage}
          </p>
        )}
      </div>
    </div>
  )
} 