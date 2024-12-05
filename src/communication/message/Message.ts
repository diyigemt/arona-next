export interface Message {
  toString(): string;

  serialization(): string;
}

export class PlainText implements Message {
  constructor(public readonly text: string) {}

  toString(): string {
    return this.text;
  }

  serialization(): string {
    return this.text;
  }
}

export class At implements Message {
  constructor(public readonly target: string) {}

  toString(): string {
    return `@${this.target}`;
  }
  serialization(): string {
    return `[arona:at:${this.target}]`;
  }
}
