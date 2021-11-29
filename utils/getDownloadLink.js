const got = require("got");
const parse = require("parse");

module.exports = async function getDownloadLink(md5, fiction) {
  const downloadPageResponse = await got(
    `http://library.lol/${fiction ? "fiction" : "main"}/${md5}`
  );
  const downloadPage = parse(downloadPage.body);
  const downloadLink = downloadPage.querySelector("#download a");
  return downloadLink.attrs.href;
};
