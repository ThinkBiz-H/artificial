const transporter = require("../config/mailer");
const logger = require("./logger");

/**
 * Low-level reusable SMTP sender. Every mail utility/service in the app
 * (utils/sendEmail.js templates, services/emailService.js) sends through
 * this single function so transporter/logging behavior stays in one place.
 * @param {Object} options - { to, subject, html, text }
 */
const sendMail = async ({ to, subject, html, text }) => {
  const mailOptions = {
    from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
    to,
    subject,
    html,
    text,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email sent to ${to}: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error(`Failed to send email to ${to}: ${error.message}`);
    throw error;
  }
};

module.exports = { sendMail };
