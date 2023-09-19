import * as htmlparser2 from 'htmlparser2';

export class G1Parser {
    constructor() {
        this.parseContent = this.parseContent;
        this.parse = this.parse;
    }

    async parseContent(data: {
        time: string;
        from: string;
        contents: Array<{ quote?: string; title?: string; content?: string; image?: string; list?: Array<string> }>;
    }) {
        const contents = [];

        for (let { content, quote, title, list, image } of data.contents) {
            if (content) {
                contents.push({ content: this.parse(content) });

                continue;
            }

            if (quote) {
                contents.push({ quote: this.parse(quote) });

                continue;
            }

            if (title) {
                contents.push({
                    title: this.parse(title)
                        .map(item => item.text.trim())
                        .join(' '),
                });

                continue;
            }

            if (list.length >= 1) {
                contents.push({ list: list.map(i => this.parse(i)).flat() });

                continue;
            }

            contents.push({ image });
        }

        return {
            from: data.from,
            time: data.time,
            contents,
        };
    }

    parse(content: string) {
        const contents = [] as Array<{
            text: string;
            isBold: boolean;
            isHighlight: boolean;
            isLink: boolean;
            href: string;
        }>;

        const tags = [];

        const parser = new htmlparser2.Parser({
            onopentag(name, attributes) {
                tags.push({
                    name,
                    text: '',
                    attrs: attributes,
                    isOpen: true,
                    isClosed: false,
                });
            },
            ontext(text) {
                const index = tags.findIndex(c => c.isOpen);

                if (index != -1) {
                    tags[index]['text'] += text;

                    return;
                }

                contents.push({
                    text: text.trim(),
                    href: '',
                    isHighlight: false,
                    isBold: false,
                    isLink: false,
                });
            },
            onclosetag(name) {
                const index = tags.findIndex(c => c.name == name);

                if (['a', 'span', 'b', 'strong'].includes(name)) {
                    if (index != -1) {
                        tags[index].isClosed = true;
                        tags[index].isOpen = false;

                        const tag = tags[index];

                        contents.push({
                            text: tag.text.trim(),
                            href: tag.name === 'a' ? tag.attrs.href : '',

                            isHighlight: tag.attrs.class ? tag.attrs.class.includes('highlight') : false,
                            isBold: ['b', 'strong'].includes(tag.name),
                            isLink: tag.name === 'a',
                        });
                    }
                } else {
                    contents.push({
                        text: tags[index].text,
                        href: '',
                        isHighlight: false,
                        isBold: false,
                        isLink: false,
                    });
                }

                tags.splice(index, 1);
            },
        });
        parser.write(content);
        parser.end();

        return contents;
    }
}
