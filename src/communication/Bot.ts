import { Message } from "./message/Message";
import { Image } from "./message/Image";
import { MessageChain } from "./message/MessageChain";
import axios, { AxiosInstance } from "axios";
import GlobalEventChannel, { BotEvent } from "./event/Event";
import { EventChannel } from "./event/EventChannel";
import { OpenApiAuthorizationReq, OpenApiAuthorizationResp } from "./types/Authorization";
import { NodeSimpleLogger } from "@/logger";
import { BotAuthorizationSuccessEvent, BotOnlineEvent } from "./event/AuthorizationEvent";
import { BotConfig } from "@/types";
import { MessageReceipt } from "./message/MessageReceipt";
import { ed25519 } from "@noble/curves/ed25519";
import BotManager from "./BotManager";
import { COpenapiEndpoint, OpenApiUrlPlaceHolder, OpenapiEndpoint, OpenapiNeedData } from "./types/Openapi";
import { Contact, ContactList, Friend, Group, Guild } from "./types/Contact";
import { FriendImpl, GroupImpl, GuildImpl } from "./contact/Contact";
import { initService } from "@/service";

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
  private httpClient: AxiosInstance;
  logger = NodeSimpleLogger(`Bot.${this.config.id}`);
  friends = new ContactList<Friend>((id: string) => new FriendImpl(id, this));
  groups = new ContactList<Group>((id: string) => new GroupImpl(id, this));
  // @ts-expect-error
  guilds = new ContactList<Guild>((id: string) => new GuildImpl(id, this, null));
  private accessTokenCoroutine: NodeJS.Timeout | undefined;
  private accessToken: string = "";
  private webhookPrivateKey = Buffer.from(this.config.secret.repeat(2).slice(0, 32));
  private webhookPublicKey = ed25519.getPublicKey(this.webhookPrivateKey);
  eventChannel: EventChannel<BotEvent> = GlobalEventChannel.filterIsInstance(BotEvent).filter(
    async (it) => it.bot === this,
  );

  async callOpenApi<
    EP extends keyof OpenapiEndpoint,
    Req extends OpenapiNeedData<EP>,
    Resp extends OpenapiEndpoint[EP]["RespType"],
  >(
    endpoint: EP,
    urlPlaceHolder: OpenApiUrlPlaceHolder<OpenapiEndpoint[EP]["Url"]>,
    data: Req,
    config: axios.AxiosRequestConfig = {},
  ): Promise<Resp> {
    const mapper = COpenapiEndpoint[endpoint];
    let url = `https://${this.config.debugMode ? "sandbox." : ""}api.sgroup.qq.com${mapper.Url}`;
    Object.keys(urlPlaceHolder).forEach((k) => {
      if (url.includes(k)) {
        url = url.replace(`{${k}}`, Reflect.get(urlPlaceHolder, k) as string);
      }
    });
    const cfg = Object.assign(config, {
      url,
      method: mapper.Method,
      headers: {
        Authorization: `QQBot ${this.accessToken}`,
        "X-Union-Appid": this.config.id,
      },
    });
    if (data) {
      cfg.data = data;
    }
    return this.httpClient.request(cfg).then((resp) => {
      return resp.data as Resp;
    });
  }

  webhookVerify(body: Buffer, sign: Buffer) {
    return ed25519.verify(sign, body, this.webhookPublicKey);
  }

  webhookSign(body: Buffer) {
    return Buffer.from(ed25519.sign(body, this.webhookPrivateKey));
  }

  async sendMessage(
    message: string | Message | MessageChain,
    messageSequence: number,
  ): Promise<MessageReceipt<Contact>> {
    return Promise.resolve(undefined) as unknown as Promise<MessageReceipt<Contact>>;
  }

  async uploadImage(dataLike: string | Buffer): Promise<Image> {
    return Promise.resolve(undefined) as unknown as Promise<Image>;
  }

  login() {
    this.eventChannel.subscribeOnce(BotAuthorizationSuccessEvent, async () => {
      new BotOnlineEvent(this).broadcast().then();
      BotManager.registerBot(this);
      initService();
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
