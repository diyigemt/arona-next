import { Message, PlainText } from "./Message";

export interface MessageChain extends Message, Array<Message> {
  messageId: string;
  eventId?: string;
}

export class MessageChainImpl extends Array<Message> implements MessageChain {
  constructor(
    public messageId: string,
    public eventId?: string,
    messages?: Message[],
  ) {
    super();
    if (messages) {
      this.push(...messages);
    }
  }

  push(...items: Message[]): number {
    if (items.length === 1 && items[0] instanceof MessageChainImpl) {
      const ch = items[0];
      this.messageId = ch.messageId;
      this.eventId = ch.eventId;
    }
    return [].push.apply(this, ...items);
  }

  readonly [Symbol.unscopables]: object;

  serialization(): string {
    return "";
  }

  toString(): string {
    return this.map((it) => it.toString()).join("");
  }

  toMessageChain(): MessageChain {
    return this;
  }
}

export function MessageChainBuilder(messageId: string, eventId?: string): MessageChainBuilder {
  return new MessageChainBuilderImpl([], messageId, eventId);
}

interface MessageChainBuilder extends Array<Message> {
  append(text: string): MessageChainBuilder;

  append(element: Message): MessageChainBuilder;

  append(element: MessageChain): MessageChainBuilder;

  build(): MessageChain;
}

class MessageChainBuilderImpl extends Array<Message> implements MessageChainBuilder {
  constructor(
    private readonly container: Message[],
    private sourceMessageId?: string,
    private eventId?: string,
  ) {
    super();
  }

  append(element: string | Message | MessageChain): MessageChainBuilder {
    if (typeof element === "string") {
      this.push(new PlainText(element));
    } else if (Array.isArray(element)) {
      this.sourceMessageId = element.messageId ?? this.sourceMessageId;
      this.eventId = element.eventId ?? this.eventId;
    } else {
      this.push(element);
    }
    return this;
  }

  build(): MessageChain {
    return new MessageChainImpl(this.sourceMessageId ?? "", this.eventId, this);
  }
}

export function MessageToMessageChain(message: Message): MessageChain;
export function MessageToMessageChain(message: Message, messageId?: string, eventId?: string): MessageChain;
export function MessageToMessageChain(message: Message, messageId?: string, eventId?: string): MessageChain {
  if (!messageId) {
    if (message instanceof MessageChainImpl) {
      return message;
    } else {
      return new MessageChainImpl(messageId, eventId, [message]);
    }
  }
  const mc = new MessageChainImpl(messageId, eventId);
  if (message instanceof MessageChainImpl) {
    mc.push(...message);
  } else {
    mc.push(message);
  }
  return mc.toMessageChain();
}
