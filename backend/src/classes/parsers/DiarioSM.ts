import * as htmlparser2 from 'htmlparser2';

export class DiarioSMParser {
    constructor() {
        this.parse = this.parse;
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
                // if (name == 'br') return;

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

        return contents
            .filter(c => {
                if (Boolean(c.href) || Boolean(c.text)) return true;

                return false;
            })
            .filter(c => typeof c != 'undefined');
    }
}
