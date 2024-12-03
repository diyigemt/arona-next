import { Contact } from "./contact/Contact";
import { Message, MessageReceipt } from "./message/Message";
import { Image } from "./message/Image";
import { MessageChain } from "./message/MessageChain";

interface BotConfig {
  id: string;
  appId: string;
  token: string;
  secret: string;
}

export class Bot implements Contact {
  constructor(private readonly config: BotConfig) {}

  bot: Bot = this;
  id: string = this.config.id;
  unionOpenidOrId: string = this.config.id;

  sendMessage(message: string | Message | MessageChain, messageSequence: number): Promise<MessageReceipt<Contact>> {
    return Promise.resolve(undefined);
  }

  uploadImage(dataLike: string | Buffer): Promise<Image> {
    return Promise.resolve(undefined);
  }
}
