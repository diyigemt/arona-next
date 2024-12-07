import { BotEvent } from "../event/Event";
import { CallbackButtonChatType, CallbackButtonType } from "../types/Message";
import { Contact, User } from "../types/Contact";
import { Bot } from "../Bot";

export enum CallbackButtonRespType {
  Success = 0,
  Failure = 1,
  Busy = 2,
  Duplicate = 3,
  PermissionDeny = 4,
  AdminOnly = 5,
}

export class CallbackButtonEvent extends BotEvent {
  constructor(
    readonly id: string,
    readonly rawId: string,
    readonly appId: string,
    readonly buttonId: string,
    readonly buttonData: string,
    readonly type: CallbackButtonType,
    readonly chatType: CallbackButtonChatType,
    readonly contact: Contact,
    readonly user: User,
    readonly bot: Bot,
  ) {
    super(bot);
  }

  eventId: string = this.rawId;

  async accept() {
    return await this.reject(CallbackButtonRespType.Success);
  }

  async reject(reason = CallbackButtonRespType.Failure) {
    await this.bot.callOpenApi(
      "Interactions",
      {
        interaction_id: this.id,
      },
      {
        code: reason,
      },
    );
  }

  toString(): string {
    return `CallbackButtonEvent(bot=${this.bot.id},user=${this.user.id},btnId=${this.buttonId},btnData=${this.buttonData})`;
  }
}
