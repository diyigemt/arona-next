import BotManager from "../communication/BotManager";
import { GroupMessageEvent } from "../communication/event/MessageEvent";
import { GroupCommandSender } from "../command/CommandSender";
import { executeCommand } from "../command/CommandManager";
import { ActionHandler, AronaCommand } from "../types/decorator";
import { AbstractCommand } from "../command/AbstractCommand";

export function initService() {
  const bot = BotManager.getBot();
  if (!bot) return;
  bot.eventChannel.subscribeAlways(GroupMessageEvent, async (ev) => {
    const commandSender = new GroupCommandSender(ev.sender, ev.message.messageId, ev.eventId);
    executeCommand(ev.message, commandSender).then();
  });
}

@AronaCommand("测试")
export class HellWorldCommand extends AbstractCommand {
  constructor() {
    super("测试");
  }

  @ActionHandler(GroupCommandSender)
  async handle(ctx: GroupCommandSender) {
    ctx.sendMessage("hello world").then();
  }
}
