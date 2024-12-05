import { MessageReceipt } from "../message/MessageReceipt";
import { Contact } from "../contact/Contact";

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
    RespType: MessageReceipt<Contact>;
  };
};
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
