import { randomUUID } from 'crypto';

import dayjs from 'dayjs';

import { sleep, ReadingProps } from './G1';
import { DiarioSMParser } from './parsers/DiarioSM';

import { prisma } from '../services';
import { Utils } from './Utils';

export const DiarioSMUrls = {
    Cultura: 'https://diariosm.com.br/cultura',
    Economia: 'https://diariosm.com.br/noticias/economia',
    Educação: 'https://diariosm.com.br/noticias/educacao',
    Esporte: 'https://diariosm.com.br/esportes',
    Geral: 'https://diariosm.com.br/geral',
    Polícia: 'https://diariosm.com.br/noticias/policia-seguranca',
    Política: 'https://diariosm.com.br/noticias/politica',
    Saúde: 'https://diariosm.com.br/noticias/saude',
};

export class DiarioSM extends Utils {
    parser = new DiarioSMParser();

    constructor() {
        super();

        this.read = this.read;
        this.readingNews = this.readingNews;
    }

    createISO(iso: string) {
        const [date, time] = iso.split(' ');
        const [h, m] = time.split(':');

        return dayjs(date.trim(), 'DD/MM/YYYY')
            .set('hour', Number(h))
            .set('minute', Number(m.replace(/\D/g, '')))
            .set('second', 0)
            .format();
    }

    async readingNews(data: ReadingProps) {
        const { category, url } = data;

        try {
            const document = await this.createDocument(url);
            if (typeof document == 'boolean') return true;

            const post = document.querySelector('.post-list');

            const list = [];

            for await (let child of Array.from(post.children)) {
                if (child.classList.contains('ts-pagination')) continue;

                try {
                    const url = child.querySelector('a').getAttribute('href').trim();
                    const image = child.querySelector('img').getAttribute('src').trim();
                    const title = child.querySelector('.post-title.md > a').innerHTML.trim();
                    const time = child.querySelector('.post-meta-info > li').innerHTML.replace('\n', '').trim();

                    list.push({
                        url: `https://diariosm.com.br${url}`,
                        // cover,
                        coverUrl: image,
                        title: this.parser
                            .parse(title)
                            .map(i => i.text)
                            .join(' '),
                        time,
                    });
                } catch (e) {}
            }

            await sleep(2_000);

            let _category = await prisma.newsCategory.findFirst({
                where: { name: category, portalName: 'Diário de Santa Maria' },
            });
            if (!_category) {
                _category = await prisma.newsCategory.create({
                    data: { name: category, id: randomUUID(), portalName: 'Diário de Santa Maria' },
                });
            }

            const trans = [];

            for await (let news of list) {
                const alreadyExists = await prisma.news.findFirst({
                    where: { title: news.title, categoryId: _category.id },
                });
                if (alreadyExists) continue;

                let data = await this.read(news.url);
                if (typeof data == 'boolean') continue;

                const [createdAt, id] = [this.createISO(news.time), randomUUID(), []];
                const cover = await this.downloadImage(news.coverUrl);

                if ((data[0].imageUrl ?? '') != news.coverUrl) {
                    data = [{ image: cover }, ...data];
                }

                trans.push(
                    prisma.news.create({
                        data: {
                            id,
                            title: news.title.trim(),
                            description: '',
                            from: '',
                            time: news.time,
                            url: news.url,
                            cover: cover,
                            createdAt: createdAt,
                            updatedAt: createdAt,
                            categoryId: _category.id,
                        },
                    })
                );

                for (let { content, title, image, list } of data) {
                    const articleId = randomUUID();

                    trans.push(
                        prisma.newsArticle.create({
                            data: {
                                id: articleId,
                                newsId: id as string,

                                ...(title && { title: title }),
                                ...(image && { image: image }),
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
                                        href,

                                        text,

                                        contentId,
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
                                        href,

                                        text,

                                        listId,
                                    },
                                })
                            );
                        }
                    }
                }
            }

            await prisma.$transaction(trans);
        } catch (e) {
            process.send(e);
        }
    }

    async read(url: string) {
        try {
            const document = await this.createDocument(url);
            if (typeof document == 'boolean') return true;

            const element = document.querySelector('#text-article');
            const contents = [];

            for await (let child of Array.from(element.children)) {
                if (child.classList.contains('alright-video')) continue;
                if (child.getAttribute('data-google-query-id')) continue;

                if (child.tagName.toLowerCase() == 'h3') {
                    contents.push({
                        title: this.parser
                            .parse(child.innerHTML)
                            .map(item => item.text)
                            .join(' '),
                    });

                    continue;
                }

                const image = child.querySelector('img');
                if (image) {
                    const url = await this.downloadImage(image.getAttribute('src'));

                    contents.push({ image: url, imageUrl: image.getAttribute('src') });

                    continue;
                }

                if (['ul', 'ol'].includes(child.tagName.toLowerCase())) {
                    const list = [];

                    for (let item of Array.from(child.children)) {
                        list.push(...this.parser.parse(item.innerHTML));
                    }

                    contents.push({ list: list.flat() });

                    continue;
                }

                contents.push({ content: this.parser.parse(child.innerHTML) });
            }

            return contents
                .filter(c => {
                    if (typeof c.content == 'string') return false;

                    return true;
                })
                .filter(Boolean);
        } catch (e) {
            // process.send(e);
            console.log(e);

            return false;
        }
    }
}
