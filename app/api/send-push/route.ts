import { NextResponse } from 'next/server'
import Expo from 'expo-server-sdk'
import { Pool } from '@neondatabase/serverless'

// Create a new Expo SDK client
// Optionally use an access token if configured:
// let expo = new Expo({ accessToken: process.env.EXPO_ACCESS_TOKEN });
let expo = new Expo()

// Create a Neon DB Pool
const pool = new Pool({ connectionString: process.env.DATABASE_URL })

export async function POST(request: Request) {
  try {
    const { title, body, data } = await request.json()

    if (!title || !body) {
      return NextResponse.json({ error: 'Title and body are required' }, { status: 400 })
    }

    // Fetch all push tokens from the database using Neon
    const sql = `SELECT "exponentPushToken" FROM push_subscriptions WHERE "exponentPushToken" IS NOT NULL;`
    const { rows } = await pool.query(sql)

    // Extract tokens - assuming the column name is exponentPushToken
    const pushTokens = rows
      .map((row: { exponentPushToken: string | null }) => row.exponentPushToken) // Adjust property name if needed
      .filter((token: string | null): token is string => token !== null && Expo.isExpoPushToken(token))

    if (pushTokens.length === 0) {
      return NextResponse.json({ message: 'No valid push tokens found to send notifications to.' }, { status: 200 })
    }

    // Construct a message payload for each recipient
    // See https://docs.expo.dev/push-notifications/sending-notifications/#message-request-format
    let messages = []
    for (let pushToken of pushTokens) {
      // Each push token looks like ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]

      // Check that the push token is a valid Expo push token
      if (!Expo.isExpoPushToken(pushToken)) {
        console.error(`Push token ${pushToken} is not a valid Expo push token`)
        continue
      }

      // Construct a message
      messages.push({
        to: pushToken,
        sound: 'default',
        title: title,
        body: body,
        data: data || {}, // Include the JSON data, default to empty object if null/undefined
        channelId: 'default', // Set Android channel ID to default
      })
    }

    // The Expo push service accepts batches of notifications, chunking makes it efficient
    let chunks = expo.chunkPushNotifications(messages)
    let tickets = []
    let errors = []

    // Send the chunks to the Expo push notification service. There are
    // different strategies you could use. A simple one is to send one chunk at a
    // time, which nicely spreads the load out over time:
    for (let chunk of chunks) {
      try {
        let ticketChunk = await expo.sendPushNotificationsAsync(chunk)
        tickets.push(...ticketChunk)
        // NOTE: If a ticket contains an error code in ticket.details.error,
        // you must handle it appropriately. The error codes are listed in the Expo documentation:
        // https://docs.expo.dev/push-notifications/sending-notifications/#individual-errors
        // We will just collect them for now.
        ticketChunk.forEach((ticket, index) => {
          if (ticket.status === 'error') {
            errors.push({ token: chunk[index].to, error: ticket.details?.error, message: ticket.message })
          }
        })

      } catch (error) {
        console.error('Error sending push notification chunk:', error)
        // Log the error associated with the chunk. It might map to tokens.
        errors.push({ chunkData: chunk, error: error instanceof Error ? error.message : String(error) })
      }
    }

    // TODO: Later, you might want to implement push receipt checking using the ticket IDs.
    // See: https://docs.expo.dev/push-notifications/sending-notifications/#check-push-receipts-for-errors

    if (errors.length > 0) {
      console.error('Push notification errors:', errors)
      // Decide how to respond. Maybe still success if some sent?
      // For simplicity, return success but mention errors were logged.
      return NextResponse.json({
        message: `Notifications sent, but ${errors.length} error(s) occurred (logged server-side). Tickets processed: ${tickets.length}`,
        errors: errors, // Optionally return errors (be careful with sensitive info)
        tickets: tickets, // Return tickets for potential receipt checking client-side (less common)
      }, { status: 207 }) // Multi-Status
    }

    return NextResponse.json({ message: `Successfully sent notifications to ${tickets.length} device(s).`, tickets }, { status: 200 })

  } catch (error) {
    console.error('Failed to send notifications:', error)
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
    return NextResponse.json({ error: `Internal Server Error: ${errorMessage}` }, { status: 500 })
  }
} 