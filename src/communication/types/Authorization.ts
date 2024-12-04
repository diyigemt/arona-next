export interface TencentOpenApiAuthorizationReq {
  appId: string;
  clientSecret: string;
}

export interface TencentOpenApiAuthorizationResp {
  access_token: string;
  expires_in: number;
}

export interface TencentWebhookChallengeReq {
  plain_token: string;
  event_ts: string;
}

export interface TencentWebhookChallengeResp {
  plain_token: string;
  signature: string;
}
