'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

export type Language = 'en' | 'hi' | 'gu'

interface Notification {
  id: string
  title: string
  desc: string
  type: 'order' | 'stock' | 'return' | 'review'
  read: boolean
  date: string
}

interface ChatMessage {
  sender: 'vendor' | 'customer'
  text: string
  time: string
}

interface VendorContextProps {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
  searchQuery: string
  setSearchQuery: (query: string) => void
  notifications: Notification[]
  markNotificationRead: (id: string) => void
  unreadCount: number
  chatMessages: Record<string, ChatMessage[]>
  sendSimulatedMessage: (orderId: string, text: string) => void
  kycVerified: 'PENDING' | 'VERIFIED' | 'REJECTED'
  setKycVerified: (status: 'PENDING' | 'VERIFIED' | 'REJECTED') => void
}

const VendorContext = createContext<VendorContextProps | undefined>(undefined)

const translations: Record<Language, Record<string, string>> = {
  en: {
    dashboard: "Dashboard",
    mylistings: "My Products",
    addproduct: "Add Product",
    orders: "Orders",
    calendar: "Calendar",
    earnings: "Earnings",
    reviews: "Reviews",
    settings: "Settings",
    seller_hub: "Seller Hub",
    welcome_back: "Welcome back",
    total_revenue: "Total Revenue",
    active_rentals: "Active Rentals",
    pending_orders: "Pending Orders",
    avg_rating: "Avg Rating",
    quick_actions: "Quick Actions",
    recent_requests: "Recent Rental Requests",
    low_stock_alert: "Low Stock & Returns",
    all_orders: "All Orders",
    pending: "Pending",
    active: "Active",
    completed: "Completed",
    cancelled: "Cancelled",
    search_placeholder: "Search products, orders, or customers...",
    withdraw: "Withdraw",
    kyc_status: "KYC Status",
    verified: "Verified",
    gstin: "GSTIN",
    gst_summary: "GST Summary",
    availability: "Availability",
    reply: "Reply",
    save: "Save Changes",
  },
  hi: {
    dashboard: "डैशबोर्ड",
    mylistings: "मेरे उत्पाद",
    addproduct: "उत्पाद जोड़ें",
    orders: "ऑर्डर सूची",
    calendar: "कैलेंडर",
    earnings: "कमाई",
    reviews: "समीक्षाएं",
    settings: "सेटिंग्स",
    seller_hub: "विक्रेता हब",
    welcome_back: "स्वागत है",
    total_revenue: "कुल आय",
    active_rentals: "सक्रिय किराये",
    pending_orders: "लंबित ऑर्डर",
    avg_rating: "औसत रेटिंग",
    quick_actions: "त्वरित कार्रवाई",
    recent_requests: "हाल के अनुरोध",
    low_stock_alert: "कम स्टॉक और रिटर्न",
    all_orders: "सभी ऑर्डर",
    pending: "लंबित",
    active: "सक्रिय",
    completed: "पूरा किया गया",
    cancelled: "रद्द किया गया",
    search_placeholder: "उत्पाद, ऑर्डर या ग्राहकों को खोजें...",
    withdraw: "निकासी",
    kyc_status: "केवाईसी स्थिति",
    verified: "सत्यापित",
    gstin: "जीएसटी नंबर",
    gst_summary: "जीएसटी सारांश",
    availability: "उपलब्धता",
    reply: "उत्तर दें",
    save: "बदलाव सहेजें",
  },
  gu: {
    dashboard: "ડેશબોર્ડ",
    mylistings: "મારા ઉત્પાદનો",
    addproduct: "ઉમેરો ઉત્પાદન",
    orders: "ઓર્ડર સૂચિ",
    calendar: "કેલેન્ડર",
    earnings: "કમાણી",
    reviews: "સમીક્ષાઓ",
    settings: "સેટિંગ્સ",
    seller_hub: "વિક્રેતા હબ",
    welcome_back: "સ્વાગત છે",
    total_revenue: "કુલ આવક",
    active_rentals: "સક્રિય ભાડા",
    pending_orders: "બાકી ઓર્ડર્સ",
    avg_rating: "સરેરાશ રેટિંગ",
    quick_actions: "ઝડપી ક્રિયાઓ",
    recent_requests: "તાજેતરના ઓર્ડર",
    low_stock_alert: "ઓછો સ્ટોક અને રિટર્ન",
    all_orders: "બધા ઓર્ડર્સ",
    pending: "બાકી",
    active: "સક્રિય",
    completed: "પૂર્ણ થયેલ",
    cancelled: "રદ કરેલ",
    search_placeholder: "ઉત્પાદન, ઓર્ડર અથવા ગ્રાહકો શોધો...",
    withdraw: "ઉપાડ",
    kyc_status: "કેવાયસી સ્થિતિ",
    verified: "વેરિફાઇડ",
    gstin: "જીએસટી નંબર",
    gst_summary: "જીએસટી સારાંશ",
    availability: "ઉપલબ્ધતા",
    reply: "જવાબ આપો",
    save: "ફેરફારો સાચવો",
  }
}

