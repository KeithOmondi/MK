import nodemailer from "nodemailer";

export const sendEmail = async ({ email, to, subject, message, html }) => {
  const recipient = email || to; // ✅ handle both cases

  if (!recipient || !subject || (!message && !html)) {
    throw new Error("Email, subject, and either message or HTML content are required.");
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: { rejectUnauthorized: false },
    });

    const mailOptions = {
      from: `"MK Store" <${process.env.SMTP_USER}>`,
      to: recipient,
      subject,
      text: message || "",
      html: html || "",
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent:", info.response);
    return info;
  } catch (error) {
    console.error("❌ Email sending error:", error.message);
    throw new Error("Failed to send email. Please try again.");
  }
};
