const fetch = require('node-fetch');
const { parse } = require('node-html-parser');
const nodemailer = require('nodemailer');

exports.handler = async function (event, context) {
  const body = JSON.parse(event.body);
  const { email, md5 } = body;

  if (!email || !md5) {
    return { statusCode: 400, body: 'Both email and md5 are required' };
  }

  // Change this to a race
  const downloadPageResponses = await Promise.all([
    fetch(`http://library.lol/fiction/${md5}`),
    fetch(`http://library.lol/main/${md5}`),
  ]);

  const downloadPageResponse = downloadPageResponses.find(
    (response) => response.status < 300
  );

  if (!downloadPageResponse) {
    throw new Error('Unable to get download link');
  }

  const page = await downloadPageResponse.text();
  const downloadPage = parse(page);
  const downloadLink = downloadPage.querySelector('#download a');
  const href = downloadLink.attrs.href;
  const filename = decodeURIComponent(href.split('/').slice(-1)[0]);

  const auth = {
    user: process.env.SOURCE_EMAIL,
    pass: process.env.SOURCE_EMAIL_PASSWORD,
  };

  const transporter = nodemailer.createTransport({ service: 'gmail', auth });
  const mailOptions = {
    from: auth.user,
    to: email,
    subject: `Free-books | ${filename} | ${Date.toISOString()}`,
    text: filename,
    attachments: [{ filename, href }],
  };

  await new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) =>
      error ? reject(error) : resolve(info)
    );
  });

  return { statusCode: 200, body: 'Email sent' };
};
