const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');
const cors = require('cors');
const nodemailer = require('nodemailer');
const getDownloadLink = require('./getDownloadLink');

const port = process.env.PORT || 3000;

const app = express();
app.use(cors());
app.use(bodyParser.json());

let pool;

async function getPool() {
  if (!pool) {
    pool = mysql.createPool(process.env.DATABASE_URL);
  }
  return pool;
}

app.post('/query', async (req, res) => {
  const { title, author, page = 1 } = req.body;
  if (!(title || author)) {
    return res.status(400).send('Either title or author is required');
  }

  const pool = await getPool();
  const [rows] = await pool.execute(
    `SELECT * FROM fiction_filtered WHERE 
         ${title ? `Title LIKE ?` : ''} 
         ${title && author ? 'AND' : ''}
         ${author ? `Author LIKE ?` : ''} 
         LIMIT ?, 10`,
    [
      title ? `%${title}%` : null,
      author ? `%${author}%` : null,
      (page - 1) * 10,
    ]
  );

  res.json(rows);
});

app.post('/send-to-kindle', async (req, res) => {
  const { email, md5, fiction } = req.body;
  if (!email || !md5) {
    return res.status(400).send('Both email and md5 are required');
  }

  const downloadLink = await getDownloadLink(md5, fiction);

  const auth = {
    user: process.env.SOURCE_EMAIL,
    pass: process.env.SOURCE_EMAIL_PASSWORD,
  };
  const transporter = nodemailer.createTransport({ service: 'gmail', auth });
  const mailOptions = {
    from: auth.user,
    to: email,
    subject: `Free-books book ${Date.now()}`,
    text: 'See attached',
    attachments: [{ href: downloadLink }],
  };

  console.log('Sending mail with options', JSON.stringify(mailOptions));
  await new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) =>
      error ? reject(error) : resolve(info)
    );
  });

  res.status(200).send('Email sent');
});

app.listen(port, function () {
  console.log(`Example app listening on port ${port}!`);
});
