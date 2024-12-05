import { MessageReceipt } from "../message/MessageReceipt";

import { Friend } from "./Contact";
import { MarkdownMessage } from "./Markdown";
import { KeyboardMessage } from "./Keyboard";
import { MessageEmbedRaw, MessageMediaInfo, MessageReference, OpenapiMessagePostType } from "./Message";
import { Nullable } from "./Helper";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
type ClearEmptyObject<T> = T extends {} ? (keyof T extends never ? null : T) : T;

type ParseStringTemplate<T extends string> = T extends `${infer _Start}{${infer Key}}${infer Rest}`
  ? Key extends string
    ? { [K in Key]: string } & ParseStringTemplate<Rest>
    : never
  : {};

export type OpenApiUrlPlaceHolder<T extends string> = ClearEmptyObject<ParseStringTemplate<T>>;
export type OpenapiEndpoint = {
  Interactions: {
    Url: "/interactions/{interaction_id}";
    Method: "POST";
    RespType: void;
  };
  PostFriendMessage: {
    Url: "/v2/users/{openid}/messages";
    Method: "POST";
    RespType: Nullable<MessageReceipt<Friend>>;
  };
};
export type OpenapiMessageEndpoint = Omit<OpenapiEndpoint, "Interactions">;
export const COpenapiEndpoint: { [key in keyof OpenapiEndpoint]: Omit<OpenapiEndpoint[key], "RespType"> } = {
  Interactions: {
    Url: "/interactions/{interaction_id}",
    Method: "POST",
  },
  PostFriendMessage: {
    Url: "/v2/users/{openid}/messages",
    Method: "POST",
  },
};

export interface OpenapiMessagePost {
  content: string;
  markdown?: MarkdownMessage;
  keyboard?: KeyboardMessage;
  message_reference?: MessageReference;
  ark?: string;
  msg_id?: string;
  event_id?: string;
  msg_seq: number;
}

export interface OpenapiGuildMessagePost extends OpenapiMessagePost {
  embed: MessageEmbedRaw;
  image: string;
}

export interface OpenapiGroupMessagePost extends OpenapiMessagePost {
  media: MessageMediaInfo;
  msg_type: OpenapiMessagePostType;
}
