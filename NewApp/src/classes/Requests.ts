import axios from 'axios';

const baseURL = 'http://192.168.0.110:3333';

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
            data: data.data.map(item => ({ ...item, page })),
            page,
            totalPages: data.totalPages,
        };

        return this.portals[name][page];
    }

    async loadNewsByCategory(name: string, category: string, page: number) {
        if (this.category[category] && this.category[category][page]) return this.category[category][page];

        const { data } = await axios.get(`${baseURL}/news?portal=${name}&category=${category}&page=${page}`);

        if (!this.category[category]) this.category[category] = {};

        this.category[category][page] = {
            data: data.data,
            page,
            totalPages: data.totalPages,
        };

        return this.category[category][page];
    }
}

export default new Requests();
