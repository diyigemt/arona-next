import { Bot } from "../Bot";
import { Message, PlainText } from "../message/Message";
import { AbstractImage, Image, OfflineImage, OnlineImage } from "../message/Image";
import { MessageChain, MessageToMessageChain } from "../message/MessageChain";

import { MessageReceipt } from "../message/MessageReceipt";
import {
  OpenapiGroupMessagePost,
  OpenapiMessageEndpoint,
  OpenapiMessagePost,
  OpenApiUrlPlaceHolder,
} from "../types/Openapi";
import {
  FriendMessagePreSendEvent,
  GroupMessagePreSendEvent,
  GuildMessagePreSendEvent,
  GuildPrivateMessagePreSendEvent,
  MessagePreSendEvent,
  MessagePreSendEventConstructor,
} from "../event/MessagePreSendEvent";
import {
  FriendMessagePostSendEvent,
  GroupMessagePostSendEvent,
  GuildMessagePostSendEvent,
  GuildPrivateMessagePostSendEvent,
  MessagePostSendEventConstructor,
} from "../event/MessagePostSendEvent";
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
import { GuildChannelRaw, GuildMemberRaw, GuildRaw, OpenapiMessagePostType, RichMessageType } from "../types/Message";

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
    let error: Error | undefined;
    if (this instanceof GroupImpl) {
      try {
        result = await this.bot.callOpenApi(endpoint, urlPlaceHolder, data as never);
      } catch (err) {
        error = err as Error;
      }
    }
    new postSendEventConstructor(this as unknown as C, chain, error, result as unknown as MessageReceipt<C>)
      .broadcast()
      .then();
    return result;
  }

  async sendMessage(
    message: string | Message | MessageChain,
    messageSequence: number,
  ): Promise<MessageReceipt<Contact> | undefined> {
    if (typeof message === "string") {
      return this.sendMessage(new PlainText(message), messageSequence);
    } else if (Array.isArray(message)) {
      return this.doSendMessage(message, messageSequence);
    } else {
      return this.doSendMessage(MessageToMessageChain(message), messageSequence);
    }
  }

  protected abstract doSendMessage(
    message: MessageChain,
    messageSequence: number,
  ): Promise<MessageReceipt<Contact> | undefined>;

  async uploadImage(dataLike: string | Buffer): Promise<Image | undefined> {
    if (typeof dataLike !== "string") {
      return await this.uploadBufferImage(dataLike);
    }
    if (this instanceof FriendImpl) {
      return await this.bot
        .callOpenApi(
          "PostFriendRichMessage",
          {
            openid: this.id,
          },
          {
            url: dataLike,
            file_type: RichMessageType.IMAGE,
            srv_send_msg: false,
          },
        )
        .then((resp) => {
          return new OnlineImage(resp.file_info, resp.file_uuid, resp.ttl, dataLike);
        });
    } else if (this instanceof GroupImpl) {
      return await this.bot
        .callOpenApi(
          "PostGroupRichMessage",
          {
            group_openid: this.id,
          },
          {
            url: dataLike,
            file_type: RichMessageType.IMAGE,
            srv_send_msg: false,
          },
        )
        .then((resp) => {
          return new OnlineImage(resp.file_info, resp.file_uuid, resp.ttl, dataLike);
        });
    } else {
      new OnlineImage("", "", 0, dataLike);
    }
    return Promise.resolve(undefined);
  }

  private async uploadBufferImage(data: Buffer): Promise<Image> {
    if (!data) {
      return Promise.reject(new Error("unable to upload null data"));
    }
    const base64Encoded = data.toString("base64");
    if (this instanceof FriendImpl) {
      return await this.bot
        .callOpenApi(
          "PostFriendRichMessage",
          {
            openid: this.id,
          },
          {
            file_data: base64Encoded,
            file_type: RichMessageType.IMAGE,
            srv_send_msg: false,
          },
        )
        .then((resp) => {
          return new OnlineImage(resp.file_info, resp.file_uuid, resp.ttl, "");
        });
    } else if (this instanceof GroupImpl) {
      return await this.bot
        .callOpenApi(
          "PostGroupRichMessage",
          {
            group_openid: this.id,
          },
          {
            file_data: base64Encoded,
            file_type: RichMessageType.IMAGE,
            srv_send_msg: false,
          },
        )
        .then((resp) => {
          return new OnlineImage(resp.file_info, resp.file_uuid, resp.ttl, "");
        });
    } else {
      return Promise.resolve(new OfflineImage(data));
    }
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

  async doSendMessage(message: MessageChain, messageSequence: number): Promise<MessageReceipt<Friend> | undefined> {
    return this.callMessageOpenApi(
      "PostFriendMessage",
      {
        openid: this.unionOpenidOrId,
      },
      message,
      messageSequence,
      FriendMessagePreSendEvent,
      FriendMessagePostSendEvent,
    ).then((resp) => {
      if (resp && resp.id && resp.timestamp) {
        return new MessageReceipt(resp.id, resp.timestamp, this);
      }
      return undefined;
    });
  }
}

export class GroupMemberImpl extends AbstractContact implements GroupMember {
  constructor(
    readonly id: string,
    readonly group: GroupImpl,
    readonly unionOpenid?: string,
  ) {
    super(group.bot);
  }

