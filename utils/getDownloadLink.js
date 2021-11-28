const got = require("got");

module.exports = async function getDownloadLink(md5, fiction) {
  const downloadPage = await got("http://library.lol/main/" + md5); // TODO: Make this work for fiction
  return downloadPage.body.match(/<a href="(.*)">GET<\/a>/)[1];
};
