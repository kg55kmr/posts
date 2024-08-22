import fs from "fs";
import process from "./process";

const { posts, latestPosts, album } = await process();

fs.writeFileSync("public/posts.json", JSON.stringify(posts));
fs.writeFileSync("public/latest-posts.json", JSON.stringify(latestPosts));
fs.writeFileSync("public/album.json", JSON.stringify(album));
