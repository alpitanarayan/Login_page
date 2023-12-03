const nodemailer = require('nodemailer');
const user_email = process.env.user;
const user_password = process.env.password;

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: user_email,
      pass: user_password,
    },
  });
  

module.exports = transporter;