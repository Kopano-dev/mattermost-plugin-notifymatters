import request from 'superagent';

export default class NotifyMattersClient {
    constructor() {
        this.url = '/plugins/notifymatters';
        this.config = null;
    }

    async withConfig() {
        if (this.config) {
            return Promise.resolve(this.config);
        }
        return this.getConfig();
    }

    async getConfig() {
        return this.doPost(`${this.url}/api/v1/config`, {}).then((config) => {
            if (!config) {
                throw new Error('received empty config');
            }
            this.config = config;
            return config;
        });
    }

    doPost = async (url, body, headers = {}) => {
        headers['X-Requested-With'] = 'XMLHttpRequest';

        try {
            const response = await request.
                post(url).
                send(body).
                set(headers).
                type('application/json').
                accept('application/json');

            return response.body;
        } catch (err) {
            throw err;
        }
    }
}
