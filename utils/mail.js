const nodemailer = require('nodemailer');
const { SOURCE_EMAIL, SOURCE_EMAIL_PASSWORD } = process.env;

module.exports = async function mail(destinationEmail, downloadLink, filename) {
  const auth = { user: SOURCE_EMAIL, pass: SOURCE_EMAIL_PASSWORD };
  const transporter = nodemailer.createTransport({ service: 'gmail', auth });
  const mailOptions = {
    from: auth.user,
    to: destinationEmail,
    subject: `Free-books book ${Date.now()}`,
    text: 'See attached',
    attachments: [{ filename, href: downloadLink }],
  };

  console.log('Sending mail with options', JSON.stringify(mailOptions));
  await new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) =>
      error ? reject(error) : resolve(info)
    );
  });
};
