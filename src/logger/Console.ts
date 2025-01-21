import { terminal, stringWidth } from "terminal-kit";

// @ts-ignore
const terminalWidth = terminal.width;
const terminalHeight = terminal.height;
terminal.grabInput(true);
let obj: ReturnType<typeof terminal.inputField>;
function catchInput() {
  obj = terminal.inputField(
    {
      // @ts-ignore
      x: 0,
      y: terminal.height,
      cancelable: true,
    },
    (_, input) => {
      obj.abort();
      catchInput();
    },
  );
}
terminal.on("key", (name: string) => {
  if (name === "CTRL_C") {
    obj.abort();
    catchInput();
  }
});
type LogType = "info" | "warning" | "error";
let printHeight = 0;
export function printAbove(msg: string, type: LogType = "info") {
  const msgNeedLine = Math.ceil(stringWidth(msg) / terminalWidth);
  terminal.saveCursor();
  terminal.moveTo(0, printHeight);
  terminal.eraseLine();
  if (type === "info") {
    terminal.defaultColor(msg);
  } else if (type === "warning") {
    terminal.yellow(msg);
  } else {
    terminal.red(msg);
  }
  printHeight += msgNeedLine;
  if (printHeight > terminalHeight) {
    terminal.scrollUp(1);
    printHeight = terminalHeight;
  }
  terminal.restoreCursor();
  // @ts-ignore
  obj.redraw();
}
export function initTerminal() {
  catchInput();
}
