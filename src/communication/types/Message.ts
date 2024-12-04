export interface TencentWebhookBody<T> {
  op: 0 | 13;
  type: unknown;
  d: T;
}
