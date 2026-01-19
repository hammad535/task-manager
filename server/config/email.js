const nodemailer = require('nodemailer');
require('dotenv').config();

// Create transporter (configure with your email service)
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Verify connection
transporter.verify((error, success) => {
  if (error) {
    console.log('⚠️ Email service not configured:', error.message);
  } else {
    console.log('✅ Email service ready');
  }
});

const sendStatusChangeEmail = async (toEmail, itemTitle, oldStatus, newStatus) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: toEmail,
      subject: `Task Status Updated: ${itemTitle}`,
      html: `
        <h2>Task Status Update</h2>
        <p><strong>Task:</strong> ${itemTitle}</p>
        <p><strong>Status changed from:</strong> ${oldStatus}</p>
        <p><strong>Status changed to:</strong> ${newStatus}</p>
        <p>Please check your task management dashboard for more details.</p>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Status change email sent to ${toEmail}`);
  } catch (error) {
    console.error('❌ Error sending email:', error.message);
  }
};

module.exports = { sendStatusChangeEmail };

