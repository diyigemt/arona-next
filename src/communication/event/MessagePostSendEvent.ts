import { BotEvent } from "./Event";
import { MessageChain } from "../message/MessageChain";
import { MessageReceipt } from "../message/MessageReceipt";
import { Contact, Group } from "../types/Contact";

export abstract class MessagePostSendEvent<C extends Contact> extends BotEvent {
  abstract target: C;
  abstract message: MessageChain;
  abstract exception?: Error;
  abstract receipt?: MessageReceipt<C>;
}

export type MessagePostSendEventConstructor<C extends Contact> = {
  new (target: C, message: MessageChain, exception?: Error, receipt?: MessageReceipt<C>): MessagePostSendEvent<C>;
};

export class GroupMessagePostSendEvent extends MessagePostSendEvent<Contact> {
  constructor(
    readonly target: Group,
    readonly message: MessageChain,
    readonly exception?: Error,
    readonly receipt?: MessageReceipt<Group>,
  ) {
    super(target.bot);
  }

  toString(): string {
    return `Group(${this.target.id}) <- ${this.message}`;
  }

  eventId: string = "";
}
