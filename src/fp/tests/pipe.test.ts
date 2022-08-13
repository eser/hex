import { asserts } from "./deps.ts";
import { pipe } from "../pipe.ts";

Deno.test("hex/fp/pipe:basic", () => {
  const lower = (x: string) => x.toLowerCase();
  const chars = (x: string) => x.replace(/[^\w \\-]+/g, "");
  const spaces = (x: string) => x.split(" ");
  const dashes = (x: string[]) => x.join("-");

  const slug = pipe(lower, chars, spaces, dashes);

  const result = slug("Hello World!");

  asserts.assertEquals(result, "hello-world");
});
