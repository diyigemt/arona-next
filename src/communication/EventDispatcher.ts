import {
  ChannelMessageEventRaw,
  GroupMessageEventRaw,
  MessageEventRaw,
  WebhookBody,
  WebhookEventTypes,
} from "./types/Message";
import { Bot } from "./Bot";
import { GroupMessageEvent, GuildMessageEvent } from "./event/Event";
import { MessageChain, MessageChainImpl } from "./message/MessageChain";
import { At, PlainText } from "./message/Message";
import { OnlineImage } from "./message/Image";

type EventBodyTypeMapper = {
  MESSAGE_CREATE: ChannelMessageEventRaw;
  AT_MESSAGE_CREATE: ChannelMessageEventRaw;
  GROUP_AT_MESSAGE_CREATE: GroupMessageEventRaw;
};

const EventDispatcher = {
  dispatch(bot: Bot, type: WebhookEventTypes, raw: WebhookBody<unknown>) {
    const data = raw.d;
    switch (type) {
      case "MESSAGE_CREATE": {
        const payload = data as EventBodyTypeMapper[typeof type];
        const guild = bot.guilds.getOrCreate(payload.guild_id);
        const member = guild.members.getOrCreate(payload.author.id);
        const channel = guild.channels.getOrCreate(payload.channel_id);
        const channelMember = member.asGuildChannelMember(channel.id);
        new GuildMessageEvent(toMessageChain(payload), raw.id, channelMember).broadcast().then();
        break;
      }
      case "GROUP_AT_MESSAGE_CREATE": {
        const payload = data as EventBodyTypeMapper[typeof type];
        const group = bot.groups.getOrCreate(payload.group_openid);
        const member = group.members.getOrCreate(payload.author.id);
        new GroupMessageEvent(toMessageChain(payload), raw.id, member).broadcast().then();
        break;
      }
      default: {
        console.error("Unknown event type");
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
