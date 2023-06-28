const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');
const cors = require('cors');
const path = require('path');
const nodemailer = require('nodemailer');
const { parse } = require('node-html-parser');

const port = process.env.PORT || 3000;

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

let pool;

async function getPool() {
  if (!pool) {
    pool = mysql.createPool(process.env.DATABASE_URL);
  }
  return pool;
}

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/query', async (req, res) => {
  const { title, author, page = 1 } = req.body;
  if (!(title || author)) {
    return res.status(400).send('Either title or author is required');
  }

  const pool = await getPool();

  let query = 'SELECT * FROM fiction_filtered WHERE ';
  let queryParams = [];

  if (title) {
    query += 'Title LIKE ? ';
    queryParams.push(`%${title}%`);
  }

  if (author) {
    if (title) query += 'AND ';
    query += 'Author LIKE ? ';
    queryParams.push(`%${author}%`);
  }

  query += 'LIMIT ?, 10';
  queryParams.push((page - 1) * 10);

  const [rows] = await pool.execute(query, queryParams);

  res.json(rows);
});

app.post('/send-to-kindle', async (req, res) => {
  const { email, md5 } = req.body;
  if (!email || !md5) {
    return res.status(400).send('Both email and md5 are required');
  }

  const downloadPageResponses = await Promise.all([
    fetch(`http://library.lol/fiction/${md5}`),
    fetch(`http://library.lol/main/${md5}`),
  ]);
  // find the good response
  const downloadPageResponse = downloadPageResponses.find(
    (response) => response.status < 300
  );
  console.log('got good response');
  const downloadPage = parse(downloadPageResponse.body);
  const downloadLink = downloadPage.querySelector('#download a');
  const href = downloadLink.attrs.href;

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
    attachments: [{ href }],
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
