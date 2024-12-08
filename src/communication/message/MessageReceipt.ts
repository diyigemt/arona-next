import { Contact } from "../types/Contact";
import { FriendImpl, GroupImpl, GuildChannelMemberImpl, GuildPrivateChannelMemberImpl } from "../contact/Contact";

export class MessageReceipt<C extends Contact> {
  constructor(
    readonly id: string,
    readonly timestamp: string,
    readonly target: C,
  ) {}

  async recall() {
    const target = this.target;
    if (target instanceof FriendImpl) {
      await target.bot.callOpenApi(
        "DeleteFriendMessage",
        {
          openid: target.id,
          message_id: this.id,
        },
        null,
      );
    } else if (target instanceof GroupImpl) {
      await target.bot.callOpenApi(
        "DeleteGroupMessage",
        {
          group_openid: target.id,
          message_id: this.id,
        },
        null,
      );
    } else if (target instanceof GuildChannelMemberImpl) {
      await target.bot.callOpenApi(
        "DeleteGuildMessage",
        {
          channel_id: target.channel.id,
          message_id: this.id,
        },
        null,
      );
    } else if (target instanceof GuildPrivateChannelMemberImpl) {
      await target.bot.callOpenApi(
        "DeleteGuildPrivateMessage",
        {
          guild_id: target.guild.id,
          message_id: this.id,
        },
        null,
      );
    }
  }
}
