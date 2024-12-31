import BotManager from "../communication/BotManager";
import { MessageChainBuilder } from "../communication/message/MessageChain";
import { PlainText } from "../communication/message/Message";
import { GroupMessageEvent } from "../communication/event/MessageEvent";

export function initService() {
  const bot = BotManager.getBot();
  if (!bot) return;
  bot.eventChannel.subscribeAlways(GroupMessageEvent, async (ev) => {
    const mcb = MessageChainBuilder(ev.message.sourceId, ev.eventId);
    const txt = ev.message.filter((it) => it instanceof PlainText).join("");
    mcb.append("recv: " + txt);
    const result = await ev.subject.sendMessage(mcb.build(), 1);
    mcb.splice(0, 1);
    mcb.append("recall in 3s");
    const result2 = await ev.subject.sendMessage(mcb.build(), 2);
    setTimeout(() => {
      result.recall().then();
      result2.recall().then();
    }, 3000);
  });
}
