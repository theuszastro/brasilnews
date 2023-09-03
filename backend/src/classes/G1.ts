import puppeteer, { Browser } from 'puppeteer';
import axios from 'axios';

import { NewsContentPart } from '@prisma/client';

import { randomUUID } from 'crypto';

import { prisma } from '../services';
import { Parser } from './Parser';
import { writeFile } from 'fs/promises';

const urls = {
    Agro: 'https://falkor-cda.bastian.globo.com/tenants/g1/instances/9153bfe9-5bed-4675-af3e-be408671ce08/posts/page/:currentPage',
    Ciência:
        'https://falkor-cda.bastian.globo.com/tenants/g1/instances/6f8adb97-044c-4bf3-9841-fad66bfa30e5/posts/page/:currentPage',
};

const sleep = t => new Promise(r => setTimeout(r, t));

class G1News {
    browser: Browser;

    constructor() {
        this.setup = this.setup.bind(this);
        this.miningNews = this.miningNews.bind(this);
        this.read = this.read.bind(this);
    }

    async setup() {
        this.browser = await puppeteer.launch({ headless: false, defaultViewport: { width: 1920, height: 1080 } });
    }

    async miningNews(page: number, name: string) {
        const currentPage = await prisma.mining.findFirst({ where: { page, name, portal: 'G1' } });
        if (currentPage) return this.miningNews(page + 1, name);

        const { data } = await axios.get(urls[name].replace(':currentPage', Number(page)));

        for await (let { content } of data.items) {
            if (content.section == '') continue;

            const newsCheck = await prisma.news.findFirst({ where: { title: content.title, portalName: 'G1' } });
            if (newsCheck) continue;

            if (!content.image) continue;

            const news = await this.read(content.url);
            if (typeof news != 'object') {
                continue;
            }

            const { contents, from, time } = await this.parseContent(news);

            const [id, trans] = [randomUUID(), []];

            trans.push(
                prisma.news.create({
                    data: {
                        id,
                        title: content.title,
                        description: content.summary,
                        from,
                        time,
                        portalName: 'G1',
                        url: content.url,
                        cover: content.image.sizes.L.url,
                        category: name,
                    },
                })
            );

            for (let { content, quote, title, image, list } of contents) {
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
                                articleId,
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

                    for (let { text, isBold, isHighlight, isLink, href } of list) {
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

            try {
                await prisma.$transaction(trans);
            } catch (e) {
                process.send(e);
            }
            process.send({ title: content.title, content: content.summary });

            await sleep(5000);
        }

        await prisma.mining.create({
            data: {
                id: randomUUID(),
                name,
                page,
                portal: 'G1',
            },
        });

        await sleep(30000);

        return this.miningNews(page + 1, name);
    }

    async parseContent(data: {
        time: string;
        from: string;
        contents: Array<{ quote?: string; title?: string; content?: string; image?: string; list?: Array<string> }>;
    }) {
        const parser = new Parser();
        const contents = [];

        for (let { content, quote, title, list, image } of data.contents) {
            if (content) {
                contents.push({ content: parser.parse(content) });

                continue;
            }

            if (quote) {
                contents.push({ quote: parser.parse(quote) });

                continue;
            }

            if (title) {
                contents.push({
                    title: parser
                        .parse(title)
                        .map(item => item.text.trim())
                        .join(' '),
                });

                continue;
            }

            if (list.length >= 1) {
                contents.push({ list: list.map(i => parser.parse(i)[0]) });

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

    async read(url: string) {
        const page = await this.browser.newPage();

        try {
            await page.goto(url, { timeout: 10_000 * 6, waitUntil: 'networkidle2' });

            const from = await page.$eval('.content-publication-data__from', (e: HTMLElement) => e.innerText);
            const time = await page.$eval('.content-publication-data__updated > time', (e: HTMLElement) => e.innerText);

            const article = await page.$('[itemprop="articleBody"]');
            const chunks = await article.evaluate(elem =>
                Array.from(elem.children)
                    .filter(c => (c.id ?? '').startsWith('chunk'))
                    .map(item => item.id)
            );
            const limitedChunks = await page.$eval('div.wall.protected-content', (elem: HTMLElement) =>
                Array.from(elem.children)
                    .filter(c => (c.id ?? '').startsWith('chunk'))
                    .map(item => item.id)
            );

            const contents = [];

            for await (let id of [...chunks, ...limitedChunks]) {
                const chunk = await page.$(`div#${id}`);

                let quote = await chunk.$('.content-blockquote.theme-border-color-primary-before');
                let content = await chunk.$('.content-text__container');
                let title = await chunk.$('.content-intertitle');
                let video = await chunk.$('[itemprop="thumbnailUrl"]');
                let image = await chunk.$('.content-media-figure');
                let list = await chunk.$('.content-unordered-list');

                let [_quote, _content, _title, _video, _image, _list] = ['', '', '', '', '', []];

                if (quote) {
                    _quote = await quote.evaluate(e => e.innerHTML);
                }

                if (content) {
                    _content = await content.evaluate(e => e.innerHTML);
                }

                if (title) {
                    _title = await title.evaluate(e => e.innerHTML);
                }

                if (video) {
                    _video = await video.evaluate(e => e.getAttribute('content'));
                }

                if (list) {
                    _list = await list.evaluate(e => Array.from(e.children).map(item => item.innerHTML));
                }

                if (image) {
                    _image = await image.evaluate(e => e.children[0].getAttribute('src'));
                }

                if (!_quote && !_content && !_title && !_video && !_image && _list.length < 1) continue;

                contents.push({
                    quote: _quote,
                    content: _content,
                    title: _title,
                    image: _image.length >= 1 ? _image : _video,
                    list: _list,
                });
            }

            await page.close();

            return {
                from,
                time,
                contents,
            };
        } catch (e) {
            await page.close();
        }
    }
}

export default G1News;
