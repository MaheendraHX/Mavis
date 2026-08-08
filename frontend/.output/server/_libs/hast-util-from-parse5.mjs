import { o as ok } from "./devlop.mjs";
import { s as svg, h as html, f as find } from "./property-information.mjs";
import { w as webNamespaces } from "./web-namespaces.mjs";
import { s, h } from "./hastscript.mjs";
import { l as location } from "./vfile-location.mjs";
const own = {}.hasOwnProperty;
const proto = Object.prototype;
function fromParse5(tree, options) {
  const settings = options || {};
  return one(
    {
      file: settings.file || void 0,
      location: false,
      schema: settings.space === "svg" ? svg : html,
      verbose: settings.verbose || false
    },
    tree
  );
}
function one(state, node) {
  let result;
  switch (node.nodeName) {
    case "#comment": {
      const reference = (
        /** @type {DefaultTreeAdapterMap['commentNode']} */
        node
      );
      result = { type: "comment", value: reference.data };
      patch(state, reference, result);
      return result;
    }
    case "#document":
    case "#document-fragment": {
      const reference = (
        /** @type {DefaultTreeAdapterMap['document'] | DefaultTreeAdapterMap['documentFragment']} */
        node
      );
      const quirksMode = "mode" in reference ? reference.mode === "quirks" || reference.mode === "limited-quirks" : false;
      result = {
        type: "root",
        children: all(state, node.childNodes),
        data: { quirksMode }
      };
      if (state.file && state.location) {
        const document = String(state.file);
        const loc = location(document);
        const start = loc.toPoint(0);
        const end = loc.toPoint(document.length);
        result.position = { start, end };
      }
      return result;
    }
    case "#documentType": {
      const reference = (
        /** @type {DefaultTreeAdapterMap['documentType']} */
        node
      );
      result = { type: "doctype" };
      patch(state, reference, result);
      return result;
    }
    case "#text": {
      const reference = (
        /** @type {DefaultTreeAdapterMap['textNode']} */
        node
      );
      result = { type: "text", value: reference.value };
      patch(state, reference, result);
      return result;
    }
    // Element.
    default: {
      const reference = (
        /** @type {DefaultTreeAdapterMap['element']} */
        node
      );
      result = element(state, reference);
      return result;
    }
  }
}
function all(state, nodes) {
  let index = -1;
  const results = [];
  while (++index < nodes.length) {
    const result = (
      /** @type {RootContent} */
      one(state, nodes[index])
    );
    results.push(result);
  }
  return results;
}
function element(state, node) {
  const schema = state.schema;
  state.schema = node.namespaceURI === webNamespaces.svg ? svg : html;
  let index = -1;
  const properties = {};
  while (++index < node.attrs.length) {
    const attribute = node.attrs[index];
    const name = (attribute.prefix ? attribute.prefix + ":" : "") + attribute.name;
    if (!own.call(proto, name)) {
      properties[name] = attribute.value;
    }
  }
  const x = state.schema.space === "svg" ? s : h;
  const result = x(node.tagName, properties, all(state, node.childNodes));
  patch(state, node, result);
  if (result.tagName === "template") {
    const reference = (
      /** @type {DefaultTreeAdapterMap['template']} */
      node
    );
    const pos = reference.sourceCodeLocation;
    const startTag = pos && pos.startTag && position(pos.startTag);
    const endTag = pos && pos.endTag && position(pos.endTag);
    const content = (
      /** @type {Root} */
      one(state, reference.content)
    );
    if (startTag && endTag && state.file) {
      content.position = { start: startTag.end, end: endTag.start };
    }
    result.content = content;
  }
  state.schema = schema;
  return result;
}
function patch(state, from, to) {
  if ("sourceCodeLocation" in from && from.sourceCodeLocation && state.file) {
    const position2 = createLocation(state, to, from.sourceCodeLocation);
    if (position2) {
      state.location = true;
      to.position = position2;
    }
  }
}
function createLocation(state, node, location2) {
  const result = position(location2);
  if (node.type === "element") {
    const tail = node.children[node.children.length - 1];
    if (result && !location2.endTag && tail && tail.position && tail.position.end) {
      result.end = Object.assign({}, tail.position.end);
    }
    if (state.verbose) {
      const properties = {};
      let key;
      if (location2.attrs) {
        for (key in location2.attrs) {
          if (own.call(location2.attrs, key)) {
            properties[find(state.schema, key).property] = position(
              location2.attrs[key]
            );
          }
        }
      }
      ok(location2.startTag);
      const opening = position(location2.startTag);
      const closing = location2.endTag ? position(location2.endTag) : void 0;
      const data = { opening };
      if (closing) data.closing = closing;
      data.properties = properties;
      node.data = { position: data };
    }
  }
  return result;
}
function position(loc) {
  const start = point({
    line: loc.startLine,
    column: loc.startCol,
    offset: loc.startOffset
  });
  const end = point({
    line: loc.endLine,
    column: loc.endCol,
    offset: loc.endOffset
  });
  return start || end ? { start, end } : void 0;
}
function point(point2) {
  return point2.line && point2.column ? point2 : void 0;
}
export {
  fromParse5 as f
};
