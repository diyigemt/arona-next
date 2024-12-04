import { Contact } from "./contact/Contact";
import { MessageReceipt } from "./message/MessageReceipt";

export type TencentEndpoint = {
  Interactions: {
    Url: "/interactions/{interaction_id}";
    Method: "POST";
    RespType: void;
  };
  PostFriendMessage: {
    Url: "/v2/users/{openid}/messages";
    Method: "POST";
    RespType: MessageReceipt<Contact>;
  };
};

export const CTencentEndpoint: { [key in keyof TencentEndpoint]: Omit<TencentEndpoint[key], "RespType"> } = {
  Interactions: {
    Url: "/interactions/{interaction_id}",
    Method: "POST",
  },
  PostFriendMessage: {
    Url: "/v2/users/{openid}/messages",
    Method: "POST",
  },
};

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
type ClearEmptyObject<T> = T extends {} ? (keyof T extends never ? null : T) : T;

type ParseStringTemplate<T extends string> = T extends `${infer _Start}{${infer Key}}${infer Rest}`
  ? Key extends string
    ? { [K in Key]: string } & ParseStringTemplate<Rest>
    : never
  : {};

export type OpenApiUrlPlaceHolder<T extends string> = ClearEmptyObject<ParseStringTemplate<T>>;
