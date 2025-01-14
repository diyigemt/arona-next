import { Bot } from "../communication/Bot";
import {
  Contact,
  Friend,
  GroupMember,
  GuildChannelMember,
  User,
} from "../communication/types/Contact";
import { MessageReceipt } from "../communication/message/MessageReceipt";
import { Message, PlainText } from "../communication/message/Message";
import { MessageToMessageChain } from "../communication/message/MessageChain";

interface CommandSender {
  readonly bot?: Bot;
  readonly subject?: Contact;
  readonly user?: User;
  readonly messageId: string; // 消息的messageId 用于回复
  readonly eventId?: string; // 事件的id 也可用于回复
  sendMessage(message: string): Promise<MessageReceipt<Contact> | undefined>;

  sendMessage(message: Message): Promise<MessageReceipt<Contact> | undefined>;
}

export abstract class AbstractCommandSender implements CommandSender {
  abstract readonly bot?: Bot;
  abstract readonly subject?: Contact;
  abstract readonly user?: User;
  abstract readonly eventId?: string;
  readonly messageId: string = "";
  protected messageSequence: number = 1;

  constructor(messageId: string) {
    this.messageId = messageId;
  }

  abstract sendMessage(message: string): Promise<MessageReceipt<Contact> | undefined>;
  abstract sendMessage(message: Message): Promise<MessageReceipt<Contact> | undefined>;
}

abstract class AbstractUserCommandSender extends AbstractCommandSender {
  private readonly _bot?: Bot;

  constructor(messageId: string) {
    super(messageId);
  }

  get bot(): Bot | undefined {
    return this.user?.bot;
  }

  sendMessage(message: string | Message): Promise<MessageReceipt<Contact> | undefined> {
    const msg = typeof message === "string" ? new PlainText(message) : message;
    const rec = this.subject.sendMessage(
      MessageToMessageChain(msg, this.messageId, this.eventId),
      this.messageSequence,
    );
    if (rec) {
      this.messageSequence++;
    }
    return rec;
  }
}

export class FriendCommandSender extends AbstractUserCommandSender {
  constructor(
    public readonly user: Friend,
    messageId: string,
    public readonly eventId?: string,
  ) {
    super(messageId);
  }

  get subject() {
    return this.user;
  }
}

export class GroupCommandSender extends AbstractUserCommandSender {
  constructor(
    public readonly user: GroupMember,
    messageId: string,
    public readonly eventId?: string,
  ) {
    super(messageId);
  }

  get subject() {
    return this.user.group;
  }
}

export class GuildCommandSender extends AbstractUserCommandSender {
  constructor(
    public readonly user: GuildChannelMember,
    messageId: string,
    public readonly eventId?: string,
  ) {
    super(messageId);
  }

  get subject() {
    return this.user.channel;
  }
}

export class GuildPrivateCommandSender extends AbstractUserCommandSender {
  constructor(
    public readonly user: GuildChannelMember,
    messageId: string,
    public readonly eventId?: string,
  ) {
    super(messageId);
  }

  get subject() {
    return this.user.guild;
  }
}
