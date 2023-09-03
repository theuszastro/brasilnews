import Joi from 'joi';

export type Create = {
    title: string;
    description: string;
    from: string;
    time: string;
    portalName: string;
    url: string;

    contents: Array<{
        content?: string;
        quote?: string;
        title?: string;
        image?: string;
        isAd?: boolean;

        list?: Array<string>;
    }>;
};

export class NewsValidator {
    static create = Joi.object<Create>({
        title: Joi.string().required(),
        description: Joi.string().required(),
        from: Joi.string().required(),
        time: Joi.string().required(),
        portalName: Joi.string().required(),
        url: Joi.string().required(),

        contents: Joi.array().items(
            Joi.object({
                content: Joi.string(),
                quote: Joi.string(),
                title: Joi.string(),
                image: Joi.string(),
                isAd: Joi.boolean().default(false),

                list: Joi.array().items(Joi.string()),
            })
        ),
    });
}
