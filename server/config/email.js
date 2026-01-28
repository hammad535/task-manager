const nodemailer = require('nodemailer');
require('dotenv').config();

// Create transporter (Gmail SMTP)
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // must be false for port 587 (STARTTLS)
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const verifyEmailTransport = async () => {
  try {
    await transporter.verify();
    console.log('✅ Email transport verified (Gmail SMTP)');
    return true;
  } catch (error) {
    console.error('❌ Email transport verification failed:', error?.message || error);
    return false;
  }
};

const sendStatusChangeEmail = async (toEmail, itemTitle, oldStatus, newStatus, assignedUserName) => {
  try {
    const fromEmail = process.env.EMAIL_USER;
    const assignedUserLabel = assignedUserName || toEmail;

    const mailOptions = {
      from: `"Task Manager" <${fromEmail}>`,
      to: toEmail,
      subject: `Task Status Updated: ${itemTitle}`,
      html: `
        <h2>Task Status Update</h2>
        <p><strong>Task:</strong> ${itemTitle}</p>
        <p><strong>Status:</strong> ${newStatus}</p>
        <p><strong>Previous status:</strong> ${oldStatus}</p>
        <p><strong>Assigned user:</strong> ${assignedUserLabel}</p>
        <p>Please check your task management dashboard for more details.</p>
      `
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`✅ Status change email sent to ${toEmail}`);
    } catch (error) {
      console.error('❌ Error sending status change email:', error?.message || error);
    }
  } catch (error) {
    console.error('❌ Error building status change email:', error?.message || error);
  }
};

module.exports = { transporter, verifyEmailTransport, sendStatusChangeEmail };

