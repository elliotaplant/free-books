const nodemailer = require('nodemailer');
const getAuth = require('./getAuth');

module.exports = async function mail(destination, filename, url) {
  const auth = getAuth();
  const transporter = nodemailer.createTransport({ service: 'gmail', auth });

  const mailOptions = {
    from: auth.user,
    to: destination,
    subject: 'Email using Node.js ' + new Date(),
    text: 'That was easy!',
    attachments: [{ filename, path: url }]
  };

  return await new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, function(error, info) {
      if (error) {
        reject(error);
      } else {
        resolve(info);
      }
    });
  });
};
