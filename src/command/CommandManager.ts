import * as Commands from "../service";
import { ClassType } from "../communication/types/Helper";
import { ReflectMetadataKey } from "../types/decorator";
import { AbstractCommand } from "./AbstractCommand";
import { Message, PlainText } from "../communication/message/Message";
import { AbstractCommandSender } from "./CommandSender";
import { MessageToMessageChain } from "../communication/message/MessageChain";

type CommandSignature = {
  clazz: ClassType<AbstractCommand>;
  commandName: string;
  children: CommandSignature[];
  childrenMap: Map<string, CommandSignature>;
};

const CommandMap = new Map<string, CommandSignature>();

export function registerAllCommand() {
  const subCommands: ClassType<AbstractCommand>[] = [];
  Object.keys(Commands).forEach((key) => {
    const clazz = Reflect.get(Commands, key);
    const commandName: string | undefined = Reflect.getMetadata(ReflectMetadataKey.ARONA_COMMAND, clazz);
    if (commandName) {
      CommandMap.set(commandName, {
        clazz,
        commandName,
        children: [],
        childrenMap: new Map<string, CommandSignature>(),
      });
    }
    const parent: ClassType<AbstractCommand> | undefined = Reflect.getMetadata(
      ReflectMetadataKey.SUB_COMMAND_PARENT,
      clazz,
    );
    if (parent) {
      subCommands.push(clazz);
    }
  });
  let deepCount = 0;
  const commandList = [...CommandMap.values()];
  while (deepCount++ < 10 && subCommands.length > 0) {
    subCommands.forEach((it, idx) => {
      const parent: ClassType<AbstractCommand> = Reflect.getMetadata(ReflectMetadataKey.SUB_COMMAND_PARENT, it);
      const commandName: string = Reflect.getMetadata(ReflectMetadataKey.COMMAND_NAME, it);
      const findParent = commandList.find((command) => findParentOrUndefined(command, parent));
      if (findParent) {
        subCommands.splice(idx, 1);
        const sign = {
          clazz: it,
          commandName,
          children: [],
          childrenMap: new Map<string, CommandSignature>(),
        };
        findParent.children.push(sign);
        findParent.childrenMap.set(commandName, sign);
      }
    });
  }
  function findParentOrUndefined(
    signature: CommandSignature,
    parent: ClassType<AbstractCommand>,
  ): CommandSignature | undefined {
    if (signature.clazz === parent) {
      return signature;
    }
    return signature.children.map((it) => findParentOrUndefined(it, parent)).find((it) => it);
  }
}

export function findCommandDeclaration(clazzName: string) {
  return CommandMap.get(clazzName);
}

export async function executeCommand(message: Message, caller: AbstractCommandSender) {
  const call = MessageToMessageChain(message);
  const plainMessage = call.find((it) => it instanceof PlainText);
  if (!plainMessage) {
    // TODO UnresolvedCommand
    return;
  }
  const commandStr = plainMessage.toString().trim().split(" ");
  const commandSignature = CommandMap.get(commandStr[0]);
  if (!commandSignature) {
    // TODO UnresolvedCommand
    return;
  }
  const arg = call.toString();
  const parseArg = arg
    .trim()
    .split(" ")
    .filter((it) => it);
  parseArg.splice(0, 1);
  // @ts-ignore
  const command: AbstractCommand = new commandSignature.clazz();
  const ctx = Reflect.get(command, "ctx") as Map<string, unknown>;
  ctx?.set("ctx", caller);
  return command.parseAsync(parseArg, { from: "user" });
}
