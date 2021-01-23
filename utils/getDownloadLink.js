const got = require('got');

module.exports = async function getDownloadLink(md5) {
  const downloadPage = await got('http://library.lol/main/' + md5);
  return downloadPage.body.match(/<a href="(.*)">GET<\/a>/)[1];
};
