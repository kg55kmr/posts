import path from "path";
import { access, readFile } from "fs/promises";
import _ from "lodash";
import matter from "gray-matter";
import { fdir } from "fdir";

const root = path.resolve(import.meta.dirname, "../data");

export async function processPosts() {
  const dirs = await new fdir()
    .onlyDirs()
    .withRelativePaths()
    .filter((p) => p.split(path.sep).length === 3)
    .crawl(root)
    .withPromise();

  let posts = await Promise.all(
    dirs.map(async (item) => {
      const { data, content } = matter(
        await readFile(path.resolve(root, item, "index.md"), "utf8")
      );

      item = item.replaceAll("\\", "/");

      const kind = path.basename(path.dirname(item));
      const id = path.basename(item.trim());
      const sortId = data.id ? (data.id as string) : id;
      const title = data.title as string;
      const titleLower = title.toLowerCase();
      const pin = data.pin !== undefined ? true : undefined;
      const [year, month, day] = sortId.split("-");
      const date = { year, month, day };
      const slideshows = extractSlideshows(kind, id, content);

      let thumbnailExists = true;

      await access(path.resolve(root, item, "thumbnail.jpg")).catch(
        () => (thumbnailExists = false)
      );

      return {
        kind,
        id,
        sortId: sortId as string | undefined,
        title,
        titleLower,
        pin,
        date,
        thumbnailExists,
        slideshows: slideshows as string[] | undefined,
      };
    })
  );

  posts.sort((a, b) =>
    b.sortId!.localeCompare(a.sortId!, undefined, { numeric: true })
  );

  const album = posts
    .filter((post) => post.kind === "news" && post.slideshows!.length > 0)
    .map((post) => ({ ...post }));

  posts.forEach((p) => {
    delete p.sortId;
    delete p.slideshows;
  });

  const postsGrouped = _(posts)
    .groupBy((v) => v.kind)
    .mapValues((p) => _.groupBy(p, (p) => (p.pin ? "pin" : "items")))
    .value();

  const latestPosts = _.mapValues(postsGrouped, ({ items, pin }) => {
    return {
      items: items.slice(0, 5),
      pin,
    };
  });

  return {
    posts: postsGrouped,
    latestPosts,
    album,
  };
}

const reSlideshow = /<slideshow( id="(.*)")* \/>/g;

function extractSlideshows(kind: string, id: string, data: string) {
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
