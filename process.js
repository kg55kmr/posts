const fs = require("fs");
const glob = require("glob");
const path = require("path");
const _ = require("lodash");

const reTitle = /title:\s?(.*)/;

const dirs = glob.sync("public/**/index.md");

dirs.forEach((file) => {
  const dir = path.dirname(file);
  const content = fs.readFileSync(file, "utf8").split("---\r\n\r\n");
  const title = escape(reTitle.exec(content[0])[1]);
  const components = dir.split("/");
  const date = components.slice(-1)[0];
  const kind = components.slice(-2)[0];
  const meta = `${date} ${title}`;
  const outDir = `d:/temp/tst/${kind}/${meta}`;

  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(`${outDir}/index.md`, content[1], "utf8");

  fs.readdirSync(dir)
    .filter((f) => f !== "index.md")
    .forEach((file) => {
      fs.copyFileSync(`${dir}/${file}`, `${outDir}/${file}`);
    });
});

function escape(from) {
  let str = from;
  while (true) {
    from = str.replace('"', "«").replace('"', "»");

    if (from === str) break;
    str = from;
  }

  str = str.replaceAll("\\", "").replaceAll("?", "[q]").replaceAll(":", "[..]");
  if (str.endsWith(".")) str = str.slice(0, -1);

  return str.trim();
}
