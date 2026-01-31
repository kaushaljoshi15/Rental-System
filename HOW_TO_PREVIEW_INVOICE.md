# 🖼️ How to Preview Your Invoice

## Quick Steps:

### Step 1: Make Sure Server is Running
If you see the server running in your terminal, you're good! If not, run:
```bash
npm run dev
```

### Step 2: Open Your Browser
Open any web browser (Chrome, Firefox, Edge, etc.)

### Step 3: Go to the Invoice Page
Type this URL in your browser's address bar:

```
http://localhost:3000/invoice
```

**OR** click this link if your server is running:
👉 [http://localhost:3000/invoice](http://localhost:3000/invoice)

---

## What You'll See:

✅ **Sample Invoice** with demo data:
- Company: Invincible Rentals Pvt. Ltd.
- Client: Aastha Bhatt (Orion Adventures)
- 2 Products: DSLR Camera & Trekking Tent
- All calculations (Subtotal, CGST, SGST, Grand Total)
- Payment status badge (PARTIALLY PAID)
- Print and Download buttons

---

## Preview Options:

### 1. **View Sample Invoice** (Default)
```
http://localhost:3000/invoice
```
Shows a demo invoice with sample data.

### 2. **View Real Invoice** (From Database)
```
http://localhost:3000/invoice?orderId=YOUR_ORDER_ID
```
Replace `YOUR_ORDER_ID` with an actual order ID from your database.

### 3. **Print Preview**
- Click the **"Print Invoice"** button
- Or press `Ctrl+P` (Windows) / `Cmd+P` (Mac)
- This shows how it will look when printed

---

## Troubleshooting:

### ❌ "Cannot GET /invoice"
- Make sure your server is running (`npm run dev`)
- Check the terminal for any errors
- Wait a few seconds for the server to start

### ❌ Page is blank or loading
- Check browser console (F12) for errors
- Make sure all files were saved
- Try refreshing the page (F5)

### ❌ Server not starting
```bash
# Stop the server (Ctrl+C)
# Then restart:
npm run dev
```

---

## 🎨 What to Check:

When previewing, verify:
- ✅ Invoice header with company name
- ✅ Vendor and client details
- ✅ Product table with items
- ✅ Calculations are correct
- ✅ Payment status badge (green/yellow)
- ✅ Print button works
- ✅ Layout matches your design

---

## 📸 Screenshot Tips:

To take a screenshot of your invoice:
1. Press `F12` to open Developer Tools
2. Click the device toolbar icon (or press `Ctrl+Shift+M`)
3. Select a device size (e.g., "Desktop")
4. Take a screenshot

---

**That's it!** Just open `http://localhost:3000/invoice` in your browser! 🚀

