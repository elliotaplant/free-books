const nodemailer = require('nodemailer');
const fs = require('fs');

const SECRETS_PATH = './secrets.json';
const FROM_NETLIFY = process.env.FROM_NETLIFY;

function getAuth() {
  let user, pass;
  user = process.env.EMAIL;
  pass = process.env.EMAIL_APP_PASSWORD;

  if (!user || !pass) {
    try {
      if (fs.existsSync(SECRETS_PATH)) {
        const { email, password } = JSON.parse(fs.readFileSync(SECRETS_PATH));
        user = email;
        pass = password;
      }
    } catch(err) {
      console.error(err);
    }
  }

  if (!user || !pass) {
    throw new Error('Unable to find user, pass. Please add them to the environment as EMAIL and EMAIL_APP_PASSWORD' +
     ' or in secrets.json as { email, password }');
  }
  return { user, pass };
}

exports.handler = function () {
  const auth = getAuth();
  const transporter = nodemailer.createTransport({ service: 'gmail', auth  });

  const mailOptions = {
    from: auth.user,
    to: 'elliotsstorage@gmail.com',
    subject: 'Email using Node.js ' + Math.floor(Math.random() * 100) + FROM_NETLIFY,
    text: 'That was easy!',
    attachments: [
      {
        filename: 'licence.txt',
        path: 'https://raw.github.com/nodemailer/nodemailer/master/LICENSE'
      },
    ]
  };

  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });

  return {
    statusCode: 200,
    headers: { 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify({ hello: 'world' }),
  };
};
