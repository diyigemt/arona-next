import { Bot } from "../Bot";
import { Message } from "../message/Message";
import { Image } from "../message/Image";
import { MessageChain } from "../message/MessageChain";

import { MessageReceipt } from "../message/MessageReceipt";
import { OpenapiMessageEndpoint, OpenApiUrlPlaceHolder } from "../types/Openapi";
import { MessagePreSendEvent } from "../event/MessagePreSendEvent";
import { MessagePostSendEvent } from "../event/MessagePostSendEvent";
import {
  Contact,
  ContactList,
  Friend,
  Group,
  GroupMember,
  Guild,
  GuildChannel,
  GuildChannelMember,
  GuildMember,
} from "../types/Contact";
import { GuildChannelRaw, GuildMemberRaw, GuildRaw } from "../types/Message";
import { Nullable } from "../types/Helper";

export abstract class AbstractContact implements Contact {
  abstract id: string;
  abstract unionOpenidOrId: string;

  constructor(readonly bot: Bot) {}

  async callMessageOpenApi<
    C extends Contact,
    EP extends keyof OpenapiMessageEndpoint,
    T extends OpenapiMessageEndpoint[EP]["RespType"],
  >(
    endpoint: EP,
    urlPlaceHolder: OpenApiUrlPlaceHolder<OpenapiMessageEndpoint[EP]["Url"]>,
    body: MessageChain,
    messageSequence: number,
    preSendEventConstructor: (contact: C, message: Message) => MessagePreSendEvent,
    postSendEventConstructor: (
      contact: C,
      messageChain: MessageChain,
      error?: Error,
      receipt?: MessageReceipt<C>,
    ) => MessagePostSendEvent<C>,
  ): Promise<Nullable<MessageReceipt<C>>> {
    let messagePreSendEvent: MessagePreSendEvent;
    try {
      messagePreSendEvent = await preSendEventConstructor(this as unknown as C, body).broadcast();
    } catch (e) {
      return null;
    }
    const chain = messagePreSendEvent.message;
  }

  abstract sendMessage(
    message: string | Message | MessageChain,
    messageSequence: number,
  ): Promise<MessageReceipt<Contact>>;

  uploadImage(dataLike: string | Buffer): Promise<Image> {
    return Promise.resolve(undefined);
  }
}

export class FriendImpl extends AbstractContact implements Friend {
  constructor(
    readonly id: string,
    readonly bot: Bot,
    readonly unionOpenid?: string,
  ) {
    super(bot);
  }

  unionOpenidOrId: string = this.unionOpenid ?? this.id;

  sendMessage(message: string | Message | MessageChain, messageSequence: number): Promise<MessageReceipt<Contact>> {
    return Promise.resolve(undefined);
  }
}

export class GroupMemberImpl extends AbstractContact implements GroupMember {
  constructor(
    readonly id: string,
    readonly group: Group,
    readonly unionOpenid?: string,
  ) {
    super(group.bot);
  }

  unionOpenidOrId: string = this.unionOpenid ?? this.id;

  sendMessage(message: string | Message | MessageChain, messageSequence: number): Promise<MessageReceipt<Contact>> {
    return Promise.resolve(undefined);
  }
}

export class GroupImpl extends AbstractContact implements Group {
  constructor(
    readonly id: string,
    readonly bot: Bot,
    readonly unionOpenid?: string,
  ) {
    super(bot);
  }

  members: ContactList<GroupMember> = new ContactList<GroupMember>((id: string) => new GroupMemberImpl(id, this, null));
  unionOpenidOrId: string = this.unionOpenid ?? this.id;

  sendMessage(message: string | Message | MessageChain, messageSequence: number): Promise<MessageReceipt<Contact>> {
    return Promise.resolve(undefined);
  }
}

export class GuildMemberImpl extends AbstractContact implements GuildMember {
  constructor(
    readonly id: string,
    readonly guild: Guild,
    readonly internalGuildMember: GuildMemberRaw,
    readonly unionOpenid?: string,
  ) {
    super(guild.bot);
  }
  unionOpenidOrId: string = this.unionOpenid ?? this.id;

  asGuildChannelMember(channelOrId: string | GuildChannel): GuildChannelMember {
    if (typeof channelOrId === "string") {
      const channel = this.guild.channels.getOrCreate(channelOrId);
      return new GuildChannelMemberImpl(this.id, channel, null);
    }
    return new GuildChannelMemberImpl(this.id, channelOrId, null);
  }

  sendMessage(message: string | Message | MessageChain, messageSequence: number): Promise<MessageReceipt<Contact>> {
    return Promise.reject("cannot call sendMessage, please use asGuildChannelMember");
  }
}

export class GuildChannelMemberImpl extends AbstractContact implements GuildChannelMember {
  constructor(
    readonly id: string,
    readonly channel: GuildChannel,
    private readonly internalGuildMember: GuildMemberRaw,
    readonly unionOpenid?: string,
  ) {
    super(channel.bot);
  }

  guild: Guild = this.channel.guild;
  unionOpenidOrId: string = this.unionOpenid ?? this.id;

  asGuildChannelMember(channelOrId: string | GuildChannel): GuildChannelMember {
    return this;
  }

  sendMessage(message: string | Message | MessageChain, messageSequence: number): Promise<MessageReceipt<Contact>> {
    return Promise.resolve(undefined);
  }
}

export class GuildChannelImpl extends AbstractContact implements GuildChannel {
  constructor(
    readonly id: string,
    readonly guild: Guild,
    readonly internalChannel: GuildChannelRaw,
    readonly unionOpenid?: string,
  ) {
    super(guild.bot);
  }

  members: ContactList<GuildChannelMember> = new ContactList<GuildChannelMember>(
    (id: string) => new GuildChannelMemberImpl(id, this, null),
  );
  unionOpenidOrId: string = this.unionOpenid ?? this.id;

  sendMessage(message: string | Message | MessageChain, messageSequence: number): Promise<MessageReceipt<Contact>> {
    return Promise.resolve(undefined);
  }
}

export class GuildImpl extends AbstractContact implements Guild {
  constructor(
    readonly id: string,
    readonly bot: Bot,
    readonly internalGuild: GuildRaw,
    readonly unionOpenid?: string,
  ) {
    super(bot);
  }
  unionOpenidOrId: string = this.unionOpenid ?? this.id;
  members: ContactList<GuildMember> = new ContactList<GuildMember>((id: string) => new GuildMemberImpl(id, this, null));
  channels: ContactList<GuildChannel> = new ContactList<GuildChannel>(
    (id: string) => new GuildChannelImpl(id, this, null),
  );
  isPublic: true;

  sendMessage(message: string | Message | MessageChain, messageSequence: number): Promise<MessageReceipt<Contact>> {
    return Promise.resolve(undefined);
  }
}
