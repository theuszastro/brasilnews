import 'express-async-errors';

import express from 'express';
import cors from 'cors';

import { fork } from 'child_process';
import routes from './routes';

import { ErrorHandler } from './errors';

const app = express();

app.use(cors());
app.use(routes);
app.use(ErrorHandler);
app.listen(3333);

// const child = fork('build/src/childs/index.js', { env: process.env });

// child.on('message', console.log);
// process.on('beforeExit', code => child.kill());

// import puppeteer from 'puppeteer';
// import G1News from './classes/G1';
// (async () => {
//     const g1 = new G1News();

//     const browser = await puppeteer.launch({ headless: false, defaultViewport: { width: 1920, height: 1080 } });
//     const page = await browser.newPage();

//     await g1.readingNews({
//         category: 'Agro',
//         page,
//         url: 'https://g1.globo.com/economia/agronegocios',
//     });

//     // await g1.setup();

//     // // await g1.miningNews(1, 'Agro');

//     // const data = await g1.parseContent(
//     //     await g1.read(
//     //         'https://g1.globo.com/economia/agronegocios/noticia/2023/08/31/g1-prova-peixe-mais-caro-do-mundo-veja-video.ghtml'
//     //     )
//     // );

//     process.exit();
// })();
