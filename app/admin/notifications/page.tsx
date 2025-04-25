'use client'

import { useState } from 'react'
import { useAuth, useUser } from '@clerk/nextjs'
import { sendNotification } from '@/app/actions'

export default function AdminNotifications() {
  const [message, setMessage] = useState('')
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
    if (message.trim()) {
      await sendNotification(message)
      setMessage('')
    }
  }

  return (
    <div className="w-4/5 m-auto pb-14 pt-[64px]">
      <h1 className="text-2xl font-bold mb-4">Send Notification</h1>
      <div className="max-w-md">
        <textarea
          className="w-full p-2 border rounded mb-4"
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Enter notification message"
        />
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          onClick={handleSendNotification}
        >
          Send Notification
        </button>
      </div>
    </div>
  )
} 