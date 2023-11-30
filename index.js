import fs from "fs";
import build from "./build.js";

const { posts, latestPosts, album } = build(
  "https://raw.githubusercontent.com/kg55kmr/posts/main"
);

fs.mkdirSync("public", { recursive: true });
fs.writeFileSync("public/posts.json", JSON.stringify(posts));
fs.writeFileSync("public/latest-posts.json", JSON.stringify(latestPosts));
fs.writeFileSync("public/album.json", JSON.stringify(album));
