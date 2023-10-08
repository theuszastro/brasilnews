import { Page } from 'playwright';

import sharp from 'sharp';
import axios from 'axios';

import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

import { randomUUID } from 'crypto';

import { prisma } from '../services';
import { G1Parser } from './parsers/G1';
import { Utils } from './Utils';
import { writeFile } from 'fs/promises';

export type ReadingProps = {
    url: string;
    category: string;
};

export const G1Urls = {
    Ciência: 'https://g1.globo.com/ciencia',
    Agro: 'https://g1.globo.com/economia/agronegocios',
    Carros: 'https://g1.globo.com/carros',
    Economia: 'https://g1.globo.com/economia',
    Educação: 'https://g1.globo.com/educacao',
    Empreendedorismo: 'https://g1.globo.com/empreendedorismo',
    'Meio Ambiente': 'https://g1.globo.com/meio-ambiente',
    Loteria: 'https://g1.globo.com/loterias',
    Inovação: 'https://g1.globo.com/inovacao',
    Mundo: 'https://g1.globo.com/mundo',
    Política: 'https://g1.globo.com/politica',
    Turismo: 'https://g1.globo.com/turismo-e-viagem',
    Saúde: 'https://g1.globo.com/saude',
    Tecnologia: 'https://g1.globo.com/tecnologia',
    Trabalho: 'https://g1.globo.com/trabalho-e-carreira',
};

export const sleep = t => new Promise(r => setTimeout(r, t));

dayjs.extend(customParseFormat);

export class G1 extends Utils {
    parser = new G1Parser();

    constructor() {
        super();

        this.readingNews = this.readingNews.bind(this);
        this.read = this.read.bind(this);
    }

    createISO(time: string) {
        const [date, hour] = time.trim().split(' ');
        const [h, m = '0'] = hour.split('h');

        return dayjs(date, 'DD/MM/YYYY').set('hour', Number(h)).set('minute', Number(m)).set('second', 0).format();
    }

    async readingNews(data: ReadingProps) {
        const { url, category } = data;

        try {
            const document = await this.createDocument(url);
            if (typeof document == 'boolean') return true;

            const element = document.querySelector('div.bastian-page > div._evg');
            const list = [];

            await writeFile('teste.html', document.body.innerHTML);

            for (let child of Array.from(element.children)) {
                try {
                    const coverUrl = child.querySelector('picture > img').getAttribute('src');
                    const element = child.querySelector('.feed-post-body-title.gui-color-primary.gui-color-hover a');

                    const title = element.innerHTML;
                    const url = element.getAttribute('href');
                    const description = child.querySelector('.feed-post-body-resumo > p').innerHTML;

                    list.push({
                        title: this.parser
                            .parse(title)
                            .map(i => i.text.trim())
                            .join(' '),
                        url,
                        description,
                        // cover,
                        coverUrl,
                    });
                } catch (e) {}
            }

            await sleep(2_000);

            let _category = await prisma.newsCategory.findFirst({ where: { name: category, portalName: 'G1' } });
            if (!_category) {
                _category = await prisma.newsCategory.create({
                    data: { name: category, id: randomUUID(), portalName: 'G1' },
                });
            }

            const trans = [];

            for await (let news of list) {
                const alreadyExists = await prisma.news.findFirst({
                    where: { title: news.title.trim(), categoryId: _category.id },
                });
                if (alreadyExists) continue;

                let data = await this.read(news.url);
                if (typeof data == 'boolean') continue;

                const cover = await this.downloadImage(news.coverUrl);

                if ((data.contents[0].imageUrl ?? '') != news.coverUrl) {
                    data.contents = [{ image: cover }, ...data.contents];
                }

                const [iso, id] = [this.createISO(data.time), randomUUID()];

                trans.push(
                    prisma.news.create({
                        data: {
                            id,
                            cover,
                            title: news.title.trim(),
                            description: news.description.trim(),
                            from: data.from,
                            time: data.time,
                            url: news.url,
                            createdAt: iso,
                            updatedAt: iso,
                            categoryId: _category.id,
                        },
                    })
                );

                for (let { content, quote, title, image, list } of data.contents) {
                    const articleId = randomUUID();

                    trans.push(
                        prisma.newsArticle.create({
                            data: {
                                id: articleId,
                                newsId: id as string,

                                ...(title && { title: title.trim() }),
                                ...(image && { image: image.trim() }),
                            },
                        })
                    );

                    if (content) {
                        const contentId = randomUUID();

                        trans.push(
                            prisma.newsContent.create({
                                data: {
                                    id: contentId,
                                    articleId,
                                },
                            })
                        );

                        for (let { text, isBold, isHighlight, isLink, href } of content) {
                            trans.push(
                                prisma.newsContentPart.create({
                                    data: {
                                        id: randomUUID(),

                                        isBold,
                                        isHighlight,

                                        isLink,
                                        href: Boolean(href) ? href : '',

                                        text,

                                        contentId,
                                    },
                                })
                            );
                        }
                    }

                    if (quote) {
                        const contentId = randomUUID();

                        trans.push(
                            prisma.newsContent.create({
                                data: {
                                    id: contentId,
                                    articleQuoteId: articleId,
                                    // articleId,
                                },
                            })
                        );

                        for (let { text, isBold, isHighlight, isLink, href } of quote) {
                            trans.push(
                                prisma.newsContentPart.create({
                                    data: {
                                        id: randomUUID(),

                                        isBold,
                                        isHighlight,

                                        isLink,
                                        href: Boolean(href) ? href : '',

                                        text,

                                        quoteId: contentId,
                                    },
                                })
                            );
                        }
                    }

                    if (list) {
                        const listId = randomUUID();

                        trans.push(
                            prisma.newsList.create({
                                data: {
                                    id: listId,
                                    articleId,
                                },
                            })
                        );

                        for (let item of list) {
                            for (let { text, isBold, isHighlight, isLink, href } of item) {
                                trans.push(
                                    prisma.newsContentPart.create({
                                        data: {
                                            id: randomUUID(),

                                            isBold,
                                            isHighlight,

                                            isLink,
                                            href: Boolean(href) ? href : '',

                                            text,

                                            listId,
                                        },
                                    })
                                );
                            }
                        }
                    }
                }
            }

            await prisma.$transaction(trans);
        } catch (e) {
            // process.send(e);

            console.log(e);
        }
    }

