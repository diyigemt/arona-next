import { Message, PlainText } from "./Message";

export interface MessageChain extends Message, Array<Message> {
  sourceId: string;
  eventId?: string;
}

export class MessageChainImpl extends Array<Message> implements MessageChain {
  constructor(
    readonly sourceId: string,
    readonly eventId?: string,
    messages?: Message[],
  ) {
    super();
    if (messages) {
      this.push(...messages);
    }
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
      this.sourceMessageId = element.sourceId ?? this.sourceMessageId;
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
