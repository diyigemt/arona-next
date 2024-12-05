import { ChannelMessageEventRaw, WebhookBody, WebhookEventTypes } from "./types/Message";
import { Bot } from "./Bot";
import { GuildMessageEvent } from "./event/Event";
import { MessageChainImpl } from "./message/MessageChain";

type EventBodyTypeMapper = {
  MESSAGE_CREATE: ChannelMessageEventRaw;
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
        new GuildMessageEvent(new MessageChainImpl(""), raw.id, channelMember);
        break;
      }
      default: {
        console.error("Unknown event type");
      }
    }
  },
};

export default EventDispatcher;
