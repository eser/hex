import { platforms, results } from "../../../src/functions/mod.ts";

const main = function main(input) {
  const to = input.parameters.name ?? "world";
  const message = `hello ${to}`;

  return results.text(message);
};

platforms.webapi(main, 3000);
