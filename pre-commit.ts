import metadata from "./pkg/metadata.json" assert { type: "json" };
import * as path from "./pkg/stdx/path.ts";

const main = async () => {
  const baseUrl = new URL(".", import.meta.url);
  const basePath = path.posix.fromFileUrl(baseUrl.href);

  await Deno.writeTextFile(`${basePath}/version.txt`, `${metadata.version}\n`);
};

main();
