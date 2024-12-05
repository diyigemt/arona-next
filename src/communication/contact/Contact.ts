import { Bot } from "../Bot";
import { Message } from "../message/Message";
import { Image } from "../message/Image";
import { MessageChain } from "../message/MessageChain";

import { MessageReceipt } from "../message/MessageReceipt";
import { OpenapiEndpoint, OpenApiUrlPlaceHolder } from "../types/Openapi";
import { MessagePreSendEvent } from "../event/MessagePreSendEvent";
import { MessagePostSendEvent } from "../event/MessagePostSendEvent";

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

  async callMessageOpenApi<
    C extends Contact,
    EP extends keyof OpenapiEndpoint,
    T extends OpenapiEndpoint[EP]["RespType"],
  >(
    endpoint: EP,
    urlPlaceHolder: OpenApiUrlPlaceHolder<OpenapiEndpoint[EP]["Url"]>,
    body: MessageChain,
    messageSequence: number,
    preSendEventConstructor: (contact: C, message: Message) => MessagePreSendEvent,
    postSendEventConstructor: (
      contact: C,
      messageChain: MessageChain,
      error?: Error,
      receipt?: MessageReceipt<C>,
    ) => MessagePostSendEvent<C>,
  ): Promise<MessageReceipt<C> | null> {
    let messagePreSendEvent: MessagePreSendEvent;
    try {
      messagePreSendEvent = await preSendEventConstructor(this as unknown as C, body).broadcast();
    } catch (e) {
      return null;
    }
    const chain = messagePreSendEvent.message;

  }

  abstract sendMessage(
    message: string | Message | MessageChain,
    messageSequence: number,
  ): Promise<MessageReceipt<Contact>>;

  uploadImage(dataLike: string | Buffer): Promise<Image> {
    return Promise.resolve(undefined);
  }
}
