import request from 'superagent';

export default class Client {
    constructor() {
        this.baseURL = '/plugins/notifymatters';

        this.config = null;
    }

    async withConfig() {
        if (this.config) {
            return Promise.resolve(this.config);
        }
        return this.getConfig();
    }

    async getConfig() {
        return this.doGet(`${this.baseURL}/config`).then((config) => {
            if (!config) {
                throw new Error('received empty config');
            }
            this.config = config;
            return config;
        });
    }

    doGet = async (url, headers = {}) => {
        try {
            const response = await request.
                get(url).
                set(headers).
                type('application/json').
                accept('application/json');

            return response.body;
        } catch (err) {
            throw err;
        }
    }
}
