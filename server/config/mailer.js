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

const sendAppointmentEmail = async (to, appt, caseId) => {
  const t = await getTransporter();

  const isPolice = appt.type === "police_station";
  const isCourt  = appt.type === "court";

  const typeLabel = isPolice ? "🚔 Police Station Appointment"
    : isCourt ? "⚖️ Court Appointment"
    : "📅 SafeSpeak Office Appointment";

  const detailsHtml = `
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin:16px 0">
      <h3 style="color:#065f46;margin:0 0 12px">${typeLabel}</h3>
      <table style="width:100%;font-size:13px;border-collapse:collapse">
        <tr><td style="padding:4px 0;color:#6b7280;width:120px">Date</td><td style="font-weight:bold;color:#111827">${appt.date}</td></tr>
        <tr><td style="padding:4px 0;color:#6b7280">Time</td><td style="font-weight:bold;color:#111827">${appt.time}</td></tr>
        <tr><td style="padding:4px 0;color:#6b7280">Location</td><td style="font-weight:bold;color:#111827">${appt.location}</td></tr>
        ${isPolice && appt.stationName  ? `<tr><td style="padding:4px 0;color:#6b7280">Station</td><td style="color:#111827">${appt.stationName}</td></tr>` : ""}
        ${isPolice && appt.officerName  ? `<tr><td style="padding:4px 0;color:#6b7280">Officer</td><td style="color:#111827">${appt.officerName}</td></tr>` : ""}
        ${isPolice && appt.officerPhone ? `<tr><td style="padding:4px 0;color:#6b7280">Officer Phone</td><td><a href="tel:${appt.officerPhone}" style="color:#0ea5e9">${appt.officerPhone}</a></td></tr>` : ""}
        ${isCourt  && appt.courtName   ? `<tr><td style="padding:4px 0;color:#6b7280">Court</td><td style="color:#111827">${appt.courtName}</td></tr>` : ""}
        ${isCourt  && appt.courtRoom   ? `<tr><td style="padding:4px 0;color:#6b7280">Room/Hall</td><td style="color:#111827">${appt.courtRoom}</td></tr>` : ""}
        ${isCourt  && appt.judge       ? `<tr><td style="padding:4px 0;color:#6b7280">Judge</td><td style="color:#111827">${appt.judge}</td></tr>` : ""}
      </table>
    </div>
    ${appt.purpose ? `
      <div style="background:#fef9c3;border-left:4px solid #f59e0b;padding:12px;border-radius:4px;margin:12px 0">
        <p style="margin:0;font-size:13px;color:#78350f"><strong>📋 What to bring / What to expect:</strong><br>${appt.purpose}</p>
      </div>
    ` : ""}
    <div style="background:#fef2f2;border-radius:8px;padding:12px;margin:12px 0">
      <p style="margin:0;font-size:12px;color:#dc2626;font-weight:bold">⚠️ Important:</p>
      <ul style="margin:8px 0 0;padding-left:16px;font-size:12px;color:#374151">
        <li>Arrive at least 15 minutes early</li>
        <li>Bring a valid government-issued ID</li>
        <li>Mention your Case ID: <strong>${caseId}</strong></li>
        ${isPolice ? "<li>You have the right to have a support person present</li>" : ""}
        ${isCourt  ? "<li>Dress appropriately for court proceedings</li>" : ""}
      </ul>
    </div>
  `;

  const info = await t.sendMail({
    from: `"SafeSpeak" <${process.env.EMAIL_USER || 'safespeak@test.com'}>`,
    to,
    subject: `SafeSpeak — ${typeLabel} Scheduled for Case ${caseId}`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:auto;padding:0;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden">
        <div style="background:#1a2340;padding:20px;text-align:center">
          <h1 style="color:#fff;margin:0;font-size:22px">🛡️ SafeSpeak</h1>
          <p style="color:rgba(255,255,255,0.6);margin:4px 0 0;font-size:12px">Secure · Anonymous · Trusted</p>
        </div>
        <div style="padding:24px">
          <p style="color:#374151">Dear Reporter,</p>
          <p style="color:#374151">An appointment has been scheduled for your case <strong style="color:#1a2340">${caseId}</strong>. Please review the details below carefully.</p>
          ${detailsHtml}
          <p style="color:#6b7280;font-size:12px;margin-top:20px;border-top:1px solid #e5e7eb;padding-top:12px">
            If you cannot attend, please contact us immediately at <a href="tel:+251965485715" style="color:#0ea5e9">+251 965 485 715</a>.<br>
            Your identity remains protected. Case ID: <strong>${caseId}</strong>
          </p>
        </div>
      </div>
    `,
  });
  console.log("📧 Appointment email preview:", nodemailer.getTestMessageUrl(info));
};

const sendOutcomeEmail = async (to, caseId, outcome, outcomeNote) => {
  const t = await getTransporter();

  const outcomes = {
    resolved:         { icon: "✅", title: "Case Resolved", color: "#10b981", bg: "#f0fdf4", border: "#bbf7d0", msg: "Your case has been successfully resolved. No further action is required from you." },
    proceed_to_court: { icon: "⚖️", title: "Case Proceeding to Court", color: "#f59e0b", bg: "#fef9c3", border: "#fde68a", msg: "Based on the investigation, your case will proceed to court. You will receive a separate notification with court details." },
    needs_more_info:  { icon: "📋", title: "Additional Information Required", color: "#3b82f6", bg: "#eff6ff", border: "#bfdbfe", msg: "The investigating officer requires additional information. Please log in to SafeSpeak and reply to the support team." },
    dismissed:        { icon: "❌", title: "Case Dismissed", color: "#6b7280", bg: "#f9fafb", border: "#e5e7eb", msg: "After review, the case has been dismissed. If you believe this is incorrect, you may submit a new report with additional details." },
  };

  const o = outcomes[outcome] || outcomes.resolved;

  const info = await t.sendMail({
    from: `"SafeSpeak" <${process.env.EMAIL_USER || 'safespeak@test.com'}>`,
    to,
    subject: `SafeSpeak — Case ${caseId} Outcome: ${o.title}`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:auto;padding:0;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden">
        <div style="background:#1a2340;padding:20px;text-align:center">
          <h1 style="color:#fff;margin:0;font-size:22px">🛡️ SafeSpeak</h1>
          <p style="color:rgba(255,255,255,0.6);margin:4px 0 0;font-size:12px">Secure · Anonymous · Trusted</p>
        </div>
        <div style="padding:24px">
          <p style="color:#374151">Dear Reporter,</p>
          <p style="color:#374151">We have an update on the outcome of your appointment for case <strong style="color:#1a2340">${caseId}</strong>.</p>
          <div style="background:${o.bg};border:1px solid ${o.border};border-radius:8px;padding:16px;margin:16px 0;text-align:center">
            <p style="font-size:32px;margin:0">${o.icon}</p>
            <h2 style="color:${o.color};margin:8px 0 4px">${o.title}</h2>
            <p style="color:#374151;font-size:13px;margin:0">${o.msg}</p>
          </div>
          ${outcomeNote ? `
            <div style="background:#f9fafb;border-left:4px solid #1a2340;padding:12px;border-radius:4px;margin:12px 0">
              <p style="margin:0;font-size:13px;color:#374151"><strong>Note from Support Team:</strong><br>${outcomeNote}</p>
            </div>
          ` : ""}
          <p style="color:#6b7280;font-size:12px;margin-top:20px;border-top:1px solid #e5e7eb;padding-top:12px">
            Log in to SafeSpeak to view full details and any messages from the support team.<br>
            Case ID: <strong>${caseId}</strong>
          </p>
        </div>
      </div>
    `,
  });
  console.log("📧 Outcome email preview:", nodemailer.getTestMessageUrl(info));
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

const sendReferralEmail = async (to, caseId, referral) => {
  const t = await getTransporter();

  const isPolice = referral.type === "police";
  const isCourt  = referral.type === "court";
  const isInfo   = referral.type === "info_request";

  const subject = isPolice ? `SafeSpeak — Your Case ${caseId} Has Been Referred to Police`
    : isCourt  ? `SafeSpeak — Court Date Scheduled for Case ${caseId}`
    : `SafeSpeak — Additional Information Needed for Case ${caseId}`;

  const detailsHtml = isPolice ? `
    <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:16px;margin:16px 0">
      <h3 style="color:#1e40af;margin:0 0 12px">🚔 Police Station Details</h3>
      <p style="margin:4px 0"><strong>Station:</strong> ${referral.stationName}</p>
      <p style="margin:4px 0"><strong>Address:</strong> ${referral.stationAddress}</p>
      ${referral.officerName ? `<p style="margin:4px 0"><strong>Officer:</strong> ${referral.officerName}</p>` : ""}
      ${referral.officerPhone ? `<p style="margin:4px 0"><strong>Officer Phone:</strong> ${referral.officerPhone}</p>` : ""}
    </div>
    <p style="color:#374151">Please visit the station and mention your Case ID: <strong>${caseId}</strong></p>
  ` : isCourt ? `
    <div style="background:#fef3c7;border:1px solid #fde68a;border-radius:8px;padding:16px;margin:16px 0">
      <h3 style="color:#92400e;margin:0 0 12px">⚖️ Court Hearing Details</h3>
      <p style="margin:4px 0"><strong>Court:</strong> ${referral.courtName}</p>
      <p style="margin:4px 0"><strong>Date:</strong> ${referral.courtDate}</p>
      <p style="margin:4px 0"><strong>Time:</strong> ${referral.courtTime}</p>
      ${referral.courtRoom ? `<p style="margin:4px 0"><strong>Room/Hall:</strong> ${referral.courtRoom}</p>` : ""}
      ${referral.judge ? `<p style="margin:4px 0"><strong>Judge:</strong> ${referral.judge}</p>` : ""}
    </div>
    <p style="color:#dc2626;font-weight:bold">⚠️ Please arrive at least 30 minutes early. Bring a valid ID.</p>
  ` : `
    <div style="background:#fef9c3;border:1px solid #fde047;border-radius:8px;padding:16px;margin:16px 0">
      <h3 style="color:#713f12;margin:0 0 12px">📋 Additional Information Required</h3>
      <p style="margin:4px 0">${referral.infoRequest}</p>
      ${referral.infoDeadline ? `<p style="margin:8px 0 0"><strong>Please respond by:</strong> ${referral.infoDeadline}</p>` : ""}
    </div>
    <p style="color:#374151">Please log in to SafeSpeak and reply to the support team with the requested information.</p>
  `;

  const info = await t.sendMail({
    from: `"SafeSpeak" <${process.env.EMAIL_USER || 'safespeak@test.com'}>`,
    to,
    subject,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:auto;padding:24px;border:1px solid #e5e7eb;border-radius:12px">
        <div style="background:#1a2340;padding:16px;border-radius:8px;margin-bottom:20px;text-align:center">
          <h1 style="color:#fff;margin:0;font-size:20px">🛡️ SafeSpeak</h1>
          <p style="color:rgba(255,255,255,0.7);margin:4px 0 0;font-size:12px">Secure · Anonymous · Trusted</p>
        </div>
        <p>Dear Reporter,</p>
        <p>There is an important update regarding your case <strong>${caseId}</strong>.</p>
        ${detailsHtml}
        ${referral.referralNote ? `
          <div style="background:#f9fafb;border-left:4px solid #1a2340;padding:12px;margin:16px 0;border-radius:4px">
            <p style="margin:0;font-size:13px;color:#374151"><strong>Note from Support Team:</strong><br>${referral.referralNote}</p>
          </div>
        ` : ""}
        <p style="color:#6b7280;font-size:12px;margin-top:20px;border-top:1px solid #e5e7eb;padding-top:12px">
          Your identity remains protected. This email was sent to the address registered with your SafeSpeak account.
          Case ID: ${caseId}
        </p>
      </div>
    `,
  });
  console.log("📧 Referral email preview:", nodemailer.getTestMessageUrl(info));
};

const sendReportConfirmationEmail = async (to, caseId, classification, urgency) => {
  const t = await getTransporter();
  const urgencyColor = urgency === 'High' ? '#ef4444' : urgency === 'Medium' ? '#f59e0b' : '#3b82f6';
  const info = await t.sendMail({
    from: `"SafeSpeak" <${process.env.EMAIL_USER || 'safespeak@test.com'}>`,
    to,
    subject: `SafeSpeak — Your Report Has Been Received (${caseId})`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:auto;padding:0;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden">
        <div style="background:#1a2340;padding:20px;text-align:center">
          <h1 style="color:#fff;margin:0;font-size:22px">🛡️ SafeSpeak</h1>
          <p style="color:rgba(255,255,255,0.6);margin:4px 0 0;font-size:12px">Secure · Anonymous · Trusted</p>
        </div>
        <div style="padding:24px">
          <p style="color:#374151">Dear Reporter,</p>
          <p style="color:#374151">Your report has been <strong>successfully received</strong> and our AI has analyzed it. A trained support team will review your case within <strong>24–48 hours</strong>.</p>
          <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin:16px 0;text-align:center">
            <p style="margin:0;font-size:12px;color:#6b7280">Your Case ID</p>
            <p style="margin:8px 0;font-size:28px;font-weight:bold;color:#1a2340;font-family:monospace">${caseId}</p>
            <p style="margin:0;font-size:12px;color:#6b7280">Save this ID to track your case status</p>
          </div>
          <table style="width:100%;font-size:13px;border-collapse:collapse;margin:12px 0">
            <tr><td style="padding:6px 0;color:#6b7280;width:120px">Classification</td><td style="font-weight:bold;color:#374151">${classification}</td></tr>
            <tr><td style="padding:6px 0;color:#6b7280">Priority</td><td><span style="background:${urgencyColor}22;color:${urgencyColor};padding:2px 10px;border-radius:20px;font-weight:bold;font-size:12px">${urgency}</span></td></tr>
          </table>
          <div style="background:#fef9c3;border-left:4px solid #f59e0b;padding:12px;border-radius:4px;margin:12px 0">
            <p style="margin:0;font-size:13px;color:#78350f">To track your case anytime, visit SafeSpeak and enter your Case ID: <strong>${caseId}</strong></p>
          </div>
          <p style="color:#6b7280;font-size:12px;margin-top:20px;border-top:1px solid #e5e7eb;padding-top:12px">
            If you are in immediate danger, call <a href="tel:+251965485715" style="color:#0ea5e9">+251 965 485 715</a> immediately.<br>
            Your identity remains protected.
          </p>
        </div>
      </div>
    `,
  });
  console.log("📧 Report confirmation email:", nodemailer.getTestMessageUrl(info));
};

module.exports = { sendResetEmail, sendAppointmentEmail, sendOutcomeEmail, sendStatusUpdateEmail, sendReferralEmail, sendReportConfirmationEmail };
