// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface MarkdownMessage {}

export interface CustomMarkdownMessage extends MarkdownMessage {
  readonly content: string;
}

export interface TemplateMarkdownMessageParam {
  key: string;
  values: string[];
}

export interface TemplateMarkdownMessage extends MarkdownMessage {
  custom_template_id: string;
  params: TemplateMarkdownMessageParam[];
}
