import { Contact } from "./contact/Contact";
import { Message } from "./message/Message";
import { Image } from "./message/Image";
import { MessageChain } from "./message/MessageChain";
import axios, { AxiosInstance } from "axios";
import GlobalEventChannel, { BotEvent } from "./event/Event";
import { EventChannel } from "./event/EventChannel";
import { OpenApiAuthorizationReq, OpenApiAuthorizationResp } from "./types/Authorization";
import { NodeSimpleLogger } from "../logger";
import { BotAuthorizationSuccessEvent, BotOnlineEvent } from "./event/AuthorizationEvent";
import { BotConfig } from "../types";
import { MessageReceipt } from "./message/MessageReceipt";
import { ed25519 } from "@noble/curves/ed25519";
import BotManager from "./BotManager";
import { COpenapiEndpoint, OpenApiUrlPlaceHolder, OpenapiEndpoint } from "./types/Openapi";

export class Bot implements Contact {
  constructor(private readonly config: BotConfig) {
    this.httpClient = axios.create({
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (config.debugMode) {
      this.eventChannel.subscribeAlways(BotEvent, async (ev) => {
        this.logger.info(ev.toString());
      });
    }
  }

  bot: Bot = this;
  id: string = this.config.id;
  unionOpenidOrId: string = this.config.id;
  httpClient: AxiosInstance;
  logger = NodeSimpleLogger(`Bot.${this.config.id}`);
  private accessTokenCoroutine: NodeJS.Timeout | null;
  private accessToken: string = "";
  private webhookPrivateKey = Buffer.from(this.config.secret.repeat(2).slice(0, 32));
  private webhookPublicKey = ed25519.getPublicKey(this.webhookPrivateKey);
  eventChannel: EventChannel<BotEvent> = GlobalEventChannel.filterIsInstance(BotEvent).filter(
    async (it) => it.bot === this,
  );

  callOpenApi<EP extends keyof OpenapiEndpoint, T extends OpenapiEndpoint[EP]["RespType"]>(
    endpoint: EP,
    urlPlaceHolder: OpenApiUrlPlaceHolder<OpenapiEndpoint[EP]["Url"]>,
    config: axios.AxiosRequestConfig = {},
  ): Promise<T> {
    const mapper = COpenapiEndpoint[endpoint];
    const url = `https://${this.config.debugMode ? "sandbox." : ""}api.sgroup.qq.com${mapper.Url}`;
    Object.keys(urlPlaceHolder).forEach((k) => {
      if (endpoint.includes(k)) {
        endpoint.replace(k, Reflect.get(urlPlaceHolder, k) as string);
      }
    });
    return this.httpClient
      .request(
        Object.assign(config, {
          url,
          method: mapper.Method,
          headers: {
            Authorization: "",
            "X-Union-Appid": this.config.id,
          },
        }),
      )
      .then((resp) => {
        return resp.data as T;
      });
  }

  webhookVerify(body: Buffer, sign: Buffer) {
    return ed25519.verify(sign, body, this.webhookPublicKey);
  }

  webhookSign(body: Buffer) {
    return Buffer.from(ed25519.sign(body, this.webhookPrivateKey));
  }

  sendMessage(message: string | Message | MessageChain, messageSequence: number): Promise<MessageReceipt<Contact>> {
    return Promise.resolve(undefined);
  }

  uploadImage(dataLike: string | Buffer): Promise<Image> {
    return Promise.resolve(undefined);
  }

  login() {
    this.eventChannel.subscribeOnce(BotAuthorizationSuccessEvent, async () => {
      new BotOnlineEvent(this).broadcast().then();
      BotManager.registerBot(this);
    });
    this.startUpdateAccessTokenCoroutine();
  }

  private startUpdateAccessTokenCoroutine() {
    const t = this.accessTokenCoroutine && clearTimeout(this.accessTokenCoroutine);
    this.getAccessToken()
      .then((resp) => {
        this.accessToken = resp.access_token;
        new BotAuthorizationSuccessEvent(this).broadcast().then();
        this.accessTokenCoroutine = setTimeout(
          () => {
            this.startUpdateAccessTokenCoroutine();
          },
          (resp.expires_in - 30) * 1000,
        );
      })
      .catch();
  }

  private async getAccessToken(): Promise<OpenApiAuthorizationResp> {
    const data: OpenApiAuthorizationReq = {
      appId: this.config.appId,
      clientSecret: this.config.secret,
    };
    return new Promise<OpenApiAuthorizationResp>((resolve, reject) => {
      this.httpClient
        .post("https://bots.qq.com/app/getAppAccessToken", data)
        .then((resp) => {
          if (resp.status === 200 && resp.data.access_token) {
            resolve(resp.data as OpenApiAuthorizationResp);
          } else {
            this.logger.warn("request app access token failed");
            reject(resp);
          }
        })
        .catch((err) => {
          this.logger.warn(err);
          reject(err);
        });
    });
  }
}
