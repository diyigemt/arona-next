import { Message } from "./Message";

export interface MessageChain extends Message, Array<Message> {
  sourceId: string;
  eventId?: string;
}

export class MessageChainImpl extends Array<Message> implements MessageChain {
  constructor(
    readonly sourceId: string,
    readonly eventId?: string,
  ) {
    super();
  }

  readonly [Symbol.unscopables]: object;

  serialization(): string {
    return "";
  }

  toString(): string {
    return this.map((it) => it.toString()).join("");
  }
}
