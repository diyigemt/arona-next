import {
  CallbackButton,
  CallbackButtonChatType,
  ChannelMessageEventRaw,
  FriendEventRaw,
  FriendMessageEventRaw,
  GroupEventRaw,
  GroupMessageEventRaw,
  GuildRaw,
  MessageEventRaw,
  WebhookBody,
  WebhookEventTypes,
} from "./types/Message";
import { Bot } from "./Bot";
import {
  FriendAddEvent,
  FriendDeleteEvent,
  GroupAddEvent,
  GroupDeleteEvent,
  GuildAddEvent,


} from "./event/Event";
import { MessageChain, MessageChainImpl } from "./message/MessageChain";
import { At, PlainText } from "./message/Message";
import { OnlineImage } from "./message/Image";
import { Contact, User } from "./types/Contact";
import { CallbackButtonEvent } from "./message/CallbackButton";
import { GuildPrivateChannelMemberImpl } from "./contact/Contact";
import {
  FriendMessageEvent,
  GroupMessageEvent,
  GuildMessageEvent,
  GuildPrivateMessageEvent
} from "./event/MessageEvent";

type EventBodyTypeMapper = {
  MESSAGE_CREATE: ChannelMessageEventRaw;
  AT_MESSAGE_CREATE: ChannelMessageEventRaw;
  DIRECT_MESSAGE_CREATE: ChannelMessageEventRaw;
  GROUP_AT_MESSAGE_CREATE: GroupMessageEventRaw;
  C2C_MESSAGE_CREATE: FriendMessageEventRaw;
  FRIEND_ADD: FriendEventRaw;
  FRIEND_DEL: FriendEventRaw;
  C2C_MSG_REJECT: void;
  C2C_MSG_RECEIVE: void;
  GROUP_ADD_ROBOT: GroupEventRaw;
  GROUP_DEL_ROBOT: GroupEventRaw;
  GROUP_MSG_RECEIVE: void;
  GROUP_MSG_REJECT: void;
  GUILD_CREATE: GuildRaw;
  GUILD_DELETE: GuildRaw;
  INTERACTION_CREATE: CallbackButton;
};

