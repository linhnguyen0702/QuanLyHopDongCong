const nodemailer = require("nodemailer");
const crypto = require("crypto");
require("dotenv").config();

// Debug: kiểm tra biến môi trường
console.log("🔍 Email Configuration Debug:");
console.log("EMAIL_USER:", process.env.EMAIL_USER ? "✅ Có" : "❌ Không có");
console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? "✅ Có" : "❌ Không có");

// Tạo transporter SMTP với cấu hình đầy đủ
const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Verify transporter
transporter.verify(function (error, success) {
  if (error) {
    console.log("❌ SMTP Connection Error:", error);
  } else {
    console.log("✅ SMTP Server is ready to take our messages");
  }
});

// Hàm tạo HTML template cho email
function createEmailTemplate(otp, email) {
  return `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Mã xác nhận OTP - Contract Manager</title>
        <style>
            body { margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
            .header { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 40px 30px; text-align: center; }
            .logo { width: 64px; height: 64px; background-color: rgba(255,255,255,0.2); border-radius: 16px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; }
            .logo-icon { width: 32px; height: 32px; color: white; }
            .header h1 { color: white; margin: 0; font-size: 28px; font-weight: 700; }
            .header p { color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 16px; }
            .content { padding: 40px 30px; }
            .greeting { font-size: 18px; color: #1f2937; margin-bottom: 20px; }
            .otp-section { background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0; border: 2px dashed #cbd5e1; }
            .otp-label { font-size: 14px; color: #64748b; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 1px; }
            .otp-code { font-size: 36px; font-weight: 700; color: #3b82f6; letter-spacing: 8px; margin: 10px 0; font-family: 'Courier New', monospace; }
            .otp-note { font-size: 14px; color: #64748b; margin-top: 15px; }
            .instructions { background-color: #fef3cd; border: 1px solid #fbbf24; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .instructions h3 { color: #92400e; margin: 0 0 15px; font-size: 16px; }
            .instructions ul { margin: 0; padding-left: 20px; color: #92400e; }
            .instructions li { margin-bottom: 8px; }
            .warning { background-color: #fee2e2; border: 1px solid #fca5a5; border-radius: 8px; padding: 15px; margin: 20px 0; text-align: center; }
            .warning p { color: #dc2626; margin: 0; font-size: 14px; }
            .footer { background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0; }
            .footer p { color: #64748b; margin: 0; font-size: 14px; }
            .support { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e2e8f0; }
            .support p { color: #64748b; font-size: 13px; margin: 5px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">
                    <svg class="logo-icon" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M3 3h18v18H3V3zm16 16V5H5v14h14zM7 7h10v2H7V7zm0 4h10v2H7v-2zm0 4h7v2H7v-2z"/>
                    </svg>
                </div>
                <h1>Contract Manager</h1>
                <p>Hệ thống quản lý hợp đồng</p>
            </div>
            
            <div class="content">
                <div class="greeting">
                    Xin chào,
                </div>
                
                <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
                    Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản <strong>${email}</strong> trên hệ thống Contract Manager.
                </p>
                
                <div class="otp-section">
                    <div class="otp-label">Mã xác nhận OTP</div>
                    <div class="otp-code">${otp}</div>
                    <div class="otp-note">Mã có hiệu lực trong <strong>5 phút</strong></div>
                </div>
                
                <div class="instructions">
                    <h3>📋 Hướng dẫn sử dụng:</h3>
                    <ul>
                        <li>Nhập mã OTP trên vào trang đặt lại mật khẩu</li>
                        <li>Tạo mật khẩu mới theo yêu cầu bảo mật</li>
                        <li>Đăng nhập với mật khẩu mới</li>
                    </ul>
                </div>
                
                <div class="warning">
                    <p>⚠️ <strong>Bảo mật:</strong> Không chia sẻ mã OTP này với bất kỳ ai. Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
                </div>
                
                <p style="color: #374151; line-height: 1.6; margin-top: 30px;">
                    Nếu bạn gặp khó khăn trong quá trình đặt lại mật khẩu, vui lòng liên hệ với đội ngũ hỗ trợ của chúng tôi.
                </p>
            </div>
            
            <div class="footer">
                <p><strong>Contract Manager</strong> - Hệ thống quản lý hợp đồng chuyên nghiệp</p>
                <div class="support">
                    <p>📧 Email hỗ trợ: ${process.env.EMAIL_USER}</p>
                    <p>🕒 Thời gian hỗ trợ: 8:00 - 17:00 (Thứ 2 - Thứ 6)</p>
                    <p style="margin-top: 15px;">© 2024 Contract Manager. Bảo mật và tin cậy.</p>
                </div>
            </div>
        </div>
    </body>
    </html>
  `;
}

// Hàm gửi OTP
async function sendOTP(toEmail, userName = null) {
  const otp = crypto.randomInt(100000, 999999); // mã OTP 6 số

  const mailOptions = {
    from: `"Contract Manager Support" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "🔐 Mã xác nhận OTP - Đặt lại mật khẩu",
    html: createEmailTemplate(otp, toEmail),
    text: `
Xin chào,

Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản ${toEmail} trên hệ thống Contract Manager.

MÃ OTP CỦA BẠN: ${otp}

Mã có hiệu lực trong 5 phút.

Hướng dẫn:
1. Nhập mã OTP trên vào trang đặt lại mật khẩu
2. Tạo mật khẩu mới theo yêu cầu bảo mật
3. Đăng nhập với mật khẩu mới

⚠️ BẢO MẬT: Không chia sẻ mã OTP này với bất kỳ ai. Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.

---
Contract Manager - Hệ thống quản lý hợp đồng chuyên nghiệp
Email hỗ trợ: ${process.env.EMAIL_USER}
© 2024 Contract Manager. Bảo mật và tin cậy.
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Đã gửi OTP ${otp} đến ${toEmail}`);
    return otp;
  } catch (error) {
    console.error(`❌ Lỗi gửi email đến ${toEmail}:`, error);
    throw new Error("Không thể gửi email. Vui lòng thử lại sau.");
  }
}

module.exports = { sendOTP };
