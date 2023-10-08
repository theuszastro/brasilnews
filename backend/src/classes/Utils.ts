import { randomUUID } from 'crypto';
import { writeFile } from 'fs/promises';

import { JSDOM } from 'jsdom';

import axios from 'axios';
import sharp from 'sharp';

export class Utils {
    async downloadImage(url: string) {
        try {
            const { data } = await axios.get(url, { responseType: 'arraybuffer' });
            const buffer = Buffer.from(data, 'binary');

            const newBuffer = await sharp(buffer).jpeg({ quality: 70 }).resize(144, 107).toBuffer();

            const name = `${randomUUID()}-${randomUUID()}.jpg`;

            await writeFile(`static/${name}`, newBuffer);

            return name;
        } catch (e) {
            return '';
        }
    }

    async createDocument(url: string): Promise<Document | boolean> {
        try {
            const { data } = await axios.get(url);
            const { document } = new JSDOM(data).window;

            return document;
        } catch (e) {
            return true;
        }
    }
}
