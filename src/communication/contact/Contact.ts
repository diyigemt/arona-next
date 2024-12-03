import { Bot } from "../Bot";
import { Message, MessageReceipt } from "../message/Message";
import { Image } from "../message/Image";
import { MessageChain } from "../message/MessageChain";

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

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
type ClearEmptyObject<T> = T extends {} ? (keyof T extends never ? null : T) : T;

type ParseStringTemplate<T extends string> = T extends `${infer _Start}\${${infer Key}}${infer Rest}`
  ? Key extends string
    ? { [K in Key]: string } & ParseStringTemplate<Rest>
    : never
  : {};

type OpenApiUrlPlaceHolder<T extends string> = ClearEmptyObject<ParseStringTemplate<T>>;
