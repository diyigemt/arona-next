import { Contact, Friend, Group, GroupMember, Guild, GuildChannelMember } from "../types/Contact";
import { Bot } from "../Bot";
import { MessageChain } from "../message/MessageChain";
import { BotEvent, FriendEvent, GroupEvent, GuildEvent } from "./Event";

export abstract class MessageEvent extends BotEvent {
  abstract subject: Contact;
  abstract sender: Contact;

  constructor(
    readonly bot: Bot,
    readonly message: MessageChain,
  ) {
    super(bot);
  }
}

export class GuildMessageEvent extends MessageEvent implements GuildEvent {
  constructor(
    readonly message: MessageChain,
    readonly eventId: string,
    readonly sender: GuildChannelMember,
  ) {
    super(sender.bot, message);
  }

  subject: Contact = this.sender.channel;
  guild: Guild = this.sender.guild;

  toString(): string {
    return `[Guild(${this.subject.id})] ${this.sender.id} -> ${this.message}`;
  }
}

export class GuildPrivateMessageEvent extends MessageEvent implements GuildEvent {
  constructor(
    readonly message: MessageChain,
    readonly eventId: string,
    readonly sender: GuildChannelMember,
  ) {
    super(sender.bot, message);
  }

  subject: Contact = this.sender;
  guild: Guild = this.sender.guild;

  toString(): string {
    return `[PrivateChannel(${this.subject.id})] ${this.sender.id} -> ${this.message}`;
  }
}

export class FriendMessageEvent extends MessageEvent implements FriendEvent {
  constructor(
    readonly message: MessageChain,
    readonly eventId: string,
    readonly sender: Friend,
  ) {
    super(sender.bot, message);
  }

  subject: Contact = this.sender;
  friend: Friend = this.sender;

  toString(): string {
    return `[Friend(${this.subject.id})] ${this.sender.id} -> ${this.message}`;
  }
}

export class GroupMessageEvent extends MessageEvent implements GroupEvent {
  constructor(
    readonly message: MessageChain,
    readonly eventId: string,
    readonly sender: GroupMember,
  ) {
    super(sender.bot, message);
  }

  subject: Contact = this.sender.group;
  group: Group = this.sender.group;

  toString(): string {
    return `[Group(${this.subject.id})] ${this.sender.id} -> ${this.message}`;
  }
}
