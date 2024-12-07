import { MessageReceipt } from "../message/MessageReceipt";

import { Friend, Group, GuildChannel } from "./Contact";
import { MarkdownMessage } from "./Markdown";
import { KeyboardMessage } from "./Keyboard";
import {
  MessageEmbedRaw,
  MessageMediaInfo,
  MessageReference,
  OpenapiMessagePostType,
  RichMessageType,
} from "./Message";
import { Nullable } from "./Helper";
import { CallbackButtonRespType } from "../message/CallbackButton";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
type ClearEmptyObject<T> = T extends {} ? (keyof T extends never ? null : T) : T;

type ParseStringTemplate<T extends string> = T extends `${infer _Start}{${infer Key}}${infer Rest}`
  ? Key extends string
    ? { [K in Key]: string } & ParseStringTemplate<Rest>
    : never
  : {};

export type OpenApiUrlPlaceHolder<T extends string> = ClearEmptyObject<ParseStringTemplate<T>>;
export type OpenapiNeedData<EP extends keyof OpenapiEndpoint> = OpenapiEndpoint[EP]["Method"] extends "GET"
  ? null
  : OpenapiEndpoint[EP]["ReqType"] extends {}
    ? OpenapiEndpoint[EP]["ReqType"]
    : null;
export type OpenapiEndpoint = {
  Interactions: {
    Url: "/interactions/{interaction_id}";
    Method: "PUT";
    ReqType: InteractionNotifyPut;
    RespType: void;
  };
  PostFriendMessage: {
    Url: "/v2/users/{openid}/messages";
    Method: "POST";
    ReqType: OpenapiFriendMessagePost;
    RespType: Nullable<MessageReceipt<Friend>>;
  };
  PostFriendRichMessage: {
    Url: "/v2/users/{openid}/files";
    Method: "POST";
    ReqType: RichMessagePost;
    RespType: MessageMediaInfo;
  };
  PostGroupMessage: {
    Url: "/v2/groups/{group_openid}/messages";
    Method: "POST";
    ReqType: OpenapiGroupMessagePost;
    RespType: Nullable<MessageReceipt<Group>>;
  };
  PostGroupRichMessage: {
    Url: "/v2/groups/{group_openid}/files";
    Method: "POST";
    ReqType: RichMessagePost;
    RespType: MessageMediaInfo;
  };
  PostGuildMessage: {
    Url: "/channels/{channel_id}/messages";
    Method: "POST";
    ReqType: OpenapiGuildMessagePost;
    RespType: Nullable<MessageReceipt<GuildChannel>>;
  };
  PostGuildPrivateMessage: {
    Url: "/dms/{guild_id}/messages";
    Method: "POST";
    ReqType: OpenapiGuildMessagePost;
    RespType: Nullable<MessageReceipt<GuildChannel>>;
  };
  DeleteFriendMessage: {
    Url: "/v2/users/{openid}/messages/{message_id}";
    Method: "DELETE";
    ReqType: void;
    RespType: void;
  };
  DeleteGroupMessage: {
    Url: "/v2/groups/{group_openid}/messages/{message_id}";
    Method: "DELETE";
    ReqType: void;
    RespType: void;
  };
  DeleteGuildMessage: {
    Url: "/channels/{channel_id}/messages/{message_id}";
    Method: "DELETE";
    ReqType: void;
    RespType: void;
  };
  DeleteGuildPrivateMessage: {
    Url: "/dms/{guild_id}/messages/{message_id}";
    Method: "DELETE";
    ReqType: void;
    RespType: void;
  };
};
export type OpenapiMessageEndpoint = Omit<OpenapiEndpoint, "Interactions">;
export const COpenapiEndpoint: { [key in keyof OpenapiEndpoint]: Omit<OpenapiEndpoint[key], "RespType" | "ReqType"> } =
  {
    Interactions: {
      Url: "/interactions/{interaction_id}",
      Method: "PUT",
    },
    PostFriendMessage: {
      Url: "/v2/users/{openid}/messages",
      Method: "POST",
    },
    PostFriendRichMessage: {
      Url: "/v2/users/{openid}/files",
      Method: "POST",
    },
    PostGroupMessage: {
      Url: "/v2/groups/{group_openid}/messages",
      Method: "POST",
    },
    PostGroupRichMessage: {
      Url: "/v2/groups/{group_openid}/files",
      Method: "POST",
    },
    PostGuildMessage: {
      Url: "/channels/{channel_id}/messages",
      Method: "POST",
    },
    PostGuildPrivateMessage: {
      Url: "/dms/{guild_id}/messages",
      Method: "POST",
    },
    DeleteFriendMessage: {
      Url: "/v2/users/{openid}/messages/{message_id}",
      Method: "DELETE",
    },
    DeleteGroupMessage: {
      Url: "/v2/groups/{group_openid}/messages/{message_id}",
      Method: "DELETE",
    },
    DeleteGuildMessage: {
      Url: "/channels/{channel_id}/messages/{message_id}",
      Method: "DELETE",
    },
    DeleteGuildPrivateMessage: {
      Url: "/dms/{guild_id}/messages/{message_id}",
      Method: "DELETE",
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
  media?: Pick<MessageMediaInfo, "file_info">;
  msg_type: OpenapiMessagePostType;
}

export type OpenapiFriendMessagePost = OpenapiGroupMessagePost;

export interface RichMessagePost {
  url?: string;
  file_type: RichMessageType;
  srv_send_msg: boolean;
  file_data?: string;
}

export interface InteractionNotifyPut {
  code: CallbackButtonRespType;
}
