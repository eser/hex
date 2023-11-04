import { bundleAssetUrl } from "../constants.ts";
import { RenderState } from "./state.ts";
import { htmlEscapeJsonString } from "../htmlescape.ts";
import { serialize } from "../serializer.ts";
import {
  type Plugin,
  type PluginRenderResult,
  type PluginRenderStyleTag,
} from "../types.ts";
import { type ContentSecurityPolicy, nonce } from "../../runtime/csp.ts";
import { view } from "../../runtime/drivers/view.tsx";

export type SerializedState = [
  islands: Array<unknown>,
  plugins: Array<unknown>,
];

export function renderLimeTags(
  renderState: RenderState,
  opts: {
    bodyHtml: string;
    csp?: ContentSecurityPolicy;
    imports: Array<string>;
    randomNonce?: string;
    dependenciesFn: (path: string) => Array<string>;
    styles: Array<string>;
    pluginRenderResults: Array<[Plugin, PluginRenderResult]>;
  },
) {
  const { isPartial } = renderState;

  if (opts.csp) {
    opts.csp.directives.scriptSrc = [
      ...opts.csp.directives.scriptSrc ?? [],
      nonce(renderState.getNonce()),
    ];
  }

  const moduleScripts: Array<[string, string]> = [];

  for (const url of opts.imports) {
    moduleScripts.push([url, renderState.getNonce()]);
  }

  const preloadSet = new Set<string>();

  function addImport(path: string): string {
    const url = bundleAssetUrl(`/${path}`);

    if (!isPartial) {
      preloadSet.add(url);

      for (const depPath of opts.dependenciesFn(path)) {
        const url = bundleAssetUrl(`/${depPath}`);

        preloadSet.add(url);
      }
    }

    return url;
  }

  const state: SerializedState = [
    renderState.islandProps,
    [],
  ];
  const styleTags: Array<PluginRenderStyleTag> = [];
  const pluginScripts: Array<[string, string, number]> = [];

  for (const [plugin, res] of opts.pluginRenderResults) {
    for (const hydrate of res.scripts ?? []) {
      const i = state[1].push(hydrate.state) - 1;

      pluginScripts.push([plugin.name, hydrate.entrypoint, i]);
    }

    styleTags.splice(styleTags.length, 0, ...res.styles ?? []);
  }

  // The inline script that will hydrate the page.
  let script = "";

  // Serialize the state into the <script id=__LIME_STATE> tag and generate the
  // inline script to deserialize it. This script starts by deserializing the
  // state in the tag. This potentially requires importing @preact/signals.
  let hasSignals = false;
  let requiresDeserializer = false;

  if (state[0].length > 0 || state[1].length > 0) {
    const res = serialize(state);
    const escapedState = htmlEscapeJsonString(res.serialized);
    opts.bodyHtml +=
      `<script id="__LIME_STATE" type="application/json" nonce="${renderState.getNonce()}">${escapedState}</script>`;

    hasSignals = res.hasSignals;
    requiresDeserializer = res.requiresDeserializer;

    if (res.requiresDeserializer) {
      const url = addImport("deserializer.js");
      script += `import { deserialize } from "${url}";`;
    }

    if (res.hasSignals) {
      const url = addImport("signals.js");
      script += `import { signal } from "${url}";`;
    }

    script += `const ST = document.getElementById("__LIME_STATE").textContent;`;
    script += `const STATE = `;

    if (res.requiresDeserializer) {
      if (res.hasSignals) {
        script += `deserialize(ST, signal);`;
      } else {
        script += `deserialize(ST);`;
      }
    } else {
      script += `JSON.parse(ST).v;`;
    }
  }

  // Then it imports all plugin scripts and executes them (with their respective
  // state).
  if (pluginScripts.length > 0) {
    // Use `reportError` if available, otherwise throw in a different event
    // loop tick to avoid halting the current script.
    script +=
      `function runPlugin(fn,args){try{fn(args)}catch(err){setTimeout(() => {throw err})}}`;
  }

  for (const [pluginName, entrypoint, i] of pluginScripts) {
    const url = addImport(`plugin-${pluginName}-${entrypoint}.js`);

    script += `import p${i} from "${url}";runPlugin(p${i},STATE[1][${i}]);`;
  }

  const needsMainScript = renderState.encounteredIslands.size > 0 ||
    renderState.partialCount > 0;

  if (needsMainScript) {
    // Load the main.js script
    const url = addImport("main.js");

    script += `import { revive } from "${url}";`;
  }

  // Finally, it loads all island scripts and hydrates the islands using the
  // reviver from the "main" script.
  let islandRegistry = "";
  const islandMapping: Record<string, string> = {};
  if (renderState.encounteredIslands.size > 0) {
    // Prepare the inline script that loads and revives the islands
    for (const island of renderState.encounteredIslands) {
      const url = addImport(`island-${island.id}.js`);

      script +=
        `import * as ${island.name}_${island.exportName} from "${url}";`;
      islandRegistry += `${island.id}:${island.name}_${island.exportName},`;
      islandMapping[island.id] = url;
    }
  }

  // Always revive to detect partials
  if (needsMainScript) {
    script += `const propsArr = typeof STATE !== "undefined" ? STATE[0] : [];`;
    script += `revive({${islandRegistry}}, propsArr);`;
  }

  // Append the inline script.
  if (isPartial && Object.keys(islandMapping).length > 0) {
    const escapedData = htmlEscapeJsonString(
      JSON.stringify({
        islands: islandMapping,
        signals: hasSignals ? addImport("signals.js") : null,
        deserializer: requiresDeserializer
          ? addImport("deserializer.js")
          : null,
      }),
    );
    const nonce = renderState.csp ? ` nonce="${renderState.getNonce()}` : "";
    opts.bodyHtml +=
      `<script id="__LIME_PARTIAL_DATA" type="application/json"${nonce}">${escapedData}</script>`;
  }
  if (script !== "") {
    opts.bodyHtml +=
      `<script type="module" nonce="${renderState.getNonce()}">${script}</script>`;
  }

  if (opts.styles.length > 0) {
    const node = view.adapter.h("style", {
      id: "__LIME_STYLE",
      dangerouslySetInnerHTML: { __html: opts.styles.join("\n") },
    });

    renderState.headVNodes.splice(0, 0, node);
  }

  for (const style of styleTags) {
    const node = view.adapter.h("style", {
      id: style.id,
      media: style.media,
      dangerouslySetInnerHTML: { __html: style.cssText },
    });

    renderState.headVNodes.splice(0, 0, node);
  }

  return { bodyHtml: opts.bodyHtml, preloadSet, moduleScripts };
}
