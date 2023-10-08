import { Request, Response } from 'express';

import { prisma } from '../services';

function format(news: any[]) {
    const formated = [];

    for (let [i] of news.entries()) {
        const contents = [];

        news[i].cover = `http://192.168.0.110:3333/static/${news[i].cover}`;

        for (let [index, item] of news[i].data.entries()) {
            contents.push({
                ...Object.entries(item)
                    .map(([key, value]) => {
                        if (value || typeof value == 'boolean') {
                            return [key, value];
                        }

                        return false;
                    })
                    .filter(Boolean)
                    .reduce((acc, item) => {
                        if (item[0] == 'image') {
                            item[1] = `http://192.168.0.110:3333/static/${item[1]}`;
                        }

                        acc[item[0]] = item[1];

                        return acc;
                    }, {}),

                ...(item.content && { content: item.content.map(item => item.parts).flat() }),
                ...(item.quote && { quote: item.quote.map(item => item.quoteParts).flat() }),
                ...(item.list && { list: item.list.map(item => item.parts).flat() }),
            });

            if ((index + 1) % 6 == 0) {
                contents.push({ isAd: true });
            }
        }

        formated.push({ ...news[i], data: contents });
    }

    return formated;
}

class NewsController {
    async list(req: Request, res: Response) {
        const { portal, categoryId = '', page = '1' } = req.query as Record<string, string>;
        if (!portal) throw Error('portal invalid');

        const where = { portalName: portal, ...(categoryId && { id: categoryId }) };

        if (categoryId) {
            const data = await prisma.newsCategory.findFirst({
                where,
                select: {
                    id: true,
                    name: true,
                    _count: { select: { news: true } },
                    news: {
                        ...(Number(page) > 1 && { skip: (Number(page) - 1) * 5 }),
                        take: 5,
                        orderBy: { createdAt: 'desc' },
                        select: {
                            title: true,
                            cover: true,
                            description: true,
                            from: true,
                            time: true,
                            url: true,
                            id: true,
                            data: {
                                include: {
                                    content: { include: { parts: true } },
                                    quote: { include: { quoteParts: true } },
                                    list: { include: { parts: true } },
                                },
                            },
                        },
                    },
                },
            });

            return res.json({
                id: data.id,
                name: data.name,
                totalPages: Math.ceil(data._count.news / 5),
                news: format(data.news),
            });
        }

        const total = await prisma.newsCategory.count({ where });
        const totalPages = Math.ceil(total / 5);

        if (Number(page) > totalPages) throw Error('page invalid');

        const data = await prisma.newsCategory.findMany({
            ...(Number(page) > 1 && { skip: (Number(page) - 1) * 5 }),
            orderBy: { name: 'asc' },
            take: 5,
            where,
            select: {
                id: true,
                name: true,
                _count: { select: { news: true } },
                news: {
                    take: 5,
                    orderBy: { createdAt: 'desc' },
                    select: {
                        title: true,
                        cover: true,
                        description: true,
                        from: true,
                        time: true,
                        url: true,
                        id: true,
                        data: {
                            include: {
                                content: { include: { parts: true } },
                                quote: { include: { quoteParts: true } },
                                list: { include: { parts: true } },
                            },
                        },
                    },
                },
            },
        });

        return res.json({
            totalPages,
            data: data
                .filter(c => c.news.length >= 1)
                .map(item => {
                    return {
                        id: item.id,
                        name: item.name,
                        totalPages: Math.ceil(item._count.news / 5),
                        news: format(item.news),
                    };
                }),
        });
    }

    // async create(req: Request, res: Response) {
    //     const { error, value } = NewsValidator.create.validate(req.body);
    //     if (error) throw Error('data invalid');

    //     return res.status(201).send();
    // }

    async delete(req: Request, res: Response) {
        const { id } = req.params;

        const news = await prisma.news.findFirst({ where: { id } });
        if (!news) throw Error('news invalid');

        await prisma.news.delete({ where: { id } });

        return res.status(200).send();
    }
}

export default new NewsController();
