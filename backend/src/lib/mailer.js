import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail", // or another like "hotmail", "yahoo", "smtp.example.com"
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendInviteEmail = async (to, inviteLink, inviterName) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: "Join our Chat App",
    html: `
      <h3>You've been invited to join the chat app by <strong>${inviterName}</strong></h3>
      <p>Click the link below to join and automatically become contacts with the inviter:</p>
      <a href="${inviteLink}">${inviteLink}</a>
    `,
  };

  await transporter.sendMail(mailOptions);
};
