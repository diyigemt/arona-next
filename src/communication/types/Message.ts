import { MessageChain } from "../message/MessageChain";

export interface WebhookBody<T> {
  id?: string; // 未知id, 目前只有interactions下发伴随的id有用, 需要调用openapi的接口通知后台消息处理结果
  op: 0 | 13; // 0: 正常消息 13: 客户端密钥challenge
  t: WebhookEventTypes;
  d: T; // 具体消息体
}

export type WebhookEventTypes =
  | "MESSAGE_CREATE" // 频道全量消息发送
  | "AT_MESSAGE_CREATE" // 频道@机器人消息
  | "DIRECT_MESSAGE_CREATE" // 频道私聊消息
  | "GUILD_CREATE" // 机器人被加入频道
  | "GUILD_DELETE" // 机器人被踢出频道/频道解散
  | "GROUP_AT_MESSAGE_CREATE" // 群聊@机器人消息
  | "GROUP_ADD_ROBOT" // 机器人被加入群
  | "GROUP_DEL_ROBOT" // 机器人被踢出群
  | "GROUP_MSG_REJECT" // 群拒绝机器人的主动消息
  | "GROUP_MSG_RECEIVE" // 群允许机器人的主动消息
  | "C2C_MESSAGE_CREATE" // 私聊消息发送
  | "FRIEND_ADD" // 机器人被加入好友
  | "FRIEND_DEL" // 机器人被删除好友
  | "C2C_MSG_REJECT" // 好友拒绝机器人的主动消息
  | "C2C_MSG_RECEIVE" // 好友允许机器人的主动消息
  | "INTERACTION_CREATE"; // 回调按钮被点击

export enum GuildChannelType {
  TEXT = 0, // 文字子频道
  RESERVE_0 = 1, // 保留，不可用
  VOICE = 2, // 语音子频道
  RESERVE_1 = 3, // 保留，不可用
  NODE = 4, // 子频道分组
  STREAM = 10005, // 直播子频道
  APPLICATION = 10006, // 应用子频道
  FORM = 10007, // 论坛子频道
}

export enum GuildChannelSubType {
  CHAT = 0, // 闲聊
  ANNOUNCE = 1, // 公告
  HELP = 2, // 攻略
  KOOK = 3, // 开黑
}

export enum GuildChannelPrivateType {
  OPEN = 0, // 公开频道
  ADMIN_ONLY = 1, // 群主管理员可见
  ADMIN_OR_MEMBER = 2, // 群主管理员+指定成员
}

export enum GuildChannelSpeakPermissionType {
  INVALID = 0, // 无效类型
  ANY = 1, // 所有人
  ADMIN_OR_MEMBER = 2, // 群主管理员+指定成员
}

export enum GuildChannelApplicationType {
  MOBA = 1000000, // 王者开黑大厅
  MINI_GAME = 1000001, // 互动小游戏
  VOTE = 1000010, // 腾讯投票
  CAR = 1000051, // 飞车开黑大厅
  SCHEDULE = 1000050, // 日程提醒
  CODM = 1000070, // CODM开黑大厅
  PEACE = 1010000, // 和平精英开黑大厅
}

export enum CallbackButtonType {
  MessageButton = 11, // 消息按钮
  QuickMenu = 12, // 快捷菜单
}

export enum CallbackButtonChatType {
  Guild = 0, // 频道
  Group = 1, // 群聊
  Friend = 2, // 私聊
}

export interface EventRaw {
  id: string;
}

export interface ContactRaw {
  id: string;
  union_openid?: string;
}

export interface GroupMessageEventAuthorRaw extends ContactRaw {
  member_openid: string;
}

export interface FriendMessageEventAuthorRaw extends ContactRaw {
  user_openid: string;
}

export interface GuildMessageEventAuthorRaw extends ContactRaw {
  avatar: string;
  username: string;
  bot: boolean;
  union_user_account: string;
}

export interface GuildMemberRaw extends ContactRaw {
  joined_at: string;
  nick: string;
  roles: string[];
  user?: GuildMessageEventAuthorRaw;
  guild_id: string;
}

