import { MessageChain, MessageChainImpl } from "../communication/message/MessageChain";
import { MessageEventRaw } from "../communication/types/Message";

export function messageEventRawToMessageChain(raw: MessageEventRaw): MessageChain {
  return new MessageChainImpl(raw.id);
}
