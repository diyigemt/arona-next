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
