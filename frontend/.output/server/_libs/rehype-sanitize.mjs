import { s as sanitize } from "./hast-util-sanitize.mjs";
function rehypeSanitize(options) {
  return function(tree) {
    const result = (
      /** @type {Root} */
      sanitize(tree, options)
    );
    return result;
  };
}
export {
  rehypeSanitize as r
};
