import { Bot } from "../Bot";
import { MessageChain } from "../message/MessageChain";
import { BaseEventChannel } from "./EventChannel";

export class Event {
  async broadcast<T extends Event>() {
    await GlobalEventChannel.broadcastEvent(this);
    return this as unknown as T;
  }
}

export abstract class BaseEvent extends Event {}

export abstract class TencentEvent extends BaseEvent {
  abstract toString(): string;
}

export abstract class TencentBotEvent extends TencentEvent {
  constructor(readonly bot: Bot) {
    super();
  }
}

export abstract class TencentMessageEvent extends TencentBotEvent {
  abstract subject: string;
  abstract sender: string;

  constructor(
    readonly bot: Bot,
    readonly message: MessageChain,
  ) {
    super(bot);
  }
}

const GlobalEventChannel = new BaseEventChannel();

export default GlobalEventChannel;
