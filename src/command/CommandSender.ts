import { Bot } from "../communication/Bot";
import { Contact, Friend, GroupMember, GuildChannelMember, User } from "../communication/types/Contact";
import { MessageReceipt } from "../communication/message/MessageReceipt";
import { Message, PlainText } from "../communication/message/Message";
import { MessageToMessageChain } from "../communication/message/MessageChain";
import {
  MessageEvent,
  FriendMessageEvent,
  GroupMessageEvent,
  GuildMessageEvent,
  GuildPrivateMessageEvent,
} from "../communication/event/MessageEvent";
import event from "../communication/event/Event";
import GlobalEventChannel from "../communication/event/Event";
import { withTimeout } from "../utils";

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

  abstract nextMessage(
    timeoutMillis: number,
    filter: (ctx: AbstractUserCommandSender, ev: MessageEvent) => Promise<boolean>,
  ): Promise<MessageEvent>;
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

  nextMessage(
    timeoutMillis: number = -1,
    filter: (ctx: FriendCommandSender, ev: FriendMessageEvent) => Promise<boolean> = () => Promise.resolve(true),
  ): Promise<FriendMessageEvent> {
    const mapper = createMapper(this, filter);
    const promise = new Promise<FriendMessageEvent>((resolve) => {
      GlobalEventChannel.syncFromEvent<FriendMessageEvent, FriendMessageEvent>(FriendMessageEvent, mapper).then(
        resolve,
      );
    });
    if (timeoutMillis === -1) {
      return promise;
    }
    return withTimeout(timeoutMillis, promise);
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

  nextMessage(
    timeoutMillis: number = -1,
    filter: (ctx: GroupCommandSender, ev: GroupMessageEvent) => Promise<boolean> = () => Promise.resolve(true),
  ): Promise<GroupMessageEvent> {
    const mapper = createMapper(this, filter);
    const promise = new Promise<GroupMessageEvent>((resolve) => {
      GlobalEventChannel.syncFromEvent<GroupMessageEvent, GroupMessageEvent>(GroupMessageEvent, mapper).then(resolve);
    });
    if (timeoutMillis === -1) {
      return promise;
    }
    return withTimeout(timeoutMillis, promise);
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

  nextMessage(
    timeoutMillis: number = -1,
    filter: (ctx: GuildCommandSender, ev: GuildMessageEvent) => Promise<boolean> = () => Promise.resolve(true),
  ): Promise<GuildMessageEvent> {
    const mapper = createMapper(this, filter);
    const promise = new Promise<GuildMessageEvent>((resolve) => {
      GlobalEventChannel.syncFromEvent<GuildMessageEvent, GuildMessageEvent>(GuildMessageEvent, mapper).then(resolve);
    });
    if (timeoutMillis === -1) {
      return promise;
    }
    return withTimeout(timeoutMillis, promise);
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

  nextMessage(
    timeoutMillis: number = -1,
    filter: (ctx: GuildPrivateCommandSender, ev: GuildPrivateMessageEvent) => Promise<boolean> = () =>
      Promise.resolve(true),
  ): Promise<GuildPrivateMessageEvent> {
    const mapper = createMapper(this, filter);
    const promise = new Promise<GuildPrivateMessageEvent>((resolve) => {
      GlobalEventChannel.syncFromEvent<GuildPrivateMessageEvent, GuildPrivateMessageEvent>(
        GuildPrivateMessageEvent,
        mapper,
      ).then(resolve);
    });
    if (timeoutMillis === -1) {
      return promise;
    }
    return withTimeout(timeoutMillis, promise);
  }
}

function createMapper<Ctx extends AbstractUserCommandSender, Event extends MessageEvent>(
  ctx: Ctx,
  filter: (ctx: Ctx, ev: Event) => Promise<boolean>,
): (event: Event) => Promise<Event | undefined> {
  return (_event) => {
    return new Promise((resolve) => {
      if (!isContextIdenticalWith(ctx, _event)) {
        resolve(undefined);
      }
      filter(ctx, _event).then((res) => {
        if (res) {
          resolve(_event);
        } else {
          resolve(undefined);
        }
      });
    });
  };
}

function isContextIdenticalWith(ctx: AbstractUserCommandSender, ev: MessageEvent) {
  return ctx.user.id === ev.sender.id && ctx.subject.id === ev.subject.id;
}
