import fs from "fs/promises";
import path from "path";
import ImageKit from "imagekit";
import { PromisePool } from "@supercharge/promise-pool";
import { fdir } from "fdir";

const imagekit = new ImageKit({
  publicKey: "public_l+oSmDAI7phY0X7L/UuRZ0aVNXo=",
  privateKey: "private_AT2+cCFV5bNPM/VB5LcHDfC9MIw=",
  urlEndpoint: "https://ik.imagekit.io/kg55kmr",
});

const root = path.resolve(import.meta.dirname, "../data");
const dirs = await new fdir()
  .onlyDirs()
  .withRelativePaths()
  .filter((p) => p.split(path.sep).length === 4)
  .crawl(root)
  .withPromise();

for (const dir of dirs) {
  let [kind, date, id] = dir.split(path.sep);
  switch (true) {
    case id === "_":
      id = date;
      break;

    case id.startsWith("_"):
      id = `${date}-${id.slice(1)}`;
      break;
  }

  const remotePath = ["posts", kind, id].join("/");
  const localPath = path.resolve(root, dir);
  await uploadFiles(localPath, remotePath);
  await fs.rm(localPath, { recursive: true, force: true });
}

async function uploadFiles(localPath: string, remotePath: string) {
  const localImages = await fs.readdir(localPath);
  const total = localImages.length;
  let count = 0;

  printUpload(localPath, 0, total);

  const inc = () => ++count;

  await PromisePool.withConcurrency(5)
    .for(localImages)
    .process(async (image) => {
      const data = await fs.readFile(`${localPath}/${image}`);

      await imagekit
        .upload({
          file: data,
          fileName: image,
          folder: remotePath,
          useUniqueFileName: false,
        })
        .catch(console.error);

      printUpload(localPath, inc(), total);
    });

  printUpload(localPath, 0, 0);
}

function printUpload(localPath: string, count: number, total: number) {
  const base = `upload (${localPath}):`;

  if (total === 0) {
    console.log(`${base} done`);
    return;
  }

  const percent = Math.trunc((count / total) * 100);
  process.stdout.write(`${base} ${percent}%   \r`);
}
