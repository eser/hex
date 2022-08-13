import { asserts } from "./deps.ts";
import { removeValueFromArray } from "../remove-value-from-array.ts";

Deno.test("hex/fp/remove-value-from-array:basic", () => {
  const arr1 = [1, 2, 3, 4, 5];
  const int1 = 2;
  const int2 = 3;

  const result = removeValueFromArray(arr1, int1, int2);

  asserts.assertNotStrictEquals(result, arr1);
  asserts.assertEquals(result.length, 3);
  asserts.assertEquals(result, [1, 4, 5]);
});

Deno.test("hex/fp/remove-value-from-array:with-generator", () => {
  const gen1 = function* gen() {
    yield 1;
    yield 2;
    yield 3;
    yield 4;
    yield 5;
  };
  const int1 = 2;
  const int2 = 3;

  const result = removeValueFromArray(gen1(), int1, int2);

  asserts.assertNotStrictEquals(result, gen1());
  asserts.assertEquals(result.length, 3);
  asserts.assertEquals(result, [1, 4, 5]);
});
