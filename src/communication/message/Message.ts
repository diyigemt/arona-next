import { Contact } from "../contact/Contact";

export interface Message {
  toString(): string;

  serialization(): string;
}

class PlainText implements Message {
  constructor(public readonly text: string) {}

  toString(): string {
    return this.text;
  }

  serialization(): string {
    return this.text;
  }
}

export class MessageReceipt<C extends Contact> {
  constructor(
    readonly id: string,
    readonly timestamp: string,
    readonly target: C,
  ) {}

  async recall() {
    // TODO
  }
}
