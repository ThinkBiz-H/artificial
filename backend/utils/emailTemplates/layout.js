const { BRAND } = require("./brand");

/** Escapes user-controlled strings (names, addresses, product titles) before interpolation into HTML. */
const esc = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
  );

const money = (n) => `Rs. ${Number(n || 0).toFixed(2)}`;

/** Solid gold CTA button, table-based for Outlook/Gmail compatibility. */
const button = (label, url, { variant = "primary" } = {}) => {
  const bg = variant === "primary" ? BRAND.colors.gold : "transparent";
  const color = variant === "primary" ? BRAND.colors.white : BRAND.colors.black;
  const border =
    variant === "primary" ? BRAND.colors.gold : BRAND.colors.black;

  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="display:inline-table; margin:6px 8px;">
      <tr>
        <td align="center" bgcolor="${bg}" style="border-radius:4px; border:1px solid ${border};">
          <a href="${url}" target="_blank" style="display:inline-block; padding:12px 28px; font-family:Arial, Helvetica, sans-serif; font-size:13px; font-weight:bold; letter-spacing:0.5px; text-transform:uppercase; color:${color}; text-decoration:none;">
            ${esc(label)}
          </a>
        </td>
      </tr>
    </table>`;
};

/** A pill-shaped status badge used at the top of status-update emails. */
const badge = (text, color) => `
  <span style="display:inline-block; padding:6px 18px; border-radius:20px; background:${color}; color:${BRAND.colors.white}; font-family:Arial, Helvetica, sans-serif; font-size:12px; font-weight:bold; letter-spacing:1px; text-transform:uppercase;">
    ${esc(text)}
  </span>`;

/**
 * Wraps `bodyHtml` in the shared premium, responsive email shell: logo
 * header, ivory content card, and footer with store contact details.
 * `preheader` is the short hidden preview text shown in inbox lists.
 */
const renderLayout = ({ preheader = "", bodyHtml = "" }) => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<title>${esc(BRAND.name)}</title>
<style>
  @media only screen and (max-width: 600px) {
    .container { width: 100% !important; }
    .stack { display: block !important; width: 100% !important; }
    .px { padding-left: 20px !important; padding-right: 20px !important; }
  }
</style>
</head>
<body style="margin:0; padding:0; background:${BRAND.colors.ivory}; -webkit-font-smoothing:antialiased;">
  <div style="display:none; max-height:0; overflow:hidden; opacity:0;">${esc(preheader)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${BRAND.colors.ivory};">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" class="container" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px; max-width:600px; background:${BRAND.colors.white};">
          <!-- Header -->
          <tr>
            <td align="center" bgcolor="${BRAND.colors.black}" style="padding:28px 24px;">
              ${
                BRAND.logoUrl
                  ? `<img src="${BRAND.logoUrl}" alt="${esc(BRAND.name)}" height="40" style="height:40px; display:block;" />`
                  : `<span style="font-family:Georgia, 'Times New Roman', serif; font-size:24px; letter-spacing:2px; color:${BRAND.colors.gold}; text-transform:uppercase;">${esc(BRAND.name)}</span>`
              }
            </td>
          </tr>
          <!-- Gold accent rule -->
          <tr><td height="3" bgcolor="${BRAND.colors.gold}" style="line-height:3px; font-size:0;">&nbsp;</td></tr>
          <!-- Body -->
          <tr>
            <td class="px" style="padding:40px 40px;">
              ${bodyHtml}
            </td>
          </tr>
          <!-- Footer -->
          <tr><td height="1" bgcolor="${BRAND.colors.border}" style="line-height:1px; font-size:0;">&nbsp;</td></tr>
          <tr>
            <td class="px" align="center" style="padding:28px 40px; font-family:Arial, Helvetica, sans-serif;">
              <p style="margin:0 0 8px; font-size:13px; font-weight:bold; color:${BRAND.colors.black};">Need help?</p>
              <p style="margin:0 0 4px; font-size:12px; color:${BRAND.colors.muted};">
                ${BRAND.supportEmail ? `Email: <a href="mailto:${BRAND.supportEmail}" style="color:${BRAND.colors.goldDark}; text-decoration:none;">${esc(BRAND.supportEmail)}</a>` : ""}
                ${BRAND.supportEmail && BRAND.supportPhone ? " &nbsp;|&nbsp; " : ""}
                ${BRAND.supportPhone ? `Phone: ${esc(BRAND.supportPhone)}` : ""}
              </p>
              ${
                BRAND.storeUrl !== "#"
                  ? `<p style="margin:0 0 12px; font-size:12px;"><a href="${BRAND.storeUrl}" style="color:${BRAND.colors.goldDark}; text-decoration:none;">${esc(BRAND.storeUrl.replace(/^https?:\/\//, ""))}</a></p>`
                  : ""
              }
              <p style="margin:0; font-size:11px; color:#B5AFA3;">&copy; ${new Date().getFullYear()} ${esc(BRAND.name)}. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

module.exports = { renderLayout, esc, money, button, badge };
