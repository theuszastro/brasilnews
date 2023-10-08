import { G1, G1Urls } from '../classes/G1';
import { DiarioSM, DiarioSMUrls } from '../classes/DiarioSM';
import { DiarioGaucho, DiarioGauchoUrls } from '../classes/DiarioGaucho';

import dayjs from 'dayjs';

class Cron {
    timeout: NodeJS.Timeout;

    constructor() {
        this.execute = this.execute.bind(this);
        this.start = this.start.bind(this);

        this.start();
    }

    async start() {
        if (dayjs().minute() % 10 == 0) {
            await this.execute();
        }

        this.timeout = setTimeout(this.start.bind(this), 1_000 * 60 - dayjs().second() * 1000);
    }

    async execute() {
        const g1 = new G1();
        const diarioSM = new DiarioSM();
        const diarioGaucho = new DiarioGaucho();

        for await (let [category, url] of Object.entries(G1Urls)) {
            await g1.readingNews({ category, url });
        }

        for await (let [category, url] of Object.entries(DiarioSMUrls)) {
            await diarioSM.readingNews({ category, url });
        }

        for await (let [category, url] of Object.entries(DiarioGauchoUrls)) {
            await diarioGaucho.readingNews({ category, url });
        }
    }
}

const cron = new Cron();
process.on('message', () => {});
