import { tryCatch, write, fork } from "../../../../html/index";
import { resolveAfter, rejectAfter } from "../../utils/resolve";

const renderer = () => {
  write("a");
  tryCatch(
    () => {
      write("b");
      fork(rejectAfter(new Error("ERROR!"), 20), write);
      write("d");
    },
    err => {
      write(err.message);
    }
  );
  write("e");
  fork(resolveAfter("f", 1), write);
  write("g");
};

export default renderer;
