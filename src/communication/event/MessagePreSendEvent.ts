import { BotEvent } from "./Event";
import { Message } from "../message/Message";
import { Contact, Friend, Group, GuildChannel, GuildChannelMember } from "../types/Contact";

export abstract class MessagePreSendEvent extends BotEvent {
  abstract target: Contact;
  abstract message: Message;
}

export type MessagePreSendEventConstructor<C extends Contact> = {
  new (contact: C, message: Message): MessagePreSendEvent;
};

export class FriendMessagePreSendEvent extends MessagePreSendEvent {
  constructor(
    readonly target: Friend,
    readonly message: Message,
  ) {
    super(target.bot);
  }

  toString(): string {
    return `FriendMessagePreSendEvent(message=${this.message})`;
  }

  eventId: string = "";
}

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

export class GuildMessagePreSendEvent extends MessagePreSendEvent {
  constructor(
    readonly target: GuildChannel,
    readonly message: Message,
  ) {
    super(target.bot);
  }

  toString(): string {
    return `GuildMessagePreSendEvent(message=${this.message})`;
  }

  eventId: string = "";
}

export class GuildPrivateMessagePreSendEvent extends MessagePreSendEvent {
  constructor(
    readonly target: GuildChannelMember,
    readonly message: Message,
  ) {
    super(target.bot);
  }

  toString(): string {
    return `GuildPrivateChannelMessagePreSendEvent(message=${this.message})`;
  }

  eventId: string = "";
}
