import nodemailer from "nodemailer";

let transporter = null;

const getTransporter = async () => {
  if (transporter) return transporter;

  // Check if SMTP environment variables are set
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    console.log("Using custom SMTP configuration for email delivery.");
  } else {
    // Fallback: Create test account at Ethereal Email
    console.log(
      "SMTP credentials missing in .env. Creating Ethereal SMTP test account...",
    );
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      console.log("Ethereal SMTP test account created successfully.");
      console.log(`User: ${testAccount.user}`);
      console.log(`Pass: ${testAccount.pass}`);
    } catch (err) {
      console.error(
        "Failed to create SMTP account, falling back to console logger:",
        err,
      );
      // Mock transporter that logs emails to console
      transporter = {
        sendMail: async (options) => {
          console.log("\n=========================================");
          console.log("MOCK EMAIL SENT (SMTP unavailable):");
          console.log(`To: ${options.to}`);
          console.log(`Subject: ${options.subject}`);
          console.log(`HTML: ${options.html}`);
          console.log("=========================================\n");
          return { messageId: "mock-id" };
        },
      };
    }
  }
  return transporter;
};

export const sendEmail = async ({ to, subject, html }) => {
  try {
    // 1. If RESEND_API_KEY is present, send email via Resend HTTP API (avoids Render SMTP block)
    if (process.env.RESEND_API_KEY) {
      console.log("Using Resend API for email delivery.");
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.SMTP_FROM || "StackVerse <onboarding@resend.dev>",
          to,
          subject,
          html,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to send email via Resend API");
      }
      console.log(`📧 Email sent successfully via Resend API to ${to}. ID: ${data.id}`);
      return data;
    }

    // 2. Otherwise fall back to SMTP (Gmail or Ethereal test account)
    const mailTransporter = await getTransporter();
    const info = await mailTransporter.sendMail({
      from: process.env.SMTP_FROM || '"Vaishu Mali" <vaishumali85@gmail.com>',
      to,
      subject,
      html,
    });

    // If using Ethereal, print the test message URL so developer can click it
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(
        `\n📧 Email sent successfully! Preview inbox URL: ${previewUrl}\n`,
      );
    } else {
      console.log(
        `📧 Email sent successfully to ${to}. Message ID: ${info.messageId}`,
      );
    }
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};
