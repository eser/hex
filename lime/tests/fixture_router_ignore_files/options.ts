import { type LimeConfig } from "../../server.ts";

export const config = {
  router: {
    ignoreFilePattern: /[\.|_]cy\.[t|j]s(x)?$/,
  },
} as LimeConfig;
