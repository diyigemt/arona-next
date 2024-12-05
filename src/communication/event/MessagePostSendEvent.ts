import { BotEvent } from "./Event";
import { Contact } from "../contact/Contact";
import { MessageChain } from "../message/MessageChain";
import { MessageReceipt } from "../message/MessageReceipt";

export abstract class MessagePostSendEvent<C extends Contact> extends BotEvent {
  abstract target: C;
  abstract message: MessageChain;
  abstract exception?: Error;
  abstract receipt?: MessageReceipt<C>;
}

export class GroupMessagePostSendEvent extends MessagePostSendEvent<Contact> {
  constructor(
    readonly target: Contact,
    readonly message: MessageChain,
    readonly exception?: Error,
    readonly receipt?: MessageReceipt<Contact>,
  ) {
    super(target.bot);
  }
  toString(): string {
    return `Group(${this.receipt.id}) <- ${this.message}`;
  }
}
