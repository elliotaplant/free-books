const { parse } = require('node-html-parser');

exports.handler = async function (event) {
  const body = JSON.parse(event.body);
  const { md5, fiction } = body;

  if (!md5 || typeof fiction !== 'boolean') {
    return { statusCode: 400, body: 'Both md5 and fiction are required' };
  }

  const url = fiction
    ? `http://library.lol/fiction/${md5}`
    : `http://library.lol/main/${md5}`;

  const downloadPageResponse = await fetch(url);

  if (!downloadPageResponse || downloadPageResponse.status >= 300) {
    throw new Error('Unable to get download link');
  }

  const page = await downloadPageResponse.text();
  const downloadPage = parse(page);
  const downloadLinks = downloadPage.querySelectorAll('#download a');
  const cloudflareLink =
    downloadLinks.find((link) => link.textContent === 'IPFS.io') ||
    downloadLinks.find((link) => link.textContent === 'Cloudflare');
  const href = cloudflareLink.attrs.href;

  return { statusCode: 200, body: JSON.stringify({ downloadLink: href }) };
};
