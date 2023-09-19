import puppeteer from 'puppeteer';
import G1News, { G1Urls } from '../classes/G1';

class Child {
    constructor() {
        this.setup();
    }

    async setup() {
        const browser = await puppeteer.launch({ headless: false, defaultViewport: { width: 1920, height: 1080 } });
        const page = await browser.newPage();
        const g1 = new G1News();

        // for await (let [category, url] of Object.entries(G1Urls)) {
        //     await g1.readingNews({ category, page, url });
        // }
    }
}

const child = new Child();
process.on('message', () => {});
