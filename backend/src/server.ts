import 'express-async-errors';

import express from 'express';
import cors from 'cors';

import { fork } from 'child_process';
import routes from './routes';

import { ErrorHandler } from './errors';

const app = express();

// app.use('/static', express.static('static'));
app.use(cors());
app.use(routes);
app.use(ErrorHandler);
app.listen(3330);

const child = fork('build/src/childs/index.js', { env: process.env });

child.on('message', console.log);
process.on('beforeExit', code => child.kill());

// import { G1 } from './classes/G1';
// (async () => {
//     const diario = new G1();

//     await diario.readingNews({ url: 'https://g1.globo.com/economia/agronegocios/', category: 'Ok' });
// })();
