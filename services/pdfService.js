const PDFDocument = require('pdfkit');

/**
 * Builds the PDF visual layout for a Mahid Aromas invoice onto a given PDFDocument instance.
 *
 * @param {Object} order - The Order Mongoose document
 * @param {PDFKit.PDFDocument} doc - PDFDocument instance
 */
const buildInvoiceLayout = (order, doc) => {
  const formatPKR = (val) => `PKR ${Number(val || 0).toLocaleString('en-PK')}`;

  // ── Header & Branding ──────────────────────────────────────────────────────
  doc
    .fontSize(22)
    .font('Helvetica-Bold')
    .fillColor('#0A0E1A')
    .text('MAHID AROMAS', 50, 50);

  doc
    .fontSize(9)
    .font('Helvetica')
    .fillColor('#C9A84C')
    .text('HAUTE PARFUMERIE & LUXURY OLFACTIVES', 50, 75);

  doc
    .fontSize(16)
    .font('Helvetica-Bold')
    .fillColor('#0A0E1A')
    .text('INVOICE', 400, 50, { align: 'right' });

  const orderRef = `MA-${order._id.toString().slice(-8).toUpperCase()}`;
  const orderDate = new Date(order.createdAt).toLocaleDateString('en-PK', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  doc
    .fontSize(9)
    .font('Helvetica')
    .fillColor('#5C677D')
    .text(`Invoice Ref: #${orderRef}`, 400, 72, { align: 'right' })
    .text(`Date: ${orderDate}`, 400, 85, { align: 'right' });

  // Gold accent divider line
  doc
    .strokeColor('#C9A84C')
    .lineWidth(1.5)
    .moveTo(50, 105)
    .lineTo(550, 105)
    .stroke();

  // ── Customer & Logistics Details ──────────────────────────────────────────
  const customerY = 120;

  // Left Column: Customer & Shipping
  doc
    .fontSize(10)
    .font('Helvetica-Bold')
    .fillColor('#0A0E1A')
    .text('BILLED & SHIPPED TO:', 50, customerY);

  doc
    .fontSize(9)
    .font('Helvetica')
    .fillColor('#333333')
    .text(order.shippingAddress?.fullName || 'Customer', 50, customerY + 16)
    .text(`Phone: ${order.shippingAddress?.phone || 'N/A'}`, 50, customerY + 28)
    .text(order.shippingAddress?.addressLine1 || '', 50, customerY + 40)
    .text(
      `${order.shippingAddress?.city || ''}, ${order.shippingAddress?.province || ''} ${order.shippingAddress?.postalCode || ''}`,
      50,
      customerY + 52
    );

  // Right Column: Order & Logistics Info
  doc
    .fontSize(10)
    .font('Helvetica-Bold')
    .fillColor('#0A0E1A')
    .text('PAYMENT & DISPATCH:', 350, customerY);

  doc
    .fontSize(9)
    .font('Helvetica')
    .fillColor('#333333')
    .text(`Payment Method: ${order.paymentMethod}`, 350, customerY + 16)
    .text(`Payment Status: ${order.paymentStatus}`, 350, customerY + 28)
    .text(`Order Status: ${order.orderStatus}`, 350, customerY + 40);

  if (order.courierTrackingNumber) {
    doc
      .font('Helvetica-Bold')
      .fillColor('#C9A84C')
      .text(`Tracking (${order.courierName || 'Courier'}): ${order.courierTrackingNumber}`, 350, customerY + 52);
  }

  // ── Items Table ────────────────────────────────────────────────────────────
  const tableTop = 205;

  // Table Header Background
  doc
    .rect(50, tableTop, 500, 22)
    .fill('#12182B');

  doc
    .fontSize(9)
    .font('Helvetica-Bold')
    .fillColor('#F7E7CE')
    .text('ITEM DESCRIPTION', 60, tableTop + 6)
    .text('SIZE / CONC.', 260, tableTop + 6)
    .text('QTY', 370, tableTop + 6, { align: 'center', width: 30 })
    .text('PRICE', 410, tableTop + 6, { align: 'right', width: 60 })
    .text('TOTAL', 480, tableTop + 6, { align: 'right', width: 60 });

  let y = tableTop + 28;

  order.cartItems.forEach((item, index) => {
    if (index % 2 === 1) {
      doc.rect(50, y - 4, 500, 24).fill('#F9FAFB');
    }

    doc
      .fontSize(9)
      .font('Helvetica-Bold')
      .fillColor('#12182B')
      .text(item.name, 60, y)
      .font('Helvetica')
      .fillColor('#5C677D')
      .text(`${item.size}ml · ${item.concentration ? item.concentration.split(' ')[0] : 'EDP'}`, 260, y)
      .text(String(item.quantity), 370, y, { align: 'center', width: 30 })
      .text(formatPKR(item.unitPrice), 410, y, { align: 'right', width: 60 })
      .font('Helvetica-Bold')
      .fillColor('#12182B')
      .text(formatPKR(item.unitPrice * item.quantity), 480, y, { align: 'right', width: 60 });

    y += 24;
  });

  // Table bottom border
  doc
    .strokeColor('#E5E7EB')
    .lineWidth(1)
    .moveTo(50, y + 4)
    .lineTo(550, y + 4)
    .stroke();

  // ── Pricing Summary ────────────────────────────────────────────────────────
  const summaryY = y + 15;

  doc
    .fontSize(9)
    .font('Helvetica')
    .fillColor('#5C677D')
    .text('Subtotal:', 380, summaryY, { width: 80, align: 'right' })
    .fillColor('#12182B')
    .text(formatPKR(order.itemsTotal), 470, summaryY, { width: 70, align: 'right' });

  doc
    .fillColor('#5C677D')
    .text('Shipping Fee:', 380, summaryY + 16, { width: 80, align: 'right' })
    .fillColor('#12182B')
    .text(order.shippingFee === 0 ? 'FREE' : formatPKR(order.shippingFee), 470, summaryY + 16, {
      width: 70,
      align: 'right',
    });

  doc
    .strokeColor('#C9A84C')
    .lineWidth(1)
    .moveTo(380, summaryY + 34)
    .lineTo(550, summaryY + 34)
    .stroke();

  doc
    .fontSize(12)
    .font('Helvetica-Bold')
    .fillColor('#C9A84C')
    .text('Grand Total:', 360, summaryY + 42, { width: 100, align: 'right' })
    .text(formatPKR(order.totalAmount), 470, summaryY + 42, { width: 70, align: 'right' });

  // ── Footer & Authenticity Seal ─────────────────────────────────────────────
  doc
    .fontSize(8)
    .font('Helvetica-Oblique')
    .fillColor('#5C677D')
    .text('Thank you for your patronage. Every fragrance bottle is 100% authentic and carefully crafted.', 50, 720, {
      align: 'center',
      width: 500,
    })
    .text('Mahid Aromas · support@mahidaromas.pk · www.mahidaromas.pk', 50, 735, {
      align: 'center',
      width: 500,
    });
};

/**
 * Streams the PDF invoice directly to an HTTP Express response.
 *
 * @param {Object} order - The Order Mongoose document
 * @param {Object} res - Express response object
 */
const generateInvoiceStream = (order, res) => {
  const doc = new PDFDocument({ margin: 50, size: 'A4' });
  const filename = `Invoice-MA-${order._id.toString().slice(-8).toUpperCase()}.pdf`;

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="${filename}"`);

  doc.pipe(res);
  buildInvoiceLayout(order, doc);
  doc.end();
};

/**
 * Generates an in-memory Buffer of the PDF invoice for email attachments.
 *
 * @param {Object} order - The Order Mongoose document
 * @returns {Promise<Buffer>} Resolves to the PDF binary buffer
 */
const generateInvoiceBuffer = (order) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const chunks = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', (err) => reject(err));

    buildInvoiceLayout(order, doc);
    doc.end();
  });
};

module.exports = {
  generateInvoiceStream,
  generateInvoiceBuffer,
};
