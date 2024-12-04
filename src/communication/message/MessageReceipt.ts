import { Contact } from "../contact/Contact";

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
