import { calculateHallRent } from "./pricing";
import { formatAddress } from "./utils";

interface InvoiceLine {
  id: string;
  quantity: number;
  price: number;
  product: {
    name: string;
    securityDeposit?: number | null;
  };
}

interface GenerateInvoiceHTMLParams {
  orderId: string;
  invoiceNumber: string;
  createdAt: string | Date;
  startDate: string | Date;
  endDate: string | Date;
  paymentMethod: string;
  lines: InvoiceLine[];
  customerName: string;
  customerEmail?: string | null;
  customerPhone?: string | null;
  customerAddress?: string | null;
  vendorProfile: {
    companyName: string | null;
    gstin: string | null;
    address: string | null;
    signature: string | null;
  };
  discountAmount: number;
  securityDeposit: number;
  expectedRentTotal?: number; // Optional expected total (incl. tax) to force exact alignment
}

export function generateInvoiceHTML({
  orderId,
  invoiceNumber,
  createdAt,
  startDate,
  endDate,
  paymentMethod,
  lines,
  customerName,
  customerEmail,
  customerPhone,
  customerAddress,
  vendorProfile,
  discountAmount,
  securityDeposit,
  expectedRentTotal,
}: GenerateInvoiceHTMLParams): string {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const orderDateStr = new Date(createdAt).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
  const totalDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));

  const companyName = vendorProfile.companyName || "RENTKART PARTNER";
  const gstin = vendorProfile.gstin || "N/A";
  const address = vendorProfile.address || "N/A";
  const signature = vendorProfile.signature || "Authorized Signatory";

  // Derive PAN from GSTIN if valid (GSTIN structure has PAN from index 2 to 12)
  const pan = gstin && gstin.length >= 12 ? gstin.substring(2, 12) : "N/A";
  const cin = "U51225TG1998PTC029666"; // Simulated CIN

  // 1. Calculate original subtotal for the provided lines
  let originalSubtotal = 0;
  const lineDetails = lines.map(line => {
    const pricingBreakdown = calculateHallRent(line.price, start, end);
    const lineTotal = pricingBreakdown.total * line.quantity;
    originalSubtotal += lineTotal;
    return {
      line,
      lineTotal,
      pricingBreakdown
    };
  });

  // 2. Pro-rate discount including tax
  let accumulatedDiscountWithTax = 0;
  const totalDiscountWithTax = Math.round((discountAmount * 1.18) * 100) / 100;

  const rows = lineDetails.map((item, index) => {
    const { line, lineTotal, pricingBreakdown } = item;
    
    let lineDiscountWithTax = 0;
    if (originalSubtotal > 0) {
      if (index === lineDetails.length - 1) {
        lineDiscountWithTax = Math.round((totalDiscountWithTax - accumulatedDiscountWithTax) * 100) / 100;
      } else {
        lineDiscountWithTax = Math.round(((lineTotal / originalSubtotal) * totalDiscountWithTax) * 100) / 100;
        accumulatedDiscountWithTax += lineDiscountWithTax;
      }
    }

    const lineGrossWithTax = Math.round((lineTotal * 1.18) * 100) / 100;
    const lineNetTotalWithTax = Math.round((lineGrossWithTax - lineDiscountWithTax) * 100) / 100;

    // Calculate tax breakdown (CGST 9%, SGST 9%)
    const cgst = Math.round((lineNetTotalWithTax * 0.09 / 1.18) * 100) / 100;
    const sgst = cgst;
    const taxableValue = Math.round((lineNetTotalWithTax - cgst - sgst) * 100) / 100;

    return {
      name: line.product.name,
      quantity: line.quantity,
      dailyPrice: line.price,
      totalDays,
      weekdayCount: pricingBreakdown.weekdayCount,
      weekendCount: pricingBreakdown.weekendCount,
      weekendSurcharge: pricingBreakdown.weekendSurcharge,
      grossAmount: lineGrossWithTax,
      discount: lineDiscountWithTax,
      taxableValue,
      cgst,
      sgst,
      total: lineNetTotalWithTax
    };
  });

  // 3. Defensive adjustment to match expected total paid exactly to database
  if (expectedRentTotal !== undefined && rows.length > 0) {
    const actualRentTotal = rows.reduce((acc, r) => acc + r.total, 0);
    const diff = Math.round((expectedRentTotal - actualRentTotal) * 100) / 100;
    if (Math.abs(diff) > 0 && Math.abs(diff) < 2) {
      const lastRow = rows[rows.length - 1];
      lastRow.total = Math.round((lastRow.total + diff) * 100) / 100;
      lastRow.cgst = Math.round((lastRow.total * 0.09 / 1.18) * 100) / 100;
      lastRow.sgst = lastRow.cgst;
      lastRow.taxableValue = Math.round((lastRow.total - lastRow.cgst - lastRow.sgst) * 100) / 100;
    }
  }

  // Calculate overall totals
  const totalQty = lines.reduce((acc, l) => acc + l.quantity, 0);
  const totalGross = rows.reduce((acc, r) => acc + r.grossAmount, 0);
  const totalDiscount = rows.reduce((acc, r) => acc + r.discount, 0);
  const totalTaxable = rows.reduce((acc, r) => acc + r.taxableValue, 0);
  const totalCgst = rows.reduce((acc, r) => acc + r.cgst, 0);
  const totalSgst = rows.reduce((acc, r) => acc + r.sgst, 0);
  const totalNet = rows.reduce((acc, r) => acc + r.total, 0);
  const grandTotalPaid = totalNet + securityDeposit;

  // Render rows HTML
  const rowsHTML = rows.map(r => `
    <tr style="border-bottom: 1px solid #e2e8f0;">
      <td style="padding: 10px; font-size: 11px; color: #1e293b; font-weight: 500; text-align: left;">
        <span style="font-weight: 700; font-size: 12px; color: #0f172a;">${r.name}</span><br>
        <span style="color: #64748b; font-size: 10px; font-weight: 600;">HSN/SAC: 997212 (Hall Rental Service)</span><br>
        <span style="color: #64748b; font-size: 10px;">Rental period: ${totalDays} days (${r.weekdayCount} weekdays, ${r.weekendCount} weekend days)</span><br>
        <span style="color: #64748b; font-size: 10px; font-weight: 600;">SGST/UTGST: 9.0%, CGST: 9.0%</span>
      </td>
      <td style="padding: 10px; text-align: center; font-size: 11px; font-weight: 600; color: #1e293b;">${r.quantity}</td>
      <td style="padding: 10px; text-align: right; font-size: 11px; font-weight: 650; color: #1e293b;">₹${r.grossAmount.toFixed(2)}</td>
      <td style="padding: 10px; text-align: right; font-size: 11px; font-weight: 650; color: #b91c1c;">${r.discount > 0 ? '-' : ''}₹${r.discount.toFixed(2)}</td>
      <td style="padding: 10px; text-align: right; font-size: 11px; font-weight: 650; color: #1e293b;">₹${r.taxableValue.toFixed(2)}</td>
      <td style="padding: 10px; text-align: right; font-size: 11px; font-weight: 650; color: #1e293b;">₹${r.sgst.toFixed(2)}</td>
      <td style="padding: 10px; text-align: right; font-size: 11px; font-weight: 650; color: #1e293b;">₹${r.cgst.toFixed(2)}</td>
      <td style="padding: 10px; text-align: right; font-size: 11px; font-weight: 700; color: #0f172a;">₹${r.total.toFixed(2)}</td>
    </tr>
  `).join('');

  return `
    <html>
      <head>
        <title>Tax Invoice - #${orderId.slice(-8).toUpperCase()}</title>
        <style>
          @media print {
            body { padding: 0; margin: 0; background-color: #fff; }
            .no-print { display: none; }
          }
          body { font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 25px; color: #1e293b; background-color: #fff; line-height: 1.4; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 11px; }
          th { border-bottom: 2px solid #cbd5e1; padding: 8px 10px; font-weight: 800; text-transform: uppercase; color: #334155; font-size: 10px; letter-spacing: 0.03em; }
          td { padding: 8px 10px; }
        </style>
      </head>
      <body>
        <!-- Title Header -->
        <div style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 15px;">
          <h1 style="margin: 0; font-size: 20px; font-weight: 900; letter-spacing: 0.05em; text-transform: uppercase; color: #000;">Tax Invoice</h1>
        </div>

        <!-- Sold By & Invoice Number Row -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; gap: 20px;">
          <div style="flex: 1; font-size: 11px;">
            <strong style="font-size: 12px; color: #0f172a;">Sold By: ${companyName}</strong><br>
            <span style="font-weight: 600; color: #475569;">Ship-from Address:</span> <span style="color: #555;">${address}</span><br>
            <strong style="color: #0f172a; font-size: 11px;">GSTIN:</strong> <span style="font-mono; font-weight: bold;">${gstin}</span>
          </div>
          <div style="text-align: right; display: flex; flex-direction: column; align-items: flex-end;">
            <!-- Simple clean SVG QR Code mock representing the Invoice number -->
            <svg width="60" height="60" viewBox="0 0 29 29" style="background-color: #fff; border: 1px solid #cbd5e1; padding: 3px; border-radius: 4px;">
              <path d="M0 0h7v7H0zm1 1v5h5V1zm8 0h3v1H9zm4 0h1v1h-1zm1 0h2v1h-2zm3 0h2v2h-1v-1h-1zm3 0h4v4h-4zm1 1v2h2V2zm-9 1h1v1h-1zm1 0h1v1h-1zm3 0h1v2h-1zm4 1h1v1h-1zm-10 1h2v1H9zm1 1h1v1h-1zm1 1h1v1h-1zm-3 0h1v1H9zm4 0h1v1h-1zm1 0h2v1h-2zm3 0h2v1h-2zm3 0h2v1h-2zm1 0h2v1h-2zm-22 2h7v7H0zm1 1v5h5V9zm8 0h1v2h-1zm2 0h1v1h-1zm1 0h2v1h-2zm3 0h1v2h-1zm2 0h4v1h-4zm0 2h1v1h-1zm2 0h2v2h-1v-1h-1zm-7-1h1v1h-1zm2 0h1v1h-1zm-3 1h1v1h-1zm1 0h1v1h-1zm5 0h1v1h-1zm-13 2h2v1H9zm1 1h1v1h-1zm1 1h1v1h-1zm2-2h1v1h-1zm1 0h1v2h-1zm2 1h1v1h-1zm2 0h2v1h-2zm1 0h2v1h-2zm1 0h2v1h-2zm-18 2h7v7H0zm1 1v5h5v-5zm8 0h1v1h-1zm1 0h2v1h-2zm3 0h2v1h-2zm3 0h2v1h-2zm1 0h2v2h-1v-1h-1zm3 0h4v1h-4zm-11 1h1v2h-1zm3 0h1v1h-1zm5 0h2v1h-2zm3 0h1v1h-1zm-13 1h2v1H9zm1 1h1v1h-1zm1 1h1v1h-1zm2-2h1v1h-1zm3 0h2v1h-2zm2 0h1v1h-1zm2 0h2v1h-2z" fill="#000"/>
            </svg>
            <div style="border: 2px solid #0f172a; border-radius: 4px; padding: 6px 12px; margin-top: 10px; font-weight: 900; font-size: 11px; text-transform: uppercase; color: #000; letter-spacing: 0.02em; background-color: #f8fafc;">
              Invoice Number # <span style="font-family: monospace; font-size: 12px;">${invoiceNumber}</span>
            </div>
          </div>
        </div>

        <!-- Meta Grid -->
        <table style="width: 100%; border: 1px solid #cbd5e1; margin-bottom: 25px; border-radius: 6px; overflow: hidden; background-color: #f8fafc;">
          <thead>
            <tr style="background-color: #f1f5f9; border-bottom: 1px solid #cbd5e1;">
              <th style="width: 34%; padding: 8px 12px; text-align: left;">Order Details</th>
              <th style="width: 33%; padding: 8px 12px; text-align: left;">Bill To</th>
              <th style="width: 33%; padding: 8px 12px; text-align: left;">Ship/Venue To</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="vertical-align: top; line-height: 1.6; padding: 12px;">
                <strong style="color: #0f172a;">Order ID:</strong> <span style="font-family: monospace; font-weight: bold; font-size: 11.5px;">${orderId}</span><br>
                <strong style="color: #0f172a;">Order Date:</strong> ${orderDateStr}<br>
                <strong style="color: #0f172a;">Invoice Date:</strong> ${orderDateStr}<br>
                <strong style="color: #0f172a;">PAN:</strong> <span style="font-family: monospace; font-weight: bold;">${pan}</span><br>
                <strong style="color: #0f172a;">CIN:</strong> <span style="font-family: monospace; color: #475569;">${cin}</span>
              </td>
              <td style="vertical-align: top; line-height: 1.6; padding: 12px;">
                <strong style="color: #0f172a; font-size: 12px;">${customerName}</strong><br>
                ${formatAddress(customerAddress)}<br>
                <strong style="color: #0f172a;">Phone:</strong> ${customerPhone || "N/A"}<br>
                <strong style="color: #0f172a;">Email:</strong> ${customerEmail || "N/A"}
              </td>
              <td style="vertical-align: top; line-height: 1.6; padding: 12px;">
                <strong style="color: #0f172a; font-size: 12px;">${customerName}</strong><br>
                ${formatAddress(customerAddress)}<br>
                <strong style="color: #0f172a;">Delivery Type:</strong> Venue Access / Service Setup<br>
                <span style="font-size: 10px; font-weight: bold; color: #475569; display: block; margin-top: 5px;">*Keep this invoice for event entry validation.</span>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Main Items Table -->
        <table style="border: 1px solid #cbd5e1; border-radius: 6px; overflow: hidden;">
          <thead>
            <tr style="background-color: #f8fafc; border-bottom: 2px solid #cbd5e1;">
              <th style="text-align: left; padding: 10px;">Product Description</th>
              <th style="text-align: center; width: 40px; padding: 10px;">Qty</th>
              <th style="text-align: right; width: 100px; padding: 10px;">Gross Amt<br><span style="font-size: 9px; font-weight: 550; text-transform: none;">(Incl. Tax)</span></th>
              <th style="text-align: right; width: 100px; padding: 10px;">Discount<br><span style="font-size: 9px; font-weight: 550; text-transform: none;">(Incl. Tax)</span></th>
              <th style="text-align: right; width: 100px; padding: 10px;">Taxable<br>Value</th>
              <th style="text-align: right; width: 75px; padding: 10px;">SGST<br><span style="font-size: 9px; font-weight: 550;">(9.0%)</span></th>
              <th style="text-align: right; width: 75px; padding: 10px;">CGST<br><span style="font-size: 9px; font-weight: 550;">(9.0%)</span></th>
              <th style="text-align: right; width: 105px; padding: 10px;">Total<br><span style="font-size: 9px; font-weight: 550; text-transform: none;">(Incl. Tax)</span></th>
            </tr>
          </thead>
          <tbody>
            ${rowsHTML}
            
            <!-- Totals Summary Row -->
            <tr style="background-color: #f8fafc; font-weight: 800; border-top: 2px solid #cbd5e1; border-bottom: 1px solid #cbd5e1; text-transform: uppercase; font-size: 10.5px;">
              <td style="padding: 12px 10px; text-align: left;">Total</td>
              <td style="padding: 12px 10px; text-align: center; font-weight: 800;">${totalQty}</td>
              <td style="padding: 12px 10px; text-align: right; font-weight: 800;">₹${totalGross.toFixed(2)}</td>
              <td style="padding: 12px 10px; text-align: right; font-weight: 800; color: #b91c1c;">-₹${totalDiscount.toFixed(2)}</td>
              <td style="padding: 12px 10px; text-align: right; font-weight: 800;">₹${totalTaxable.toFixed(2)}</td>
              <td style="padding: 12px 10px; text-align: right; font-weight: 800;">₹${totalSgst.toFixed(2)}</td>
              <td style="padding: 12px 10px; text-align: right; font-weight: 800;">₹${totalCgst.toFixed(2)}</td>
              <td style="padding: 12px 10px; text-align: right; font-weight: 900; color: #0f172a;">₹${totalNet.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>

        <!-- Totals & Signature Section -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-top: 30px; gap: 20px;">
          <!-- Returns Policy Details (Flipkart Style) -->
          <div style="flex: 1; border: 1px solid #e2e8f0; padding: 12px; border-radius: 6px; background-color: #fff; font-size: 9.5px; color: #475569; max-w: 60%; line-height: 1.5;">
            <strong style="color: #0f172a; font-size: 10.5px; display: block; margin-bottom: 5px; text-transform: uppercase;">Refund & Cancellation Policy:</strong>
            At Rental-System, cancellations are handled strictly based on event preparation schedules:
            <ul style="margin: 4px 0 0 0; padding-left: 15px;">
              <li><strong>100% refund</strong> (Full refund of rental charges & security deposits) for cancellations requested <strong>7 days or more</strong> before the scheduled event.</li>
              <li><strong>50% refund</strong> (Half rental charges, 100% security deposit) for cancellations requested <strong>between 2 and 6 days</strong> before the scheduled event.</li>
              <li><strong>No refund</strong> (0% rental refund, 100% security deposit refunded) for cancellations requested <strong>within 48 hours</strong> of the event.</li>
            </ul>
            <span style="font-style: italic; display: block; margin-top: 6px; color: #64748b;">The services sold are intended for single-event execution and are not for resale. Regd Office: Rental-System Hub, 6TH Sector, HSR Layout, Bengaluru, Karnataka - 560102.</span>
          </div>

          <!-- Price Ledger & Signature Box -->
          <div style="display: flex; flex-direction: column; align-items: flex-end; width: 330px; gap: 15px;">
            <!-- Price Summary table -->
            <table style="width: 100%; border: none; font-size: 11px; margin-top: 0;">
              <tr>
                <td style="padding: 5px 0; color: #475569; font-weight: 600;">Rental Subtotal (Excl. Tax):</td>
                <td style="padding: 5px 0; text-align: right; font-weight: 700; color: #0f172a;">₹${totalTaxable.toFixed(2)}</td>
              </tr>
              <tr>
                <td style="padding: 5px 0; color: #475569; font-weight: 600;">Total Tax (CGST 9% + SGST 9%):</td>
                <td style="padding: 5px 0; text-align: right; font-weight: 700; color: #0f172a;">₹${(totalCgst + totalSgst).toFixed(2)}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 5px 0 10px 0; color: #475569; font-weight: 600;">Refundable Security Deposit:</td>
                <td style="padding: 5px 0 10px 0; text-align: right; font-weight: 700; color: #475569;">₹${securityDeposit.toFixed(2)}</td>
              </tr>
              <tr style="font-size: 16px; font-weight: 900; color: #000;">
                <td style="padding: 10px 0; font-weight: 900; text-transform: uppercase;">Grand Total:</td>
                <td style="padding: 10px 0; text-align: right; font-weight: 950; font-family: monospace;">₹${grandTotalPaid.toFixed(2)}</td>
              </tr>
            </table>

            <!-- Signature Box -->
            <div style="border: 1px dashed #cbd5e1; border-radius: 8px; padding: 12px; text-align: center; width: 220px; background-color: #f8fafc; align-self: flex-end;">
              <div style="font-family: 'Georgia', serif; font-size: 16px; font-style: italic; font-weight: bold; color: #0f172a;">${signature}</div>
              <div style="height: 1px; background-color: #cbd5e1; margin: 8px 0;"></div>
              <div style="font-size: 9px; font-weight: 800; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.05em;">Authorized Signatory</div>
            </div>
          </div>
        </div>

        <!-- Footer Page Markers -->
        <div style="margin-top: 40px; border-top: 1px solid #cbd5e1; padding-top: 10px; font-size: 9px; color: #94a3b8; display: flex; justify-content: space-between; font-weight: bold;">
          <span>Contact Rental-System Support: 044-45614700 | www.rental-system.com/help</span>
          <span>E. & O.E.</span>
          <span>Page 1 of 1</span>
        </div>
      </body>
    </html>
  `;
}
