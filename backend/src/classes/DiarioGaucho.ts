import { randomUUID } from 'crypto';

import dayjs from 'dayjs';

import { sleep, ReadingProps } from './G1';
import { DiarioGauchoParser } from './parsers/DiarioGaucho';

import { Utils } from './Utils';
import { prisma } from '../services';

export const DiarioGauchoUrls = {
    Sexo: 'https://diariogaucho.clicrbs.com.br/rs/ultimas-noticias/tag/falando-de-sexo',
    Educação: 'https://diariogaucho.clicrbs.com.br/rs/ultimas-noticias/tag/educacao',
    Entretenimento: 'https://diariogaucho.clicrbs.com.br/rs/ultimas-noticias/tag/entretenimento',
    Futebol: 'https://diariogaucho.clicrbs.com.br/rs/ultimas-noticias/tag/futebol',
    Agronegócio: 'https://diariogaucho.clicrbs.com.br/rs/ultimas-noticias/tag/agricultura',
    Novela: 'https://diariogaucho.clicrbs.com.br/rs/ultimas-noticias/tag/novela',
    Noveleiros: 'https://diariogaucho.clicrbs.com.br/rs/ultimas-noticias/tag/noveleiros',
    Saúde: 'https://diariogaucho.clicrbs.com.br/rs/ultimas-noticias/tag/saude',
    'Redes Sociais': 'http://diariogaucho.clicrbs.com.br/rs/ultimas-noticias/tag/redes-sociais',
    Receitas: 'https://diariogaucho.clicrbs.com.br/rs/ultimas-noticias/tag/receitas',
};

export class DiarioGaucho extends Utils {
    constructor() {
        super();
    }

    parser = new DiarioGauchoParser();

    createISO(date: string, hour: string) {
        const [h, m] = hour.split('h');

        return dayjs(date.trim(), 'DD/MM/YYYY')
            .set('hour', Number(h))
            .set('minute', Number(m.replace(/\D/g, '')))
            .set('second', 0)
            .format();
    }

    async readingNews(data: ReadingProps) {
        try {
            const { category, url } = data;

            const document = await this.createDocument(url);
            if (typeof document === 'boolean') return;

            const boxs = document.querySelectorAll('.box.listagem');
            const contents = [];

            for await (let child of Array.from(boxs)) {
                const date = child.querySelector('.box-titulo').innerHTML;
                const item = child.querySelector('.box-conteudo');

                for await (let news of Array.from(item.children)) {
                    const image = news.querySelector('img');
                    if (image) {
                        const link = news.querySelector('a');

                        const hour = news.querySelector('.hora').innerHTML;
                        const description = news.querySelector('.materia-subtitulo').innerHTML;

                        contents.push({
                            hour,
                            date,

                            coverUrl: image.getAttribute('src'),
                            description,
                            url: link.href,
                            title: this.parser
                                .parse(link.innerHTML)
                                .map(i => i.text)
                                .join(' '),
                        });
                    }
                }
            }

            await sleep(2_000);

            let _category = await prisma.newsCategory.findFirst({
                where: { name: category, portalName: 'Diário Gaúcho' },
            });
            if (!_category) {
                _category = await prisma.newsCategory.create({
                    data: { name: category, id: randomUUID(), portalName: 'Diário Gaúcho' },
                });
            }

            const trans = [];

            for await (let news of contents) {
                const alreadyExists = await prisma.news.findFirst({
                    where: { title: news.title, categoryId: _category.id },
                });
                if (alreadyExists) continue;

                let data = await this.read(news.url);
                if (typeof data == 'boolean') continue;

                const [createdAt, id] = [this.createISO(news.date, news.hour), randomUUID(), []];
                const cover = await this.downloadImage(news.coverUrl);

                if ((data[0].imageUrl ?? '') != news.coverUrl) {
                    data = [{ image: cover }, ...data];
                }

                trans.push(
                    prisma.news.create({
                        data: {
                            id,
                            title: news.title.trim(),
                            description: news.description.trim(),
                            from: '',
                            time: `${news.date} ${news.hour}`,
                            url: news.url,
                            cover,
                            createdAt: createdAt,
                            updatedAt: createdAt,
                            categoryId: _category.id,
                        },
                    })
                );

                for (let { content, title, image } of data) {
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
                                        href: Boolean(href) ? href : '',

                                        text,

                                        contentId,
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

            const element = document.querySelector('.materia-corpo.entry-content.sa_incontent');
            const contents = [];

            for await (let item of Array.from(element.children)) {
                if (item.classList.contains('fb-page')) continue;
                if (item.innerHTML.includes('<strong>Leia mais')) continue;

                if (item.classList.contains('simple-gallery')) {
                    const images = item.querySelectorAll('img');

                    for await (let image of Array.from(images)) {
                        const url = await this.downloadImage(image.getAttribute('src'));

                        contents.push({ image: url, imageUrl: image.getAttribute('src') });
                    }

                    continue;
                }

                if (item.classList.contains('materia-foto')) {
                    const image = item.querySelector('img');
                    const url = await this.downloadImage(image.getAttribute('src'));

                    contents.push({ image: url, imageUrl: image.getAttribute('src') });

                    continue;
                }

                if (
                    item.children.length >= 1 &&
                    Array.from(item.children)[0].tagName == 'STRONG' &&
                    item.children.length == 1
                ) {
                    if (item.innerHTML.startsWith('<strong>') && item.innerHTML.endsWith('</strong>')) {
                        contents.push({
                            title: this.parser
                                .parse(item.innerHTML)
                                .map(item => item.text)
                                .join(' '),
                        });

                        continue;
                    }
                }

                if (item.innerHTML.trim().length >= 1 && !['<br>', '<hr>'].includes(item.innerHTML.trim())) {
                    contents.push({ content: this.parser.parse(item.innerHTML) });
                }
            }

            return contents;
        } catch (e) {
            process.send(e);
        }
    }
}
