// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface KeyboardMessage {}

export interface CustomKeyboardMessage extends KeyboardMessage {
  readonly content: string;
}

export interface TemplateKeyboardMessage extends KeyboardMessage {
  readonly id: string;
}
