'use server'

interface BotResponse {
  reply: string;
  suggestedPrompts: string[];
}

/**
 * Simulates a highly responsive AI Customer Support Assistant for RentalKart.
 * Parses user input keywords and generates instant, helpful support replies.
 */
export async function askSupportBot(message: string): Promise<BotResponse> {
  const query = message.toLowerCase().trim();

  // Basic Latency simulation for realism
  await new Promise(resolve => setTimeout(resolve, 500));

  let reply = "";
  let suggestedPrompts: string[] = [];

  if (query.includes("cancel") || query.includes("refund")) {
    reply = `### 📅 Cancellation & Refund Policy
Halls can be cancelled directly through the Customer Dashboard under **Order Central**:
1. **Full Refund (100%):** If cancelled at least **7 days** before the scheduled event date.
2. **Partial Refund (50%):** If cancelled between **2 to 6 days** before the event.
3. **No Refund:** Cancellations made within **48 hours** of the booking start date are not eligible for a refund.

*Note: Security deposits are always refunded 100% in case of cancellation.*`;
    suggestedPrompts = ["How is the security deposit refunded?", "Can I change my booking dates?"];

  } else if (query.includes("deposit") || query.includes("security")) {
    reply = `### 🔒 Security Deposit Policy
All hall rentals require a refundable **Security Deposit** to safeguard the venue against damages.
* **Payment:** Collected alongside the booking subtotal during checkout.
* **Refund Process:** Following your event, the vendor inspects the hall. If no damages are reported, the deposit is credited back to your original payment method within **3-5 business days**.`;
    suggestedPrompts = ["What happens if there is damage?", "How do I pay for my booking?"];

  } else if (query.includes("book") || query.includes("rent") || query.includes("how to")) {
    reply = `### 🏛️ How to Rent a Hall on RentalKart
Renting is streamlined into 4 simple steps:
1. **Browse Catalog:** Head to the [Equipment/Halls Directory](/products) and search by capacity, city, or name.
2. **Check Dates:** Open the hall detail page, select your **Start & End Dates**, and click **Add to Quotation**.
3. **Review Cart:** Go to your [Rental Cart](/dashboard/customer/cart) to see the daily rates and weekend premiums.
4. **Submit Checkout:** Click **Confirm Checkout**. Our PostgreSQL system checks real-time availability and instantly locks the dates for you.`;
    suggestedPrompts = ["Is there a weekend surcharge?", "What payment methods are supported?"];

  } else if (query.includes("weekend") || query.includes("price") || query.includes("charge") || query.includes("cost")) {
    reply = `### 💰 Platform Pricing & Surcharges
* **Base Rate:** The standard daily rate set by the vendor for weekdays (Monday–Friday).
* **Weekend Surcharge:** Saturdays and Sundays attract a **20% peak demand premium** (automatically calculated in your Cart).
* **Taxes:** A standard **18% Market GST/SGST** is applied to the final subtotal.
* **No Hidden Fees:** You will see a complete, itemized cost sheet before making any payment.`;
    suggestedPrompts = ["Do you support partial payments?", "How to rent a hall?"];

  } else if (query.includes("vendor") || query.includes("sell") || query.includes("register my")) {
    reply = `### 💼 Partnering as a Vendor (SaaS)
If you own a banquet hall, marriage lawn, or conference room, you can register as a **Vendor**:
1. Register a new account and select the **Vendor role** on the [Register Page](/register).
2. Complete your profile by entering your **GSTIN number** and **Company Name**.
3. Upload your halls with photos, daily pricing, and capacity lists.
4. Platforms take a standard **10% commission** on successful bookings. Payouts are generated automatically after events.`;
    suggestedPrompts = ["How are payouts processed?", "Is vendor registration free?"];

  } else {
    // Default Fallback assistant response
    reply = `### 🤖 RentalKart Support Assistant
Hello! I am your AI Support Assistant. I can help you with bookings, cancellations, security deposits, and pricing options.

Here are some common topics I can assist you with:
* **Booking Procedures:** *"How do I rent a hall?"*
* **Refund Policies:** *"Can I cancel my booking?"*
* **Fees & Deposits:** *"What is the weekend surcharge?"*
* **Partnering:** *"How do I register as a seller?"*

How can I help you today?`;
    suggestedPrompts = ["How do I rent a hall?", "Can I cancel my booking?", "What is the weekend surcharge?"];
  }

  return {
    reply,
    suggestedPrompts
  };
}
