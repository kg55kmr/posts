import fs from "fs";
import { processPosts } from "./process";

const { posts, latestPosts, album } = await processPosts();

fs.writeFileSync("data/posts.json", JSON.stringify(posts));
fs.writeFileSync("data/latest-posts.json", JSON.stringify(latestPosts));
fs.writeFileSync("data/album.json", JSON.stringify(album));
