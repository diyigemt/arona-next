import { ChannelMessageEventRaw, MessageEventRaw } from "./Message";

export type Nullable<T> = T | null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/no-unsafe-function-type
export type ClassType<T = any> = Function & { prototype: T };
// @ts-ignore
export const isChannelMessage = (raw: MessageEventRaw): raw is ChannelMessageEventRaw => raw["channel_id"];
