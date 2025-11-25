import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create transporter only if SMTP credentials are available
let transporter = null;
if (process.env.SMTP_USER && process.env.SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  // Verify transporter
  transporter.verify((error, success) => {
    if (error) {
      console.error('Email service error:', error);
    } else {
      console.log('Email service is ready');
    }
  });
} else {
  console.warn('SMTP_USER or SMTP_PASS not set. Email sending is disabled.');
  // Provide a dummy transporter API so calls to sendMail won't crash
  transporter = {
    sendMail: async (mailOptions) => {
      console.log('Skipping email send (SMTP credentials missing).', mailOptions && mailOptions.to);
      return { messageId: null };
    }
  };
}

// Send order confirmation email
export const sendOrderConfirmationEmail = async (order, user, address) => {
  try {
    const orderItems = order.items.map(item => {
      return `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #ddd;">
            <img src="${item.product.images[0]}" alt="${item.product.title}" style="width: 60px; height: 60px; object-fit: cover;">
          </td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.product.title}</td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.size}</td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.quantity}</td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd;">$${item.price}</td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd;">$${(item.price * item.quantity).toFixed(2)}</td>
        </tr>
      `;
    }).join('');

    const mailOptions = {
      from: `"Agri-Mart" <${process.env.SMTP_USER}>`,
      to: user.email,
      subject: `Order Confirmation - Order #${order._id}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .order-details { background-color: white; padding: 15px; margin: 20px 0; border-radius: 5px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th { background-color: #4CAF50; color: white; padding: 10px; text-align: left; }
            td { padding: 10px; border-bottom: 1px solid #ddd; }
            .total { font-size: 18px; font-weight: bold; text-align: right; margin-top: 20px; }
            .footer { text-align: center; padding: 20px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Order Confirmation</h1>
            </div>
            <div class="content">
              <p>Dear ${user.firstName} ${user.lastName},</p>
              <p>Thank you for your order! We've received your order and will process it shortly.</p>
              
              <div class="order-details">
                <h2>Order Details</h2>
                <p><strong>Order ID:</strong> ${order._id}</p>
                <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
                <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
                <p><strong>Payment Status:</strong> ${order.paymentStatus}</p>
                <p><strong>Order Status:</strong> ${order.status}</p>
              </div>

              <div class="order-details">
                <h2>Shipping Address</h2>
                <p>${address.firstName} ${address.lastName}</p>
                <p>${address.street}</p>
                <p>${address.city}, ${address.state} ${address.zipCode}</p>
                <p>${address.country}</p>
                <p>Phone: ${address.phone}</p>
              </div>

              <div class="order-details">
                <h2>Order Items</h2>
                <table>
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Product</th>
                      <th>Size</th>
                      <th>Quantity</th>
                      <th>Price</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${orderItems}
                  </tbody>
                </table>
                <div class="total">
                  <p>Subtotal: $${order.amount.toFixed(2)}</p>
                  <p>Shipping: $${order.shippingFee.toFixed(2)}</p>
                  <p>Tax: $${order.tax.toFixed(2)}</p>
                  <p>Total: $${order.totalAmount.toFixed(2)}</p>
                </div>
              </div>

              <p>We'll send you another email when your order ships.</p>
              <p>If you have any questions, please contact us at ${process.env.SMTP_USER}</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Agri-Mart. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Order confirmation email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending order confirmation email (non-fatal):', error);
    // Don't rethrow to avoid crashing order flow when email fails (e.g., SMTP auth issues)
    return null;
  }
};

