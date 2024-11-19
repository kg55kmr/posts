import fs from "fs/promises";
import path from "path";
import ImageKit from "imagekit";
import { glob } from "glob";
import { PromisePool } from "@supercharge/promise-pool";

const imagekit = new ImageKit({
  publicKey: "public_l+oSmDAI7phY0X7L/UuRZ0aVNXo=",
  privateKey: "private_AT2+cCFV5bNPM/VB5LcHDfC9MIw=",
  urlEndpoint: "https://ik.imagekit.io/kg55kmr",
});

const dirs = glob.sync("data/*/*/*/");
for (const dir of dirs) {
  let [kind, date, id] = dir.split(path.sep).slice(1);
  switch (true) {
    case id === "_":
      id = date;
      break;

    case id.startsWith("_"):
      id = `${date}-${id.slice(1)}`;
      break;
  }

  const remotePath = ["posts", kind, id].join("/");
  await uploadFiles(dir, remotePath);
  await fs.rm(dir, { recursive: true, force: true });
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
