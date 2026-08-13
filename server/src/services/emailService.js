import nodemailer from "nodemailer";

let transporterInstance = null;

const getTransporter = () => {
  if (!transporterInstance) {
    transporterInstance = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD,
      },
    });
  }
  return transporterInstance;
};

export const sendEmail = async ({ to, subject, html }) => {
  const transporter = getTransporter();

  await transporter.sendMail({
    from: `"AI Interview Platform" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};