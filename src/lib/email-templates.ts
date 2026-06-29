/**
 * Email HTML templates for transactional emails
 * Used by Resend API in notification routes
 */

const BASE_STYLE = `
  font-family: 'Georgia', serif;
  max-width: 600px;
  margin: 0 auto;
  background: #FDF8F5;
  color: #2D1B25;
`;

const HEADER = (salonName = 'Lakshana Premier Beauty Salon') => `
  <div style="text-align:center;padding:32px 40px 20px;background:linear-gradient(135deg,#2D1B25,#4A1F35);">
    <h1 style="margin:0;color:#E8A0B4;font-size:26px;font-weight:300;letter-spacing:0.05em;">${salonName}</h1>
    <div style="height:2px;background:linear-gradient(90deg,transparent,#D4447A,transparent);margin:12px auto;width:200px;"></div>
    <p style="margin:0;color:rgba(232,160,180,0.7);font-size:11px;letter-spacing:0.3em;text-transform:uppercase;">Premium Beauty Experience</p>
  </div>
`;

const FOOTER = (phone = '', email = '', address = '') => `
  <div style="background:#2D1B25;padding:24px 40px;text-align:center;">
    <p style="margin:0 0 6px;color:#E8A0B4;font-size:13px;">${address}</p>
    <p style="margin:0;color:rgba(232,160,180,0.6);font-size:12px;">
      ${phone}${phone && email ? ' · ' : ''}${email}
    </p>
    <div style="height:1px;background:rgba(212,68,122,0.2);margin:16px 0;"></div>
    <p style="margin:0;color:rgba(232,160,180,0.4);font-size:11px;">
      © ${new Date().getFullYear()} Lakshana Premier Beauty Salon. All rights reserved.
    </p>
  </div>
`;

export function bookingConfirmationEmail(data: {
  customerName: string;
  phone: string;
  services: Array<{ name: string; duration: string; member?: string }>;
  bookingId: string;
  salonName?: string;
  salonPhone?: string;
  salonEmail?: string;
  salonAddress?: string;
}) {
  const { customerName, phone, services, bookingId, salonName, salonPhone, salonEmail, salonAddress } = data;
  return `
  <div style="${BASE_STYLE}">
    ${HEADER(salonName)}
    <div style="padding:40px;">
      <p style="color:#D4447A;font-size:11px;letter-spacing:0.35em;text-transform:uppercase;margin:0 0 8px;">Booking Confirmed</p>
      <h2 style="margin:0 0 20px;font-size:28px;font-weight:300;color:#2D1B25;">Thank you, ${customerName}!</h2>
      <p style="color:#7B4F62;line-height:1.8;margin:0 0 24px;">
        Your appointment request has been received. Our team will contact you on 
        <strong style="color:#2D1B25;">${phone}</strong> to confirm the final details.
      </p>

      <div style="background:rgba(212,68,122,0.06);border-left:3px solid #D4447A;border-radius:4px;padding:20px;margin-bottom:24px;">
        <p style="margin:0 0 12px;font-size:11px;letter-spacing:0.3em;text-transform:uppercase;color:#D4447A;">Services Requested</p>
        ${services.map(s => `
          <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(212,68,122,0.1);">
            <div>
              <p style="margin:0;font-weight:500;color:#2D1B25;font-size:14px;">${s.name}</p>
              <p style="margin:2px 0 0;color:#B89BAA;font-size:12px;">${s.duration}</p>
            </div>
            ${s.member ? `<span style="color:#D4447A;font-weight:600;font-size:14px;">${s.member}</span>` : ''}
          </div>
        `).join('')}
      </div>

      <p style="font-size:12px;color:#B89BAA;margin:0;">Booking Reference: <strong style="color:#2D1B25;">#${bookingId.slice(-6).toUpperCase()}</strong></p>
    </div>
    ${FOOTER(salonPhone, salonEmail, salonAddress)}
  </div>`;
}

