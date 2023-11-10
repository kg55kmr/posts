import express from "express";
import cors from "cors";
import build from "./build.js";

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
  res.sendFile(req.url.slice(1), { root: "." });
});

app.listen(1234);

function response() {
  return build("http://localhost:1234");
}
