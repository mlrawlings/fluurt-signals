import { isEmpty, classValue, styleValue } from "../common/helpers";

export function classAttr(val: unknown) {
  return stringAttr("class", classValue(val));
}

export function styleAttr(val: unknown) {
  return stringAttr("style", styleValue(val));
}

export function attr(name: string, val: unknown) {
  return isEmpty(val) ? "" : notEmptyUnknownAttr(name, val);
}

export function attrs(data: Record<string, unknown>) {
  let result = "";

  for (const name in data) {
    const val = data[name];

    switch (name) {
      case "class":
        result += classAttr(val);
        break;
      case "style":
        result += styleAttr(val);
        break;
      case "renderBody":
        break;
      default:
        if (!(isEmpty(val) || isInvalidAttrName(name))) {
          result += notEmptyUnknownAttr(name, val);
        }
    }
  }

  return result;
}

function stringAttr(name: string, val: string) {
  if (val === "") {
    return val;
  }

  return ` ${name + doubleQuoteValue(val)}`;
}

function notEmptyUnknownAttr(name: string, val: unknown) {
  switch (typeof val) {
    case "string":
      return ` ${name + guessQuoteValue(val)}`;
    case "boolean":
      return ` ${name}`;
    case "number":
      return ` ${name}=${val}`;
    case "object":
      if (val instanceof RegExp) {
        return ` ${name + doubleQuoteValue(val.source)}`;
      }
  }

  return ` ${name + guessQuoteValue(val + "")}`;
}

function guessQuoteValue(val: string) {
  if (val === "") {
    return "";
  }

  if (val[0] === "{") {
    return singleQuoteValue(val);
  }

  return doubleQuoteValue(val);
}

function doubleQuoteValue(val: string) {
  return escapeAttrValue(val, '"', "&#34;");
}

function singleQuoteValue(val: string) {
  return escapeAttrValue(val, "'", "&#39;");
}

function escapeAttrValue(val: string, quote: string, escaped: string) {
  let result = "=" + quote;
  let lastPos = 0;

  for (let i = 0, len = val.length; i < len; i++) {
    if (val[i] === quote) {
      result += val.slice(lastPos, i) + escaped;
      lastPos = i + 1;
    }
  }

  return result + (lastPos ? val.slice(lastPos) : val) + quote;
}

// https://html.spec.whatwg.org/multipage/syntax.html#attributes-2
// Technically the above includes more invalid characters for attributes.
// In practice however the only character that does not become an attribute name
// is when there is a >.
function isInvalidAttrName(name: string) {
  for (let i = name.length; i--; ) {
    if (name[i] === ">") {
      return true;
    }
  }

  return false;
}
