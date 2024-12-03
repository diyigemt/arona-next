abstract class MarkdownElement {
  abstract build(): string;
}

class Markdown extends MarkdownElement {
  constructor(private readonly elements: MarkdownElement[] = []) {
    super();
  }

  h1(content: string) {
    this.elements.push(new TitleElement(content, TitleElementLevel.H1));
  }

  h2(content: string) {
    this.elements.push(new TitleElement(content, TitleElementLevel.H2));
  }

  title(content: string, level: TitleElementLevel = TitleElementLevel.H1) {
    this.elements.push(new TitleElement(content, level));
  }

  text(content: string, style: TextElementStyle = TextElementStyle.Normal) {
    this.elements.push(new TextElement(content, style));
  }

  build(): string {
    return this.elements
      .map((it) => {
        return it.build() + "\n";
      })
      .join("");
  }
}

enum TitleElementLevel {
  H1,
  H2,
}

class TitleElement extends MarkdownElement {
  constructor(
    private readonly content: string,
    private readonly level: TitleElementLevel = TitleElementLevel.H1,
  ) {
    super();
  }

  build(): string {
    switch (this.level) {
      case TitleElementLevel.H1: {
        return "# " + this.content;
      }
      case TitleElementLevel.H2: {
        return "## " + this.content;
      }
    }
  }
}

enum TextElementStyle {
  Normal, // 无
  Bold, // 加粗
  Italic, // 斜体
  StarItalic, // 星号斜体
  BoldItalic, // 加粗斜体
  StrikeThrough, // 删除线
  BoldUnderline, // 下划线加粗
}

class TextElement extends MarkdownElement {
  constructor(
    private readonly content: string,
    private readonly style: TextElementStyle = TextElementStyle.Normal,
  ) {
    super();
  }

  build(): string {
    switch (this.style) {
      case TextElementStyle.Normal: {
        return this.content;
      }
      case TextElementStyle.Bold: {
        return `**${this.content}**`;
      }
      case TextElementStyle.Italic: {
        return `_${this.content}_`;
      }
      case TextElementStyle.StarItalic: {
        return `*${this.content}*`;
      }
      case TextElementStyle.BoldItalic: {
        return `***${this.content}***`;
      }
      case TextElementStyle.StrikeThrough: {
        return `~~${this.content}~~`;
      }
      case TextElementStyle.BoldUnderline: {
        return `__${this.content}__`;
      }
    }
  }
}

function customMarkdown(cb: (md: Markdown) => void): string {
  const markdown = new Markdown();
  cb(markdown);
  return markdown.build();
}
