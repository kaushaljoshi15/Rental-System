'use server'

import { auth } from "@/auth"

import { prisma } from "@/lib/prisma"

interface BotResponse {
  reply: string;
  suggestedPrompts: string[];
}

/**
 * Highly responsive AI Customer Support Assistant for RentKart.
 * Integrates directly with the user session and Prisma database to check
 * active orders, cancellation eligibility, wallet status, and help categories.
 */
export async function askSupportBot(message: string): Promise<BotResponse> {
  const query = message.toLowerCase().trim()

  // 1. Resolve Session and User Details
  const session = await auth()
  const userEmail = session?.user?.email

  let user: any = null
  let orders: any[] = []

  if (userEmail) {
    user = await prisma.user.findUnique({
      where: { email: userEmail },
      include: {
        orders: {
          where: { status: { not: "QUOTATION" } },
          include: { lines: { include: { product: true } } },
          orderBy: { createdAt: "desc" }
        }
      }
    })
    if (user) {
      orders = user.orders
    }
  }

  // 2. Clean punctuation, lowercase, and resolve matching helpers
  const cleanQuery = query.replace(/[^\w\s#]/g, "").trim()
  const words = cleanQuery.split(/\s+/)

  const hasKeyword = (keywords: string[]) => 
    keywords.some(kw => cleanQuery.includes(kw)) ||
    words.some(word => keywords.includes(word))

  // 3. Local Semantic Classifier (Already robust and runs entirely in memory with 0% CPU overhead)
  let reply = ""
  let suggestedPrompts: string[] = []

  // Helper to select random template
  const randomSelect = (options: string[]) => options[Math.floor(Math.random() * options.length)]

  // Check if there's any reference-like code in the query (e.g. #ABC12345 or check cancellation for ABC12345)
  let targetRef: string | null = null
  const refMatch = cleanQuery.match(/(?:order|booking|check|cancel|#)\s*#?([0-9a-fA-F]{4,8})/i)
  if (refMatch) {
    targetRef = refMatch[1].toUpperCase()
  } else {
    // Fallback: look for any 4-8 character hex word
    const hexMatch = cleanQuery.match(/\b([0-9a-fA-F]{4,8})\b/i)
    if (hexMatch) {
      targetRef = hexMatch[1].toUpperCase()
    }
  }

  // Option I: Specific Order Lookup / Cancellation Audit (e.g. check cancellation for #Ref)
  if (targetRef && (hasKeyword(["cancel", "refund", "check", "audit", "status", "detail"]))) {
    const targetOrder = orders.find(o => o.id.slice(-8).toUpperCase() === targetRef)

    if (!targetOrder) {
      reply = `### ✕ Order Not Found\n` + randomSelect([
        `I searched your history but couldn't locate any order matching reference \`#${targetRef}\`. Please check the code and try again.`,
        `The booking reference \`#${targetRef}\` was not found in our database. Ensure you copied the exact 8 characters from your dashboard.`,
        `No bookings matched \`#${targetRef}\` under your email. Double-check your active orders list!`
      ])
      suggestedPrompts = ["Help with your order", "Help with your issues"]
    } else {
      const start = new Date(targetOrder.startDate)
      const daysToStart = Math.ceil((start.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      
      let eligibility = ""
      let actionInstruction = ""
      
      if (targetOrder.status === "CANCELLED") {
        eligibility = "This booking is already cancelled."
        actionInstruction = "No further actions are needed."
      } else if (targetOrder.status === "RETURNED") {
        eligibility = "This booking is completed and closed."
        actionInstruction = "Completed bookings cannot be cancelled."
      } else if (daysToStart >= 7) {
        eligibility = "Eligible for **100% Refund** of the rental fees."
        actionInstruction = `You can cancel this booking directly by clicking **Cancel Booking** under order \`#${targetRef}\` in the Orders tab.`
      } else if (daysToStart >= 2) {
        eligibility = "Eligible for **50% Refund** of the rental fees."
        actionInstruction = `You can cancel this booking directly by clicking **Cancel Booking** under order \`#${targetRef}\` in the Orders tab.`
      } else {
        eligibility = "Not eligible for a rental fee refund (cancellation is within 48 hours of starting)."
        actionInstruction = `If you cancel, you will forfeit the rental fee. However, the 100% Security Deposit hold of **₹${targetOrder.securityDeposit.toLocaleString()}** will be refunded to your wallet.`
      }

      reply = `### ⚖️ Cancellation Audit: Order \`#${targetRef}\`
` + randomSelect([
  `I just ran an audit on your booking. Here are the cancellation details:\n`,
  `Here is the live refund assessment for your reference:\n`,
  `The cancellation eligibility breakdown for this booking is as follows:\n`
]) + `* **Rental Period:** ${new Date(targetOrder.startDate).toLocaleDateString()} — ${new Date(targetOrder.endDate).toLocaleDateString()}
* **Status:** ${targetOrder.status}
* **Eligibility:** ${eligibility}

**Action Needed:** ${actionInstruction}`
      suggestedPrompts = ["Help with your order", "Cancellation & Refunds", "Help Topics"]
    }

  // Option C: Cancellation & Refunds Issue (General)
  } else if (hasKeyword(["cancel", "refund", "money back", "return fee"])) {
    reply = `### 📅 Cancellation & Refund Policy
` + randomSelect([
  "Here is our standard refund policy structure for bookings:\n",
  "Let me outline how cancellation refund margins are calculated:\n",
  "Below are the cancellation rules and refund rates:\n"
]) + `1. **Full Refund (100%):** If cancelled at least **7 days** before the scheduled event date.
2. **Partial Refund (50%):** If cancelled between **2 to 6 days** before the event.
3. **No Refund:** Cancellations made within **48 hours** of the booking start date are not eligible for a refund.

*Note: 100% of the Refundable Security Deposit is always returned in all cancellation cases.*`

    if (orders.length > 0) {
      reply += `\n\n### ⚖️ Live Audit for your Active Bookings:`
      orders.forEach((order) => {
        const ref = order.id.slice(-8).toUpperCase()
        const start = new Date(order.startDate)
        const daysToStart = Math.ceil((start.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        
        let eligibility = ""
        if (order.status === "CANCELLED") {
          eligibility = "Already Cancelled"
        } else if (order.status === "RETURNED") {
          eligibility = "Completed & Closed"
        } else if (daysToStart >= 7) {
          eligibility = "Eligible for 100% Refund (Cancel directly in Orders tab)"
        } else if (daysToStart >= 2) {
          eligibility = "Eligible for 50% Refund (Cancel directly in Orders tab)"
        } else {
          eligibility = "Not eligible for rental fee refund (Security deposit will be returned)"
        }

        reply += `\n* **Order #${ref}:** ${eligibility}`
      })
    }
    suggestedPrompts = ["Help with your order", "Payment & Wallet", "Help Topics"]

  // Option A: Help with order / status check
  } else if (hasKeyword(["order", "booking", "rental", "rented", "status", "track", "my item", "latest", "recent", "newest", "last"])) {
    if (!userEmail) {
      reply = `### 🔑 Sign In Required\n` + randomSelect([
        "Please sign in to view your orders and track bookings.\n\n*If you don't have an account, you can register on the homepage.*",
        "You need to be signed in to check order status. Log in via the account gateway on the top navbar.",
        "Sign in is required to pull order logs. Click the Sign In link to continue."
      ])
      suggestedPrompts = ["How to rent a asset?", "Help Topics"]
    } else if (orders.length === 0) {
      reply = `### 📦 No Active Bookings\n` + randomSelect([
        "You haven't placed any rental orders on RentKart yet.\n\n*Start browsing the homepage to schedule items and checkout.*",
        "Your order log is currently empty. You can browse our marketplace and checkout venues or gear to start.",
        "We couldn't find any orders under your email. Visit the homepage to schedule rentals!"
      ])
      suggestedPrompts = ["How to rent a asset?", "Help with your issues", "Help Topics"]
    } else {
      let filteredOrders = [...orders]
      let filterType = "all"
      let filterMessage = ""

      // Filter 1: Latest / Recent / Last / Newest
      if (hasKeyword(["latest", "recent", "newest", "last"])) {
        filteredOrders = filteredOrders.slice(0, 1)
        filterType = "latest"
        filterMessage = randomSelect([
          "Here is your latest rental order on RentKart:",
          "I found your most recent booking details:",
          "Here is your last rented item details:"
        ])
      }
      // Filter 2: Cancelled
      else if (hasKeyword(["cancelled", "cancelled status"])) {
        filteredOrders = filteredOrders.filter(o => o.status === "CANCELLED")
        filterMessage = randomSelect([
          "Here are your cancelled bookings on RentKart:",
          "I found these cancelled orders in your logs:",
          "Below are your cancelled rentals:"
        ])
      }
      // Filter 3: Active / Live / Confirmed / Pending
      else if (hasKeyword(["active", "confirmed", "live", "current", "pending"])) {
        filteredOrders = filteredOrders.filter(o => ["CONFIRMED", "PICKED_UP", "PENDING"].includes(o.status))
        filterMessage = randomSelect([
          "Here are your active and live bookings on RentKart:",
          "I found these ongoing or confirmed orders:",
          "Below are your active rentals:"
        ])
      }
      // Filter 4: Returned / Closed / Completed
      else if (hasKeyword(["returned", "closed", "completed", "done", "past"])) {
        filteredOrders = filteredOrders.filter(o => o.status === "RETURNED")
        filterMessage = randomSelect([
          "Here are your completed rental orders on RentKart:",
          "I found these closed/returned bookings in your logs:",
          "Below are your completed rentals:"
        ])
      }
      // Filter 5: Product Specific (e.g. "where is my drone order?")
      else {
        const queryWords = cleanQuery.split(/\s+/)
        const matchingProductOrders = filteredOrders.filter(o => 
          o.lines.some((l: any) => 
            queryWords.some(qw => qw.length > 2 && l.product.name.toLowerCase().includes(qw))
          )
        )
        if (matchingProductOrders.length > 0) {
          filteredOrders = matchingProductOrders
          filterMessage = `Here are your orders containing matches for "${queryWords.find(w => w.length > 2)}":`
        } else {
          filterMessage = randomSelect([
            "Here are your active rental orders on RentKart:",
            "I found the following bookings in your history:",
            "Below is the list of your rental bookings:"
          ])
        }
      }

      if (filteredOrders.length === 0) {
        reply = `### 📦 No Matching Bookings\n` + randomSelect([
          "Could not find any bookings matching your specific query filters.\n\n*Type **\"my orders\"** to view all of your bookings.*",
          "No bookings matched your description. Try typing **\"my orders\"** to view your complete list.",
          "We couldn't find bookings matching your filter tags. Ask for **\"my orders\"** to reset filters."
        ])
        suggestedPrompts = ["Help with your order", "Help with your issues", "Help Topics"]
      } else {
        reply = `### 📋 ${filterMessage}\n\n`
        filteredOrders.forEach((order) => {
          const ref = order.id.slice(-8).toUpperCase()
          const start = new Date(order.startDate).toLocaleDateString()
          const end = new Date(order.endDate).toLocaleDateString()
          const items = order.lines.map((l: any) => `${l.quantity}x ${l.product.name}`).join(", ")
          
          const statusMap: Record<string, string> = {
            PENDING: "⏳ Awaiting Approval",
            CONFIRMED: "● Booking Confirmed",
            PICKED_UP: "● Rental Live",
            RETURNED: "● Returned & Closed",
            CANCELLED: "✕ Cancelled"
          }
          const friendlyStatus = statusMap[order.status] || order.status

          reply += randomSelect([
            `* **Order Reference:** \`#${ref}\`\n  * **Items:** ${items}\n  * **Rental Period:** ${start} — ${end}\n  * **Status:** ${friendlyStatus}\n  * **Grand Total:** ₹${order.totalAmount.toLocaleString()}\n\n`,
            `* **Reference Code:** \`#${ref}\` (${friendlyStatus})\n  * **Rentals:** ${items}\n  * **Duration:** ${start} to ${end}\n  * **Total Amount:** ₹${order.totalAmount.toLocaleString()}\n\n`
          ])
        })
        
        reply += "\n" + randomSelect([
          "Select one of the quick options or type a question to inspect details.",
          "Let me know if you would like me to audit cancellations for any of these reference codes.",
          "Ask me anything if you need to calculate refund margins for these bookings."
        ])

        suggestedPrompts = [
          `Check cancellation for #${filteredOrders[0].id.slice(-8).toUpperCase()}`,
          "Help with your issues",
          "Help Topics"
        ]
      }
    }

  // Option D: Payment & Wallet Issue
  } else if (hasKeyword(["wallet", "balance", "pay", "payment", "deposit", "topup", "ledger", "superpay"])) {
    const balanceText = user ? `₹${user.walletBalance.toLocaleString()}` : "₹0 (Sign in to view)"
    reply = `### 🪙 Payment & Wallet Ledger
` + randomSelect([
  `Here is your wallet and deposit details:\n`,
  `Live ledger stats and balances for your account:\n`,
  `Your financial and deposit ledger details are as follows:\n`
]) + `* **Current Wallet Balance:** **${balanceText}**
* **Security Deposits:** Refundable holds are collected during checkout. Upon event completion and check, deposits are credited back to your RentKart Wallet within **3-5 business days**.
* **SuperPay Later (Mock Limits B2B):** B2B verified accounts can access mock lines up to ₹1,00,000 for deferred settlements.`
    suggestedPrompts = ["Help with your order", "Cancellation & Refunds", "Help Topics"]

  // Option E: Delivery & Setup Issue
  } else if (hasKeyword(["delivery", "deliver", "ship", "setup", "venue", "location", "dispatch", "logistics"])) {
    reply = `### 🚚 Delivery & Venue Setup
` + randomSelect([
  "Delivery and setup details are coordinated by vendors:\n",
  "Here is our vendor coordinate delivery timeline guidelines:\n"
]) + `* **Asset Handover:** Delivery and venue setups are coordinated directly by Prime Partners and Vendors.
* **Timings:** Setup slots usually commence **4 hours** before your scheduled rental window.
* **Inspections:** Please check assets upon arrival and report any setup issues directly to support or the vendor.`
    suggestedPrompts = ["Help with your order", "Returns & Pickup", "Help Topics"]

  // Option F: Returns & Pickup Issue
  } else if (hasKeyword(["return", "pickup", "pick-up", "collect", "post-event", "damage", "audit"])) {
    reply = `### 📦 Returns & Post-Event Pickup
` + randomSelect([
  "Vendor collection and audit timelines:\n",
  "Here is our post-event pickup guidelines:\n"
]) + `* **Vendor Pickup:** The listing vendor will coordinate collection from the venue at the end of the rental window.
* **Audit Period:** The vendor has **24 hours** to inspect the items and report damages.
* **Deposit Release:** Once audited successfully, your Refundable Hold is credited back instantly to your wallet.`
    suggestedPrompts = ["Help with your order", "Cancellation & Refunds", "Help Topics"]

  // Option G: Account & Settings
  } else if (hasKeyword(["account", "setting", "profile", "avatar", "name", "phone", "address"])) {
    const addressCount = user?.address ? JSON.parse(user.address).length : 0
    reply = `### ⚙️ Account Management
` + randomSelect([
  "Your account and address stats:\n",
  "Here is your profile configuration details:\n"
]) + `* **Personal Details:** Edit your name, phone number, and gender inside the Settings tab.
* **Avatars:** Personalize your profile using premium vector avatar presets.
* **Saved Addresses:** You currently have **${addressCount} saved locations**. Manage them easily in the Addresses manager.`
    suggestedPrompts = ["Help with your issues", "Help Topics"]

  // Option B: Help with issues / Categories list
  } else if (hasKeyword(["issue", "problem", "ticket", "complaint", "wrong", "broken"])) {
    reply = `### 🛠️ Help Categories
` + randomSelect([
  "Select an issue category below to get support guides:\n",
  "Here is our help desk issue index:\n",
  "Please select a topic category below to get help:\n"
]) + `1. **Cancellation & Refunds:** Check refund rules, cancellation deadlines, and order cancellation setup.
2. **Payment & Wallet:** Query your wallet ledger balance, top-up methods, and security deposits.
3. **Delivery & Setup:** Information on venue dispatch, logistics timing, and site inspections.
4. **Returns & Pickup:** Procedures for post-event audit and damage assessments.
5. **Account & Settings:** Guide to change name, set default address, or edit preset avatars.`
    suggestedPrompts = [
      "Cancellation & Refunds",
      "Payment & Wallet",
      "Delivery & Setup",
      "Returns & Pickup",
      "Account & Settings"
    ]

  // Option H: Help Topics / Surcharges / FAQ Guide
  } else if (hasKeyword(["guide", "topic", "faq", "policy", "rules", "surcharge", "weekend", "price", "rate", "gst", "commission"])) {
    if (cleanQuery.includes("weekend") || cleanQuery.includes("surcharge") || cleanQuery.includes("premium")) {
      reply = `### 💰 Weekend Surcharges & Pricing
To balance high demand, bookings scheduled on Saturdays or Sundays attract a **20% peak premium**.
* Base rates apply from Monday to Friday.
* All taxes (18% GST) and deposits are calculated dynamically on the checkout screen.`
      suggestedPrompts = ["How do I rent an asset?", "Payment & Wallet", "Help Topics"]
    } else if (cleanQuery.includes("rent") || cleanQuery.includes("booking") || cleanQuery.includes("procedure")) {
      reply = `### 🏛️ Booking Procedures
1. Select dates on the product listing page.
2. Review the daily subtotals in your Cart tab.
3. Choose a payment method (Card, UPI, Wallet) and complete transaction checkout.
4. Track status in your **Order Central** tab.`
      suggestedPrompts = ["Help with your order", "Payment & Wallet", "Help Topics"]
    } else if (cleanQuery.includes("seller") || cleanQuery.includes("vendor") || cleanQuery.includes("partner")) {
      reply = `### 💼 Partnering as a Vendor
Own equipment or venues? Log out and navigate to the **Partner Gateway** to sign up as a Vendor:
* List items with custom daily/weekly pricing.
* Automate security deposit holding.
* Pay only 10% commission on successful bookings.`
      suggestedPrompts = ["Help Topics", "Help with your issues"]
    } else {
      reply = `### 📖 Help Topics Directory
Choose a topic below to read detailed instructions:

* **Surcharges & Pricing:** Weekend bookings (Saturday & Sunday) attract a **20% peak demand surcharge**. GST is 18%.
* **How to Rent:** Browse products, select dates, add items to cart, and checkout using your wallet or card.
* **Partnering as Seller:** Register as a Vendor to list halls and equipment. Commission is 10%.`
      suggestedPrompts = ["How do I rent an asset?", "What is the weekend surcharge?", "How to register as seller?", "Help with your issues"]
    }

  // Fallback response
  } else {
    reply = `### 🤖 Sahayak AI Assistant
` + randomSelect([
  "Namaste! I am Sahayak, your RentKart support assistant. I can help you check order details, wallet balances, or refund status. How can I help you today?",
  "Welcome to Sahayak Support! I'm here to assist you with active bookings, payments, and cancellation eligibility. What can I do for you?",
  "Hi! Need help with your RentKart orders or policies? I can resolve details about tracking, wallets, or refund rules."
]) + `\n\n**Quick Options:**
* 📦 **Orders:** Type *"Help with your order"* to track active rentals.
* 🛠️ **Issues:** Type *"Help with your issues"* to resolve cancellations or refunds.
* 📖 **Guides:** Type *"Help Topics"* for weekday/weekend rules.`
    suggestedPrompts = ["Help with your order", "Help with your issues", "Help Topics"]
  }

  return {
    reply,
    suggestedPrompts
  }
}

