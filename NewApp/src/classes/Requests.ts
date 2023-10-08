import axios from 'axios';

const baseURL = 'https://news.umbandatudosobre.com';

class Requests {
    portalsCategory = {} as any;
    portals = {} as any;
    category = {} as any;

    constructor() {
        this.loadNewsByPortal = this.loadNewsByPortal.bind(this);
        this.loadNewsByCategory = this.loadNewsByCategory.bind(this);
    }

    async loadNewsByPortal(name: string, page: number) {
        if (this.portals[name] && this.portals[name][page]) return this.portals[name][page];

        const { data } = await axios.get(`${baseURL}/news?portal=${name}&page=${page}`);

        if (!this.portals[name]) this.portals[name] = {};

        this.portals[name][page] = {
            // @ts-ignore
            data: data.data.map(item => ({ ...item, page: 1 })),
            page,
            totalPages: data.totalPages,
        };

        return this.portals[name][page];
    }

    async loadNewsByCategory(name: string, id: string, page: number) {
        if (this.category[id] && this.category[id][page]) return this.category[id][page];

        const { data } = await axios.get(`${baseURL}/news?portal=${name}&categoryId=${id}&page=${page}`);

        if (!this.category[id]) this.category[id] = {};

        this.category[id][page] = {
            news: data.news,
            page,
            totalPages: data.totalPages,
        };

        return this.category[id][page];
    }
}

export default new Requests();
