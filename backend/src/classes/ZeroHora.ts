// import { randomUUID } from 'crypto';

// import dayjs from 'dayjs';

// import { sleep, ReadingProps, ReadNewsProps } from './G1';
// import { ZeroHoraParser } from './parsers/ZeroHora';

// import { prisma } from '../services';

// export const ZeroHoraUrls = {
//     Trânsito: 'https://gauchazh.clicrbs.com.br/transito/ultimas-noticias/',
//     Economia: 'https://gauchazh.clicrbs.com.br/economia/ultimas-noticias',
//     Educação: 'https://gauchazh.clicrbs.com.br/educacao/ultimas-noticias',
//     Empreendedorismo: 'https://g1.globo.com/empreendedorismo',
//     'Meio Ambiente': 'https://gauchazh.clicrbs.com.br/ambiente/ultimas-noticias',
//     Mundo: 'https://gauchazh.clicrbs.com.br/mundo/ultimas-noticias',
//     Política: 'https://gauchazh.clicrbs.com.br/politica/ultimas-noticias',
//     Investigação: 'https://gauchazh.clicrbs.com.br/grupo-de-investigacao/ultimas-noticias',
//     Saúde: 'https://gauchazh.clicrbs.com.br/saude/ultimas-noticias',
//     'Tecnologia e Ciência': 'https://gauchazh.clicrbs.com.br/tecnologia/ultimas-noticias',
//     Geral: 'https://gauchazh.clicrbs.com.br/geral/ultimas-noticias',
//     Segurança: 'https://gauchazh.clicrbs.com.br/seguranca/ultimas-noticias',
//     Esportes: 'https://gauchazh.clicrbs.com.br/esportes/ultimas-noticias',
//     Cinema: 'https://gauchazh.clicrbs.com.br/cultura-e-lazer/cinema/ultimas-noticias',
//     Carros: 'https://gauchazh.clicrbs.com.br/comportamento/carros/ultimas-noticias',
//     Viagem: 'https://gauchazh.clicrbs.com.br/comportamento/viagem/ultimas-noticias',
//     'Redes Sociais': 'https://gauchazh.clicrbs.com.br/comportamento/feed-redes-sociais/ultimas-noticias',
//     Televisão: 'https://gauchazh.clicrbs.com.br/cultura-e-lazer/tv/ultimas-noticias',
//     Música: 'https://gauchazh.clicrbs.com.br/cultura-e-lazer/musica/ultimas-noticias',
// };

// export class ZeroHora {
//     parser = new ZeroHoraParser();

//     createISO(iso: string) {
//         const [date, time] = iso.split('-');
//         const [h, m] = time.split('h');

//         return dayjs(date.trim(), 'DD/MM/YYYY')
//             .set('hour', Number(h))
//             .set('minute', Number(m.replace(/\D/g, '')))
//             .set('second', 0)
//             .format();
//     }

//     async readingNews(data: ReadingProps) {
//         const { category, page, url } = data;

//         try {
//             await page.goto(url, { timeout: 100_000 * 10, waitUntil: 'networkidle2' });

//             for await (let _ of Array.from({ length: 2 })) {
//                 const button = await page.$('.btn-show-more');
//                 if (button) {
//                     await button.click();

//                     await sleep(1_000);

//                     continue;
//                 }

//                 await page.evaluate(() => document.body.scroll({ behavior: 'smooth', left: 0, top: 100_000 * 40 }));

//                 await sleep(2_000);
//             }

//             const list = await page.$eval('.m-latest-news > .m-latest-news__timeline', elem => {
//                 const data = [];

//                 for (let child of Array.from(elem.children)) {
//                     try {
//                         const url = child.querySelector('a').getAttribute('href');
//                         const cover = child.querySelector('img').getAttribute('src');
//                         const title = child.querySelector('.m-crd-pt__headline').innerHTML;
//                         const time = child.querySelector('.article-card__summary_date > time').innerHTML;

//                         data.push({ url: `https://gauchazh.clicrbs.com.br${url}`, cover, title, time });
//                     } catch (e) {}
//                 }

//                 return data;
//             });

//             await sleep(2_000);

//             let _category = await prisma.newsCategory.findFirst({ where: { name: category, portalName: 'Zero Hora' } });
//             if (!_category) {
//                 _category = await prisma.newsCategory.create({
//                     data: { name: category, id: randomUUID(), portalName: 'G1' },
//                 });
//             }

//             for await (let news of list.map(i => ({ ...i, title: this.parser.parse(i.title)[0].text }))) {
//                 const alreadyExists = await prisma.news.findFirst({
//                     where: { title: news.title.trim(), categoryId: _category.id },
//                 });
//                 if (alreadyExists) continue;

//                 const data = await this.read({ page, url: news.url });
//                 if (typeof data == 'boolean') continue;

//                 const createdAt = this.createISO(news.time);

//                 console.log(data);
//             }
//         } catch (e) {
//             console.log(e);
//         }

//         // lista de noticias -> document.querySelector(".m-latest-news > .m-latest-news__timeline").children
//         // url -> document.querySelector(".m-latest-news > .m-latest-news__timeline").children[0].querySelector("a")
//         // cover -> document.querySelector(".m-latest-news > .m-latest-news__timeline").children[0].querySelector("img")
//         // title -> document.querySelector(".m-latest-news > .m-latest-news__timeline").children[0].querySelector(".m-crd-pt__headline");
//         // time -> document.querySelector(".m-latest-news > .m-latest-news__timeline").children[0].querySelector(".article-card__summary_date > time");
//     }

//     async read(data: ReadNewsProps) {
//         const { page, url } = data;

//         try {
//             await page.goto(url, { timeout: 60_000 * 5, waitUntil: 'domcontentloaded' });

//             await sleep(2_000);

//             await page.evaluate(() => {
//                 window.scrollTo({ behavior: 'smooth', left: 0, top: document.body.scrollHeight });
//             });

//             const description = await page.$eval('.m-supportline', e => e.innerHTML);
//             const contents = await page.$eval('.article-content.sa_incontent', e => {
//                 const data = [];

//                 for (let child of Array.from(e.children)) {
//                     if (child.querySelector('.m-read-more.leak-left') || child.classList.contains('trust-project-box'))
//                         continue;

//                     if (child.querySelector('.gallery-slider')) {
//                         for (let img of Array.from(child.querySelectorAll('img'))) {
//                             data.push({ image: img.getAttribute('src') });
//                         }

//                         continue;
//                     }

//                     if (child.querySelector('img')) {
//                         data.push({ image: child.querySelector('img').getAttribute('src') });

//                         continue;
//                     }

//                     if (child.querySelector('div > h3')) {
//                         data.push({ title: child.innerHTML });

//                         continue;
//                     }

//                     if (child.querySelector('ul > li') || child.querySelector('ol > li')) {
//                         data.push({ list: child.innerHTML });

//                         continue;
//                     }

//                     data.push({ content: child.innerHTML });
//                 }

//                 return data;
//             });

//             // // const contents = await page.$$eval('.article-paragraph', e => e.map(item => item.innerHTML));

//             // for (let content of contents) {
//             //     console.log(this.parser.parse(content));
//             // }

//             console.log(contents);

//             await sleep(5_000);
//         } catch (e) {
//             console.log(e);

//             return false;
//         }

//         // description -> document.querySelector(".m-supportline");
//         // author -> GZH}
//         // image -> document.querySelector(".article-paragraph").querySelector("picture").querySelector("img").src
//         // article -> document.querySelector(".article-content.sa_incontent").children
//         // contents -> document.querySelector(".article-paragraph");
//     }
// }
