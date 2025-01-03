import BotManager from "../communication/BotManager";
import { GroupMessageEvent } from "../communication/event/MessageEvent";
import { GroupCommandSender } from "../command/CommandSender";
import { executeCommand } from "../command/CommandManager";
import { ActionHandler, AronaCommand } from "../types/decorator";
import { AbstractCommand } from "../command/AbstractCommand";
import axios from "axios";

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
  private httpClient = axios.create({
    timeout: 10000,
  });

  constructor() {
    super("测试");
  }

  @ActionHandler(GroupCommandSender)
  async handle(ctx: GroupCommandSender) {
    this.httpClient
      .get("https://arona.diyigemt.com/api/v2/image", {
        params: {
          name: "猫夜",
        },
      })
      .then((resp) => {
        ctx.sendMessage(resp.data.data[0].hash).then();
      });
  }
}
