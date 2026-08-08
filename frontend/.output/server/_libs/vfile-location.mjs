function location(file) {
  const value = String(file);
  const indices = [];
  return { toOffset, toPoint };
  function toPoint(offset) {
    if (typeof offset === "number" && offset > -1 && offset <= value.length) {
      let index = 0;
      while (true) {
        let end = indices[index];
        if (end === void 0) {
          const eol = next(value, indices[index - 1]);
          end = eol === -1 ? value.length + 1 : eol + 1;
          indices[index] = end;
        }
        if (end > offset) {
          return {
            line: index + 1,
            column: offset - (index > 0 ? indices[index - 1] : 0) + 1,
            offset
          };
        }
        index++;
      }
    }
  }
  function toOffset(point) {
    if (point && typeof point.line === "number" && typeof point.column === "number" && !Number.isNaN(point.line) && !Number.isNaN(point.column)) {
      while (indices.length < point.line) {
        const from = indices[indices.length - 1];
        const eol = next(value, from);
        const end = eol === -1 ? value.length + 1 : eol + 1;
        if (from === end) break;
        indices.push(end);
      }
      const offset = (point.line > 1 ? indices[point.line - 2] : 0) + point.column - 1;
      if (offset < indices[point.line - 1]) return offset;
    }
  }
}
function next(value, from) {
  const cr = value.indexOf("\r", from);
  const lf = value.indexOf("\n", from);
  if (lf === -1) return cr;
  if (cr === -1 || cr + 1 === lf) return lf;
  return cr < lf ? cr : lf;
}
export {
  location as l
};
