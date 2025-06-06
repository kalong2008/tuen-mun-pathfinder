'use client'

import Image from "next/image";
import * as motion from "motion/react-client";
import { FaChurch, FaUserFriends, FaHiking, FaBook, FaChild } from "react-icons/fa";
import MyCalendar from "@/app/ui/calendar";
import VersePopup from "@/app/ui/VersePopup";
//import { useState, useEffect } from 'react'
//import { subscribeUser, unsubscribeUser } from '@/app/actions'
 
// Commenting out notification-related functions for future use
/*
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
 
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
 
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

function PushNotificationManager() {
  const [isSupported, setIsSupported] = useState(false)
  const [subscription, setSubscription] = useState<PushSubscription | null>(null)
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default')
  const [showPopup, setShowPopup] = useState(false)
  const [isPWA, setIsPWA] = useState(false)
 
  useEffect(() => {
    // Check if running in PWA mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                        (window.navigator as any).standalone || 
                        document.referrer.includes('android-app://');
    setIsPWA(isStandalone);

    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true)
      const permission = Notification.permission
      setPermissionStatus(permission)
      
      // Show popup if permission is default (not yet asked) and in PWA mode
      if (permission === 'default' && isStandalone) {
        setShowPopup(true)
      }
      
      registerServiceWorker()
    }
  }, [])
 
  async function registerServiceWorker() {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none',
      })
      const sub = await registration.pushManager.getSubscription()
      setSubscription(sub)
    } catch (error) {
      console.error('Service Worker registration failed:', error)
    }
  }
 
  async function subscribeToPush() {
    try {
      const permission = await Notification.requestPermission()
      setPermissionStatus(permission)
      setShowPopup(false) // Hide popup after user makes a choice
      
      if (permission !== 'granted') {
        throw new Error('Permission denied')
      }

      const registration = await navigator.serviceWorker.ready
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
        ),
      })
      setSubscription(sub)
      const serializedSub = JSON.parse(JSON.stringify(sub))
      await subscribeUser(serializedSub)
    } catch (error) {
      console.error('Error subscribing to push notifications:', error)
    }
  }
 
  async function unsubscribeFromPush() {
    try {
      await subscription?.unsubscribe()
      setSubscription(null)
      if (subscription) {
        const serializedSub = JSON.parse(JSON.stringify(subscription))
        await unsubscribeUser(serializedSub)
      }
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error)
    }
  }
 
  if (!isSupported) {
    return null; // Don't show anything if not supported
  }

  if (!isPWA) {
    return null; // Don't show anything if not in PWA mode
  }

  if (permissionStatus === 'denied') {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800">
          Push notifications are blocked. Please enable them in your browser settings to receive updates.
        </p>
      </div>
    )
  }
 
  return (
    <>
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Enable Push Notifications</h3>
            <p className="text-gray-600 mb-4">
              Would you like to receive notifications about upcoming events and activities?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowPopup(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
              >
                Maybe Later
              </button>
              <button
                onClick={subscribeToPush}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Enable Notifications
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Push Notifications</h3>
        {subscription ? (
          <>
            <p className="text-gray-700 mb-2">You are subscribed to push notifications.</p>
            <button 
              onClick={unsubscribeFromPush}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
            >
              Unsubscribe
            </button>
          </>
        ) : (
          <>
            <p className="text-gray-700 mb-2">You are not subscribed to push notifications.</p>
            <button 
              onClick={subscribeToPush}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
            >
              Subscribe
            </button>
          </>
        )}
      </div>
    </>
  )
}
*/

