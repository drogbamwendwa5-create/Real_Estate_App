const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.sendWelcomeEmail = (user) => {
  const message = {
    from: `${process.env.EMAIL_FROM}`,
    to: user.email,
    subject: 'Welcome to Real Estate App',
    text: `Hello ${user.name},\n\nWelcome to our Real Estate App! We're excited to have you on board.\n\nBest regards,\nThe Real Estate Team`,
  };
  transporter.sendMail(message);
};

exports.sendPasswordResetEmail = (user, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  const message = {
    from: `${process.env.EMAIL_FROM}`,
    to: user.email,
    subject: 'Password Reset Request',
    text: `Hello ${user.name},\n\nYou requested a password reset. Click the link below to reset your password:\n\n${resetUrl}\n\nThis link will expire in 10 minutes.\n\nIf you didn't request this, please ignore this email.\n\nBest regards,\nThe Real Estate Team`,
  };

  transporter.sendMail(message);
};