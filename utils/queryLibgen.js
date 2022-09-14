const got = require('got');
const { parseFiction, parseNonFiction } = require('./parseLibgenResponse');

module.exports = async function queryLibgen(query) {
  const params = new URLSearchParams({
    format: 'epub',
    language: 'English',
    req: query,
    q: query,
  });

  const [nonFictionResponse, fictionResponse] = await Promise.all([
    got(`https://libgen.rs/search.php?${params.toString()}`),
    got(`https://libgen.rs/fiction/?${params.toString()}`),
  ]);

  const nonFictionBooks = parseNonFiction(nonFictionResponse.body);
  const fictionBooks = parseFiction(fictionResponse.body);

  return fictionBooks.concat(nonFictionBooks);
};
