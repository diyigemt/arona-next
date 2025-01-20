import BotManager from "../communication/BotManager";
import { GroupMessageEvent } from "../communication/event/MessageEvent";
import { GroupCommandSender } from "../command/CommandSender";
import { executeCommand } from "../command/CommandManager";
import { ActionHandler, AronaCommand, CommandArgument } from "../types/decorator";
import { AbstractCommand } from "../command/AbstractCommand";
import axios from "axios";
import { MessageChainBuilder } from "../communication/message/MessageChain";

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
    this.getImage(ctx, this.imName).then(async (resp) => {
      if (!resp) {
        ctx.sendMessage("api服务器出错, 请稍后再试").then();
        return;
      }
      if (resp.code !== 200) {
        // 多选
        const mc = MessageChainBuilder();
        mc.append(`未找到有关${this.imName}的内容, 是否想要查找:`);
        resp.data.forEach((it, index) => {
          mc.append(`${index + 1}. ${it.name}`);
        });
        await ctx.sendMessage(mc.build());
        const choseMessage = await ctx.nextMessage();
        const chose = choseMessage.message.toString();
        const num = Number(chose);
        if (num > 0 && num < resp.data.length) {
          this.getImage(ctx, resp.data[num].content).then(async (data) => {
            if (!data) {
              ctx.sendMessage("api服务器出错, 请稍后再试").then();
              return;
            }
            const url = `https://arona.cdn.diyigemt.com/image${data.data[0].content}`;
            const im = await ctx.subject.uploadImage(url);
            ctx.sendMessage(im).then();
          });
        }
      } else {
        const url = `https://arona.cdn.diyigemt.com/image${resp.data[0].content}`;
        const im = await ctx.subject.uploadImage(url);
        ctx.sendMessage(im).then();
      }
    });
  }

  private getImage(ctx: GroupCommandSender, name: string) {
    return this.httpClient
      .get("https://arona.diyigemt.com/api/v2/image", {
        params: {
          name,
        },
      })
      .then(async (resp) => {
        if (resp.status !== 200) {
          return undefined;
        }
        return resp.data as AronaServerResponse<ImageQueryData[]>;
      })
      .catch((err) => {
        ctx.bot.logger.error(err);
      });
  }
}
