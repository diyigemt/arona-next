import { ChannelMessageEventRaw, MessageEventRaw } from "./Message";

export type Nullable<T> = T | null;

// @ts-ignore
export const isChannelMessage = (raw: MessageEventRaw): raw is ChannelMessageEventRaw => raw["channel_id"];
