export type TencentEndpoint = {
  Interactions: "/interactions/{interaction_id}";
  PostFriendMessage: "/v2/users/{openid}/messages";
};

export const CTencentEndpoint: TencentEndpoint = {
  Interactions: "/interactions/{interaction_id}",
  PostFriendMessage: "/v2/users/{openid}/messages",
};

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
type ClearEmptyObject<T> = T extends {} ? (keyof T extends never ? null : T) : T;

type ParseStringTemplate<T extends string> = T extends `${infer _Start}{${infer Key}}${infer Rest}`
  ? Key extends string
    ? { [K in Key]: string } & ParseStringTemplate<Rest>
    : never
  : {};

export type OpenApiUrlPlaceHolder<T extends string> = ClearEmptyObject<ParseStringTemplate<T>>;
