import { ServerClient } from 'postmark';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Postmark client only if API token is available
let postmarkClient = null;
if (process.env.POSTMARK_API_TOKEN) {
  postmarkClient = new ServerClient(process.env.POSTMARK_API_TOKEN);
  console.log('Postmark email service initialized');
} else {
  console.warn('POSTMARK_API_TOKEN not set. Email sending is disabled.');
}

// Helper function to send email via Postmark
const sendEmail = async (to, subject, html, from = null) => {
  if (!postmarkClient) {
    console.log('Skipping email send (Postmark API token missing).', to);
    return { MessageID: null };
  }

  try {
    const fromEmail = from || process.env.POSTMARK_FROM_EMAIL || 'noreply@example.com';
    const fromName = process.env.POSTMARK_FROM_NAME || 'Agri-Mart';
    
    const response = await postmarkClient.sendEmail({
      From: `"${fromName}" <${fromEmail}>`,
      To: to,
      Subject: subject,
      HtmlBody: html,
      MessageStream: 'outbound'
    });

    return response;
  } catch (error) {
    console.error('Postmark email error:', error);
    throw error;
  }
};

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

    const fromEmail = process.env.POSTMARK_FROM_EMAIL || 'noreply@example.com';
    const supportEmail = process.env.POSTMARK_SUPPORT_EMAIL || fromEmail;
    
    const htmlContent = `
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
              <p>If you have any questions, please contact us at ${supportEmail}</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Agri-Mart. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
    `;

    const response = await sendEmail(
      user.email,
      `Order Confirmation - Order #${order._id}`,
      htmlContent
    );

    console.log('Order confirmation email sent:', response.MessageID);
    return response;
  } catch (error) {
    console.error('Error sending order confirmation email (non-fatal):', error);
    // Don't rethrow to avoid crashing order flow when email fails (e.g., SMTP auth issues)
    return null;
  }
};

