const { parseFiction, parseNonFiction } = require("./parseLibgenResponse");

module.exports = async function queryLibgen(query) {
  const [nonFictionResponse, fictionResponse] = await Promise.all([
    got(`https://libgen.rs/search.php?req=${encodeURIComponent(query)}`),
    got(`https://libgen.rs/fiction/?q=${encodeURIComponent(query)}`),
  ]);

  const nonFictionBooks = parseNonFiction(nonFictionResponse);
  const fictionBooks = parseFiction(fictionResponse);

  return fictionBooks.concat(nonFictionBooks);
};
