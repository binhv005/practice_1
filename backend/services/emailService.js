const nodemailer = require("nodemailer");

/**
 * Tạo transporter để gửi email
 * Tự động detect MOCK MODE hoặc PRODUCTION MODE dựa vào .env
 */
const createTransporter = () => {
  // Check xem có cấu hình email không
  const hasEmailConfig =
    process.env.EMAIL_HOST &&
    process.env.EMAIL_USER &&
    process.env.EMAIL_PASS;

  if (!hasEmailConfig) {
    console.warn(
      "\n⚠️  WARNING: Email chưa được cấu hình trong .env"
    );
    console.warn("→ Sử dụng MOCK MODE (không gửi email thật)\n");
    return null;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || "587"),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    console.log("✅ Email transporter created (PRODUCTION MODE)");
    return transporter;
  } catch (error) {
    console.error("❌ Create transporter error:", error.message);
    return null;
  }
};

/**
 * Gửi email reset password
 * @param {string} email - Email người nhận
 * @param {string} resetToken - Token reset password
 * @param {string} fullname - Tên người nhận
 */
const sendResetPasswordEmail = async (email, resetToken, fullname) => {
  try {
    const transporter = createTransporter();

    // URL frontend để reset password
    const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password?token=${resetToken}`;

    // ========================================
    // MOCK MODE - Development
    // ========================================
    if (!transporter) {
      console.log("\n" + "=".repeat(50));
      console.log("📧 MOCK EMAIL (Development Mode)");
      console.log("=".repeat(50));
      console.log(`To:      ${email}`);
      console.log(`Subject: Yêu cầu đặt lại mật khẩu`);
      console.log(`Name:    ${fullname}`);
      console.log(`\nReset Link:`);
      console.log(`${resetUrl}`);
      console.log(`\nToken:`);
      console.log(`${resetToken}`);
      console.log("=".repeat(50) + "\n");

      // Giả lập thành công
      return {
        success: true,
        messageId: "mock-" + Date.now(),
        mode: "mock",
      };
    }

    // ========================================
    // PRODUCTION MODE - Gửi email thật
    // ========================================
    const mailOptions = {
      from: `"Mini Marketplace" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Yêu cầu đặt lại mật khẩu",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #ffba00; color: #6c4d00; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 30px; background: #ffba00; color: #6c4d00; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #999; }
            .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎁 Đặt lại mật khẩu</h1>
            </div>
            <div class="content">
              <p>Xin chào <strong>${fullname}</strong>,</p>
              
              <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
              
              <p>Vui lòng nhấn vào nút bên dưới để đặt lại mật khẩu:</p>
              
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Đặt lại mật khẩu</a>
              </div>
              
              <p>Hoặc copy link này vào trình duyệt:</p>
              <p style="word-break: break-all; background: #fff; padding: 10px; border: 1px solid #ddd; border-radius: 5px;">
                ${resetUrl}
              </p>
              
              <div class="warning">
                <strong>⚠️ Lưu ý quan trọng:</strong>
                <ul>
                  <li>Link này chỉ có hiệu lực trong <strong>10 phút</strong></li>
                  <li>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này</li>
                  <li>Không chia sẻ link này với bất kỳ ai</li>
                </ul>
              </div>
              
              <p>Nếu bạn gặp vấn đề, vui lòng liên hệ với chúng tôi.</p>
              
              <p>Trân trọng,<br><strong>Đội ngũ Mini Marketplace</strong></p>
            </div>
            <div class="footer">
              <p>Email này được gửi tự động, vui lòng không trả lời.</p>
              <p>&copy; ${new Date().getFullYear()} Mini Marketplace. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log("✅ Email sent successfully:", info.messageId);

    return {
      success: true,
      messageId: info.messageId,
      mode: "production",
    };
  } catch (error) {
    console.error("❌ Send email error:", error.message);
    throw new Error("Không thể gửi email");
  }
};

module.exports = {
  sendResetPasswordEmail,
};
