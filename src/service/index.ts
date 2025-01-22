import BotManager from "@communication/BotManager";
import { GroupMessageEvent } from "@communication/event/MessageEvent";
import { GroupCommandSender } from "@command/CommandSender";
import { executeCommand } from "@command/CommandManager";

export * from "./arona";

export function initService() {
  const bot = BotManager.getBot();
  if (!bot) return;
  bot.eventChannel.subscribeAlways(GroupMessageEvent, async (ev) => {
    const commandSender = new GroupCommandSender(ev.sender, ev.message.messageId, ev.eventId);
    executeCommand(ev.message, commandSender).then();
  });
}
