import fs from "fs";
import generate from "./generate.js";

const { posts, album } = generate(
  "https://raw.githubusercontent.com/kg55kmr/posts/main"
);

fs.writeFileSync("public/data.json", posts);
fs.writeFileSync("public/album.json", album);
