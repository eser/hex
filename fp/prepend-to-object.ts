export const prependToObject = <T>(
  instance: Record<string | number | symbol, T>,
  ...values: ReadonlyArray<Record<string | number | symbol, T>>
): Record<string | number | symbol, T> => {
  return Object.assign({}, ...values, instance);
};

export { prependToObject as default };
