import { firefox, Page } from 'playwright';

import { PlaywrightBlocker } from '@cliqz/adblocker-playwright';
import fetch from 'cross-fetch';

import { G1, G1Urls } from '../classes/G1';
import { DiarioSM, DiarioSMUrls } from '../classes/DiarioSM';
import { DiarioGaucho, DiarioGauchoUrls } from '../classes/DiarioGaucho';

class Child {
    constructor() {
        this.setup();
    }

    async execute(page: Page) {}

    async setup() {
        const browser = await firefox.launch({ headless: false });
        const page = await browser.newPage();

        const blocker = await PlaywrightBlocker.fromPrebuiltAdsAndTracking(fetch);
        await blocker.enableBlockingInPage(page);

        await this.execute(page);
    }
}

const child = new Child();
process.on('message', () => {});
