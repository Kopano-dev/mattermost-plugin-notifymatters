/*eslint-disable no-console */
/*eslint-disable complexity*/

import Client from './client';

class NotifyMattersPlugin {
    constructor() {
        this.version = '20171130';
        this.allowedOrigins = null;
        this.target = null;
        this.targetOrigin = '';

        this.notificationsCounter = 0;
        this.notificationsCache = {};
        this.pendingCounter = 0;
        this.pendingCache = {};

        // TODO(longsleep): Add condition which prevent activation when
        // already activated before. This can happen when the plugin gets
        // deactivated and activated again in Mattermost.

        window.addEventListener('message', (event) => {
            this.onMessage(event);
        }, false);
    }

    initialize(registerComponents, store) {
        this.store = store;

        registerComponents({}, {});
    }

    isAllowedOrigin(origin) {
        if (!this.allowedOrigins || !origin) {
            return false;
        }

        return this.allowedOrigins.indexOf(origin) >= 0;
    }

    async onMessage(event) {
        if (this.allowedOrigins === null) {
            try {
                const config = await Client.withConfig();
                this.allowedOrigins = config.TrustedOrigin.split(' ');
                this.allowedOrigins.push(window.origin); // Always allow self.
            } catch (err) {
                throw err;
            }
        }

        const {version} = this;

        if (!this.isAllowedOrigin(event.origin)) {
            // NOTE(longsleep): Check event.origin and ignore if unknown.
            console.warn('Notifymatters origin not allowed', event.origin, this.allowedOrigins);
            return;
        }

        if (!event.data || !event.data.type || event.data.notifymatters > version) {
            // Ignore unknown stuff.
            console.warn('Notifymatters invalid event data', event.data, version);
            return;
        }

        this.processMessage(event);
    }

    processMessage(event) {
        const data = event.data;

        switch (data.type) {
        case 'notifymatters.enable': {
            // Initialize stuff.
            this.target = event.source;
            this.targetOrigin = event.origin;

            const permission = event.data.data;
            NotificationDelegate.permission = permission;

            if (!('Notification' in window) || typeof Notification.requestPermission !== 'function') {
                // Unsupported.
                console.warn('Notifymatters Notification API not supported by browser');
                return;
            }

            this.target.postMessage({
                type: 'notifymatters.ok',
                notifymatters: event.data.notifymatters,
                state: event.data.state || null
            }, this.targetOrigin);

            global.window.Notification = NotificationDelegate;
            break;
        }

        case 'notifymatters.notification.onclick': {
            const notification = this.notificationsCache[data.ref];
            if (!notification || !notification.onclick) {
                return;
            }

            notification.onclick();
            break;
        }

        case 'notifymatters.notification.onclose': {
            const notification = this.notificationsCache[data.ref];
            if (notification && notification.onclose) {
                notification.onclose();
            }

            delete this.notificationsCache[data.ref];
            break;
        }

        case 'notifymatters.ref.resolve': {
            const record = this.pendingCache[data.ref];
            if (!record) {
                return;
            }

            delete this.pendingCache[data.ref];
            record.resolve(data.data);
            break;
        }

        case 'notifymatters.ref.reject': {
            const record = this.pendingCache[data.ref];
            if (!record) {
                return;
            }

            delete this.pendingCache[data.ref];
            record.reject(data.data);
            break;
        }

        default:
            console.warn('notifymatters received unknown message type', event.data.type);
            break;
        }
    }

    async sendMessage(cmd, data, expectReply = false) {
        const payload = {
            type: 'notifymatters.' + cmd,
            notifymatters: this.version,
            data
        };

        return new Promise((resolve, reject) => {
            if (expectReply) {
                payload.ref = this.pendingCounter++;
                this.pendingCache[payload.ref] = {resolve, reject};
            } else {
                resolve();
            }

            this.target.postMessage(payload, this.targetOrigin);
        });
    }
}

const plugin = new NotifyMattersPlugin();

class NotificationDelegate {
    static NativeNotification = window.Notification;
    static permission = 'default';

    static requestPermission(cb) {
        plugin.sendMessage('notification.requestPermission', null, true).then((result) => {
            if (cb) {
                cb(result);
            }
        });
    }

    constructor(title, options) {
        this.id = plugin.notificationsCounter++;
        plugin.notificationsCache[this.id] = this;

        plugin.sendMessage('notification.new', {
            id: this.id,
            title,
            options
        });
    }

    close() {
        delete plugin.notificationsCache[this.id];
        plugin.sendMessage('notification.close', {
            id: this.id
        });
    }
}

global.window.plugins['notifymatters'] = plugin;
