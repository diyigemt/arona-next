import { Contact } from "./contact/Contact";
import { Message, MessageReceipt } from "./message/Message";
import { Image } from "./message/Image";
import { MessageChain } from "./message/MessageChain";
import { CTencentEndpoint, OpenApiUrlPlaceHolder, TencentEndpoint } from "./Api";
import axios, { AxiosInstance } from "axios";

interface BotConfig {
  id: string;
  appId: string;
  token: string;
  secret: string;
  debugMode: boolean;
}

export class Bot implements Contact {
  constructor(private readonly config: BotConfig) {
    this.httpClient = axios.create({
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  bot: Bot = this;
  id: string = this.config.id;
  unionOpenidOrId: string = this.config.id;
  httpClient: AxiosInstance;

  callOpenApi<EP extends keyof TencentEndpoint, T>(
    endpoint: EP,
    urlPlaceHolder: OpenApiUrlPlaceHolder<TencentEndpoint[EP]>,
  ): Promise<T> {
    const url = `https://${this.config.debugMode ? "sandbox." : ""}api.sgroup.qq.com${CTencentEndpoint[endpoint]}`;
    Object.keys(urlPlaceHolder).forEach((k) => {
      if (endpoint.includes(k)) {
        endpoint.replace(k, Reflect.get(urlPlaceHolder, k) as string);
      }
    });
    return this.httpClient
      .post(url, {
        headers: {
          Authorization: "",
          "X-Union-Appid": this.config.id,
        },
      })
      .then((resp) => {
        return resp.data as T;
      });
  }

  sendMessage(message: string | Message | MessageChain, messageSequence: number): Promise<MessageReceipt<Contact>> {
    return Promise.resolve(undefined);
  }

  uploadImage(dataLike: string | Buffer): Promise<Image> {
    return Promise.resolve(undefined);
  }
}
