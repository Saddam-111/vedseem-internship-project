import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS
  }
});

export const sendMail = async (to, otp) => {
  try {
    await transporter.sendMail({
      from: `"Dhanush-Digital Support" <${process.env.EMAIL}>`,
      to,
      subject: "Reset Your Password OTP",
      html: `
        <h3>Password Reset OTP</h3>
        <p>Your OTP is:</p>
        <h2 style="color: #FF8C00; font-size: 24px;">${otp}</h2>
        <p>This OTP will expire in <b>5 minutes</b>.</p>
        <p>If you did not request this, please ignore this email.</p>
      `,
    });
    return true;
  } catch (error) {
    console.error("Error sending OTP:", error.message);
    return false;
  }
};
