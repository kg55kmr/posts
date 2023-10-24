import express from "express";
import generate from "./generate.js";

const app = express();

app.get("/posts", (_req, res) => {
  const { posts } = response();
  res.send(posts);
});

app.get("/album", (_req, res) => {
  const { album } = response();
  res.send(album);
});

app.get("/data/*", (req, res) => {
  res.send(req.url);
});

app.listen(1234);

function response() {
  return generate("https://localhost:1234");
}
