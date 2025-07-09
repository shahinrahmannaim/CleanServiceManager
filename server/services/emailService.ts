import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER || 'your-email@gmail.com',
    pass: process.env.SMTP_PASS || 'your-app-password',
  },
});

export const sendOtpEmail = async (email: string, otp: string) => {
  const mailOptions = {
    from: process.env.SMTP_FROM || 'noreply@panaroma.qa',
    to: email,
    subject: 'Your OTP Code - Panaroma',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1E3A8A;">Panaroma - Your OTP Code</h2>
        <p>Your OTP code is: <strong style="font-size: 24px; color: #EF4444;">${otp}</strong></p>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't request this code, please ignore this email.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

export const sendWelcomeEmail = async (email: string, name: string) => {
  const mailOptions = {
    from: process.env.SMTP_FROM || 'noreply@panaroma.qa',
    to: email,
    subject: 'Welcome to Panaroma - Professional Cleaning Services',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1E3A8A;">Welcome to Panaroma, ${name}!</h2>
        <p>Thank you for joining our professional cleaning services platform.</p>
        <p>You can now book cleaning services across Qatar with trusted professionals.</p>
        <a href="${process.env.CLIENT_URL || 'http://localhost:5000'}" style="background-color: #EF4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
          Start Booking Services
        </a>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};