const EventDispatcher = {
  dispatch(bot: Bot, type: WebhookEventTypes, raw: WebhookBody<unknown>) {
    const data = raw.d;
    switch (type) {
      case "MESSAGE_CREATE":
      case "AT_MESSAGE_CREATE": {
        const payload = data as EventBodyTypeMapper[typeof type];
        const guild = bot.guilds.getOrCreate(payload.guild_id);
        const member = guild.members.getOrCreate(payload.author.id);
        const channel = guild.channels.getOrCreate(payload.channel_id);
        const channelMember = member.asGuildChannelMember(channel.id);
        new GuildMessageEvent(toMessageChain(payload), raw.id, channelMember).broadcast().then();
        break;
      }
      case "DIRECT_MESSAGE_CREATE": {
        const payload = data as EventBodyTypeMapper[typeof type];
        const guild = bot.guilds.getOrCreate(payload.guild_id);
        const channel = guild.channels.getOrCreate(payload.channel_id);
        const member = new GuildPrivateChannelMemberImpl(payload.author.id, channel, payload.member);
        new GuildPrivateMessageEvent(toMessageChain(payload), raw.id, member).broadcast().then();
        break;
      }
      case "GROUP_AT_MESSAGE_CREATE": {
        const payload = data as EventBodyTypeMapper[typeof type];
        const group = bot.groups.getOrCreate(payload.group_openid);
        const member = group.members.getOrCreate(payload.author.id);
        new GroupMessageEvent(toMessageChain(payload), raw.id, member).broadcast().then();
        break;
      }
      case "C2C_MESSAGE_CREATE": {
        const payload = data as EventBodyTypeMapper[typeof type];
        const friend = bot.friends.getOrCreate(payload.author.id);
        new FriendMessageEvent(toMessageChain(payload), raw.id, friend).broadcast().then();
        break;
      }
      case "FRIEND_ADD": {
        const payload = data as EventBodyTypeMapper[typeof type];
        const friend = bot.friends.getOrCreate(payload.openid);
        new FriendAddEvent(friend, raw.id).broadcast().then();
        break;
      }
      case "FRIEND_DEL": {
        const payload = data as EventBodyTypeMapper[typeof type];
        const friend = bot.friends.getOrCreate(payload.openid);
        new FriendDeleteEvent(friend, raw.id).broadcast().then();
        break;
      }
      case "GROUP_ADD_ROBOT": {
        const payload = data as EventBodyTypeMapper[typeof type];
        const group = bot.groups.getOrCreate(payload.id);
        const member = group.members.getOrCreate(payload.op_member_openid);
        new GroupAddEvent(member, raw.id).broadcast().then();
        break;
      }
      case "GROUP_DEL_ROBOT": {
        const payload = data as EventBodyTypeMapper[typeof type];
        const group = bot.groups.getOrCreate(payload.id);
        const member = group.members.getOrCreate(payload.op_member_openid);
        new GroupDeleteEvent(member, raw.id).broadcast().then();
        break;
      }
      case "GUILD_CREATE": {
        const payload = data as EventBodyTypeMapper[typeof type];
        const guild = bot.guilds.getOrCreate(payload.id);
        const member = guild.members.getOrCreate(payload.op_user_id);
        new GuildAddEvent(member, raw.id).broadcast().then();
        break;
      }
      case "INTERACTION_CREATE": {
        const payload = data as EventBodyTypeMapper[typeof type];
        let contact: [Contact, User] | null;
        switch (payload.chat_type) {
          case CallbackButtonChatType.Guild: {
            const guild = bot.guilds.getOrCreate(payload.guild_id ?? "");
            const channel = guild.channels.getOrCreate(payload.channel_id ?? "");
            const channelMember = channel.members.getOrCreate(payload.data.resolved.user_id ?? "");
            contact = [channel, channelMember];
            break;
          }
          case CallbackButtonChatType.Friend: {
            const friend = bot.friends.getOrCreate(payload.user_openid ?? "");
            contact = [friend, friend];
            break;
          }
          case CallbackButtonChatType.Group: {
            const group = bot.groups.getOrCreate(payload.group_openid ?? "");
            const member = group.members.getOrCreate(payload.group_member_openid ?? "");
            contact = [group, member];
            break;
          }
          default: {
            contact = null;
          }
        }
        if (contact != null) {
          new CallbackButtonEvent(
            payload.id,
            raw.id,
            payload.application_id,
            payload.data.resolved.button_id,
            payload.data.resolved.button_data ?? "",
            payload.type,
            payload.chat_type,
            contact[0],
            contact[1],
            bot,
          )
            .broadcast()
            .then();
        }
        break;
      }
      default: {
        bot.logger.error(`Unknown event type: ${type}`);
      }
    }
  },
};

function parsePlainTextAndImage(raw: MessageEventRaw, chain: MessageChain) {
  const trim = raw.content.trim();
  // 文本解析
  if (trim !== "") {
    const split = trim.split(" ");
    if (split.length > 1) {
      const maybeAt = split[0];
      const match = /^<@!(\w+)>$/.exec(maybeAt);
      if (match) {
        chain.push(new At(match[1]));
        chain.push(new PlainText(split.slice(1).join(" ")));
      } else {
        chain.push(new PlainText(trim));
      }
    } else {
      chain.push(new PlainText(trim));
    }
  }
  // 图片解析
  if (raw.attachments?.length > 0) {
    chain.push(
      ...raw.attachments.map((it) => {
        return new OnlineImage("", "", 0, it.url);
      }),
    );
  }
}

function toChannelRawMessageChain(raw: ChannelMessageEventRaw): MessageChain {
  const messageChain = new MessageChainImpl(raw.id);
  parsePlainTextAndImage(raw, messageChain);
  return messageChain;
}

function toMessageChain(raw: MessageEventRaw): MessageChain {
  if (raw["channel_id"]) {
    // 频道消息
    return toChannelRawMessageChain(raw as ChannelMessageEventRaw);
  }
  const messageChain = new MessageChainImpl(raw.id);
  parsePlainTextAndImage(raw, messageChain);
  return messageChain;
}

export default EventDispatcher;
