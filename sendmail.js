const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: 'nodemaillerapp@gmail.com',
      pass: 'koab tisg eisi gtpi',
    },
  });
  

module.exports = transporter;