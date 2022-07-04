import type HexFunction from "./function.ts";
import type HexFunctionContext from "./function-context.ts";
import type HexFunctionInput from "./function-input.ts";
import type HexFunctionNext from "./function-next.ts";
import type HexFunctionResult from "./function-result.ts";

const composer = function composer(
  ...functions: readonly HexFunction[]
): HexFunction {
  return async function* (
    input: HexFunctionInput,
    context: HexFunctionContext,
    next?: HexFunctionNext,
  ): HexFunctionResult {
    let index = 0;
    let currentContext = context;

    const jump: HexFunctionNext = async function* jump(
      newContext?: HexFunctionContext,
    ): HexFunctionResult {
      const current = functions[index];

      index += 1;
      if (newContext !== undefined) {
        currentContext = newContext;
      }

      const result = await current(
        input,
        currentContext,
        jump,
      );

      if (
        Symbol.iterator in Object(result) ||
        Symbol.asyncIterator in Object(result)
      ) {
        yield* result;

        return;
      }

      yield result;
    };

    const jumped = await jump(currentContext);
    yield* jumped;
  };
};

export { composer, composer as default };
