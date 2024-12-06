import { BotEvent } from "./Event";
import { Message } from "../message/Message";
import { Contact, Group } from "../types/Contact";

export abstract class MessagePreSendEvent extends BotEvent {
  abstract target: Contact;
  abstract message: Message;
}

export type MessagePreSendEventConstructor<C extends Contact> = {
  new (contact: C, message: Message): MessagePreSendEvent;
};

export class GroupMessagePreSendEvent extends MessagePreSendEvent {
  constructor(
    readonly target: Group,
    readonly message: Message,
  ) {
    super(target.bot);
  }

  toString(): string {
    return `GroupMessagePreSendEvent(message=${this.message})`;
  }

  eventId: string = "";
}
