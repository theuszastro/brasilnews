import G1News from '../classes/G1';

class Child {
    constructor() {
        this.mining();
    }

    async mining() {
        const g1 = new G1News();

        await g1.setup();
        // await g1.miningNews(1, 'Ciência');
        await g1.miningNews(1, 'Agro');
    }
}

const child = new Child();
process.on('message', () => {});