export interface MessageAttachmentRaw {
  url: string; // 下载地址
}

export type MessageEmbedThumbnailRaw = MessageAttachmentRaw;

export interface MessageEmbedField {
  name: string;
}

export interface MessageEmbedRaw {
  title: string;
  prompt: string;
  thumbnail: MessageEmbedThumbnailRaw;
  fields: MessageEmbedField[];
}

export interface MessageArkRaw {
  template_id: number;
  kv: MessageArkKv[];
}

export interface MessageArkKv {
  key: string;
  value: string;
  obj: MessageArkObj[];
}

export interface MessageArkObj {
  obj_kv: MessageArkObjKv[];
}

export interface MessageArkObjKv {
  key: string;
  value: string;
}

export interface MessageReference {
  message_id: string; // 需要引用回复的消息 id
  ignore_get_message_error: boolean; // 是否忽略获取引用消息详情错误，默认否
}

export interface MessageEventRaw extends EventRaw {
  author: ContactRaw; // 消息创建者
  content: string; // 消息内容
  timestamp: string; // 消息创建时间 ISO8601 timestamp
  attachments?: MessageAttachmentRaw[];
}

export interface GroupMessageEventRaw extends MessageEventRaw {
  author: GroupMessageEventAuthorRaw;
}

export interface FriendMessageEventRaw extends MessageEventRaw {
  author: FriendMessageEventAuthorRaw;
}

export interface ChannelMessageEventRaw extends MessageEventRaw {
  guild_id: string; // 频道id
  channel_id: string; // 子频道id
  src_guild_id?: string; // 用于私信场景下识别真实的来源频道id
  /**
   * 子频道消息 seq，用于消息间的排序，
   *
   * seq 在同一子频道中按从先到后的顺序递增，不同的子频道之间消息无法排序
   */
  seq_in_channel: number;
  edited_timestamp?: string; // 消息编辑时间 ISO8601 timestamp
  mention_everyone: boolean; // 是否是@全员消息
  author: GuildMessageEventAuthorRaw; // 消息创建者
  member: GuildMemberRaw; // 消息创建者的member信息
  mentions?: GuildMemberRaw[];
  embeds?: MessageEmbedRaw[];
  ark?: MessageArkRaw;
  message_reference?: MessageReference;
}

export interface GroupEventRaw extends EventRaw {
  group_openid: string;
  op_member_openid: string;
  timestamp: number;
}

export interface FriendEventRaw extends EventRaw {
  openid: string;
  timestamp: number;
}

export interface CallbackButton extends EventRaw {
  type: CallbackButtonType;
  chat_type: CallbackButtonChatType;
  data: CallbackButtonData;
  timestamp: string; // 触发时间 RFC 3339 格式
  guild_id?: string;
  channel_id?: string;
  user_openid?: string;
  group_openid?: string;
  group_member_openid?: string;
  version: number;
  application_id: string;
}

export interface CallbackButtonData {
  resolved: CallbackButtonDataResolved;
  type: CallbackButtonType;
}

export interface CallbackButtonDataResolved {
  button_data?: string;
  button_id: string;
  user_id?: string;
  feature_id: string;
  message_id?: string;
}

// 一个频道对象
export interface GuildRaw extends ContactRaw {
  name: string;
  icon: string;
  owner_id: string;
  owner: boolean;
  member_count: number;
  max_members: number;
  description: string;
  joined_at: string;
  op_user_id: string;
}

export interface GuildChannelRaw extends ContactRaw {
  guild_id: string;
  name: string;
  type: GuildChannelType;
  sub_type: GuildChannelSubType;
  position: number;
  parent_id: string;
  owner_id: string;
  private_type: GuildChannelPrivateType;
  speak_permission: GuildChannelSpeakPermissionType;
  application_id: GuildChannelApplicationType;
  // https://bot.q.qq.com/wiki/develop/api-v2/server-inter/channel/role-group/channel_permissions/model.html#Permissions
  permissions: string;
}
