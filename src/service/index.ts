import BotManager from "../communication/BotManager";
import { GroupMessageEvent } from "../communication/event/Event";
import { MessageChainBuilder } from "../communication/message/MessageChain";
import { PlainText } from "../communication/message/Message";

export function initService() {
  const bot = BotManager.getBot();
  if (!bot) return;
  bot.eventChannel.subscribeAlways(GroupMessageEvent, async (ev) => {
    const mcb = MessageChainBuilder(ev.message.sourceId, ev.eventId);
    const txt = ev.message.filter((it) => it instanceof PlainText).join("");
    mcb.append("recv: " + txt);
    ev.subject.sendMessage(mcb.build(), 1).then();
    if (txt === "图图") {
      const mb2 = MessageChainBuilder(ev.message.sourceId, ev.eventId);
      const im = await ev.group.uploadImage(
        "https://arona.cdn.diyigemt.com/image/some/Trip-Trap-Train%E5%A4%8D%E5%88%BB.png",
      );
      mb2.append(im);
      ev.subject.sendMessage(mb2.build(), 2).then();
    }
  });
}
