const nodemailer = require('nodemailer');

function getAuth() {
  let user, pass;
  user = process.env.EMAIL;
  pass = process.env.EMAIL_APP_PASSWORD;

  if (!user || !pass) {
    try {
      const { email, password } = require('./secrets.json');
      user = email;
      pass = password;
    } catch (e) {
      // No-op
    }
  }

  if (!user || !pass) {
    throw new Error('Unable to find user, pass. Please add them to the environment as EMAIL and EMAIL_APP_PASSWORD' +
     ' or in secrets.json as { email, password }');
  }
  return { user, pass };
}

const transporter = nodemailer.createTransport({ service: 'gmail', auth: getAuth() });

const mailOptions = {
  from: getAuth().user,
  to: 'elliotsstorage@gmail.com',
  subject: 'Email using Node.js ' + Math.floor(Math.random() * 100),
  text: 'That was easy!',
  attachments: [
    {   // use URL as an attachment
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
