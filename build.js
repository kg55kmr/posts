import fs from "fs";
import process from "./process.js";

const { posts, latestPosts, album } = await process(
  "https://raw.githubusercontent.com/kg55kmr/posts/main"
);

fs.writeFileSync("public/posts.json", JSON.stringify(posts));
fs.writeFileSync("public/latest-posts.json", JSON.stringify(latestPosts));
fs.writeFileSync("public/album.json", JSON.stringify(album));
