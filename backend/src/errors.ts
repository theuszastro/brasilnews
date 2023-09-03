import { ErrorRequestHandler, Response } from 'express';

const createError =
    (res: Response) =>
    (error: string, status = 400) =>
        res.status(status).json({ error });

export const ErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
    const error = createError(res);

    switch (err.message) {
        case 'portal invalid':
            return error('this portal not exists');

        case 'news invalid':
            return error('this news not exists');

        default:
            console.log(err.message);

            error('Internal Server Error', 500);
    }
};
