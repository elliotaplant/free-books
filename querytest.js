const got = require("got");
const fs = require("fs");
const { parse } = require("node-html-parser");

async function main() {
  // Non fiction
  // const query = "season of the witch wilwkejrlwkejrlwkejrlkwe";
  // const response = await got(
  //   `https://libgen.rs/search.php?req=${encodeURIComponent(query)}`
  // );

  // Fiction
  // https://libgen.rs/fiction/?q=love+hypothesis
  const query = "love hypothesis alskdjflaksdjf";
  const url = `https://libgen.rs/fiction/?q=${encodeURIComponent(query)}`;
  console.log("url", url);
  const response = await got(
    `https://libgen.rs/fiction/?q=${encodeURIComponent(query)}`
  );

  fs.writeFileSync("nothingFiction.html", response.body);
  // const root = parse(response.body);
  // const table = root.querySelector("table.c");
  // console.log("table.innerHTML", table.innerHTML);
  // const rows = table.querySelector("tbody>tr");
  // const bodyRows = rows.filter((row) =>
  //   row.innerHTML.includes("Sort results by ID")
  // );
  // console.log("rows", rows);
}

main().catch(console.error);
