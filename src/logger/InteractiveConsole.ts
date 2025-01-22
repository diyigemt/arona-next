import { terminal, stringWidth } from "terminal-kit";
// @ts-ignore
import * as InlineInput from "terminal-kit/lib/document/InlineInput.js";
const terminalWidth = terminal.width;
const terminalHeight = terminal.height;
// @ts-ignore
const document = terminal.createDocument();
let obj: unknown;
export function catchInput() {
  obj = new InlineInput({
    parent: document,
    // @ts-ignore
    x: 0,
    y: terminal.height - 1,
    width: terminal.width - 1,
    cancelable: true,
    prompt: {
      content: "> ",
    },
  });
  document.focusNext();
  // @ts-ignore
  obj.on("submit", (input: string) => {
    if (input === "exit") {
      terminal.hideCursor(false);
      terminal.styleReset();
      terminal.clear();
      process.exit(0);
    }
    resetInput();
  });
}
function resetInput() {
  if (obj) {
    // @ts-ignore
    obj.setValue("");
    // @ts-ignore
    obj.autoResizeAndDraw();
  }
}
terminal.on("key", (name: string) => {
  if (name === "CTRL_C") {
    resetInput();
  }
});
type LogType = "info" | "warning" | "error";
let printHeight = 1;
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
  obj.autoResizeAndDraw();
}
