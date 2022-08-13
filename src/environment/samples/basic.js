import * as hex from "../../mod.ts";

const fnc = function fnc(input) {
  const to = input.parameters[0] ?? "world";
  const message = `hello ${to}`;

  return hex.functions.results.text(message);
};

// hex.functions.dumper(
//   hex.functions.execute(fnc),
// );

async function main() {
  const env = hex.environment.environment(
    hex.environment.cli(),
  );

  await env.dispatch("write", "Hello, world!");
}

main();
