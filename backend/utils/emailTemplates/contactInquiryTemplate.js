const { BRAND } = require("./brand");
const { renderLayout, esc } = require("./layout");

const formatDateTime = (date) =>
  new Date(date).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });

const detailRow = (label, value) => `
  <tr>
    <td style="padding:8px 0; width:140px; vertical-align:top; font-size:13px; font-weight:bold; color:${BRAND.colors.black}; font-family:Arial, Helvetica, sans-serif;">${esc(label)}</td>
    <td style="padding:8px 0; font-size:13px; color:${BRAND.colors.muted}; font-family:Arial, Helvetica, sans-serif;">${esc(value)}</td>
  </tr>`;

/**
 * Renders the internal notification email sent to the store's inbox whenever
 * a customer submits the Contact page form.
 * @param {Object} inquiry - { inquiryType, name, email, phone, subject, message, createdAt }
 * @returns {{ subject: string, html: string }}
 */
const renderContactInquiryEmail = (inquiry) => {
  const bodyHtml = `
    <h1 style="margin:0 0 4px; font-family:Georgia, 'Times New Roman', serif; font-size:22px; color:${BRAND.colors.black};">New Contact Inquiry</h1>
    <p style="margin:0 0 24px; font-size:13px; color:${BRAND.colors.muted}; font-family:Arial, Helvetica, sans-serif;">Submitted via the ${esc(BRAND.name)} contact form.</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      ${detailRow("Inquiry Type", inquiry.inquiryType || "General Inquiry")}
      ${detailRow("Name", inquiry.name)}
      ${detailRow("Email", inquiry.email)}
      ${detailRow("Phone", inquiry.phone)}
      ${detailRow("Subject", inquiry.subject)}
      ${detailRow("Date & Time", formatDateTime(inquiry.createdAt || Date.now()))}
    </table>
    <div style="margin-top:20px; padding-top:16px; border-top:1px solid ${BRAND.colors.border};">
      <p style="margin:0 0 8px; font-size:13px; font-weight:bold; color:${BRAND.colors.black}; font-family:Arial, Helvetica, sans-serif;">Message</p>
      <p style="margin:0; font-size:13.5px; line-height:1.6; color:${BRAND.colors.black}; font-family:Arial, Helvetica, sans-serif; white-space:pre-wrap;">${esc(inquiry.message)}</p>
    </div>`;

  return {
    subject: `New Contact Inquiry: ${inquiry.inquiryType || "General Inquiry"} — ${inquiry.name}`,
    html: renderLayout({
      preheader: `New ${inquiry.inquiryType || "General Inquiry"} from ${inquiry.name}`,
      bodyHtml,
    }),
  };
};

module.exports = { renderContactInquiryEmail };
