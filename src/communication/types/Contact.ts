import { Bot } from "../Bot";
import { Message } from "../message/Message";
import { MessageChain } from "../message/MessageChain";
import { MessageReceipt } from "../message/MessageReceipt";
import { Image } from "../message/Image";

export interface Contact {
  id: string;
  bot: Bot;
  unionOpenid?: string;
  unionOpenidOrId: string;

  sendMessage(message: string | Message | MessageChain, messageSequence: number): Promise<MessageReceipt<Contact>>;

  uploadImage(dataLike: string | Buffer): Promise<Image>;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface User extends Contact {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface Friend extends User {}

export interface Group extends Contact {
  members: ContactList<GroupMember>;
}

export interface GroupMember extends User {
  group: Group;
}

export interface Guild extends Contact {
  members: ContactList<GuildMember>;
  channels: ContactList<GuildChannel>;
  isPublic: boolean;
}

export interface GuildChannel extends Contact {
  guild: Guild;
  members: ContactList<GuildChannelMember>;
}

// 频道成员, 无法直接聊天, 需要转换为GuildChannelMember
export interface GuildMember extends Contact {
  guild: Guild;
  asGuildChannelMember(channelId: string): GuildChannelMember;
}

export interface GuildChannelMember extends GuildMember {
  channel: GuildChannel;
}

export class ContactList<C extends Contact> extends Map<string, C> {
  constructor(protected readonly generator: (id: string) => C) {
    super();
  }
  getOrCreate(id: string): C {
    const tmp = this[id];
    if (!tmp) {
      this[id] = this.generator(id);
    }
    return this[id];
  }
}