    async read(url: string) {
        try {
            const document = await this.createDocument(url);
            if (typeof document === 'boolean') return true;

            const from = document.querySelector('.content-publication-data__from');
            const time = document.querySelector('.content-publication-data__updated > time');

            const readChunks = async (selector: string) => {
                const element = document.querySelector(selector);
                if (!element) return [];

                const data = [];

                for await (let e of Array.from(element.children).filter(c => (c.id ?? '').startsWith('chunk'))) {
                    const quote = e.querySelector('.content-blockquote.theme-border-color-primary-before');
                    const content = e.querySelector('.content-text__container');
                    const title = e.querySelector('.content-intertitle');
                    const video = e.querySelector('[itemprop="thumbnailUrl"]');
                    const image = e.querySelector('.content-media-figure > img');
                    const _image = e.querySelector('img');
                    const __image = e.querySelector('amp-img');
                    const list = e.querySelector('.content-unordered-list');

                    const imageUrl = image
                        ? image.getAttribute('src')
                        : _image
                        ? _image.getAttribute('src')
                        : __image
                        ? __image.getAttribute('src')
                        : '';

                    const url = imageUrl.length >= 1 ? await this.downloadImage(imageUrl) : '';

                    data.push({
                        quote: quote ? quote.innerHTML : '',
                        content: content ? content.innerHTML : '',
                        title: title ? title.innerHTML : '',
                        video: video ? video.getAttribute('content') : '',
                        image: url,
                        imageUrl,
                        list: list ? Array.from(list.children).map(item => item.innerHTML) : [],
                    });
                }

                return data;
            };

            const contents = await Promise.all([
                readChunks('div.wall.protected-content'),
                readChunks('[itemprop="articleBody"]'),
            ]);

            return await this.parser.parseContent({
                from: from ? from.innerHTML : '',
                time: time ? time.innerHTML : '',
                contents: contents.flat(),
            });
        } catch (e) {
            // process.send(e);

            console.log(e);

            return false;
        }
    }
}
