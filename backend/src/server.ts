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

// import G1News from './classes/G1';
// (async () => {
//     const g1 = new G1News();

//     await g1.setup();

//     // await g1.miningNews(1, 'Agro');

//     console.log(
//         await g1.parseContent(
//             await g1.read(
//                 'https://g1.globo.com/economia/agronegocios/noticia/2023/08/31/touro-gigante-viaja-em-banco-de-passageiro-nos-eua-e-carro-e-parado-pela-policia.ghtml'
//             )
//         )
//     );

//     process.exit();
// })();
