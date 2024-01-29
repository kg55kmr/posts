import fs from "fs/promises";
import path from "path";
import ImageKit from "imagekit";
import { glob } from "glob";

const imagekit = new ImageKit({
  publicKey: "public_l+oSmDAI7phY0X7L/UuRZ0aVNXo=",
  privateKey: "private_AT2+cCFV5bNPM/VB5LcHDfC9MIw=",
  urlEndpoint: "https://ik.imagekit.io/kg55kmr",
});

async function uploadFiles(localPath, remotePath) {
  const remoteImages = new Map(
    await imagekit
      .listFiles({ path: remotePath })
      .then((r) => r.map((item) => [item.name, item.size])),
  );

  const localImages = await fs.readdir(localPath);

  for (const localImage of localImages) {
    const data = await fs.readFile(`${localPath}/${localImage}`);
    const remoteSize = remoteImages.get(localImage);
    if (data.length === remoteSize) {
      continue;
    }

    await imagekit
      .upload({
        file: data,
        fileName: localImage,
        folder: remotePath,
        useUniqueFileName: false,
      })
      .catch(console.error);
    console.log(`uploaded: ${remotePath}/${localImage}`);
  }
}

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
}
