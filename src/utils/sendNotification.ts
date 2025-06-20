import nodemailer from "nodemailer";

export const sendNotification = async (message: string) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  await transporter.sendMail({
    from: `"Stock Monitor" <${process.env.EMAIL_USER}>`,
    to: "gospelkalu33@gmail.com",
    subject: "📦 Stock Alert",
    text: message
  });
};
