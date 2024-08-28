import fs from "fs";
import { processPosts } from "./process";

const { posts, latestPosts, album } = await processPosts();

fs.writeFileSync("public/posts.json", JSON.stringify(posts));
fs.writeFileSync("public/latest-posts.json", JSON.stringify(latestPosts));
fs.writeFileSync("public/album.json", JSON.stringify(album));
