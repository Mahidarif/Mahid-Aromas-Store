/**
 * Luxury HTML Email Templates for Mahid Aromas
 * Styled using table-based inline CSS compatible with Gmail, Outlook, Apple Mail, etc.
 */

const formatPKR = (amount) =>
  `PKR ${Number(amount || 0).toLocaleString('en-PK')}`;

/**
 * 1. Order Confirmation Email Template
 */
const orderConfirmationTemplate = (order) => {
  const orderRef = `MA-${order._id.toString().slice(-8).toUpperCase()}`;
  const customerName = order.shippingAddress?.fullName || 'Valued Customer';
  const orderDate = new Date(order.createdAt).toLocaleDateString('en-PK', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const itemsHtml = order.cartItems
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #232D48; color: #F0EBE1; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 14px;">
          <strong style="color: #F7E7CE; font-family: Georgia, serif; font-size: 15px;">${item.name}</strong><br>
          <span style="color: #9CA3AF; font-size: 12px;">${item.size}ml · ${item.concentration ? item.concentration.split(' ')[0] : 'EDP'}</span>
        </td>
        <td style="padding: 12px 8px; border-bottom: 1px solid #232D48; color: #9CA3AF; font-size: 13px; text-align: center;">
          x${item.quantity}
        </td>
        <td style="padding: 12px 0; border-bottom: 1px solid #232D48; color: #C9A84C; font-weight: bold; font-size: 14px; text-align: right; font-family: Georgia, serif;">
          ${formatPKR(item.unitPrice * item.quantity)}
        </td>
      </tr>
    `
    )
    .join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Order Confirmation - Mahid Aromas</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0A0E1A; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0A0E1A; padding: 30px 10px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table border="0" cellpadding="0" cellspacing="0" width="600" style="max-width: 600px; background-color: #12182B; border: 1px solid #232D48; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.6);">
          
          <!-- Header Banner -->
          <tr>
            <td align="center" style="background-color: #0A0E1A; padding: 35px 20px; border-bottom: 2px solid #C9A84C;">
              <h1 style="margin: 0; color: #C9A84C; font-family: Georgia, serif; font-size: 26px; letter-spacing: 4px; font-weight: 700; text-transform: uppercase;">
                MAHID AROMAS
              </h1>
              <p style="margin: 6px 0 0 0; color: #9CA3AF; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
                Haute Parfumerie &amp; Luxury Olfactives
              </p>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 35px 35px 20px 35px;">
              <h2 style="margin: 0 0 10px 0; color: #F0EBE1; font-family: Georgia, serif; font-size: 22px; font-weight: normal;">
                Thank You for Your Order, <span style="color: #E8C97A;">${customerName}</span>
              </h2>
              <p style="margin: 0 0 25px 0; color: #9CA3AF; font-size: 14px; line-height: 1.6;">
                We have received your order and are carefully preparing your artisanal fragrance. Your official invoice is attached to this email.
              </p>

              <!-- Order Meta Box -->
              <table border="0" cellpadding="12" cellspacing="0" width="100%" style="background-color: #1A2035; border: 1px solid #232D48; border-radius: 10px; margin-bottom: 25px;">
                <tr>
                  <td width="50%" style="color: #9CA3AF; font-size: 12px; border-right: 1px solid #232D48;">
                    <strong style="color: #C9A84C; text-transform: uppercase; font-size: 10px; letter-spacing: 1px; display: block; margin-bottom: 4px;">Order Reference</strong>
                    <span style="font-family: 'Courier New', monospace; font-size: 15px; color: #F0EBE1; font-weight: bold;">#${orderRef}</span>
                  </td>
                  <td width="50%" style="color: #9CA3AF; font-size: 12px; padding-left: 15px;">
                    <strong style="color: #C9A84C; text-transform: uppercase; font-size: 10px; letter-spacing: 1px; display: block; margin-bottom: 4px;">Order Date</strong>
                    <span style="color: #F0EBE1;">${orderDate}</span>
                  </td>
                </tr>
              </table>

              <!-- Item List -->
              <h3 style="margin: 0 0 12px 0; color: #F7E7CE; font-family: Georgia, serif; font-size: 16px; border-bottom: 1px solid #C9A84C; padding-bottom: 6px;">
                Your Olfactive Selection
              </h3>
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 20px;">
                ${itemsHtml}
              </table>

              <!-- Pricing Summary -->
              <table border="0" cellpadding="4" cellspacing="0" width="100%" style="margin-bottom: 25px;">
                <tr>
                  <td style="color: #9CA3AF; font-size: 13px; text-align: right; padding-right: 15px;">Subtotal:</td>
                  <td width="100" style="color: #F0EBE1; font-size: 13px; text-align: right; font-family: Georgia, serif;">${formatPKR(order.itemsTotal)}</td>
                </tr>
                <tr>
                  <td style="color: #9CA3AF; font-size: 13px; text-align: right; padding-right: 15px;">Shipping Fee:</td>
                  <td width="100" style="color: #22C55E; font-size: 13px; text-align: right; font-family: Georgia, serif;">
                    ${order.shippingFee === 0 ? 'FREE' : formatPKR(order.shippingFee)}
                  </td>
                </tr>
                <tr>
                  <td colspan="2" style="border-top: 1px solid #C9A84C; padding-top: 8px;"></td>
                </tr>
                <tr>
                  <td style="color: #E8C97A; font-family: Georgia, serif; font-size: 16px; font-weight: bold; text-align: right; padding-right: 15px;">Grand Total:</td>
                  <td width="100" style="color: #E8C97A; font-family: Georgia, serif; font-size: 18px; font-weight: bold; text-align: right;">${formatPKR(order.totalAmount)}</td>
                </tr>
              </table>

              <!-- Shipping & Payment Address Cards -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 25px;">
                <tr>
                  <td width="50%" valign="top" style="padding-right: 10px;">
                    <div style="background-color: #1A2035; border: 1px solid #232D48; border-radius: 10px; padding: 14px;">
                      <strong style="color: #C9A84C; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 6px;">Shipping Address</strong>
                      <span style="color: #F0EBE1; font-size: 12px; line-height: 1.5; display: block;">
                        ${order.shippingAddress?.fullName}<br>
                        ${order.shippingAddress?.addressLine1}<br>
                        ${order.shippingAddress?.city}, ${order.shippingAddress?.province}<br>
                        ${order.shippingAddress?.phone}
                      </span>
                    </div>
                  </td>
                  <td width="50%" valign="top" style="padding-left: 10px;">
                    <div style="background-color: #1A2035; border: 1px solid #232D48; border-radius: 10px; padding: 14px;">
                      <strong style="color: #C9A84C; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 6px;">Payment Summary</strong>
                      <span style="color: #F0EBE1; font-size: 12px; line-height: 1.5; display: block;">
                        Method: <strong>${order.paymentMethod}</strong><br>
                        Status: <strong style="color: ${order.paymentStatus === 'Paid' ? '#22C55E' : '#F59E0B'};">${order.paymentStatus}</strong><br>
                        Fulfillment: <strong>Processing</strong>
                      </span>
                    </div>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="background-color: #0A0E1A; padding: 25px 20px; border-top: 1px solid #232D48;">
              <p style="margin: 0 0 6px 0; color: #C9A84C; font-size: 12px; font-family: Georgia, serif;">
                ✨ 100% Guaranteed Original Fragrances
              </p>
              <p style="margin: 0; color: #5C677D; font-size: 11px; line-height: 1.4;">
                Need assistance? Contact our concierge at <a href="mailto:support@mahidaromas.pk" style="color: #E8C97A; text-decoration: none;">support@mahidaromas.pk</a><br>
                &copy; ${new Date().getFullYear()} Mahid Aromas. All Rights Reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};

/**
 * 2. Order Shipped / AWB Dispatched Email Template
 */
const orderShippedTemplate = (order) => {
  const orderRef = `MA-${order._id.toString().slice(-8).toUpperCase()}`;
  const customerName = order.shippingAddress?.fullName || 'Valued Customer';
  const courierName = order.courierName || 'Trax Logistics';
  const trackingNumber = order.courierTrackingNumber || 'N/A';
  const trackingUrl =
    order.awbUrl || `https://sonic.trax.pk/tracking?tracking_number=${trackingNumber}`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Your Order Has Shipped - Mahid Aromas</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0A0E1A; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0A0E1A; padding: 30px 10px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table border="0" cellpadding="0" cellspacing="0" width="600" style="max-width: 600px; background-color: #12182B; border: 1px solid #232D48; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.6);">
          
          <!-- Header Banner -->
          <tr>
            <td align="center" style="background-color: #0A0E1A; padding: 35px 20px; border-bottom: 2px solid #C9A84C;">
              <h1 style="margin: 0; color: #C9A84C; font-family: Georgia, serif; font-size: 26px; letter-spacing: 4px; font-weight: 700; text-transform: uppercase;">
                MAHID AROMAS
              </h1>
              <p style="margin: 6px 0 0 0; color: #9CA3AF; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
                Shipment Dispatch Notification
              </p>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 35px 35px 20px 35px;">
              <div style="text-align: center; margin-bottom: 25px;">
                <span style="font-size: 38px; display: block; margin-bottom: 10px;">📦✨</span>
                <h2 style="margin: 0 0 8px 0; color: #F0EBE1; font-family: Georgia, serif; font-size: 24px;">
                  Your Fragrance is on its Way!
                </h2>
                <p style="margin: 0; color: #9CA3AF; font-size: 14px; line-height: 1.6;">
                  Dear <strong style="color: #E8C97A;">${customerName}</strong>, your package for order <strong style="color: #F0EBE1;">#${orderRef}</strong> has been handed over to our logistics partner for express delivery.
                </p>
              </div>

              <!-- Tracking Details Card -->
              <table border="0" cellpadding="20" cellspacing="0" width="100%" style="background-color: #1A2035; border: 1px solid #C9A84C; border-radius: 12px; margin-bottom: 30px; text-align: center;">
                <tr>
                  <td>
                    <p style="margin: 0 0 4px 0; color: #9CA3AF; font-size: 11px; text-transform: uppercase; letter-spacing: 2px;">
                      Courier Partner
                    </p>
                    <p style="margin: 0 0 16px 0; color: #F7E7CE; font-family: Georgia, serif; font-size: 18px; font-weight: bold;">
                      ${courierName}
                    </p>

                    <p style="margin: 0 0 4px 0; color: #9CA3AF; font-size: 11px; text-transform: uppercase; letter-spacing: 2px;">
                      Airway Bill (AWB) Tracking Number
                    </p>
                    <p style="margin: 0 0 24px 0; color: #C9A84C; font-family: 'Courier New', monospace; font-size: 22px; font-weight: bold; letter-spacing: 2px;">
                      ${trackingNumber}
                    </p>

                    <!-- CTA Button -->
                    <table border="0" cellpadding="0" cellspacing="0" align="center">
                      <tr>
                        <td align="center" style="background: linear-gradient(135deg, #9B7A2A, #E8C97A); border-radius: 8px;">
                          <a href="${trackingUrl}" target="_blank" style="display: inline-block; padding: 14px 32px; color: #0A0E1A; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 14px; font-weight: bold; text-decoration: none; text-transform: uppercase; letter-spacing: 1px;">
                            Track Your Shipment &rarr;
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Delivery Estimates & Info -->
              <table border="0" cellpadding="12" cellspacing="0" width="100%" style="background-color: #12182B; border: 1px solid #232D48; border-radius: 8px; margin-bottom: 25px;">
                <tr>
                  <td style="color: #9CA3AF; font-size: 13px; line-height: 1.6;">
                    🚚 <strong style="color: #F0EBE1;">Estimated Delivery:</strong> 1–3 business days across Pakistan.<br>
                    📍 <strong style="color: #F0EBE1;">Destination:</strong> ${order.shippingAddress?.city}, ${order.shippingAddress?.province}<br>
                    ${order.paymentMethod === 'COD' ? `💵 <strong style="color: #F0EBE1;">Amount to Pay on Delivery:</strong> <span style="color: #C9A84C; font-weight: bold;">${formatPKR(order.totalAmount)}</span>` : `✅ <strong style="color: #22C55E;">Payment Status:</strong> Paid in Full`}
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="background-color: #0A0E1A; padding: 25px 20px; border-top: 1px solid #232D48;">
              <p style="margin: 0 0 6px 0; color: #C9A84C; font-size: 12px; font-family: Georgia, serif;">
                ✨ Crafted with Passion. Packaged with Precision.
              </p>
              <p style="margin: 0; color: #5C677D; font-size: 11px; line-height: 1.4;">
                Questions about your delivery? Reply directly to this email or visit <a href="mailto:support@mahidaromas.pk" style="color: #E8C97A; text-decoration: none;">support@mahidaromas.pk</a><br>
                &copy; ${new Date().getFullYear()} Mahid Aromas. All Rights Reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};

module.exports = {
  orderConfirmationTemplate,
  orderShippedTemplate,
};
