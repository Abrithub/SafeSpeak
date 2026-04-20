const nodemailer = require("nodemailer");

// For testing: creates a fake SMTP account at ethereal.email
// Emails are captured at https://ethereal.email — not delivered to real inboxes
let transporter;

const getTransporter = async () => {
  if (transporter) return transporter;

  if (process.env.EMAIL_USER && process.env.EMAIL_USER !== 'your_gmail@gmail.com') {
    // Real Gmail
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });
  } else {
    // Ethereal test account — auto-created
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });
    console.log("📧 Test email account:", testAccount.user);
    console.log("📧 View emails at: https://ethereal.email");
  }
  return transporter;
};

const sendResetEmail = async (to, resetCode) => {
  const t = await getTransporter();
  const info = await t.sendMail({
    from: `"SafeSpeak" <${process.env.EMAIL_USER || 'safespeak@test.com'}>`,
    to,
    subject: "SafeSpeak — Password Reset Code",
    html: `
      <div style="font-family:sans-serif;max-width:400px;margin:auto;padding:24px;border:1px solid #e5e7eb;border-radius:12px">
        <h2 style="color:#1a2340">Password Reset</h2>
        <p>Your reset code is:</p>
        <div style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#1a2340;padding:16px;background:#f3f4f6;border-radius:8px;text-align:center">
          ${resetCode}
        </div>
        <p style="color:#6b7280;font-size:12px;margin-top:16px">This code expires in 15 minutes.</p>
      </div>
    `,
  });
  console.log("📧 Reset email preview:", nodemailer.getTestMessageUrl(info));
};

const sendAppointmentEmail = async (to, appointment, caseId) => {
  const t = await getTransporter();
  const info = await t.sendMail({
    from: `"SafeSpeak" <${process.env.EMAIL_USER || 'safespeak@test.com'}>`,
    to,
    subject: `SafeSpeak — Appointment Scheduled for ${caseId}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:24px;border:1px solid #e5e7eb;border-radius:12px">
        <h2 style="color:#0f766e">📅 Appointment Scheduled</h2>
        <p>An appointment has been scheduled for your case <strong>${caseId}</strong>.</p>
        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin:16px 0">
          <p style="margin:4px 0"><strong>Date:</strong> ${appointment.date}</p>
          <p style="margin:4px 0"><strong>Time:</strong> ${appointment.time}</p>
          <p style="margin:4px 0"><strong>Location:</strong> ${appointment.location}</p>
          ${appointment.notes ? `<p style="margin:4px 0"><strong>Notes:</strong> ${appointment.notes}</p>` : ""}
        </div>
        <p style="color:#6b7280;font-size:12px">Please arrive on time.</p>
      </div>
    `,
  });
  console.log("📧 Appointment email preview:", nodemailer.getTestMessageUrl(info));
};

const sendStatusUpdateEmail = async (to, caseId, status) => {
  const t = await getTransporter();
  const info = await t.sendMail({
    from: `"SafeSpeak" <${process.env.EMAIL_USER || 'safespeak@test.com'}>`,
    to,
    subject: `SafeSpeak — Case ${caseId} Status Update`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:24px;border:1px solid #e5e7eb;border-radius:12px">
        <h2 style="color:#1a2340">Case Status Updated</h2>
        <p>Your case <strong>${caseId}</strong> has been updated.</p>
        <div style="background:#f3f4f6;border-radius:8px;padding:16px;margin:16px 0;text-align:center">
          <p style="font-size:20px;font-weight:bold;color:#1a2340;margin:0">${status}</p>
        </div>
        <p style="color:#6b7280;font-size:12px">Log in to SafeSpeak to view full details.</p>
      </div>
    `,
  });
  console.log("📧 Status email preview:", nodemailer.getTestMessageUrl(info));
};

module.exports = { sendResetEmail, sendAppointmentEmail, sendStatusUpdateEmail };
