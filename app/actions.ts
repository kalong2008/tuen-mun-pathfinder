'use server'

import webpush from 'web-push'
import { saveSubscription, getSubscriptions, deleteSubscription } from '@/app/lib/db'

webpush.setVapidDetails(
  'mailto:info@tuenmunpathfinder.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

export async function subscribeUser(sub: webpush.PushSubscription) {
  try {
    await saveSubscription(JSON.stringify(sub))
    return { success: true }
  } catch (error) {
    console.error('Error subscribing user:', error)
    return { success: false, error: 'Failed to subscribe' }
  }
}

export async function unsubscribeUser(sub: webpush.PushSubscription) {
  try {
    await deleteSubscription(JSON.stringify(sub))
    return { success: true }
  } catch (error) {
    console.error('Error unsubscribing user:', error)
    return { success: false, error: 'Failed to unsubscribe' }
  }
}

export async function sendNotification(message: string) {
  try {
    const subscriptions = await getSubscriptions()
    
    if (subscriptions.length === 0) {
      throw new Error('No subscriptions available')
    }

    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        const subscription = JSON.parse(sub.subscription)
        return webpush.sendNotification(
          subscription,
          JSON.stringify({
            title: 'Tuen Mun Pathfinder',
            body: message,
            icon: '/icon.png',
          })
        )
      })
    )

    const failed = results.filter((r) => r.status === 'rejected')
    if (failed.length > 0) {
      console.error('Some notifications failed to send:', failed)
    }

    return { 
      success: true,
      sent: results.length - failed.length,
      failed: failed.length
    }
  } catch (error) {
    console.error('Error sending push notification:', error)
    return { success: false, error: 'Failed to send notification' }
  }
}