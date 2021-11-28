const fs = require("fs");
const { parse } = require("node-html-parser");

async function main() {
  const seasonOfTheWitchHtml = fs
    .readFileSync("./seasonOfTheWitch.html")
    .toString();
  const root = parse(seasonOfTheWitchHtml);
  const table = root.querySelector("table.c");
  const rows = table.querySelectorAll("tr").slice(1);

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
    ] = row.querySelectorAll("td");

    const authors = authorsHtml
      .querySelectorAll("a")
      .map((a) => a.innerText)
      .join(",");

    const titleLink = titleHtml.querySelector("a");
    const titleLinkAllHtml = titleLink.innerHTML;
    const firstOpenTag = titleLinkAllHtml.indexOf("<");
    const title = titleHtml
      .querySelector("a")
      .innerHTML.slice(0, firstOpenTag)
      .trim();
    const md5 = titleLink.attrs.href.split("md5=")[1];

    const language = languageHtml.innerText;
    const size = sizeHtml.innerText;
    const format = extensionHtml.innerText.toUpperCase();

    return { authors, title, md5, language, format, size, fiction: false };
  });
}

main()
  .then((rows) => console.log("rows", rows) || rows)
  .catch(console.error);
