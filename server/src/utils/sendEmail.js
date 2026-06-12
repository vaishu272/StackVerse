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
    const mailTransporter = await getTransporter();
    const info = await mailTransporter.sendMail({
      from: process.env.SMTP_FROM || '"Vaishu Mali" <[EMAIL_ADDRESS]>',
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
