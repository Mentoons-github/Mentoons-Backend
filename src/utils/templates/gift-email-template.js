const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const getProductName = (order) =>
  order?.items?.[0]?.productName ||
  order?.items?.[0]?.product?.title ||
  order?.productInfo ||
  "a Mentoons product";

const getClaimUrl = (order) =>
  `${process.env.FRONTEND_URL}/gift/claim?token=${encodeURIComponent(
    order.giftDetails.claimToken,
  )}`;

const wrap = (content) => `
  <div style="font-family:Arial,Helvetica,sans-serif;background:#fff8e6;padding:24px;">
    <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:16px;padding:28px;color:#0f1b3d;">
      ${content}
    </div>
  </div>
`;

const GiftRecipientEmailTemplate = (order) => {
  const sender = escapeHtml(order.giftDetails.senderName);
  const product = escapeHtml(getProductName(order));
  const message = escapeHtml(order.giftDetails.message);
  const claimUrl = getClaimUrl(order);

  return wrap(`
    <h2 style="margin:0 0 8px;">🎁 You've got a gift!</h2>
    <p style="margin:0 0 16px;color:#475569;">
      <strong>${sender}</strong> sent you <strong>${product}</strong> from Mentoons.
    </p>
    ${
      message
        ? `<blockquote style="margin:0 0 20px;padding:12px 16px;background:#fff3d1;border-left:4px solid #ffc42e;border-radius:8px;">${message}</blockquote>`
        : ""
    }
    <a href="${claimUrl}" style="display:inline-block;background:#ffc42e;color:#0f1b3d;font-weight:700;text-decoration:none;padding:12px 24px;border-radius:12px;">
      Claim your gift
    </a>
    <p style="margin:20px 0 0;font-size:12px;color:#94a3b8;">
      If the button doesn't work, copy this link into your browser:<br />${claimUrl}
    </p>
  `);
};

const GiftSenderEmailTemplate = (order) => {
  const recipient = escapeHtml(order.giftDetails.recipientEmail);
  const product = escapeHtml(getProductName(order));

  return wrap(`
    <h2 style="margin:0 0 8px;">Your gift is on its way 🎉</h2>
    <p style="margin:0 0 12px;color:#475569;">
      Thanks for your purchase! We've emailed <strong>${recipient}</strong> a special link to claim <strong>${product}</strong>.
    </p>
    <p style="margin:0;color:#475569;">
      Order ID: <strong>${escapeHtml(order.orderId)}</strong><br />
      Amount paid: <strong>₹${escapeHtml(order.amount)}</strong>
    </p>
  `);
};

module.exports = { GiftRecipientEmailTemplate, GiftSenderEmailTemplate };
