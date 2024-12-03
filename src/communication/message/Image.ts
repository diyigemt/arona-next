import { Message } from "./Message";

export interface Image extends Message {
  height: number;
  width: number;
  url: string;
}
