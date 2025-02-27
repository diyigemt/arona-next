import { ActionHandler, AronaCommand, CommandArgument } from "@type/decorator";
import { AbstractCommand } from "@command/AbstractCommand";
import axios from "axios";
import { GroupCommandSender } from "@command/CommandSender";
import { MessageChainBuilder } from "@communication/message/MessageChain";
import { withTimeoutOrNull } from "@/utils";

type AronaServerResponse<T> = {
  code: number;
  message: string;
  data: T;
};

type ImageQueryData = {
  name: string;
  hash: string;
  content: string;
  type: string;
};

@AronaCommand("攻略")
export class TrainerCommand extends AbstractCommand {
  private httpClient = axios.create({
    timeout: 10000,
  });

  @CommandArgument()
  private imName!: string;

  constructor() {
    super("攻略");
  }

  @ActionHandler(GroupCommandSender)
  async handle(ctx: GroupCommandSender) {
    const resp = await this.getImage(ctx, this.imName);
    if (!resp) {
      ctx.sendMessage("api服务器出错, 请稍后再试").then();
      return;
    }
    if (resp.code !== 200) {
      // 多选
      const mcb = MessageChainBuilder();
      mcb.append(`未找到有关${this.imName}的内容, 是否想要查找:`);
      resp.data.forEach((it, index) => {
        mcb.append(`${index + 1}. ${it.name}`);
      });
      await ctx.sendMessage(mcb.build());
      const choseMessage = await withTimeoutOrNull(5000, ctx.nextMessage());
      if (!choseMessage) {
        ctx.sendMessage("选择超时").then();
        return;
      }
      const chose = choseMessage.message.toString();
      const num = Number(chose);
      if (num > 0 && num <= resp.data.length) {
        const data = await this.getImage(ctx, resp.data[num - 1].name);
        if (!data) {
          ctx.sendMessage("api服务器出错, 请稍后再试").then();
          return;
        }
        const url = `https://arona.cdn.diyigemt.com/image${data.data[0].content}`;
        const im = await ctx.subject.uploadImage(url);
        if (im) {
          ctx.sendMessage(im).then();
        }
      }
    } else {
      const url = `https://arona.cdn.diyigemt.com/image${resp.data[0].content}`;
      const im = await ctx.subject.uploadImage(url);
      if (im) {
        ctx.sendMessage(im).then();
      }
    }
  }

  private async getImage(ctx: GroupCommandSender, name: string) {
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
        ctx.bot?.logger.error(err);
      });
  }
}
