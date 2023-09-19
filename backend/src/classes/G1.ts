import { Page } from 'puppeteer';

import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

import { randomUUID } from 'crypto';

import { prisma } from '../services';
import { G1Parser } from './parsers/G1';

type ReadNewsProps = {
    page: Page;
    url: string;
};

type ReadingProps = {
    page: Page;
    url: string;
    category: string;
};

export const G1Urls = {
    Agro: 'https://g1.globo.com/economia/agronegocios',
    Ciência: 'https://g1.globo.com/ciencia',
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

const sleep = t => new Promise(r => setTimeout(r, t));

dayjs.extend(customParseFormat);

class G1News {
    parser = new G1Parser();

    constructor() {
        this.readingNews = this.readingNews.bind(this);
        this.read = this.read.bind(this);
    }

    createISO(time: string) {
        const [date, hour] = time.trim().split(' ');
        const [h, m = '0'] = hour.split('h');

        return dayjs(date, 'DD/MM/YYYY').set('hour', Number(h)).set('minute', Number(m)).set('second', 0).format();
    }

    async readingNews(data: ReadingProps) {
        const { page, url, category } = data;

        try {
            await page.goto(url, { timeout: 10_000 * 6, waitUntil: 'networkidle2' });

            for await (let _ of Array.from({ length: 3 })) {
                const button = await page.$('.load-more.gui-color-primary-bg');
                if (button) {
                    await button.click();

                    await sleep(1_000);

                    continue;
                }

                await page.evaluate(() => document.body.scroll({ behavior: 'smooth', left: 0, top: 100_000 * 40 }));

                await sleep(2_000);
            }

            const list = await page.$eval('div.bstn-fd.bstn-fd-csr > div._evg > div > div > div._evg', e => {
                const data = [];

                for (let child of Array.from(e.children)) {
                    try {
                        const image = child.querySelector('img').src;

                        const element = child.querySelector(
                            '.feed-post-body-title.gui-color-primary.gui-color-hover a'
                        );

                        const title = element.innerHTML;
                        const url = element.getAttribute('href');
                        const description = child.querySelector('.feed-post-body-resumo > p').innerHTML;

                        data.push({
                            title,
                            url,
                            description,
                            image,
                        });
                    } catch (e) {}
                }

                return data;
            });

            await sleep(2_000);

            let _category = await prisma.newsCategory.findFirst({ where: { name: category } });
            if (!_category) {
                _category = await prisma.newsCategory.create({
                    data: { name: category, id: randomUUID(), portalName: 'G1' },
                });
            }

            for await (let news of list.map(i => ({ ...i, title: this.parser.parse(i.title)[0].text }))) {
                const alreadyExists = await prisma.news.findFirst({ where: { title: news.title.trim() } });
                if (alreadyExists) continue;

                const data = await this.read({ page, url: news.url });
                if (typeof data == 'boolean') continue;

                const iso = this.createISO(data.time);

                const [id, trans] = [randomUUID(), []];

                trans.push(
                    prisma.news.create({
                        data: {
                            id,
                            title: news.title.trim(),
                            description: news.description.trim(),
                            from: data.from,
                            time: data.time,
                            url: news.url,
                            cover: news.image,
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
                    // console.log(e);
                    process.send(e);
                }

                // @ts-ignore
                process.send({ title: news.title, content: news.description });
                // console.log({ title: news.title, content: news.description });

                await sleep(5000);

                break;
            }
        } catch (e) {
            console.log(e);
        }
    }

    async read(data: ReadNewsProps) {
        const { page, url } = data;

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

            return await this.parser.parseContent({
                from,
                time,
                contents,
            });
        } catch (e) {
            return false;
        }
    }

    // async miningNews(page: number, name: string) {
    //     const currentPage = await prisma.mining.findFirst({ where: { page, name, portal: 'G1' } });
    //     if (currentPage) return this.miningNews(page + 1, name);

    //     const { data } = await axios.get(urls[name].replace(':currentPage', Number(page)));

    //     for await (let { content } of data.items) {
    //         if (content.section == '') continue;

    //         const newsCheck = await prisma.news.findFirst({ where: { title: content.title, portalName: 'G1' } });
    //         if (newsCheck) continue;

    //         if (!content.image) continue;

    //         const news = await this.read(content.url);
    //         if (typeof news != 'object') {
    //             continue;
    //         }

    //         const { contents, from, time } = await this.parseContent(news);

    //         const [id, trans] = [randomUUID(), []];

    //         trans.push(
    //             prisma.news.create({
    //                 data: {
    //                     id,
    //                     title: content.title,
    //                     description: content.summary,
    //                     from,
    //                     time,
    //                     portalName: 'G1',
    //                     url: content.url,
    //                     cover: content.image.sizes.L.url,
    //                     category: name,
    //                 },
    //             })
    //         );

    //         for (let { content, quote, title, image, list } of contents) {
    //             const articleId = randomUUID();

    //             trans.push(
    //                 prisma.newsArticle.create({
    //                     data: {
    //                         id: articleId,
    //                         newsId: id as string,

    //                         ...(title && { title: title.trim() }),
    //                         ...(image && { image: image.trim() }),
    //                     },
    //                 })
    //             );

    //             if (content) {
    //                 const contentId = randomUUID();

    //                 trans.push(
    //                     prisma.newsContent.create({
    //                         data: {
    //                             id: contentId,
    //                             articleId,
    //                         },
    //                     })
    //                 );

    //                 for (let { text, isBold, isHighlight, isLink, href } of content) {
    //                     trans.push(
    //                         prisma.newsContentPart.create({
    //                             data: {
    //                                 id: randomUUID(),

    //                                 isBold,
    //                                 isHighlight,

    //                                 isLink,
    //                                 href: Boolean(href) ? href : '',

    //                                 text,

    //                                 contentId,
    //                             },
    //                         })
    //                     );
    //                 }
    //             }

    //             if (quote) {
    //                 const contentId = randomUUID();

    //                 trans.push(
    //                     prisma.newsContent.create({
    //                         data: {
    //                             id: contentId,
    //                             articleId,
    //                         },
    //                     })
    //                 );

    //                 for (let { text, isBold, isHighlight, isLink, href } of quote) {
    //                     trans.push(
    //                         prisma.newsContentPart.create({
    //                             data: {
    //                                 id: randomUUID(),

    //                                 isBold,
    //                                 isHighlight,

    //                                 isLink,
    //                                 href: Boolean(href) ? href : '',

    //                                 text,

    //                                 quoteId: contentId,
    //                             },
    //                         })
    //                     );
    //                 }
    //             }

    //             if (list) {
    //                 const listId = randomUUID();

    //                 trans.push(
    //                     prisma.newsList.create({
    //                         data: {
    //                             id: listId,
    //                             articleId,
    //                         },
    //                     })
    //                 );

    //                 for (let { text, isBold, isHighlight, isLink, href } of list) {
    //                     trans.push(
    //                         prisma.newsContentPart.create({
    //                             data: {
    //                                 id: randomUUID(),

    //                                 isBold,
    //                                 isHighlight,

    //                                 isLink,
    //                                 href: Boolean(href) ? href : '',

    //                                 text,

    //                                 listId,
    //                             },
    //                         })
    //                     );
    //                 }
    //             }
    //         }

    //         try {
    //             await prisma.$transaction(trans);
    //         } catch (e) {
    //             process.send(e);
    //         }
    //         process.send({ title: content.title, content: content.summary });

    //         await sleep(5000);
    //     }

    //     await prisma.mining.create({
    //         data: {
    //             id: randomUUID(),
    //             name,
    //             page,
    //             portal: 'G1',
    //         },
    //     });

    //     await sleep(30000);

    //     return this.miningNews(page + 1, name);
    // }
}

export default G1News;
