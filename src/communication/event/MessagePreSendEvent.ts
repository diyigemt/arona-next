import { BotEvent } from "./Event";
import { Message } from "../message/Message";
import { Contact } from "../types/Contact";

export abstract class MessagePreSendEvent extends BotEvent {
  abstract target: Contact;
  abstract message: Message;
}

export class GroupMessagePreSendEvent extends MessagePreSendEvent {
  constructor(
    readonly target: Contact,
    readonly message: Message,
  ) {
    super(target.bot);
  }
  toString(): string {
    return `GroupMessagePreSendEvent(message=${this.message})`;
  }
}
