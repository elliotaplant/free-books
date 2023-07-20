const mysql = require('mysql2/promise');

exports.handler = async function () {
  const pool = mysql.createPool(process.env.DATABASE_URL);

  let query = 'SELECT * FROM combined LIMIT 1';

  const [rows] = await pool.execute(query);

  return { statusCode: 200, body: JSON.stringify(rows) };
};
