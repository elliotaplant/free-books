const fs = require("fs");
const { parse } = require("node-html-parser");

async function main() {
  const loveHypothesisHtml = fs
    .readFileSync("./loveHypothesis.html")
    .toString();
  const root = parse(loveHypothesisHtml);
  const bookRows = root.querySelectorAll("table.catalog>tbody>tr");
  const parsedRows = bookRows.map((row) => {
    const [
      authorsHtml,
      seriesHtml,
      titleHtml,
      languageHtml,
    ] = row.querySelectorAll("td");

    const series = seriesHtml.innerText;
    const language = languageHtml.innerText;

    const authors = authorsHtml
      .querySelectorAll("ul.catalog_authors>li>a")
      .map((e) => e.innerText)
      .join(", ");

    const titleLink = titleHtml.querySelector("a");
    const title = titleLink.innerText;
    const md5 = titleLink.attrs.href.split("/")[2];

    return { authors, series, title, md5, language, fiction: true };
  });

  return parsedRows;
}

main().catch(console.error);
