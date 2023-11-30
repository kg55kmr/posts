import fs from "fs";
import path from "path";
import { glob } from "glob";
import _ from "lodash";
import matter from "gray-matter";
import { fileURLToPath } from "url";

const wd = path.dirname(fileURLToPath(import.meta.url));

export default (base) => {
  const dirs = glob.sync("data/*/*", { cwd: wd });

  let posts = dirs.map((item) => {
    const { data, content } = matter(
      fs.readFileSync(path.resolve(wd, item, "index.md"), "utf8")
    );
    const kind = path.basename(path.dirname(item));
    const id = path.basename(item.trim());
    const sortId = data.id ? data.id : id;
    const title = data.title;
    const titleLower = title.toLowerCase();
    const pin = data.pin;
    const [year, month, day] = sortId.split("-");
    const thumbnailExists = fs.existsSync(
      path.resolve(wd, item, "thumbnail.jpg")
    );
    const date = { year, month, day };
    const url = `${base}/${item}`;
    const md = `${url}/index.md`;
    const thumbnail = thumbnailExists ? `${url}/thumbnail.jpg` : undefined;
    const slideshows = extractSlideshows(kind, id, content);

    return {
      kind,
      id,
      sortId,
      title,
      titleLower,
      pin,
      date,
      url,
      md,
      thumbnail,
      slideshows,
    };
  });

  posts.sort((a, b) =>
    b.sortId.localeCompare(a.sortId, undefined, { numeric: true })
  );

  posts.forEach((v) => delete v.sortId);

  const album = posts
    .filter((post) => post.kind === "news" && post.slideshows.length > 0)
    .map((post) => ({ ...post }));
  posts.forEach((v) => delete v.slideshows);

  const postsByKind = _.groupBy(posts, (v) => v.kind);
  const postsGrouped = {
    posts: _.mapValues(postsByKind, (p) =>
      _.groupBy(p, (p) => (p.pin ? "pin" : "items"))
    ),
    host: `${base}/data`,
  };
  const latestPosts = _.mapValues(postsByKind, (p) => {
    const result = p.slice(0, 5).map((v) => ({ ...v }));
    result.forEach((v) => delete v.titleLower);
    return result;
  });

  return {
    posts: postsGrouped,
    latestPosts,
    album,
  };
};

const reSlideshow = /<slideshow( id="(.*)")* \/>/g;

function extractSlideshows(kind, id, data) {
  const slideshows = [];
  let m;

  id = `${kind}/${id}`;

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
