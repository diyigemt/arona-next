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
  readonly height: number = 0;
  readonly width: number = 0;
  readonly size: number = 0;

  toString(): string {
    return this.serialization();
  }

  serialization(): string {
    return `[arona:image:${this.url}]`;
  }
}

export class OfflineImage extends AbstractImage {
  constructor(raw: Buffer) {
    super();
  }
  readonly resourceId: string = "";
  readonly resourceUuid: string = "";
  readonly ttl: number = 0;
  readonly url: string = "";
  readonly height: number = 0;
  readonly width: number = 0;
  readonly size: number = 0;

  toString(): string {
    return this.serialization();
  }

  serialization(): string {
    return `[arona:image:${this.url}]`;
  }
}