  unionOpenidOrId: string = this.unionOpenid ?? this.id;

  async doSendMessage(
    message: string | Message | MessageChain,
    messageSequence: number,
  ): Promise<MessageReceipt<Contact>> {
    return Promise.reject(new Error("暂未实现"));
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

  members: ContactList<GroupMember> = new ContactList<GroupMember>(
    (id: string) => new GroupMemberImpl(id, this, undefined),
  );
  unionOpenidOrId: string = this.unionOpenid ?? this.id;

  async doSendMessage(message: MessageChain, messageSequence: number): Promise<MessageReceipt<Group> | undefined> {
    return this.callMessageOpenApi(
      "PostGroupMessage",
      {
        group_openid: this.unionOpenidOrId,
      },
      message,
      messageSequence,
      GroupMessagePreSendEvent,
      GroupMessagePostSendEvent,
    ).then((resp) => {
      if (resp && resp.id && resp.timestamp) {
        return new MessageReceipt(resp.id, resp.timestamp, this);
      }
      return undefined;
    });
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
      // @ts-expect-error
      return new GuildChannelMemberImpl(this.id, channel, null);
    }
    // @ts-expect-error
    return new GuildChannelMemberImpl(this.id, channelOrId, null);
  }

  async doSendMessage(
    message: string | Message | MessageChain,
    messageSequence: number,
  ): Promise<MessageReceipt<Contact> | undefined> {
    return Promise.reject(new Error("只能通过`asGuildChannelMember`发送"));
  }
}

export class GuildChannelMemberImpl extends AbstractContact implements GuildChannelMember {
  constructor(
    readonly id: string,
    readonly channel: GuildChannel,
    protected readonly internalGuildMember: GuildMemberRaw,
    readonly unionOpenid?: string,
  ) {
    super(channel.bot);
  }

  guild: Guild = this.channel.guild;
  unionOpenidOrId: string = this.unionOpenid ?? this.id;

  asGuildChannelMember(channelOrId: string | GuildChannel): GuildChannelMember {
    return this;
  }

  async doSendMessage(
    message: string | Message | MessageChain,
    messageSequence: number,
  ): Promise<MessageReceipt<Contact> | undefined> {
    return Promise.resolve(undefined);
  }
}

export class GuildPrivateChannelMemberImpl extends GuildChannelMemberImpl {
  constructor(
    readonly id: string,
    readonly channel: GuildChannel,
    internalGuildMember: GuildMemberRaw,
    readonly unionOpenid?: string,
  ) {
    super(id, channel, internalGuildMember, unionOpenid);
  }

  async doSendMessage(
    message: MessageChain,
    messageSequence: number,
  ): Promise<MessageReceipt<GuildChannelMember> | undefined> {
    return this.callMessageOpenApi(
      "PostGuildPrivateMessage",
      {
        guild_id: this.guild.unionOpenidOrId,
      },
      message,
      messageSequence,
      GuildPrivateMessagePreSendEvent,
      GuildPrivateMessagePostSendEvent,
    ).then((resp) => {
      if (resp && resp.id && resp.timestamp) {
        return new MessageReceipt(resp.id, resp.timestamp, this);
      }
      return undefined;
    });
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
    // @ts-expect-error
    (id: string) => new GuildChannelMemberImpl(id, this, null),
  );
  unionOpenidOrId: string = this.unionOpenid ?? this.id;

  async doSendMessage(
    message: MessageChain,
    messageSequence: number,
  ): Promise<MessageReceipt<GuildChannel> | undefined> {
    return this.callMessageOpenApi(
      "PostGuildMessage",
      {
        channel_id: this.unionOpenidOrId,
      },
      message,
      messageSequence,
      GuildMessagePreSendEvent,
      GuildMessagePostSendEvent,
    ).then((resp) => {
      if (resp && resp.id && resp.timestamp) {
        return new MessageReceipt(resp.id, resp.timestamp, this);
      }
      return undefined;
    });
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
  // @ts-expect-error
  members: ContactList<GuildMember> = new ContactList<GuildMember>((id: string) => new GuildMemberImpl(id, this, null));
  channels: ContactList<GuildChannel> = new ContactList<GuildChannel>(
    // @ts-expect-error
    (id: string) => new GuildChannelImpl(id, this, null),
  );
  isPublic: boolean = true;

  async doSendMessage(
    message: string | Message | MessageChain,
    messageSequence: number,
  ): Promise<MessageReceipt<Contact> | undefined> {
    return Promise.resolve(undefined);
  }
}

function MessageChainToOpenapiPostData(messageChain: MessageChain, messageSequence: number): OpenapiMessagePost {
  const content = messageChain
    .filter((it) => it instanceof PlainText)
    .map((it) => it.toString())
    .join("\n");
  const toSend: OpenapiGroupMessagePost = {
    content,
    msg_type: OpenapiMessagePostType.PLAIN_TEXT,
    msg_id: messageChain.messageId,
    event_id: messageChain.eventId,
    msg_seq: messageSequence,
  };
  const im = messageChain.filter((it) => it instanceof AbstractImage);
  if (im.length > 0) {
    toSend.msg_type = OpenapiMessagePostType.FILE;
    const image = im[im.length - 1];
    toSend.media = {
      file_info: image.resourceId,
    };
  }
  return toSend;
}