export function invoiceEmail(data: {
  customerName: string;
  invoiceNumber: string;
  items: Array<{ name: string; quantity: number; total: number }>;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: string;
  salonName?: string;
  salonPhone?: string;
  salonEmail?: string;
  salonAddress?: string;
}) {
  const { customerName, invoiceNumber, items, subtotal, discount, tax, total, paymentMethod, salonName, salonPhone, salonEmail, salonAddress } = data;
  return `
  <div style="${BASE_STYLE}">
    ${HEADER(salonName)}
    <div style="padding:40px;">
      <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:28px;">
        <div>
          <p style="color:#D4447A;font-size:11px;letter-spacing:0.35em;text-transform:uppercase;margin:0 0 6px;">Invoice</p>
          <h2 style="margin:0;font-size:24px;font-weight:300;color:#2D1B25;">${customerName}</h2>
        </div>
        <div style="text-align:right;">
          <p style="margin:0;font-size:13px;color:#B89BAA;">#${invoiceNumber}</p>
          <p style="margin:4px 0 0;font-size:12px;color:#B89BAA;">${new Date().toLocaleDateString('en-IN', { day:'numeric',month:'long',year:'numeric' })}</p>
        </div>
      </div>

      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
        <thead>
          <tr style="background:#D4447A;color:white;">
            <th style="padding:10px 14px;text-align:left;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;">Service / Product</th>
            <th style="padding:10px 14px;text-align:center;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;">Qty</th>
            <th style="padding:10px 14px;text-align:right;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${items.map((item, i) => `
            <tr style="background:${i % 2 === 0 ? '#fff' : '#FFF8FB'};">
              <td style="padding:10px 14px;font-size:13px;color:#2D1B25;">${item.name}</td>
              <td style="padding:10px 14px;text-align:center;font-size:13px;color:#7B4F62;">${item.quantity}</td>
              <td style="padding:10px 14px;text-align:right;font-size:13px;font-weight:600;color:#2D1B25;">₹${item.total.toLocaleString('en-IN')}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div style="display:flex;justify-content:flex-end;margin-bottom:24px;">
        <div style="width:220px;">
          <div style="display:flex;justify-content:space-between;padding:6px 0;color:#7B4F62;font-size:13px;">
            <span>Subtotal</span><span>₹${subtotal.toLocaleString('en-IN')}</span>
          </div>
          ${discount > 0 ? `<div style="display:flex;justify-content:space-between;padding:6px 0;color:#22C55E;font-size:13px;"><span>Discount</span><span>-₹${discount.toLocaleString('en-IN')}</span></div>` : ''}
          ${tax > 0 ? `<div style="display:flex;justify-content:space-between;padding:6px 0;color:#7B4F62;font-size:13px;"><span>Tax</span><span>₹${tax.toLocaleString('en-IN')}</span></div>` : ''}
          <div style="display:flex;justify-content:space-between;padding:10px 0;font-size:18px;font-weight:700;color:#D4447A;border-top:2px solid rgba(212,68,122,0.2);margin-top:4px;">
            <span>Total</span><span>₹${total.toLocaleString('en-IN')}</span>
          </div>
          <p style="margin:6px 0 0;font-size:11px;color:#B89BAA;text-align:right;text-transform:capitalize;">Paid via ${paymentMethod}</p>
        </div>
      </div>

      <div style="background:rgba(212,68,122,0.06);border-radius:8px;padding:16px;text-align:center;">
        <p style="margin:0;color:#D4447A;font-size:14px;">Thank you for choosing ${salonName || 'Lakshana Beauty Salon'}! 💄</p>
      </div>
    </div>
    ${FOOTER(salonPhone, salonEmail, salonAddress)}
  </div>`;
}

export function thankYouEmail(data: {
  customerName: string;
  services: string[];
  salonName?: string;
  salonPhone?: string;
  salonEmail?: string;
  salonAddress?: string;
  instagramUrl?: string;
}) {
  const { customerName, services, salonName, salonPhone, salonEmail, salonAddress, instagramUrl } = data;
  return `
  <div style="${BASE_STYLE}">
    ${HEADER(salonName)}
    <div style="padding:40px;text-align:center;">
      <div style="width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg,#D4447A,#E8A0B4);display:inline-flex;align-items:center;justify-content:center;margin-bottom:20px;">
        <span style="font-size:28px;">💄</span>
      </div>
      <p style="color:#D4447A;font-size:11px;letter-spacing:0.35em;text-transform:uppercase;margin:0 0 8px;">You were amazing!</p>
      <h2 style="margin:0 0 16px;font-size:28px;font-weight:300;color:#2D1B25;">Thank you, ${customerName}!</h2>
      <p style="color:#7B4F62;line-height:1.8;margin:0 0 24px;max-width:420px;margin-left:auto;margin-right:auto;">
        We loved having you with us today. Your beauty is our inspiration, 
        and we hope your experience was nothing short of extraordinary.
      </p>

      <div style="background:rgba(212,68,122,0.06);border-radius:8px;padding:20px;margin-bottom:24px;text-align:left;">
        <p style="margin:0 0 10px;font-size:11px;letter-spacing:0.3em;text-transform:uppercase;color:#D4447A;">Today's Services</p>
        ${services.map(s => `<p style="margin:4px 0;color:#2D1B25;font-size:13px;">✨ ${s}</p>`).join('')}
      </div>

      ${instagramUrl ? `
      <a href="${instagramUrl}" style="display:inline-block;padding:12px 28px;background:linear-gradient(135deg,#D4447A,#B03060);color:white;text-decoration:none;border-radius:24px;font-size:12px;letter-spacing:0.2em;text-transform:uppercase;margin-bottom:24px;">
        Follow Us on Instagram
      </a>` : ''}

      <p style="color:#B89BAA;font-size:12px;margin:0;">We look forward to seeing you again soon. 🌸</p>
    </div>
    ${FOOTER(salonPhone, salonEmail, salonAddress)}
  </div>`;
}

export function offerEmail(data: {
  customerName: string;
  offerTitle: string;
  offerBody: string;
  couponCode?: string;
  expiresAt?: string;
  salonName?: string;
  salonPhone?: string;
  salonEmail?: string;
  salonAddress?: string;
}) {
  const { customerName, offerTitle, offerBody, couponCode, expiresAt, salonName, salonPhone, salonEmail, salonAddress } = data;
  return `
  <div style="${BASE_STYLE}">
    ${HEADER(salonName)}
    <div style="padding:40px;">
      <p style="color:#D4447A;font-size:11px;letter-spacing:0.35em;text-transform:uppercase;margin:0 0 8px;">Exclusive Offer</p>
      <h2 style="margin:0 0 8px;font-size:28px;font-weight:300;color:#2D1B25;">Hi ${customerName},</h2>
      <h3 style="margin:0 0 16px;font-size:22px;font-weight:500;color:#D4447A;">${offerTitle}</h3>
      <p style="color:#7B4F62;line-height:1.8;margin:0 0 24px;">${offerBody}</p>

      ${couponCode ? `
      <div style="background:linear-gradient(135deg,rgba(212,68,122,0.1),rgba(176,48,96,0.06));border:2px dashed rgba(212,68,122,0.4);border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;">
        <p style="margin:0 0 6px;font-size:11px;letter-spacing:0.35em;text-transform:uppercase;color:#7B4F62;">Your Coupon Code</p>
        <p style="margin:0;font-size:28px;font-weight:700;color:#D4447A;letter-spacing:0.15em;">${couponCode}</p>
        ${expiresAt ? `<p style="margin:8px 0 0;font-size:11px;color:#B89BAA;">Valid until ${new Date(expiresAt).toLocaleDateString('en-IN', { day:'numeric',month:'long',year:'numeric' })}</p>` : ''}
      </div>` : ''}

      <div style="text-align:center;">
        <a href="#" style="display:inline-block;padding:14px 36px;background:linear-gradient(135deg,#D4447A,#B03060);color:white;text-decoration:none;border-radius:4px;font-size:11px;letter-spacing:0.3em;text-transform:uppercase;box-shadow:0 8px 24px rgba(212,68,122,0.35);">
          Book Your Appointment
        </a>
      </div>
    </div>
    ${FOOTER(salonPhone, salonEmail, salonAddress)}
  </div>`;
}
