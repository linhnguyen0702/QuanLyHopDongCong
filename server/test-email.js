// Test script để kiểm tra cấu hình email
const nodemailer = require("nodemailer");
require("dotenv").config();

console.log("🔍 Testing Email Configuration...");
console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? "Có" : "Không có");

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Test connection
transporter.verify(function (error, success) {
  if (error) {
    console.log("❌ SMTP Connection Error:", error);
  } else {
    console.log("✅ SMTP Server is ready to take our messages");

    // Test send email
    const mailOptions = {
      from: `"Contract Manager Test" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // gửi cho chính mình để test
      subject: "🧪 Test Email Configuration",
      text: "Nếu bạn nhận được email này, cấu hình email đã hoạt động thành công!",
      html: "<h2>✅ Test thành công!</h2><p>Cấu hình email đã hoạt động.</p>",
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("❌ Send email error:", error);
      } else {
        console.log("✅ Test email sent successfully:", info.messageId);
      }
    });
  }
});
