const { renderOrderConfirmationEmail } = require("./orderConfirmationTemplate");
const { renderOrderStatusEmail, STATUS_CONFIG } = require("./orderStatusTemplate");
const { renderContactInquiryEmail } = require("./contactInquiryTemplate");

module.exports = {
  renderOrderConfirmationEmail,
  renderOrderStatusEmail,
  STATUS_CONFIG,
  renderContactInquiryEmail,
};
