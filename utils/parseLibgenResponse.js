const { parse } = require('node-html-parser');

function parseFiction(html) {
  const root = parse(html);
  const bookRows = root.querySelectorAll('table.catalog>tbody>tr');
  console.log('bookRows', bookRows);
  return bookRows.map((row) => {
    const [authorsHtml, seriesHtml, titleHtml, languageHtml, fileHtml] =
      row.querySelectorAll('td');

    const series = seriesHtml.innerText;
    const language = languageHtml.innerText;
    const [format, size] = fileHtml.innerText
      .replace('&nbsp;', ' ')
      .split('/')
      .map((t) => t.trim());

    const authors = authorsHtml
      .querySelectorAll('ul.catalog_authors>li>a')
      .map((e) => e.innerText)
      .join(', ');

    const titleLink = titleHtml.querySelector('a');
    const title = titleLink.innerText;
    const md5 = titleLink.attrs.href.split('/')[2];

    return {
      authors,
      title,
      md5,
      language,
      format,
      size,
      fiction: true,
    };
  });
}

function parseNonFiction(html) {
  const root = parse(html);
  const table = root.querySelector('table.c');
  const rows = table.querySelectorAll('tr').slice(1);

  return rows.map((row) => {
    const [
      idHtml,
      authorsHtml,
      titleHtml,
      publisherHtml,
      yearHtml,
      pagesHtml,
      languageHtml,
      sizeHtml,
      extensionHtml,
    ] = row.querySelectorAll('td');

    const authors = authorsHtml
      .querySelectorAll('a')
      .map((a) => a.innerText)
      .join(',');

    const titleLink = titleHtml.querySelector('a');
    const titleLinkAllHtml = titleLink.innerHTML;
    const firstOpenTag = titleLinkAllHtml.indexOf('<');
    const title = titleHtml
      .querySelector('a')
      .innerHTML.slice(0, firstOpenTag)
      .trim();
    const md5 = titleLink.attrs.href.split('md5=')[1];

    const language = languageHtml.innerText;
    const size = sizeHtml.innerText;
    const format = extensionHtml.innerText.toUpperCase();

    return { authors, title, md5, language, format, size, fiction: false };
  });
}

module.exports = { parseFiction, parseNonFiction };
