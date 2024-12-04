import { Bot } from "../Bot";
import { Message } from "../message/Message";
import { Image } from "../message/Image";
import { MessageChain } from "../message/MessageChain";

import { MessageReceipt } from "../message/MessageReceipt";

export interface Contact {
  id: string;
  bot: Bot;
  unionOpenid?: string;
  unionOpenidOrId: string;

  sendMessage(message: string | Message | MessageChain, messageSequence: number): Promise<MessageReceipt<Contact>>;

  uploadImage(dataLike: string | Buffer): Promise<Image>;
}

export abstract class AbstractContact implements Contact {
  abstract id: string;
  abstract unionOpenidOrId: string;

  constructor(readonly bot: Bot) {}

  async callMessageOpenApi() {}

  abstract sendMessage(
    message: string | Message | MessageChain,
    messageSequence: number,
  ): Promise<MessageReceipt<Contact>>;

  uploadImage(dataLike: string | Buffer): Promise<Image> {
    return Promise.resolve(undefined);
  }
}
