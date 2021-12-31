const got = require("got");
const { parseFiction, parseNonFiction } = require("./parseLibgenResponse");

module.exports = async function queryLibgen(query) {
  // Make requests serially to avoid rate limiting from libgen
  const nonFictionResponse = await got(`https://libgen.rs/search.php?req=${encodeURIComponent(query)}`);
  const fictionResponse = await got(`https://libgen.rs/fiction/?q=${encodeURIComponent(query)}`);

  const nonFictionBooks = parseNonFiction(nonFictionResponse.body);
  const fictionBooks = parseFiction(fictionResponse.body);

  return fictionBooks.concat(nonFictionBooks);
};
