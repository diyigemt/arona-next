import { Bot } from "../Bot";
import { Message, PlainText } from "../message/Message";
import { AbstractImage, Image } from "../message/Image";
import { MessageChain, MessageChainImpl } from "../message/MessageChain";

import { MessageReceipt } from "../message/MessageReceipt";
import {
  OpenapiGroupMessagePost,
  OpenapiMessageEndpoint,
  OpenapiMessagePost,
  OpenApiUrlPlaceHolder,
} from "../types/Openapi";
import {
  GroupMessagePreSendEvent,
  MessagePreSendEvent,
  MessagePreSendEventConstructor,
} from "../event/MessagePreSendEvent";
import { GroupMessagePostSendEvent, MessagePostSendEventConstructor } from "../event/MessagePostSendEvent";
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
import { GuildChannelRaw, GuildMemberRaw, GuildRaw, OpenapiMessagePostType } from "../types/Message";

function MessageToMessageChain(message: Message): MessageChain {
  if (message instanceof MessageChainImpl) {
    return message;
  }
  return new MessageChainImpl("", null, [message]);
}

export abstract class AbstractContact implements Contact {
  abstract id: string;
  abstract unionOpenidOrId: string;

  constructor(readonly bot: Bot) {}

  async callMessageOpenApi<C extends Contact, EP extends keyof OpenapiMessageEndpoint>(
    endpoint: EP,
    urlPlaceHolder: OpenApiUrlPlaceHolder<OpenapiMessageEndpoint[EP]["Url"]>,
    body: MessageChain,
    messageSequence: number,
    preSendEventConstructor: MessagePreSendEventConstructor<C>,
    postSendEventConstructor: MessagePostSendEventConstructor<C>,
  ): Promise<OpenapiMessageEndpoint[EP]["RespType"]> {
    let messagePreSendEvent: MessagePreSendEvent;
    try {
      messagePreSendEvent = await new preSendEventConstructor(this as unknown as C, body).broadcast();
    } catch (e) {
      return null;
    }
    const chain = MessageToMessageChain(messagePreSendEvent.message);
    const data = MessageChainToOpenapiPostData(chain, messageSequence);
    let result: OpenapiMessageEndpoint[EP]["RespType"] | null = null;
    let error: Error | null;
    if (this instanceof GroupImpl) {
      try {
        result = await this.bot.callOpenApi(endpoint, urlPlaceHolder, data as never);
      } catch (err) {
        error = err;
      }
    }
    new postSendEventConstructor(this as unknown as C, chain, error, result as unknown as MessageReceipt<C>)
      .broadcast()
      .then();
    return result;
  }

  sendMessage(message: string | Message | MessageChain, messageSequence: number): Promise<MessageReceipt<Contact>> {
    if (typeof message === "string") {
      return this.sendMessage(new PlainText(message), messageSequence);
    } else if (Array.isArray(message)) {
      return this.doSendMessage(message, messageSequence);
    } else {
      return this.doSendMessage(MessageToMessageChain(message), messageSequence);
    }
  }

  protected abstract doSendMessage(message: MessageChain, messageSequence: number): Promise<MessageReceipt<Contact>>;

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

  doSendMessage(message: string | Message | MessageChain, messageSequence: number): Promise<MessageReceipt<Contact>> {
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

  doSendMessage(message: string | Message | MessageChain, messageSequence: number): Promise<MessageReceipt<Contact>> {
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

  doSendMessage(message: MessageChain, messageSequence: number): Promise<MessageReceipt<Contact>> {
    return this.callMessageOpenApi<Group, "PostGroupMessage">(
      "PostGroupMessage",
      {
        group_openid: this.unionOpenidOrId,
      },
      message,
      messageSequence,
      GroupMessagePreSendEvent,
      GroupMessagePostSendEvent,
    );
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

  doSendMessage(message: string | Message | MessageChain, messageSequence: number): Promise<MessageReceipt<Contact>> {
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

  doSendMessage(message: string | Message | MessageChain, messageSequence: number): Promise<MessageReceipt<Contact>> {
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

  doSendMessage(message: string | Message | MessageChain, messageSequence: number): Promise<MessageReceipt<Contact>> {
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

  doSendMessage(message: string | Message | MessageChain, messageSequence: number): Promise<MessageReceipt<Contact>> {
    return Promise.resolve(undefined);
  }
}

function MessageChainToOpenapiPostData(messageChain: MessageChain, messageSequence: number): OpenapiMessagePost {
  const content = messageChain
    .filter((it) => it instanceof PlainText)
    .map((it) => it.toString())
    .join("\n");
  const im = messageChain.filter((it) => it instanceof AbstractImage);
  return {
    content,
    msg_type: OpenapiMessagePostType.PLAIN_TEXT,
    msg_id: messageChain.sourceId,
    event_id: messageChain.eventId,
    msg_seq: messageSequence,
  } as OpenapiGroupMessagePost;
}
