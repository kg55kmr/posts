import fs from "fs";
import path from "path";
import glob from "glob";
import _ from "lodash";

const reTitle = /title:\s?(.*)/;
const reSlideshow = /<slideshow( id="(.*)")*>/g;

const dirs = glob.sync("data/*/*");

const host = "https://raw.githubusercontent.com/kg55kmr/posts/main";

fs.mkdirSync("public", { recursive: true });

let posts = dirs.map((dir) => {
  const content = fs
    .readFileSync(dir + "/index.md", "utf8")
    .split("---\r\n\r\n");

  const kind = path.basename(path.dirname(dir));
  const id = path.basename(dir.trim());
  const title = reTitle.exec(content[0])[1];
  const titleLower = title.toLowerCase();
  const [year, month, day, slug = 1] = id.split("-");
  const thumbnailExists = fs.existsSync(`${dir}/thumbnail.jpg`);
  const date = { year, month, day };
  const url = `${host}/${dir}`;
  const md = `${url}/index.md`;
  const thumbnail = thumbnailExists ? `${url}/thumbnail.jpg` : undefined;
  const siteRoute = `/posts/view?id=${id}&kind=${kind}`;
  const slideshows = extractSlideshows(kind, id, content);

  return {
    kind,
    id,
    title,
    titleLower,
    date,
    slug,
    url,
    md,
    thumbnail,
    siteRoute,
    slideshows,
  };
});

posts.reverse();
posts = _.groupBy(posts, (p) => p.kind);

// posts generate

fs.writeFileSync(
  "public/data.json",
  JSON.stringify(posts, (k, v) => {
    switch (k) {
      case "slideshows":
        return undefined;
    }

    return v;
  })
);

// album generate

const album = posts.news.filter((post) => post.slideshows.length > 0);
fs.writeFileSync("public/album.json", JSON.stringify(album));

function extractSlideshows(kind, id, data) {
  const slideshows = [];
  let m;

  id = `${kind}-${id}`;

  while ((m = reSlideshow.exec(data)) !== null) {
    switch (true) {
      case m[2] === undefined:
        slideshows.push(id);
        break;

      case m[2].startsWith("*"):
        slideshows.push(`${id}-${m[2].slice(1)}`);
        break;

      default:
        slideshows.push(m[2]);
    }
  }

  return slideshows;
}
