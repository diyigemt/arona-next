import BotManager from "../communication/BotManager";
import { GroupMessageEvent } from "../communication/event/MessageEvent";
import { GroupCommandSender } from "../command/CommandSender";
import { executeCommand } from "../command/CommandManager";
import { ActionHandler, AronaCommand, CommandArgument } from "../types/decorator";
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

type AronaServerResponse<T> = {
  code: number;
  message: string;
  data: T | null;
};

type ImageQueryData = {
  name: string;
  hash: string;
  content: string;
  type: string;
};

@AronaCommand("攻略")
export class HellWorldCommand extends AbstractCommand {
  private httpClient = axios.create({
    timeout: 10000,
  });

  @CommandArgument()
  private imName: string;

  constructor() {
    super("攻略");
  }

  @ActionHandler(GroupCommandSender)
  async handle(ctx: GroupCommandSender) {
    this.httpClient
      .get("https://arona.diyigemt.com/api/v2/image", {
        params: {
          name: this.imName,
        },
      })
      .then(async (resp) => {
        if (resp.status !== 200) {
          ctx.sendMessage("api服务器出错, 请稍后再试").then();
          return;
        }
        const data = resp.data as AronaServerResponse<ImageQueryData[]>;
        if (data.code !== 200) {
          // 多选
        } else {
          const url = `https://arona.cdn.diyigemt.com/image${data.data[0].content}`;
          const im = await ctx.subject.uploadImage(url);
          ctx.sendMessage(im).then();
        }
      });
  }
}
