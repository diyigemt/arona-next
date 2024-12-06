import { Message } from "./Message";
import { Resource } from "../types/Message";

export interface Image extends Message, Resource {
  height: number;
  width: number;
  url: string;
}

export abstract class AbstractImage implements Image {
  abstract resourceId: string;
  abstract resourceUuid: string;
  abstract ttl: number;
  abstract size: number;
  abstract height: number;
  abstract width: number;
  abstract url: string;
  abstract serialization(): string;
}

export class OnlineImage extends AbstractImage {
  constructor(
    readonly resourceId: string,
    readonly resourceUuid: string,
    readonly ttl: number,
    readonly url: string,
  ) {
    super();
  }
  height: number = 0;
  width: number = 0;
  size: number = 0;

  toString(): string {
    return this.serialization();
  }

  serialization(): string {
    return `[arona:image:${this.url}]`;
  }
}
