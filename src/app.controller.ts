import { Body, Controller, Get, Post, RawBody, Req, Res } from "@nestjs/common";
import BotManager from "./communication/BotManager";
import { FastifyRequest, FastifyReply } from "fastify";
import { TencentWebhookBody } from "./communication/types/Message";
import { TencentWebhookChallengeReq, TencentWebhookChallengeResp } from "./communication/types/Authorization";

@Controller("/webhook")
export class AppController {
  @Post()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/no-unsafe-function-type
  webhook(@Req() req: FastifyRequest, @Res() resp: FastifyReply, @Body() rawBody: Record<any, any>) {
    const sign = req.headers["x-signature-ed25519"];
    const ts = req.headers["x-signature-timestamp"];
    const bot = BotManager.getBot();
    if (sign && typeof sign === "string" && ts && typeof ts === "string" && rawBody) {
      const verifyBody = Buffer.concat([Buffer.from(ts), Buffer.from(JSON.stringify(rawBody))]);
      const verify = bot.webhookVerify(verifyBody, Buffer.from(sign, "hex"));
      if (!verify) {
        return resp.status(400);
      }
      const body = req.body as TencentWebhookBody<TencentWebhookChallengeReq>;
      if (body.op === 13) {
        // 验签
        const dataSign = bot.webhookSign(Buffer.from(body.d.event_ts + body.d.plain_token));
        return resp.status(200).send({
          plain_token: body.d.plain_token,
          signature: dataSign.toString("hex"),
        } as TencentWebhookChallengeResp);
      }
      // 发送数据
      bot.logger.info(JSON.stringify(body));
      return resp.status(204).send();
    }
    return resp.status(400).send();
  }

  @Get()
  hello() {
    return {
      status: 123,
    };
  }
}
