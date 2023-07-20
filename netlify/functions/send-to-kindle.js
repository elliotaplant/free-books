const nodemailer = require('nodemailer');

exports.handler = async function (event) {
  const body = JSON.parse(event.body);
  const { email, url } = body;

  if (!email || !url) {
    return { statusCode: 400, body: 'Both email and url are required' };
  }

  const filename = new URL(url).searchParams.get('filename');

  const auth = {
    user: process.env.SOURCE_EMAIL,
    pass: process.env.SOURCE_EMAIL_PASSWORD,
  };

  const transporter = nodemailer.createTransport({ service: 'gmail', auth });
  const mailOptions = {
    from: auth.user,
    to: email,
    subject: `Free-books | ${filename} | ${new Date().toISOString()}`,
    text: filename,
    attachments: [{ filename, href: url }],
  };

  await new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) =>
      error ? reject(error) : resolve(info)
    );
  });

  return { statusCode: 200, body: 'Email sent' };
};
