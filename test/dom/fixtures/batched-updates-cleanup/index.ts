import {
  once,
  compute,
  createSignal,
  conditional,
  set,
  register
} from "../../../../dom/index";

import { dynamicText, beginEl, endEl } from "../../../../dom/dom";

const click = (container: Element) => {
  container.querySelector("button")!.click();
};

export const inputs = [{}, click] as const;

const renderer = register(
  __dirname.split("/").pop()!,
  (input: (typeof inputs)[0]) => {
    const show = createSignal(true);
    const message = createSignal("hi");

    beginEl("button");
    once("click", () => {
      set(message, "bye");
      set(show, false);
    });
    endEl();
    const branch0 = () => {
      beginEl("span");
      dynamicText(message);
      endEl();
    };
    conditional(compute(_show => (_show ? branch0 : undefined), [show]));
  }
);

renderer.input = ["value"];

export default renderer;
