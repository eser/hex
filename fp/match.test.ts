// Copyright 2023-present Eser Ozvataf and other contributors. All rights reserved. Apache-2.0 license.

import { assert, bdd } from "./deps-dev.ts";
import { match } from "./match.ts";

bdd.describe("cool/fp/match", () => {
  bdd.it("basic", () => {
    const str1 = "apple";

    const result = match(str1, [
      ["apple", () => "Apple is selected."],
      ["pear", () => "Pear is selected."],
      ["banana", () => "Banana is selected."],
    ]);

    assert.assertEquals(
      result,
      "Apple is selected.",
    );
  });

  bdd.it("conditions", () => {
    const str1 = "appLe"; // intentionally mixed case
    const str2 = "pear";
    const str3 = "banana";

    const result = match(true, [
      // @ts-ignore - intentionally testing for falsey values
      [str1 === "apple", () => "Apple is selected."],
      [str2 === "pear", () => "Pear is selected."],
      [str3 === "banana", () => "Banana is selected."],
    ]);

    assert.assertEquals(
      result,
      "Pear is selected.",
    );
  });
});
