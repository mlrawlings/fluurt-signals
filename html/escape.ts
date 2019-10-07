const xmlCharReg = /[&<]/g;
const xmlAttrReg = /["\n]/g;
const xmlReplacements = {
  "<": "&lt;",
  "&": "&amp;",
  '"': "&quot;", // We only need double quotes since the runtime will only output double quotes.
  "\n": "&#10;" // Preserve new lines so that they don't get normalized as space.
} as const;

export const escapeScript = escapeTagEnding("script");
export const escapeStyle = escapeTagEnding("style");
export const escapeXML = escapeIfNeeded(val =>
  val.replace(xmlCharReg, replaceXMLChar)
);
export const escapeXMLAttr = escapeIfNeeded(val =>
  val.replace(xmlAttrReg, replaceXMLChar)
);

function replaceXMLChar(match: string) {
  return xmlReplacements[match];
}

function escapeTagEnding(tagName: string) {
  const closingTag = `</${tagName}`;
  const replacement = `\\003c/${tagName}`;
  return escapeIfNeeded(val => val.replace(closingTag, replacement));
}

function escapeIfNeeded(escape: (val: string) => string) {
  return (val: unknown) => {
    if (val == null) {
      return "";
    }

    const type = typeof val;
    const result = val + "";

    if (type === "boolean" || type === "number") {
      return result;
    }

    if (type === "object" && val instanceof RegExp) {
      return val.source;
    }

    return escape(result);
  };
}
