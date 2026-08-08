import { s as stringify } from "./comma-separated-tokens.mjs";
import { o as ok } from "./devlop.mjs";
import { s as svg, h as html, f as find } from "./property-information.mjs";
import { s as stringify$1 } from "./space-separated-tokens.mjs";
import { w as webNamespaces } from "./web-namespaces.mjs";
import { z as zwitch } from "./zwitch.mjs";
const emptyOptions = {};
const own = {}.hasOwnProperty;
const one = zwitch("type", { handlers: { root, element, text, comment, doctype } });
function toParse5(tree, options) {
  const settings = options || emptyOptions;
  const space = settings.space;
  return one(tree, space === "svg" ? svg : html);
}
function root(node, schema) {
  const result = {
    nodeName: "#document",
    // @ts-expect-error: `parse5` uses enums, which are actually strings.
    mode: (node.data || {}).quirksMode ? "quirks" : "no-quirks",
    childNodes: []
  };
  result.childNodes = all(node.children, result, schema);
  patch(node, result);
  return result;
}
function fragment(node, schema) {
  const result = { nodeName: "#document-fragment", childNodes: [] };
  result.childNodes = all(node.children, result, schema);
  patch(node, result);
  return result;
}
function doctype(node) {
  const result = {
    nodeName: "#documentType",
    name: "html",
    publicId: "",
    systemId: "",
    parentNode: null
  };
  patch(node, result);
  return result;
}
function text(node) {
  const result = {
    nodeName: "#text",
    value: node.value,
    parentNode: null
  };
  patch(node, result);
  return result;
}
function comment(node) {
  const result = {
    nodeName: "#comment",
    data: node.value,
    parentNode: null
  };
  patch(node, result);
  return result;
}
function element(node, schema) {
  const parentSchema = schema;
  let currentSchema = parentSchema;
  if (node.type === "element" && node.tagName.toLowerCase() === "svg" && parentSchema.space === "html") {
    currentSchema = svg;
  }
  const attrs = [];
  let prop;
  if (node.properties) {
    for (prop in node.properties) {
      if (prop !== "children" && own.call(node.properties, prop)) {
        const result2 = createProperty(
          currentSchema,
          prop,
          node.properties[prop]
        );
        if (result2) {
          attrs.push(result2);
        }
      }
    }
  }
  const space = currentSchema.space;
  const result = {
    nodeName: node.tagName,
    tagName: node.tagName,
    attrs,
    // @ts-expect-error: `parse5` types are wrong.
    namespaceURI: webNamespaces[space],
    childNodes: [],
    parentNode: null
  };
  result.childNodes = all(node.children, result, currentSchema);
  patch(node, result);
  if (node.tagName === "template" && node.content) {
    result.content = fragment(node.content, currentSchema);
  }
  return result;
}
function createProperty(schema, prop, value) {
  const info = find(schema, prop);
  if (value === false || value === null || value === void 0 || typeof value === "number" && Number.isNaN(value) || !value && info.boolean) {
    return;
  }
  if (Array.isArray(value)) {
    value = info.commaSeparated ? stringify(value) : stringify$1(value);
  }
  const attribute = {
    name: info.attribute,
    value: value === true ? "" : String(value)
  };
  if (info.space && info.space !== "html" && info.space !== "svg") {
    const index = attribute.name.indexOf(":");
    if (index < 0) {
      attribute.prefix = "";
    } else {
      attribute.name = attribute.name.slice(index + 1);
      attribute.prefix = info.attribute.slice(0, index);
    }
    attribute.namespace = webNamespaces[info.space];
  }
  return attribute;
}
function all(children, parentNode, schema) {
  let index = -1;
  const results = [];
  if (children) {
    while (++index < children.length) {
      const child = one(children[index], schema);
      child.parentNode = parentNode;
      results.push(child);
    }
  }
  return results;
}
function patch(from, to) {
  const position = from.position;
  if (position && position.start && position.end) {
    ok(typeof position.start.offset === "number");
    ok(typeof position.end.offset === "number");
    to.sourceCodeLocation = {
      startLine: position.start.line,
      startCol: position.start.column,
      startOffset: position.start.offset,
      endLine: position.end.line,
      endCol: position.end.column,
      endOffset: position.end.offset
    };
  }
}
export {
  toParse5 as t
};