export function VendorProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem('vendor_lang') as Language
      if (savedLang) return savedLang
    }
    return 'en'
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [kycVerified, setKycVerified] = useState<'PENDING' | 'VERIFIED' | 'REJECTED'>(() => {
    if (typeof window !== 'undefined') {
      const savedKyc = localStorage.getItem('vendor_kyc')
      if (savedKyc === 'PENDING' || savedKyc === 'VERIFIED' || savedKyc === 'REJECTED') {
        return savedKyc
      }
    }
    return 'PENDING'
  })
  
  // Simulated Notifications
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const defaultVal: Notification[] = [
      {
        id: 'n1',
        title: 'New Rental Order #RO-892',
        desc: 'Customer requested DSLR Camera for 4 days.',
        type: 'order',
        read: false,
        date: '10 Mins Ago'
      },
      {
        id: 'n2',
        title: 'Low Stock Alert',
        desc: 'PA Sound Systems is down to 1 available unit.',
        type: 'stock',
        read: false,
        date: '2 Hours Ago'
      },
      {
        id: 'n3',
        title: 'Late Return Notice',
        desc: 'Order #RO-741 (Sony Alpha) was due yesterday.',
        type: 'return',
        read: false,
        date: '1 Day Ago'
      },
      {
        id: 'n4',
        title: 'New Review Posted',
        desc: '5-star rating left on Tripod Stand.',
        type: 'review',
        read: true,
        date: '2 Days Ago'
      }
    ]
    if (typeof window !== 'undefined') {
      const savedNotifs = localStorage.getItem('vendor_notifs')
      if (savedNotifs) {
        try {
          return JSON.parse(savedNotifs)
        } catch {
          return defaultVal
        }
      }
    }
    return defaultVal
  })

  // Simulated Chat Messages
  const [chatMessages, setChatMessages] = useState<Record<string, ChatMessage[]>>(() => {
    const defaultVal = {
      'default': [
        { sender: 'customer', text: 'Hello, is the lens hood included with the Sony Alpha?', time: '12 Jun, 10:15 AM' },
        { sender: 'vendor', text: 'Yes, the lens hood and a storage bag are included.', time: '12 Jun, 10:20 AM' },
        { sender: 'customer', text: 'Great! I have placed the booking.', time: '12 Jun, 10:25 AM' }
      ]
    }
    if (typeof window !== 'undefined') {
      const savedChats = localStorage.getItem('vendor_chats')
      if (savedChats) {
        try {
          return JSON.parse(savedChats)
        } catch {
          return defaultVal
        }
      }
    }
    return defaultVal
  })

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang)
    localStorage.setItem('vendor_lang', lang)
  }

  const handleSetKyc = (status: 'PENDING' | 'VERIFIED' | 'REJECTED') => {
    setKycVerified(status)
    localStorage.setItem('vendor_kyc', status)
  }

  const markNotificationRead = (id: string) => {
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n)
    setNotifications(updated)
    localStorage.setItem('vendor_notifs', JSON.stringify(updated))
  }

  const sendSimulatedMessage = (orderId: string, text: string) => {
    const orderKey = orderId || 'default'
    const newMsg: ChatMessage = {
      sender: 'vendor',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    
    const updatedChats = {
      ...chatMessages,
      [orderKey]: [...(chatMessages[orderKey] || []), newMsg]
    }
    setChatMessages(updatedChats)
    localStorage.setItem('vendor_chats', JSON.stringify(updatedChats))

    // Simulate auto-reply after 3 seconds
    setTimeout(() => {
      const autoReply: ChatMessage = {
        sender: 'customer',
        text: "Thank you for the reply. I will check this.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      const withReply = {
        ...updatedChats,
        [orderKey]: [...(updatedChats[orderKey] || []), autoReply]
      }
      setChatMessages(withReply)
      localStorage.setItem('vendor_chats', JSON.stringify(withReply))
    }, 3000)
  }

  const t = (key: string) => {
    return translations[language][key] || translations['en'][key] || key
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <VendorContext.Provider value={{
      language,
      setLanguage: handleSetLanguage,
      t,
      searchQuery,
      setSearchQuery,
      notifications,
      markNotificationRead,
      unreadCount,
      chatMessages,
      sendSimulatedMessage,
      kycVerified,
      setKycVerified: handleSetKyc
    }}>
      {children}
    </VendorContext.Provider>
  )
}

export function useVendor() {
  const context = useContext(VendorContext)
  if (!context) {
    throw new Error('useVendor must be used within a VendorProvider')
  }
  return context
}
