import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import cors from "cors";
import chokidar from "chokidar";
import build from "./build.js";

let callback = () => {};

export default (fn) => (callback = fn);

const wd = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(cors());

app.get("/posts.json", (_req, res) => {
  const { posts } = response();
  res.send(posts);
});

app.get("/album.json", (_req, res) => {
  const { album } = response();
  res.send(album);
});

app.get("/data/*", async (req, res) => {
  res.sendFile(req.url.slice(1), { root: wd });
});

app.listen(1234);

chokidar
  .watch("", { cwd: path.resolve(wd, "data"), ignoreInitial: true })
  .on("all", () => callback());

function response() {
  return build("http://localhost:1234");
}
