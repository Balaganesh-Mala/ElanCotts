import PDFDocument from "pdfkit";
import fetch from "node-fetch";

export const generateInvoicePDF = async (order, res) => {
  const doc = new PDFDocument({ size: "A4", margin: 40 });

  /* ================= CONSTANTS ================= */
  const PAGE_WIDTH = 595;
  const MARGIN = 40;

  const LEFT_X = MARGIN;
  const RIGHT_X = PAGE_WIDTH - 260;
  const COL_WIDTH = 220;

  /* ================= RESPONSE HEADERS ================= */
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=Invoice-${order.orderNo}.pdf`
  );

  doc.pipe(res);

  /* =====================================================
     HEADER
  ===================================================== */
  const headerY = 40;

  // Logo
  if (order.companyLogo) {
    try {
      const response = await fetch(order.companyLogo);
      const buffer = await response.buffer();
      doc.image(buffer, LEFT_X, headerY, { width: 60 });
    } catch {}
  }

  // Title
  doc.fontSize(18).text("TAX INVOICE", 0, headerY + 15, {
    align: "center",
  });

  /* =====================================================
     INVOICE INFO (LEFT ALIGNED)
  ===================================================== */
  const invoiceInfoY = headerY + 60;

  doc
    .fontSize(10)
    .text(`Invoice No: ${order.orderNo}`, LEFT_X, invoiceInfoY, {
      width: COL_WIDTH,
    })
    .text(`Order ID: ${order._id}`, LEFT_X, invoiceInfoY + 14, {
      width: COL_WIDTH,
    })
    .text(
      `Invoice Date: ${new Date(order.createdAt).toLocaleDateString()}`,
      LEFT_X,
      invoiceInfoY + 28,
      { width: COL_WIDTH }
    )
    .text(
      `Payment Method: ${order.paymentMethod}`,
      LEFT_X,
      invoiceInfoY + 42,
      { width: COL_WIDTH }
    )
    .text(
      `Payment Status: ${order.paymentStatus}`,
      LEFT_X,
      invoiceInfoY + 56,
      { width: COL_WIDTH }
    );

  /* =====================================================
     SELLER & CUSTOMER
  ===================================================== */
  const partyY = invoiceInfoY + 90;

  // Seller (LEFT)
  doc
    .fontSize(11)
    .text("Elan Cotts", LEFT_X, partyY, { width: COL_WIDTH })
    .text("Hyderabad, Telangana, India", { width: COL_WIDTH })
    .text("GSTIN: 36XXXXXXXXXX", { width: COL_WIDTH })
    .text("Email: support@elancotts.com", { width: COL_WIDTH })
    .text("Phone: +91-XXXXXXXXXX", { width: COL_WIDTH });

  // Customer (RIGHT)
  doc
    .fontSize(11)
    .text("Bill To", RIGHT_X, partyY, { width: COL_WIDTH })
    .moveDown(0.5)
    .text(order.shippingAddress.name, { width: COL_WIDTH })
    .text(`Phone: ${order.shippingAddress.phone}`, { width: COL_WIDTH })
    .text(order.shippingAddress.street, { width: COL_WIDTH })
    .text(
      `${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}`,
      { width: COL_WIDTH }
    )
    .text(order.shippingAddress.country || "India", {
      width: COL_WIDTH,
    });

  /* =====================================================
     ITEMS TABLE
  ===================================================== */
  const tableY = partyY + 140;
  const rowHeight = 24;
  const tableWidth = PAGE_WIDTH - MARGIN * 2;

  const col = {
    sno: LEFT_X,
    name: LEFT_X + 30,
    hsn: LEFT_X + 230,
    qty: LEFT_X + 300,
    rate: LEFT_X + 350,
    total: LEFT_X + 440,
  };

  doc.fontSize(13).text("Items", LEFT_X, tableY - 20);

  // Table Header
  doc.rect(LEFT_X, tableY, tableWidth, rowHeight).stroke();

  doc
    .fontSize(10)
    .text("S.No", col.sno + 5, tableY + 7)
    .text("Product", col.name + 5, tableY + 7)
    .text("HSN", col.hsn + 5, tableY + 7)
    .text("Qty", col.qty + 5, tableY + 7)
    .text("Rate (INR)", col.rate + 5, tableY + 7)
    .text("Total (INR)", col.total + 5, tableY + 7);

  let rowY = tableY + rowHeight;

  order.orderItems.forEach((item, i) => {
    const lineTotal = item.price * item.qty;

    doc.rect(LEFT_X, rowY, tableWidth, rowHeight).stroke();

    doc
      .fontSize(10)
      .text(i + 1, col.sno + 5, rowY + 7)
      .text(item.name, col.name + 5, rowY + 7, {
        width: col.hsn - col.name - 10,
      })
      .text(item.hsn || "NA", col.hsn + 5, rowY + 7)
      .text(item.qty, col.qty + 5, rowY + 7)
      .text(`INR ${item.price.toFixed(2)}`, col.rate + 5, rowY + 7)
      .text(`INR ${lineTotal.toFixed(2)}`, col.total + 5, rowY + 7);

    rowY += rowHeight;
  });

  /* =====================================================
     SUMMARY (RIGHT)
  ===================================================== */
  const discount = order.discountPrice || 0;
  const tax = order.tax || { cgst: 0, sgst: 0 };
  const taxable = order.itemsPrice - discount;

  const summaryY = rowY + 20;

  doc
    .fontSize(11)
    .text(`Subtotal: INR ${order.itemsPrice.toFixed(2)}`, RIGHT_X, summaryY)
    .text(`Discount: - INR ${discount.toFixed(2)}`, RIGHT_X, summaryY + 16)
    .text(`Taxable Amount: INR ${taxable.toFixed(2)}`, RIGHT_X, summaryY + 32)
    .text(`CGST (2.5%): INR ${tax.cgst.toFixed(2)}`, RIGHT_X, summaryY + 48)
    .text(`SGST (2.5%): INR ${tax.sgst.toFixed(2)}`, RIGHT_X, summaryY + 64);

  doc
    .fontSize(13)
    .text(
      `Grand Total: INR ${order.totalPrice.toFixed(2)}`,
      RIGHT_X,
      summaryY + 90
    );

  /* =====================================================
     FOOTER
  ===================================================== */
  const footerY = 760;

  doc
    .fontSize(10)
    .text(
      "Refund Policy: Returns are accepted within 7 days of delivery. Refunds will be processed within 5–7 business days after inspection.",
      LEFT_X,
      footerY - 30,
      { align: "center", width: tableWidth }
    );

  doc
    .fontSize(10)
    .text(
      "This is a computer-generated invoice and does not require a signature.",
      LEFT_X,
      footerY - 10,
      { align: "center", width: tableWidth }
    );

  doc
    .fontSize(10)
    .text("Authorized Signatory", PAGE_WIDTH - 160, footerY + 10);

  doc.end();
};
