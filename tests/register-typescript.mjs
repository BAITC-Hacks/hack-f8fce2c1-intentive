import { registerHooks } from "node:module";

// Node strips TS syntax; resolve the extensionless relative imports used by Next.js.
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (context.parentURL?.endsWith(".ts") && !context.parentURL.includes("/node_modules/")
      && specifier.startsWith(".") && !/\.[a-z]+$/i.test(specifier)) {
      return nextResolve(`${specifier}.ts`, context);
    }
    return nextResolve(specifier, context);
  },
});
