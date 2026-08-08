import { r as raw } from "./hast-util-raw.mjs";
function rehypeRaw(options) {
  return function(tree, file) {
    const result = (
      /** @type {Root} */
      raw(tree, { ...options, file })
    );
    return result;
  };
}
export {
  rehypeRaw as r
};