export default function Home() {
  return (
    <>
      <VersePopup />
      <motion.div
        className="w-full m-auto pt-[64px]"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 1,
          scale: { type: "spring", visualDuration: 0.4, bounce: 0.5 },
        }}
      >
        <div className="relative">
          <Image
            src="/photo/2024/2024-09-promotion/2024-09-promotion-87.jpeg"
            alt="banner-photo"
            width="4000"
            height="1610"
            className="w-full"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900/80 to-gray-900/60 flex flex-col items-center justify-center text-white">
            <h1 className="text-2xl md:text-6xl font-bold mb-4">屯門前鋒會 幼鋒會</h1>
            <h3 className="text-md md:text-2xl">Tuen Mun Pathfinder and Adventurer Club</h3>
          </div>
        </div>
      </motion.div>

      {/* Adventurer Section */}
      <section className="py-12 bg-gradient-to-b from-zinc-100 to-zinc-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl font-bold mb-8 text-center text-[#123458]">幼鋒會</h2>
          </motion.div>
          
          <motion.div 
            className="grid md:grid-cols-2 gap-8 mb-8"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            <div className="shadow-lg rounded-lg overflow-hidden md:order-2">
              <Image
                src="/photo/2024/2024-09-visit-pineapple/2024-09-visit-pineapple-7.jpeg"
                alt="幼鋒會活動"
                width={4000}
                height={2667}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="md:order-1">
              <p className="text-lg mb-4 text-gray-700">
              幼鋒會旨在幫助 6-9 歲的兒童成長，讓他們能在沒有父母在場的情況下，學習如何與其他小朋友相處，並能夠學到如何照顧自己。
                
              </p>
              <p className="text-lg text-gray-700">
                幼鋒會每星期提供專為這個年齡段的需求而設計的活動，同時每個月會有不同的主題，讓小朋友可以學習到不同的知識。
              </p>
            </div>
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-3 gap-6 text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="p-6 border border-[#70859a] rounded-lg shadow-md hover:shadow-lg transition bg-white/80">
              <FaChurch className="text-4xl mx-auto mb-4 text-[#123458]" />
              <h3 className="text-xl font-semibold mb-2 text-[#123458]">理念</h3>
              <p className="text-gray-700">
                基督復臨安息日會教會贊助的事工，幫助兒童在能夠快樂地成長、培養良好的品格。
              </p>
            </div>
            <div className="p-6 border border-[#70859a] rounded-lg shadow-md hover:shadow-lg transition bg-white/80">
              <FaChild className="text-4xl mx-auto mb-4 text-[#123458]" />
              <h3 className="text-xl font-semibold mb-2 text-[#123458]">目標</h3>
              <p className="text-gray-700">
              旨在培養基督般的品格與愛，養成獨立自主、堅韌自信、懂得感恩，能面對挑戰並獨立生活。
              </p>
            </div>
            <div className="p-6 border border-[#70859a] rounded-lg shadow-md hover:shadow-lg transition bg-white/80">
              <FaBook className="text-4xl mx-auto mb-4 text-[#123458]" />
              <h3 className="text-xl font-semibold mb-2 text-[#123458]">課程</h3>
              <p className="text-gray-700">
                幼鋒會課程分為4個級別：勤蜂、陽光、工匠和援手，每個級別都針對特定年齡組設計。
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pathfinder Section */}
      <section className="py-12 bg-gradient-to-b from-zinc-100 to-zinc-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl font-bold mb-8 text-center text-[#1B4D3E]">前鋒會</h2>
          </motion.div>
          
          <motion.div 
            className="grid md:grid-cols-2 gap-8 mb-8"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            <div className="shadow-lg rounded-lg overflow-hidden md:order-1">
              <Image
                src="/photo/2024/2024-12-drilling-training/2024-12-drilling-training-1.jpg"
                alt="前鋒會活動"
                width={4000}
                height={2667}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="md:order-2">
              <p className="text-lg mb-4 text-gray-700">
              「前鋒會」不僅意味著行軍、露營和自然研究等探索，這個為10至15歲青少年成立的團體，更致力於達成雙重目標：開闊他們的世界視野，並幫助他們建立與上帝的關係。
              </p>
              <p className="text-lg text-gray-700">
                全球有近 200 萬會員，這個由基督復臨安息日會教會贊助的活動，接受任何願意學習並挑戰自己的青少年。
              </p>
            </div>
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-3 gap-6 text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="p-6 border border-[#76948b] rounded-lg shadow-md hover:shadow-lg transition bg-white/80">
              <FaUserFriends className="text-4xl mx-auto mb-4 text-[#1B4D3E]" />
              <h3 className="text-xl font-semibold mb-2 text-[#1B4D3E]">領䄂</h3>
              <p className="text-gray-700">
                我們所有導師都是義工領袖，他們都是忠心的基督徒，他們都將帶領前鋒會視為生命中的使命。
              </p>
            </div>
            <div className="p-6 border border-[#76948b] rounded-lg shadow-md hover:shadow-lg transition bg-white/80">
              <FaHiking className="text-4xl mx-auto mb-4 text-[#1B4D3E]" />
              <h3 className="text-xl font-semibold mb-2 text-[#1B4D3E]">活動</h3>
              <p className="text-gray-700">
              前鋒會透過社區服務、自然研究、露營等多樣化活動，挑戰並激發每位會員的獨特潛能與天賦。
              </p>
            </div>
            <div className="p-6 border border-[#76948b] rounded-lg shadow-md hover:shadow-lg transition bg-white/80">
              <FaBook className="text-4xl mx-auto mb-4 text-[#1B4D3E]" />
              <h3 className="text-xl font-semibold mb-2 text-[#1B4D3E]">班級</h3>
              <p className="text-gray-700">
                建立在六個級別的課程上，並有約 350 個涵蓋藝術、自然、個人成長等專業技能發展主題。
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Join Us Call to Action */}
      <section className="py-16 bg-gradient-to-b from-zinc-100 to-zinc-50 text-center">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl font-bold mb-4">今天就加入我們！</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              我們歡迎所有兒童及青少年加入我們的幼鋒會及前鋒會，一起學習、成長，並在與上帝建立關係的同時享受樂趣。
            </p>
            <a 
              href="https://wa.me/85265721493?text=我想查詢有關幼鋒會及前鋒會的資料。" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block"
            >
              <button className="bg-gray-900 text-white px-8 py-3 rounded-full font-bold text-lg hover:bg-gray-700 transition">
                聯絡我們
              </button>
            </a>
          </motion.div>
        </div>
      </section>

      {/* Meeting Time and Calendar */}
      <section className="py-12 bg-gradient-to-b from-zinc-100 to-zinc-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">集會時間</h2>
          </motion.div>
          
          <div className="p-6 border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition bg-white mb-8">
            <MyCalendar />
          </div>
        </div>
      </section>
    </>
  );
}
