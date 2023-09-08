const nodemailer = require("nodemailer");
const mailGenerator = require("../utils/mailGenerator");

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    port: 465,
    host: "smtp.gmail.com",
    secure: true,
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASS,
    },
  });

  const emailBody = {
    body: {
      name: options.name,
      intro: "Verify your recovery email ",
      action: {
        instructions: "To reset your password, please click here:",
        button: {
          color: "#22BC66",
          text: "Reset Link",
          link: `${options.resetPasswordURL}`,
        },
      },
      outro:
        "Need help, or have questions? Just reply to this email, we'd love to help.",
    },
  };

  const mailOptions = {
    from: process.env.SMTP_EMAIL,
    to: options.email,
    subject: options.subject,
    text: options.message,
    text: mailGenerator.generatePlaintext(emailBody),
    html: mailGenerator.generate(emailBody),
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
