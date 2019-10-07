export { register } from "../common/registry";

export { classAttr, styleAttr } from "../common/helpers";

export { escapeScript, escapeStyle, escapeXML } from "./escape";

export { attr, attrs } from "./attrs";

export {
  createRenderer,
  write,
  fork,
  tryPlaceholder,
  tryCatch
} from "./writer";
