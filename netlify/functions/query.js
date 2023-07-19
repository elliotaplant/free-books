const mysql = require('mysql2/promise');

exports.handler = async function (event, context) {
  const body = JSON.parse(event.body);
  const { title, author, page = 1 } = body;

  if (!(title || author)) {
    return { statusCode: 400, body: 'Either title or author is required' };
  }

  const pool = mysql.createPool(process.env.DATABASE_URL);

  let query = 'SELECT * FROM combined WHERE ';
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

  query += 'LIMIT ?, 9';
  queryParams.push((page - 1) * 9);

  const [rows] = await pool.execute(query, queryParams);

  return {
    statusCode: 200,
    body: JSON.stringify(rows),
  };
};
