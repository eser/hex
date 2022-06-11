import { asserts } from "./deps.ts";
import pickFromArray from "../pick-from-array.ts";

Deno.test("hex/fp/pick-from-array:basic", () => {
  const arr1 = [1, 2, 3, 4, 5];
  const arr2 = [2, 3, 6];

  const result = pickFromArray(arr1, arr2);

  asserts.assertNotStrictEquals(result.items, arr1);
  asserts.assertNotStrictEquals(result.items, arr2);
  asserts.assertEquals(result.items.length, 2);
  asserts.assertEquals(result.items, [2, 3]);

  asserts.assertNotStrictEquals(result.rest, arr1);
  asserts.assertNotStrictEquals(result.rest, arr2);
  asserts.assertEquals(result.rest.length, 3);
  asserts.assertEquals(result.rest, [1, 4, 5]);
});

Deno.test("hex/fp/pick-from-array:with-generator-1", () => {
  const gen1 = function* gen() {
    yield 1;
    yield 2;
    yield 3;
    yield 4;
    yield 5;
  };

  const arr1 = [2, 3, 6];

  const result = pickFromArray(gen1(), arr1);

  asserts.assertNotStrictEquals(result.items, gen1());
  asserts.assertNotStrictEquals(result.items, arr1);
  asserts.assertEquals(result.items.length, 2);
  asserts.assertEquals(result.items, [2, 3]);

  asserts.assertNotStrictEquals(result.rest, gen1());
  asserts.assertNotStrictEquals(result.rest, arr1);
  asserts.assertEquals(result.rest.length, 3);
  asserts.assertEquals(result.rest, [1, 4, 5]);
});

Deno.test("hex/fp/pick-from-array:with-generator-2", () => {
  const arr1 = [1, 2, 3, 4, 5];
  const gen1 = function* gen() {
    yield 2;
    yield 3;
    yield 6;
  };

  const result = pickFromArray(arr1, gen1());

  asserts.assertNotStrictEquals(result.items, arr1);
  asserts.assertNotStrictEquals(result.items, gen1());
  asserts.assertEquals(result.items.length, 2);
  asserts.assertEquals(result.items, [2, 3]);

  asserts.assertNotStrictEquals(result.rest, arr1);
  asserts.assertNotStrictEquals(result.rest, gen1());
  asserts.assertEquals(result.rest.length, 3);
  asserts.assertEquals(result.rest, [1, 4, 5]);
});
