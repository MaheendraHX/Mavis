import { s as structuredClone } from "./ungap__structured-clone.mjs";
import { h as htmlVoidElements } from "./html-void-elements.mjs";
import { P as Parser, T as TokenizerMode, a as TokenType, g as getTagID } from "./parse5.mjs";
import { w as webNamespaces } from "./web-namespaces.mjs";
import { z as zwitch } from "./zwitch.mjs";
import { p as pointStart, a as pointEnd } from "./unist-util-position.mjs";
import { f as fromParse5 } from "./hast-util-from-parse5.mjs";
import { v as visit } from "./unist-util-visit.mjs";
import { t as toParse5 } from "./hast-util-to-parse5.mjs";
const gfmTagfilterExpression = /<(\/?)(iframe|noembed|noframes|plaintext|script|style|textarea|title|xmp)(?=[\t\n\f\r />])/gi;
const knownMdxNames = /* @__PURE__ */ new Set([
  "mdxFlowExpression",
  "mdxJsxFlowElement",
  "mdxJsxTextElement",
  "mdxTextExpression",
  "mdxjsEsm"
]);
const parseOptions = { sourceCodeLocationInfo: true, scriptingEnabled: false };
function raw(tree, options) {
  const document = documentMode(tree);
  const one = zwitch("type", {
    handlers: { root, element, text, comment, doctype, raw: handleRaw },
    unknown
  });
  const state = {
    parser: document ? new Parser(parseOptions) : Parser.getFragmentParser(void 0, parseOptions),
    handle(node) {
      one(node, state);
    },
    stitches: false,
    options: options || {}
  };
  one(tree, state);
  resetTokenizer(state, pointStart());
  const p5 = document ? state.parser.document : state.parser.getFragment();
  const result = fromParse5(p5, {
    // To do: support `space`?
    file: state.options.file
  });
  if (state.stitches) {
    visit(result, "comment", function(node, index, parent) {
      const stitch2 = (
        /** @type {Stitch} */
        /** @type {unknown} */
        node
      );
      if (stitch2.value.stitch && parent && index !== void 0) {
        const siblings = parent.children;
        siblings[index] = stitch2.value.stitch;
        return index;
      }
    });
  }
  if (result.type === "root" && result.children.length === 1 && result.children[0].type === tree.type) {
    return result.children[0];
  }
  return result;
}
function all(nodes, state) {
  let index = -1;
  if (nodes) {
    while (++index < nodes.length) {
      state.handle(nodes[index]);
    }
  }
}
function root(node, state) {
  all(node.children, state);
}
function element(node, state) {
  startTag(node, state);
  all(node.children, state);
  endTag(node, state);
}
function text(node, state) {
  if (state.parser.tokenizer.state > 4) {
    state.parser.tokenizer.state = 0;
  }
  const token = {
    type: TokenType.CHARACTER,
    chars: node.value,
    location: createParse5Location(node)
  };
  resetTokenizer(state, pointStart(node));
  state.parser.currentToken = token;
  state.parser._processToken(state.parser.currentToken);
}
function doctype(node, state) {
  const token = {
    type: TokenType.DOCTYPE,
    name: "html",
    forceQuirks: false,
    publicId: "",
    systemId: "",
    location: createParse5Location(node)
  };
  resetTokenizer(state, pointStart(node));
  state.parser.currentToken = token;
  state.parser._processToken(state.parser.currentToken);
}
function stitch(node, state) {
  state.stitches = true;
  const clone = cloneWithoutChildren(node);
  if ("children" in node && "children" in clone) {
    const fakeRoot = (
      /** @type {Root} */
      raw({ type: "root", children: node.children }, state.options)
    );
    clone.children = fakeRoot.children;
  }
  comment({ type: "comment", value: { stitch: clone } }, state);
}
function comment(node, state) {
  const data = node.value;
  const token = {
    type: TokenType.COMMENT,
    data,
    location: createParse5Location(node)
  };
  resetTokenizer(state, pointStart(node));
  state.parser.currentToken = token;
  state.parser._processToken(state.parser.currentToken);
}
function handleRaw(node, state) {
  state.parser.tokenizer.preprocessor.html = "";
  state.parser.tokenizer.preprocessor.pos = -1;
  state.parser.tokenizer.preprocessor.lastGapPos = -2;
  state.parser.tokenizer.preprocessor.gapStack = [];
  state.parser.tokenizer.preprocessor.skipNextNewLine = false;
  state.parser.tokenizer.preprocessor.lastChunkWritten = false;
  state.parser.tokenizer.preprocessor.endOfChunkHit = false;
  state.parser.tokenizer.preprocessor.isEol = false;
  setPoint(state, pointStart(node));
  state.parser.tokenizer.write(
    state.options.tagfilter ? node.value.replace(gfmTagfilterExpression, "&lt;$1$2") : node.value,
    false
  );
  state.parser.tokenizer._runParsingLoop();
  if (state.parser.tokenizer.state === 72 || // @ts-expect-error: removed.
  state.parser.tokenizer.state === 78) {
    state.parser.tokenizer.preprocessor.lastChunkWritten = true;
    const cp = state.parser.tokenizer._consume();
    state.parser.tokenizer._callState(cp);
  }
}
function unknown(node_, state) {
  const node = (
    /** @type {Nodes} */
    node_
  );
  if (state.options.passThrough && state.options.passThrough.includes(node.type)) {
    stitch(node, state);
  } else {
    let extra = "";
    if (knownMdxNames.has(node.type)) {
      extra = ". It looks like you are using MDX nodes with `hast-util-raw` (or `rehype-raw`). If you use this because you are using remark or rehype plugins that inject `'html'` nodes, then please raise an issue with that plugin, as its a bad and slow idea. If you use this because you are using markdown syntax, then you have to configure this utility (or plugin) to pass through these nodes (see `passThrough` in docs), but you can also migrate to use the MDX syntax";
    }
    throw new Error("Cannot compile `" + node.type + "` node" + extra);
  }
}
function resetTokenizer(state, point) {
  setPoint(state, point);
  const token = state.parser.tokenizer.currentCharacterToken;
  if (token && token.location) {
    token.location.endLine = state.parser.tokenizer.preprocessor.line;
    token.location.endCol = state.parser.tokenizer.preprocessor.col + 1;
    token.location.endOffset = state.parser.tokenizer.preprocessor.offset + 1;
    state.parser.currentToken = token;
    state.parser._processToken(state.parser.currentToken);
  }
  state.parser.tokenizer.paused = false;
  state.parser.tokenizer.inLoop = false;
  state.parser.tokenizer.active = false;
  state.parser.tokenizer.returnState = TokenizerMode.DATA;
  state.parser.tokenizer.charRefCode = -1;
  state.parser.tokenizer.consumedAfterSnapshot = -1;
  state.parser.tokenizer.currentLocation = null;
  state.parser.tokenizer.currentCharacterToken = null;
  state.parser.tokenizer.currentToken = null;
  state.parser.tokenizer.currentAttr = { name: "", value: "" };
}
function setPoint(state, point) {
  if (point && point.offset !== void 0) {
    const location = {
      startLine: point.line,
      startCol: point.column,
      startOffset: point.offset,
      endLine: -1,
      endCol: -1,
      endOffset: -1
    };
    state.parser.tokenizer.preprocessor.lineStartPos = -point.column + 1;
    state.parser.tokenizer.preprocessor.droppedBufferSize = point.offset;
    state.parser.tokenizer.preprocessor.line = point.line;
    state.parser.tokenizer.currentLocation = location;
  }
}
function startTag(node, state) {
  const tagName = node.tagName.toLowerCase();
  if (state.parser.tokenizer.state === TokenizerMode.PLAINTEXT) return;
  resetTokenizer(state, pointStart(node));
  const current = state.parser.openElements.current;
  let ns = "namespaceURI" in current ? current.namespaceURI : webNamespaces.html;
  if (ns === webNamespaces.html && tagName === "svg") {
    ns = webNamespaces.svg;
  }
  const result = toParse5(
    // Shallow clone to not delve into `children`: we only need the attributes.
    { ...node, children: [] },
    { space: ns === webNamespaces.svg ? "svg" : "html" }
  );
  const tag = {
    type: TokenType.START_TAG,
    tagName,
    tagID: getTagID(tagName),
    // We always send start and end tags.
    selfClosing: false,
    ackSelfClosing: false,
    // Always element.
    /* c8 ignore next */
    attrs: "attrs" in result ? result.attrs : [],
    location: createParse5Location(node)
  };
  state.parser.currentToken = tag;
  state.parser._processToken(state.parser.currentToken);
  state.parser.tokenizer.lastStartTagName = tagName;
}
function endTag(node, state) {
  const tagName = node.tagName.toLowerCase();
  if (!state.parser.tokenizer.inForeignNode && htmlVoidElements.includes(tagName)) {
    return;
  }
  if (state.parser.tokenizer.state === TokenizerMode.PLAINTEXT) return;
  resetTokenizer(state, pointEnd(node));
  const tag = {
    type: TokenType.END_TAG,
    tagName,
    tagID: getTagID(tagName),
    selfClosing: false,
    ackSelfClosing: false,
    attrs: [],
    location: createParse5Location(node)
  };
  state.parser.currentToken = tag;
  state.parser._processToken(state.parser.currentToken);
  if (
    // Current element is closed.
    tagName === state.parser.tokenizer.lastStartTagName && // `<textarea>` and `<title>`
    (state.parser.tokenizer.state === TokenizerMode.RCDATA || // `<iframe>`, `<noembed>`, `<noframes>`, `<style>`, `<xmp>`
    state.parser.tokenizer.state === TokenizerMode.RAWTEXT || // `<script>`
    state.parser.tokenizer.state === TokenizerMode.SCRIPT_DATA)
  ) {
    state.parser.tokenizer.state = TokenizerMode.DATA;
  }
}
function documentMode(node) {
  const head = node.type === "root" ? node.children[0] : node;
  return Boolean(
    head && (head.type === "doctype" || head.type === "element" && head.tagName.toLowerCase() === "html")
  );
}
function createParse5Location(node) {
  const start = pointStart(node) || {
    line: void 0,
    column: void 0,
    offset: void 0
  };
  const end = pointEnd(node) || {
    line: void 0,
    column: void 0,
    offset: void 0
  };
  const location = {
    startLine: start.line,
    startCol: start.column,
    startOffset: start.offset,
    endLine: end.line,
    endCol: end.column,
    endOffset: end.offset
  };
  return location;
}
function cloneWithoutChildren(node) {
  return "children" in node ? structuredClone({ ...node, children: [] }) : structuredClone(node);
}
export {
  raw as r
};
