import { Request, Response } from 'express';

import { prisma } from '../services';

function format(news: any[]) {
    const formated = [];

    for (let [i] of news.entries()) {
        const contents = [];

        for (let [index, item] of news[i].data.entries()) {
            contents.push({
                ...item,
                ...(item.content && { content: item.content.map(item => item.parts).flat() }),
                ...(item.quote && { quote: item.quote.map(item => item.quoteParts).flat() }),
                ...(item.list && { list: item.list.map(item => item.parts).flat() }),
            });

            if ((index + 1) % 6 == 0) {
                contents.push({ isAd: true });
            }
        }

        formated.push({
            ...news[i],
            data: contents,
        });
    }

    return formated;
}

class NewsController {
    async list(req: Request, res: Response) {
        const { portal, category = '', page = '1' } = req.query as Record<string, string>;
        if (!portal) throw Error('portal invalid');

        if (category) {
            const total = await prisma.news.count({
                where: { category, portalName: portal.trim() },
            });
            const news = await prisma.news.findMany({
                where: { category, portalName: portal.trim() },
                include: {
                    data: {
                        include: {
                            content: { include: { parts: true } },
                            quote: { include: { quoteParts: true } },
                            list: { include: { parts: true } },
                        },
                    },
                },
                take: 5,
                ...(Number(page) > 1 && { skip: (Number(page) - 1) * 5 }),
            });

            return res.json({
                totalPages: Math.ceil(total / 5),
                data: format(news),
            });
        }

        const total = await prisma.mining.count({ where: { page: 1, portal: 'G1' } });
        const categories = await prisma.mining.findMany({
            where: { page: 1, portal: 'G1' },
            take: 5,
            ...(Number(page) > 1 && {
                skip: (Number(page) - 1) * 5,
            }),
        });

        const data = [];
        const promises = [];

        for (let category of categories) {
            promises.push(
                (async () => {
                    const total = await prisma.news.count({
                        where: { category: category.name, portalName: portal.trim() },
                    });
                    const news = await prisma.news.findMany({
                        where: { category: category.name, portalName: portal.trim() },
                        include: {
                            data: {
                                include: {
                                    content: { include: { parts: true } },
                                    quote: { include: { quoteParts: true } },
                                    list: { include: { parts: true } },
                                },
                            },
                        },
                        take: 5,
                    });

                    data.push({
                        id: category.id,
                        category: category.name,
                        totalPages: Math.ceil(total / 5),
                        data: format(news),
                    });
                })()
            );
        }

        await Promise.all(promises);

        return res.json({ totalPages: Math.ceil(total / 5), data });
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
