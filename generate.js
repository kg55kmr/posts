import fs from "fs";
import path from "path";
import { glob } from "glob";
import _ from "lodash";
import matter from "gray-matter";

export default (host) => {
  const reSlideshow = /<slideshow( id="(.*)")* \/>/g;
  const dirs = glob.sync("data/*/*");

  fs.mkdirSync("public", { recursive: true });

  let posts = dirs.map((dir) => {
    const { data, content } = matter(
      fs.readFileSync(dir + "/index.md", "utf8")
    );

    const kind = path.basename(path.dirname(dir));
    const id = path.basename(dir.trim());
    const title = data.title;
    const titleLower = title.toLowerCase();
    const pin = data.pin;
    const [year, month, day, slug = 1] = id.split("-");
    const thumbnailExists = fs.existsSync(`${dir}/thumbnail.jpg`);
    const date = { year, month, day };
    const url = `${host}/${dir}`;
    const md = `${url}/index.md`;
    const thumbnail = thumbnailExists ? `${url}/thumbnail.jpg` : undefined;
    const slideshows = extractSlideshows(kind, id, content);

    return {
      kind,
      id,
      title,
      titleLower,
      pin,
      date,
      slug,
      url,
      md,
      thumbnail,
      slideshows,
    };
  });

  posts.reverse();
  posts = _.mapValues(_.groupBy(posts, "kind"), (p) =>
    _.groupBy(p, (p) => (p.pin ? "pin" : "items"))
  );

  const album = [
    ...(posts.news.pin?.filter((post) => post.slideshows.length > 0) ?? []),
    ...posts.news.items.filter((post) => post.slideshows.length > 0),
  ];

  return {
    posts: JSON.stringify(posts, (k, v) => {
      switch (k) {
        case "slideshows":
          return undefined;
      }

      return v;
    }),
    album: JSON.stringify(album),
  };

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
};
