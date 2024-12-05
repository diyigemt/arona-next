export interface OpenApiAuthorizationReq {
  appId: string;
  clientSecret: string;
}

export interface OpenApiAuthorizationResp {
  access_token: string;
  expires_in: number;
}

export interface WebhookChallengeReq {
  plain_token: string;
  event_ts: string;
}

export interface WebhookChallengeResp {
  plain_token: string;
  signature: string;
}
