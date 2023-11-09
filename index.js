import fs from "fs";
import build from "./build.js";

const { posts, album } = build(
  "https://raw.githubusercontent.com/kg55kmr/posts/main"
);

fs.writeFileSync("public/posts.json", posts);
fs.writeFileSync("public/album.json", album);
