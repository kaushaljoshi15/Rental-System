# 📋 Invoice System Guide - Step by Step

## What I Created For You

I've set up a complete invoice calculation system for your rental project. Here's what you now have:

### 1. **Invoice Calculation Function** (`src/lib/invoice.ts`)
   - This is your main calculation helper
   - It calculates: Subtotal, CGST (9%), SGST (9%), Security Deposit, and Grand Total
   - You can use this anywhere in your project

### 2. **Server Action** (`src/actions/create-order.ts`)
   - This saves orders to your database
   - It uses the invoice calculation function
   - It requires the user to be logged in

### 3. **Example Invoice Page** (`src/app/invoice/page.tsx`)
   - A working example page that shows how everything works
   - You can add items, set security deposit, and see totals calculated automatically
   - Visit: `http://localhost:3000/invoice`

---

## 🚀 How to Use It

### Step 1: Test the Invoice Page

1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **Open your browser and go to:**
   ```
   http://localhost:3000/invoice
   ```

3. **Try it out:**
   - Add items with rate and quantity
   - Set a security deposit
   - Watch the totals calculate automatically!

### Step 2: Use the Calculation Function in Your Own Code

#### Example 1: In a React Component

```typescript
import { calculateInvoiceTotals, type InvoiceItem } from '@/lib/invoice';

function MyComponent() {
  const items: InvoiceItem[] = [
    { rate: 100, qty: 2 },
    { rate: 50, qty: 3 }
  ];
  const securityDeposit = 500;

  const totals = calculateInvoiceTotals(items, securityDeposit);
  
  console.log(totals);
  // Output: { subtotal: 350, cgst: 31.5, sgst: 31.5, securityDeposit: 500, grandTotal: 913 }
}
```

#### Example 2: In a Server Action

```typescript
'use server'
import { calculateInvoiceTotals } from '@/lib/invoice';

export async function myServerAction(items: InvoiceItem[], deposit: number) {
  const totals = calculateInvoiceTotals(items, deposit);
  // Use totals.grandTotal to save to database, etc.
}
```

### Step 3: Create Orders (Save to Database)

When you're ready to save orders to your database, use the server action I created:

```typescript
import { createRentalOrder } from '@/actions/create-order';

// In your component or page
const result = await createRentalOrder(
  items,           // Array of InvoiceItem with productId
  securityDeposit, // Number
  startDate,       // Date
  endDate          // Date
);

if (result.error) {
  // Handle error
} else {
  // Success! Order created
  console.log(result.order);
  console.log(result.totals);
}
```

**Important:** When creating orders, make sure your `InvoiceItem` objects include `productId`:

```typescript
const items: InvoiceItem[] = [
  { 
    rate: 100, 
    qty: 2, 
    productId: "actual-product-id-from-database" 
  }
];
```

---

## 📁 File Structure

```
src/
├── lib/
│   └── invoice.ts          ← Your calculation function (DONE ✅)
├── actions/
│   └── create-order.ts     ← Server action to save orders (DONE ✅)
└── app/
    └── invoice/
        └── page.tsx        ← Example page showing how to use it (DONE ✅)
```

---

## 🎯 Next Steps (What You Might Want to Do)

### Option 1: Integrate with Your Product List
- Fetch products from your database
- Let users select products to add to invoice
- Automatically fill in rates from product data

### Option 2: Add to Checkout Flow
- Use the invoice page in your checkout process
- Connect it to payment processing
- Save orders when payment is confirmed

### Option 3: Create Invoice PDF
- Generate PDF invoices using the calculated totals
- Email invoices to customers

### Option 4: Add More Features
- Discount codes
- Different tax rates for different items
- Multiple currencies
- Invoice history/viewing

---

## 💡 Quick Tips

1. **The calculation function is pure** - it doesn't touch the database, just does math
2. **You can use it anywhere** - components, server actions, API routes
3. **TypeScript types are included** - your editor will help you with autocomplete
4. **The example page is just a demo** - customize it to match your design

---

## ❓ Common Questions

**Q: Where should I use this?**
A: Use it wherever you need to calculate invoice totals - checkout pages, order confirmation, invoice display, etc.

**Q: Can I change the tax rate?**
A: Yes! Edit `src/lib/invoice.ts` and change `0.09` (9%) to whatever rate you need.

**Q: How do I connect it to my products?**
A: Fetch products from your database, then map them to `InvoiceItem` format with `productId`, `rate`, and `qty`.

**Q: Can I use this without the example page?**
A: Absolutely! The calculation function is standalone. The page is just to show you how it works.

---

## 🎉 You're All Set!

You now have:
- ✅ A working invoice calculation system
- ✅ An example page to see it in action
- ✅ A server action to save orders
- ✅ TypeScript types for safety

Just run `npm run dev` and visit `/invoice` to see it working!

